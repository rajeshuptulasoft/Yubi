const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { deliveryPartnerIdColumn } = require("../utils/deliveryPartnerSchema");

const router = express.Router();

/** Maps body `action` to `orders.status`. Accepts DB values or short aliases. */
function resolveDeliveryAction(action) {
  if (action === undefined || action === null || String(action).trim() === "") return null;
  const key = String(action)
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  const map = {
    accept: "accepted",
    accepted: "accepted",
    accept_order: "accepted",
    pickup: "picked",
    picked: "picked",
    confirm_pickup: "picked",
    out: "out_for_delivery",
    out_for_delivery: "out_for_delivery",
    deliver: "delivered",
    delivered: "delivered",
    mark_delivered: "delivered"
  };
  return map[key] || null;
}

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  const dpIdCol = await deliveryPartnerIdColumn();
  const [rows] = await pool.query(
    `SELECT du.id AS user_id, du.name, du.phone, du.password, dp.${dpIdCol} AS delivery_partner_id
     FROM delivery_user du
     LEFT JOIN deliverypartners dp ON dp.phone = du.phone
     WHERE du.phone = ? LIMIT 1`,
    [phone]
  );
  if (!rows.length) return res.status(401).json({ status: "error", message: "Invalid credentials" });
  const user = rows[0];
  const ok = (await bcrypt.compare(password, user.password).catch(() => false)) || password === user.password;
  if (!ok) return res.status(401).json({ status: "error", message: "Invalid credentials" });
  return res.json({ status: "success", user: { ...user, password: undefined } });
});

router.get("/profile", async (req, res) => {
  const { phone, user_id } = req.query;
  const [rows] = await pool.query(
    "SELECT id AS user_id, name, phone, email, status FROM delivery_user WHERE phone = ? OR id = ? LIMIT 1",
    [phone || null, user_id || null]
  );
  if (!rows.length) return res.status(404).json({ status: "error", message: "Profile not found" });
  return res.json({ status: "success", profile: rows[0] });
});

router.post("/update-availability", async (req, res) => {
  const { delivery_partner_id, available } = req.body;
  const dpIdCol = await deliveryPartnerIdColumn();
  await pool.query(`UPDATE deliverypartners SET available = ? WHERE ${dpIdCol} = ?`, [
    Number(available) ? 1 : 0,
    delivery_partner_id
  ]);
  return res.json({ status: "success", message: "Availability updated", availability: Number(available) ? 1 : 0 });
});

router.post("/change-password", async (req, res) => {
  const { phone, user_id, current_password, new_password } = req.body;
  const [rows] = await pool.query("SELECT id, password FROM delivery_user WHERE phone = ? OR id = ? LIMIT 1", [
    phone || null,
    user_id || null
  ]);
  if (!rows.length) return res.status(404).json({ status: "error", message: "User not found" });
  const user = rows[0];
  const ok = (await bcrypt.compare(current_password, user.password).catch(() => false)) || current_password === user.password;
  if (!ok) return res.status(400).json({ status: "error", message: "Current password is incorrect" });
  const hash = await bcrypt.hash(new_password, 10);
  await pool.query("UPDATE delivery_user SET password = ? WHERE id = ?", [hash, user.id]);
  return res.json({ status: "success", message: "Password changed successfully" });
});

router.get("/order-history", async (req, res) => {
  try {
    const rawId = req.query.delivery_partner_id;
    const deliveryPartnerId = Number(rawId);
    if (rawId === undefined || rawId === null || rawId === "" || !Number.isFinite(deliveryPartnerId) || deliveryPartnerId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "delivery_partner_id query param is required and must be a positive number"
      });
    }
    const [rows] = await pool.query(
      "SELECT * FROM orders WHERE delivery_partner_id = ? ORDER BY order_id DESC",
      [deliveryPartnerId]
    );
    return res.json({ status: "success", message: "Order history fetched", orders: rows });
  } catch (error) {
    console.error("ORDER HISTORY ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch order history" });
  }
});

router.get("/get-active-order", async (req, res) => {
  try {
    const rawId = req.query.delivery_partner_id;
    const deliveryPartnerId = Number(rawId);
    if (rawId === undefined || rawId === null || rawId === "" || !Number.isFinite(deliveryPartnerId) || deliveryPartnerId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "delivery_partner_id query param is required and must be a positive number (same id returned from login / delivery partners list)"
      });
    }
    const [rows] = await pool.query(
      `SELECT * FROM orders
       WHERE delivery_partner_id = ?
         AND status IN ('assigned', 'accepted', 'picked', 'out_for_delivery')
       ORDER BY order_id DESC`,
      [deliveryPartnerId]
    );
    return res.json({ status: "success", orders: rows });
  } catch (error) {
    console.error("GET ACTIVE ORDER ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to fetch active orders" });
  }
});

/** Body: `order_id`, `action` (→ status); optional `payment_received` when action is deliver/delivered (1 = mark COD paid). */
router.patch("/orders/:delivery_partner_id/status", async (req, res) => {
  try {
    const dpId = Number(req.params.delivery_partner_id);
    const { order_id, action, payment_received } = req.body;
    const orderId = Number(order_id);

    if (!Number.isFinite(dpId) || dpId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "delivery_partner_id in URL must be a positive number"
      });
    }
    if (!Number.isFinite(orderId) || orderId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "order_id is required in body as a positive number"
      });
    }

    const nextStatus = resolveDeliveryAction(action);
    if (!nextStatus) {
      return res.status(400).json({
        status: "error",
        message:
          "action is required; use accepted, picked, out_for_delivery, or delivered (aliases: accept, pickup, out, deliver)"
      });
    }

    const [existing] = await pool.query(
      "SELECT order_id, payment_method FROM orders WHERE order_id = ? AND delivery_partner_id = ? LIMIT 1",
      [orderId, dpId]
    );
    if (!existing.length) {
      return res.status(404).json({
        status: "error",
        message: "Order not found or not assigned to this delivery partner"
      });
    }

    if (nextStatus === "delivered") {
      const paymentMethod = String(existing[0].payment_method || "").trim().toLowerCase();
      if (paymentMethod === "cod" && Number(payment_received) !== 1) {
        return res.status(400).json({
          status: "error",
          message: "Confirm COD payment before marking the order delivered"
        });
      }
      await pool.query(
        "UPDATE orders SET status = 'delivered', payment_status = IF(? = 1, 'paid', payment_status), delivered_at = NOW() WHERE order_id = ? AND delivery_partner_id = ?",
        [Number(payment_received) ? 1 : 0, orderId, dpId]
      );
    } else {
      await pool.query(
        "UPDATE orders SET status = ? WHERE order_id = ? AND delivery_partner_id = ?",
        [nextStatus, orderId, dpId]
      );
    }

    return res.json({
      status: "success",
      message: `Order ${nextStatus}`,
      order_id: orderId,
      delivery_partner_id: dpId,
      status: nextStatus
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({ status: "error", message: "Failed to update order status" });
  }
});

module.exports = router;
