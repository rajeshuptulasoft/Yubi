const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const pool = require("../config/db");
const { issueToken, requireAuth, requireRole } = require("../middleware/auth");
const { deliveryPartnerIdColumn } = require("../utils/deliveryPartnerSchema");

const router = express.Router();
const upload = multer({ dest: path.join(process.cwd(), "..", "uploads") });

function columnNameSet(rows) {
  return new Set(rows.map((c) => String(c.Field).toLowerCase()));
}

router.post("/login", async (req, res) => {
  const { phone_or_email: phoneOrEmail, password } = req.body;
  const [rows] = await pool.query(
    "SELECT user_id, name, email, phone, password, role FROM users WHERE email = ? OR phone = ? LIMIT 1",
    [phoneOrEmail, phoneOrEmail]
  );
  if (!rows.length) return res.status(401).json({ success: false, message: "Invalid credentials" });
  const admin = rows[0];
  if (admin.role !== "admin") return res.status(403).json({ success: false, message: "Admin only" });

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const token = issueToken({ id: admin.user_id, role: admin.role });
  return res.json({ success: true, token, user: { user_id: admin.user_id, name: admin.name, role: admin.role } });
});

router.get("/admin-dashboard", requireAuth, requireRole("admin"), async (_req, res) => {
  const [[totalOrders]] = await pool.query("SELECT COUNT(*) AS count FROM orders");
  const [[pendingOrders]] = await pool.query("SELECT COUNT(*) AS count FROM orders WHERE status = 'pending'");
  const [[revenue]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) AS amount FROM orders WHERE payment_status = 'paid'");
  return res.json({
    success: true,
    stats: {
      totalOrders: totalOrders.count,
      pendingOrders: pendingOrders.count,
      revenue: Number(revenue.amount)
    }
  });
});

router.get("/admin-products", requireAuth, requireRole("admin"), async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM products ORDER BY product_id DESC");
  return res.json({ success: true, products: rows });
});

router.post("/add-products", requireAuth, requireRole("admin"), upload.single("image"), async (req, res) => {
  try {
    const { product_name, description, category, price, stock, is_available } = req.body;
    if (!product_name || !description || !category || price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "product_name, description, category, and price are required"
      });
    }
    if (stock === undefined || stock === null || stock === "") {
      return res.status(400).json({
        success: false,
        message: "stock is required"
      });
    }
    const stockNum = Number(stock);
    if (!Number.isFinite(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      return res.status(400).json({
        success: false,
        message: "stock must be a non-negative integer"
      });
    }
    const available =
      is_available === undefined || is_available === null || is_available === ""
        ? 1
        : Number(is_available)
          ? 1
          : 0;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    await pool.query(
      "INSERT INTO products (product_name, description, category, price, image_url, is_available, stock) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [product_name, description, category, price, image_url, available, stockNum]
    );
    return res.status(201).json({ success: true, message: "Product added" });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to add product" });
  }
});

router.delete("/delete-products/:product_id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { product_id } = req.params;
    const [result] = await pool.query("DELETE FROM products WHERE product_id = ?", [product_id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to delete product" });
  }
});

router.put("/update-products/:product_id", requireAuth, requireRole("admin"), upload.single("image"), async (req, res) => {
  try {
    const { product_id } = req.params;
    const { product_name, description, category, price, is_available, stock } = req.body;

    const [existing] = await pool.query("SELECT product_id FROM products WHERE product_id = ? LIMIT 1", [product_id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updates = [];
    const params = [];
    if (product_name != null && String(product_name).trim() !== "") {
      updates.push("product_name = ?");
      params.push(String(product_name).trim());
    }
    if (description != null && String(description).trim() !== "") {
      updates.push("description = ?");
      params.push(String(description).trim());
    }
    if (category != null && String(category).trim() !== "") {
      updates.push("category = ?");
      params.push(String(category).trim());
    }
    if (price !== undefined && price !== null && price !== "") {
      updates.push("price = ?");
      params.push(price);
    }
    if (is_available !== undefined && is_available !== null && is_available !== "") {
      updates.push("is_available = ?");
      params.push(Number(is_available) ? 1 : 0);
    }
    if (stock !== undefined && stock !== null && stock !== "") {
      const stockNum = Number(stock);
      if (!Number.isFinite(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
        return res.status(400).json({
          success: false,
          message: "stock must be a non-negative integer"
        });
      }
      updates.push("stock = ?");
      params.push(stockNum);
    }
    if (req.file) {
      updates.push("image_url = ?");
      params.push(`/uploads/${req.file.filename}`);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: "No fields provided to update" });
    }

    params.push(product_id);
    await pool.query(`UPDATE products SET ${updates.join(", ")} WHERE product_id = ?`, params);
    return res.json({ success: true, message: "Product updated" });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update product" });
  }
});

router.get("/admin-orders", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? "WHERE o.status = ?" : "";
    const params = status ? [status] : [];
    const dpIdCol = await deliveryPartnerIdColumn();
    const [orders] = await pool.query(
      `SELECT o.*, dp.name AS delivery_partner_name
       FROM orders o
       LEFT JOIN deliverypartners dp ON dp.${dpIdCol} = o.delivery_partner_id
       ${where}
       ORDER BY o.order_id DESC`,
      params
    );
    return res.json({ success: true, orders });
  } catch (error) {
    console.error("ADMIN ORDERS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
  }
});

router.patch("/admin-orders/:order_id/assign", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const orderId = Number(req.params.order_id);
    const deliveryPartnerId = Number(req.body.delivery_partner_id);
    if (!Number.isFinite(orderId) || orderId <= 0 || !Number.isFinite(deliveryPartnerId) || deliveryPartnerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "order_id (in URL) and delivery_partner_id (in body) must be positive numbers"
      });
    }

    const [orderRows] = await pool.query("SELECT order_id FROM orders WHERE order_id = ? LIMIT 1", [orderId]);
    if (!orderRows.length) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const dpIdCol = await deliveryPartnerIdColumn();
    const [partnerRows] = await pool.query(
      `SELECT ${dpIdCol} AS id FROM deliverypartners WHERE ${dpIdCol} = ? LIMIT 1`,
      [deliveryPartnerId]
    );
    if (!partnerRows.length) {
      return res.status(404).json({ success: false, message: "Delivery partner not found" });
    }

    await pool.query(
      "UPDATE orders SET delivery_partner_id = ?, status = 'assigned', assigned_at = NOW() WHERE order_id = ?",
      [deliveryPartnerId, orderId]
    );
    return res.json({ success: true, message: "Delivery partner assigned", order_id: orderId, delivery_partner_id: deliveryPartnerId });
  } catch (error) {
    console.error("ASSIGN DELIVERY ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to assign delivery partner" });
  }
});

router.patch("/admin-orders/:order_id/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const orderId = Number(req.params.order_id);
    const { status } = req.body;
    if (!Number.isFinite(orderId) || orderId <= 0) {
      return res.status(400).json({ success: false, message: "order_id in URL must be a positive number" });
    }
    if (status === undefined || status === null || String(status).trim() === "") {
      return res.status(400).json({ success: false, message: "status is required in body" });
    }
    const [exists] = await pool.query("SELECT order_id FROM orders WHERE order_id = ? LIMIT 1", [orderId]);
    if (!exists.length) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    await pool.query("UPDATE orders SET status = ? WHERE order_id = ?", [status, orderId]);
    return res.json({ success: true, message: "Order status updated", order_id: orderId, status });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update order status" });
  }
});

router.get("/delivery-partners", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM deliverypartners");
    const names = columnNameSet(columns);
    const orderBy = names.has("delivery_partner_id") ? "delivery_partner_id" : names.has("id") ? "id" : "1";
    const [rows] = await pool.query(`SELECT * FROM deliverypartners ORDER BY ${orderBy} DESC`);
    return res.json({ success: true, delivery_partners: rows });
  } catch (error) {
    console.error("DELIVERY PARTNERS LIST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch delivery partners" });
  }
});

router.post("/create-delivery-partner", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "name, phone, and password are required"
      });
    }

    // Check if phone already exists
    const [existingUser] = await pool.query(
      "SELECT id FROM delivery_user WHERE phone = ? LIMIT 1",
      [phone]
    );
    if (existingUser.length) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists"
      });
    }

    const dpIdCol = await deliveryPartnerIdColumn();
    const [existingPartner] = await pool.query(
      `SELECT ${dpIdCol} AS id FROM deliverypartners WHERE phone = ? LIMIT 1`,
      [phone]
    );
    if (existingPartner.length) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into delivery_user
    const [userResult] = await pool.query(
      "INSERT INTO delivery_user (name, phone, email, password, status) VALUES (?, ?, ?, ?, 'active')",
      [name, phone, email || null, hashedPassword]
    );

    // Insert into deliverypartners
    await pool.query(
      "INSERT INTO deliverypartners (name, phone, email, available, is_available) VALUES (?, ?, ?, 1, 1)",
      [name, phone, email || null]
    );

    return res.status(201).json({
      success: true,
      message: "Delivery partner created successfully",
      delivery_partner: {
        name,
        phone,
        email
      }
    });

  } catch (error) {
    console.error("CREATE DELIVERY PARTNER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create delivery partner"
    });
  }
});

router.get("/admin-enquiries", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM enquiries");
    const names = columnNameSet(columns);
    const orderExpr = names.has("enquiry_id")
      ? "e.enquiry_id"
      : names.has("id")
        ? "e.id"
        : names.has("created_at")
          ? "e.created_at"
          : "1";
    const [rows] = await pool.query(
      `SELECT e.*, p.product_name
       FROM enquiries e
       LEFT JOIN products p ON p.product_id = e.product_id
       ORDER BY ${orderExpr} DESC`
    );
    return res.json({ success: true, enquiries: rows });
  } catch (error) {
    console.error("ADMIN ENQUIRIES ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
  }
});

router.get("/contact-messages", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM contact_messages");
    const names = columnNameSet(columns);
    const orderBy = names.has("id")
      ? "id"
      : names.has("message_id")
        ? "message_id"
        : names.has("created_at")
          ? "created_at"
          : "1";
    const [rows] = await pool.query(`SELECT * FROM contact_messages ORDER BY ${orderBy} DESC`);
    return res.json({ success: true, messages: rows });
  } catch (error) {
    console.error("CONTACT MESSAGES ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch contact messages" });
  }
});

module.exports = router;
