const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Razorpay = require("razorpay");
const pool = require("../config/db");
const { normalizeItems } = require("../utils/helpers");
const { issueToken, requireAuth } = require("../middleware/auth");

const router = express.Router();
const BCRYPT_SALT_ROUNDS = 10;
const profileUploadDir = path.join(process.cwd(), "..", "uploads", "profiles");
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}
const uploadProfileImage = multer({ dest: profileUploadDir });

function parseIfString(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return value;
  }
}
//get all categories
router.get("/categories", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT DISTINCT category_name AS name FROM categories ORDER BY category_name");
    return res.json({ success: true, categories: rows.map((x) => x.name) });
  } catch (_error) {
    return res.json({
      success: true,
      categories: ["Pizza", "Burger", "Snacks", "Desserts", "Drinks"]
    });
  }
});

//get all products
router.get("/products", async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? "WHERE is_available = 1 AND category = ?" : "WHERE is_available = 1";
    const params = category ? [category] : [];
    const [rows] = await pool.query(
      `SELECT product_id, product_name, description, category, price, image_url, is_available
       FROM products ${where} ORDER BY product_id DESC`,
      params
    );
    return res.json({ success: true, products: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
  }
});

//get all spices and grocery products
router.get("/foods-spices", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT product_id, product_name, description, category, price, image_url, is_available
     FROM products
     WHERE is_available = 1
       AND (
         LOWER(category) LIKE '%spice%'
         OR LOWER(category) LIKE '%grocery%'
       )
     ORDER BY product_id DESC`
  );
  return res.json({ success: true, products: rows });
});

//get all agro products
router.get("/agro-products", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT product_id, product_name, description, category, price, image_url, is_available
     FROM products
     WHERE is_available = 1
       AND (
         LOWER(category) LIKE '%agro%'
         OR LOWER(category) LIKE '%farm%'
       )
     ORDER BY product_id DESC`
  );
  return res.json({ success: true, products: rows });
});

//get all blogs
router.get("/blogs", async (_req, res) => {
  const [rows] = await pool.query("SELECT id, header, paragraph, advimg FROM blog ORDER BY id DESC");
  return res.json({ success: true, blogs: rows });
});

//send contact message
router.post("/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }
  await pool.query(
    "INSERT INTO contact_messages (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
    [name, email, phone, subject, message]
  );
  return res.status(201).json({ success: true, message: "Message sent successfully" });
});

//send enquiry
router.post("/enquiry", async (req, res) => {
  const { product_id, name, email, phone, address, quantity, message } = req.body;
  await pool.query(
    `INSERT INTO enquiries (product_id, name, email, phone, address, quantity, message, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'new', NOW())`,
    [product_id, name, email, phone, address, quantity, message || null]
  );
  return res.status(201).json({ success: true, message: "Enquiry submitted successfully" });
});

//register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, confirm_password: confirmPassword } = req.body;
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const [existing] = await pool.query("SELECT user_id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existing.length) return res.status(409).json({ success: false, message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    await pool.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'customer')",
      [name, email, phone, hashedPassword]
    );
    return res.json({ success: true, message: "Registration successful" });
  } catch (error) {
    if (error && error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        success: false,
        message: "Required database table is missing. Please import the SQL schema and try again."
      });
    }
    return res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
});

//login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query(
      "SELECT user_id, name, email, password, role FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    if (!users.length) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const user = users[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = issueToken({
      id: user.user_id,
      role: user.role
    });

    return res.json({
      success: true,
      token,
      user: { id: user.user_id, role: user.role, email: user.email, fullName: user.name }
    });
  } catch (error) {
    if (error && error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        success: false,
        message: "Required database table is missing. Please import the SQL schema and try again."
      });
    }
    return res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
});

//logout user
router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (refreshToken) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = ?", [refreshToken]);
  }
  res.clearCookie("refresh_token");
  return res.json({ success: true, message: "Logged out successfully" });
});

//check session
router.get("/session-check", (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return res.json({
      success: true,
      isSessionActive: false,
      showWarning: false,
      timeRemaining: 0
    });
  }
  return res.json({
    success: true,
    isSessionActive: true,
    showWarning: false,
    timeRemaining: 1800
  });
});

//get logged in user profile
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const [rows] = await pool.query(
      "SELECT user_id, name, email, phone, role, profile_picture, created_at FROM users WHERE user_id = ? LIMIT 1",
      [user_id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, profile: rows[0] });
  } catch (error) {
    console.error("PROFILE FETCH ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});

router.put("/profile", requireAuth, uploadProfileImage.single("profile_picture"), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const user_id = req.user.id;
    const { name, email, phone } = req.body;
    const uploadedProfilePicturePath = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "").trim();
    const normalizedPhone = String(phone || "").trim();

    if (!normalizedName || !normalizedEmail || !normalizedPhone) {
      return res.status(400).json({ success: false, message: "name, email and phone are required" });
    }

    if (normalizedEmail) {
      const [existingEmail] = await connection.query(
        "SELECT user_id FROM users WHERE email = ? AND user_id != ? LIMIT 1",
        [normalizedEmail, user_id]
      );
      if (existingEmail.length) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }
    }

    if (normalizedPhone) {
      const [existingPhone] = await connection.query(
        "SELECT user_id FROM users WHERE phone = ? AND user_id != ? LIMIT 1",
        [normalizedPhone, user_id]
      );
      if (existingPhone.length) {
        return res.status(409).json({ success: false, message: "Phone already in use" });
      }
    }

    await connection.beginTransaction();

    const [existingUserRows] = await connection.query(
      "SELECT profile_picture FROM users WHERE user_id = ? LIMIT 1",
      [user_id]
    );
    const existingProfilePicture = existingUserRows.length ? existingUserRows[0].profile_picture : null;
    const finalProfilePicture = uploadedProfilePicturePath || existingProfilePicture || null;

    await connection.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, profile_picture = ? WHERE user_id = ?",
      [normalizedName, normalizedEmail, normalizedPhone, finalProfilePicture, user_id]
    );

    await connection.commit();

    const [updatedRows] = await connection.query(
      "SELECT user_id, name, email, phone, role, profile_picture, created_at FROM users WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedRows[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error("PROFILE UPDATE ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  } finally {
    connection.release();
  }
});
//set default delivery address
router.patch("/delivery-addresses/:id/default", requireAuth, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const user_id = req.user.id;
    const address_id = req.params.id;

    await connection.beginTransaction();

    // 🔐 Check ownership
    const [rows] = await connection.query(
      "SELECT address_id FROM user_addresses WHERE address_id = ? AND user_id = ? LIMIT 1",
      [address_id, user_id]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    // 🔄 Remove previous default
    await connection.query(
      "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
      [user_id]
    );

    // ⭐ Set new default
    await connection.query(
      "UPDATE user_addresses SET is_default = 1 WHERE address_id = ?",
      [address_id]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Default address updated successfully"
    });

  } catch (error) {
    await connection.rollback();
    console.error("SET DEFAULT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update default address"
    });
  } finally {
    connection.release();
  }
});

router.get("/delivery-addresses", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [rows] = await pool.query(
      `SELECT address_id, user_id, address_line_1, address_line_2, city, state, pincode, landmark, is_default 
       FROM user_addresses 
       WHERE user_id = ? 
       ORDER BY is_default DESC, address_id DESC`,
      [user_id]
    );

    return res.json({ success: true, addresses: rows });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

//add delivery address


// router.post("/delivery_addresses", async (req, res) => {
//   const { action } = req.body;
//   if (action === "create") {
//     const { user_id, address_line_1, address_line_2, city, state, pincode, landmark, is_default } = req.body;
//     await pool.query(
//       `INSERT INTO user_addresses
//        (user_id, address_line_1, address_line_2, city, state, pincode, landmark, is_default)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [user_id, address_line_1, address_line_2 || "", city, state, pincode, landmark || "", Number(is_default) ? 1 : 0]
//     );
//     return res.json({ success: true, message: "Address added successfully" });
//   }
//   if (action === "update") {
//     const { address_id, address_line_1, address_line_2, city, state, pincode, landmark, is_default } = req.body;
//     await pool.query(
//       `UPDATE user_addresses
//        SET address_line_1 = ?, address_line_2 = ?, city = ?, state = ?, pincode = ?, landmark = ?, is_default = ?
//        WHERE address_id = ?`,
//       [address_line_1, address_line_2 || "", city, state, pincode, landmark || "", Number(is_default) ? 1 : 0, address_id]
//     );
//     return res.json({ success: true, message: "Address updated successfully" });
//   }
//   if (action === "delete") {
//     await pool.query("DELETE FROM user_addresses WHERE address_id = ?", [req.body.address_id]);
//     return res.json({ success: true, message: "Address deleted successfully" });
//   }
//   return res.status(400).json({ success: false, message: "Invalid action" });
// });
router.post("/delivery-addresses", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const {
      address_line_1,
      address_line_2,
      city,
      state,
      pincode,
      landmark,
      is_default
    } = req.body;

    if (!address_line_1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    // 🔥 If default → unset previous default
    if (Number(is_default)) {
      await pool.query(
        "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
        [user_id]
      );
    }

    await pool.query(
      `INSERT INTO user_addresses 
       (user_id, address_line_1, address_line_2, city, state, pincode, landmark, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        address_line_1,
        address_line_2 || "",
        city,
        state,
        pincode,
        landmark || "",
        Number(is_default) ? 1 : 0
      ]
    );

    return res.json({ success: true, message: "Address added successfully" });

  } catch (error) {
    console.error("CREATE ADDRESS ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
//update delivery address
router.put("/delivery-addresses/:id", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const address_id = req.params.id;

    const {
      address_line_1,
      address_line_2,
      city,
      state,
      pincode,
      landmark,
      is_default
    } = req.body;

    if (!address_line_1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    // 🔥 Check ownership
    const [existing] = await pool.query(
      "SELECT address_id FROM user_addresses WHERE address_id = ? AND user_id = ?",
      [address_id, user_id]
    );

    if (!existing.length) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or address not found"
      });
    }

    // 🔥 Handle default
    if (Number(is_default)) {
      await pool.query(
        "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
        [user_id]
      );
    }

    await pool.query(
      `UPDATE user_addresses
       SET address_line_1 = ?, address_line_2 = ?, city = ?, state = ?, pincode = ?, landmark = ?, is_default = ?
       WHERE address_id = ? AND user_id = ?`,
      [
        address_line_1,
        address_line_2 || "",
        city,
        state,
        pincode,
        landmark || "",
        Number(is_default) ? 1 : 0,
        address_id,
        user_id
      ]
    );

    return res.json({ success: true, message: "Address updated successfully" });

  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
//delete address
router.delete("/delivery-addresses/:id", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const address_id = req.params.id;

    const [result] = await pool.query(
      "DELETE FROM user_addresses WHERE address_id = ? AND user_id = ?",
      [address_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized or address not found"
      });
    }

    return res.json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

function verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!secret || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return false;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === razorpay_signature;
}

//place order (server-priced, stock-safe, user-scoped, payment-verified, transactional)
router.post("/order", requireAuth, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const user_id = req.user.id;
    const {
      address_id,
      items,
      payment_method: rawPaymentMethod,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = req.body;

    const payment_method = rawPaymentMethod === "online" ? "online" : "cod";

    if (!address_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Address and items are required"
      });
    }

    if (!["cod", "online"].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    await connection.beginTransaction();

    if (payment_method === "online") {
      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Razorpay payment_id, order_id, and signature are required for online orders"
        });
      }

      const [existingPayment] = await connection.query(
        "SELECT order_id FROM orders WHERE payment_id = ? LIMIT 1 FOR UPDATE",
        [razorpay_payment_id]
      );
      if (existingPayment.length) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: "Duplicate payment detected"
        });
      }

      if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Online payment verification failed"
        });
      }
    }

    const [userRows] = await connection.query(
      "SELECT user_id, name, phone, email FROM users WHERE user_id = ? LIMIT 1",
      [user_id]
    );
    if (!userRows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const customer = userRows[0];

    const [addressRows] = await connection.query(
      "SELECT * FROM user_addresses WHERE address_id = ? AND user_id = ? FOR UPDATE",
      [address_id, user_id]
    );

    if (!addressRows.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Address not found"
      });
    }

    const address = addressRows[0];
    const deliveryParts = [
      address.address_line_1,
      address.address_line_2,
      address.landmark,
      address.city,
      address.state,
      address.pincode
    ].filter((p) => p != null && String(p).trim() !== "");
    const delivery_address = deliveryParts.join(", ");

    const sortedItems = [...items].sort((a, b) => Number(a.product_id) - Number(b.product_id));
    let total_amount = 0;
    const orderItems = [];

    for (const raw of sortedItems) {
      const product_id = Number(raw.product_id);
      const quantity = Math.floor(Number(raw.quantity));
      if (!Number.isFinite(product_id) || product_id <= 0 || !Number.isFinite(quantity) || quantity < 1) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Each item must have a valid product_id and quantity >= 1"
        });
      }

      const [productRows] = await connection.query(
        "SELECT * FROM products WHERE product_id = ? AND is_available = 1 FOR UPDATE",
        [product_id]
      );

      if (!productRows.length) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Product unavailable or not found: ${product_id}`
        });
      }

      const product = productRows[0];
      const displayName = product.product_name || product.name || "Product";
      const unitPrice = Number(product.price);
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Invalid price for product: ${product_id}`
        });
      }

      const stock = Number(product.stock);
      if (!Number.isFinite(stock) || stock < quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${displayName}`
        });
      }

      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      total_amount = Math.round((total_amount + lineTotal) * 100) / 100;

      orderItems.push({
        product_id,
        displayName,
        quantity,
        price: unitPrice,
        lineTotal
      });
    }

    const payment_status = payment_method === "online" ? "paid" : "pending";

    const payment_id = payment_method === "online" ? razorpay_payment_id : null;
    const razorpay_order_id_value = payment_method === "online" ? razorpay_order_id : null;

    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (user_id, customer_name, customer_phone, delivery_address, total_amount, email, payment_method, payment_status, payment_id, razorpay_order_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        user_id,
        customer.name || "Customer",
        customer.phone || "",
        delivery_address,
        total_amount,
        customer.email || null,
        payment_method,
        payment_status,
        payment_id,
        razorpay_order_id_value
      ]
    );

    const order_id = orderResult.insertId;

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items 
         (order_id, product_id, product_name, quantity, price) 
         VALUES (?, ?, ?, ?, ?)`,
        [order_id, item.product_id, item.displayName, item.quantity, item.price]
      );

      const [stockUpdate] = await connection.query(
        "UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?",
        [item.quantity, item.product_id, item.quantity]
      );
      if (stockUpdate.affectedRows !== 1) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: "Stock changed while placing order. Please review your cart and try again."
        });
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order_id,
      total_amount
    });
  } catch (error) {
    await connection.rollback();
    console.error("ORDER ERROR:", error);
    if (error && error.errno === 1062) {
      return res.status(409).json({
        success: false,
        message: "Duplicate payment detected"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Order failed"
    });
  } finally {
    connection.release();
  }
});



//cancel user order
router.post("/cancel-order", requireAuth, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { order_id, cancel_code, reason } = req.body;
    const user = req.user;

    await connection.beginTransaction();

    const [orders] = await connection.query(
      "SELECT * FROM orders WHERE order_id = ? FOR UPDATE",
      [order_id]
    );

    if (!orders.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = orders[0];

    // 🔐 Determine who is cancelling
    let cancelled_by = null;
    if (req.user.role === "customer") {
      cancelled_by = "user";
    }
    if (req.user.role === "delivery") {
      cancelled_by = "delivery";
    }
    if (req.user.role === "admin") {
      cancelled_by = "admin";
    }
    if (!cancelled_by) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: "Invalid role for cancellation"
      });
    }

    // 🚫 Status rules
    const rules = {
      customer: ["pending", "confirmed"],
      delivery: ["out_for_delivery"],
      admin: ["pending", "confirmed", "picked", "out_for_delivery"]
    };

    if (!rules[user.role]?.includes(order.status)) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "You cannot cancel this order at this stage"
      });
    }

    // 🔄 Restore stock
    const [items] = await connection.query(
      "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
      [order_id]
    );

    for (const item of items) {
      await connection.query(
        "UPDATE products SET stock = stock + ? WHERE product_id = ?",
        [item.quantity, item.product_id]
      );
    }

    // 💰 Refund logic
    let refund_status = "none";

    if (order.payment_method === "online") {
      refund_status = "pending";
    }

    // ❌ Update order
    await connection.query(
      `UPDATE orders 
       SET status = 'cancelled',
           cancelled_by = ?,
           cancel_code = ?,
           cancel_reason = ?,
           cancelled_at = NOW(),
           refund_status = ?
       WHERE order_id = ?`,
      [cancelled_by, cancel_code || null, reason || null, refund_status, order_id]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: "Order cancelled successfully",
      cancelled_by,
      refund_status
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Cancel failed"
    });
  } finally {
    connection.release();
  }
});

//get user orders (authenticated user only — uses JWT id, no query-string filters)
router.get("/user-order", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const [orders] = await pool.query(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY order_id DESC",
      [user_id]
    );
    for (const order of orders) {
      const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [order.order_id]);
      order.items = items;
    }
    return res.json({ success: true, orders });
  } catch (error) {
    console.error("USER ORDERS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

//get delivery status
router.get("/order-details/:order_id", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { order_id } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM orders
       WHERE order_id = ? AND user_id = ?
       LIMIT 1`,
      [order_id, user_id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const order = rows[0];
    const [items] = await pool.query(
      "SELECT order_item_id, order_id, product_id, product_name, quantity, price FROM order_items WHERE order_id = ?",
      [order.order_id]
    );
    order.items = items;

    return res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error("DELIVERY STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order"
    });
  }
});

//get order updates
router.get("/order-status/:order_id", requireAuth, async (req, res) => {
  const user_id = req.user.id;
  const { order_id } = req.params;
  if (!order_id) return res.status(400).json({ success: false, message: "order_id is required" });
  const [rows] = await pool.query(
    `SELECT order_id, status, payment_status, assigned_at, delivered_at, created_at
     FROM orders
     WHERE order_id = ? AND user_id = ?`,
    [order_id, user_id]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: "Order not found" });
  return res.json({ success: true, update: rows[0] });
});

//get cart
router.get("/cart", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [cartRows] = await pool.query(
      "SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    if (!cartRows.length) {
      return res.json({
        success: true,
        items: [],
        summary: { total_items: 0, total_amount: 0 }
      });
    }

    const cartId = cartRows[0].cart_id;

    const [items] = await pool.query(
      `SELECT 
        ci.cart_item_id, 
        ci.product_id, 
        p.product_name, 
        p.category,
        p.image_url, 
        ci.quantity, 
        ci.price, 
        (ci.quantity * ci.price) AS line_total
       FROM cart_items ci
       INNER JOIN products p ON p.product_id = ci.product_id
       WHERE ci.cart_id = ?
       ORDER BY ci.cart_item_id DESC`,
      [cartId]
    );

    const totalItems = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.line_total || 0),
      0
    );

    return res.json({
      success: true,
      items,
      summary: {
        total_items: totalItems,
        total_amount: Number(totalAmount.toFixed(2))
      }
    });

  } catch (error) {
    console.error("GET CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
});

//add to cart
router.post("/cart", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "product_id is required"
      });
    }

    const qty = Math.max(1, Number(quantity || 1));

    // 🔍 Check product
    const [productRows] = await pool.query(
      "SELECT product_id, price, is_available FROM products WHERE product_id = ? LIMIT 1",
      [product_id]
    );

    if (!productRows.length || !Number(productRows[0].is_available)) {
      return res.status(404).json({
        success: false,
        message: "Product not available"
      });
    }

    const price = Number(productRows[0].price);

    // 🛒 Get or create cart
    const [cartRows] = await pool.query(
      "SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    let cartId;

    if (cartRows.length) {
      cartId = cartRows[0].cart_id;
    } else {
      const [newCart] = await pool.query(
        "INSERT INTO carts (user_id) VALUES (?)",
        [user_id]
      );
      cartId = newCart.insertId;
    }

    // 📦 Check existing item
    const [existingItems] = await pool.query(
      "SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1",
      [cartId, product_id]
    );

    if (existingItems.length) {
      // 🔄 Update quantity
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + ?, price = ? WHERE cart_item_id = ?",
        [qty, price, existingItems[0].cart_item_id]
      );
    } else {
      // ➕ Insert new item
      await pool.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [cartId, product_id, qty, price]
      );
    }

    return res.status(201).json({
      success: true,
      message: "Item added to cart"
    });

  } catch (error) {
    console.error("ADD TO CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart"
    });
  }
});

//remove from cart
router.delete("/cart/:cart_item_id", requireAuth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { cart_item_id } = req.params;

    if (!cart_item_id) {
      return res.status(400).json({
        success: false,
        message: "cart_item_id is required"
      });
    }

    // Get user's cart
    const [cartRows] = await pool.query(
      "SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    if (!cartRows.length) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const cartId = cartRows[0].cart_id;

    // Check if item exists in user's cart
    const [itemRows] = await pool.query(
      "SELECT cart_item_id FROM cart_items WHERE cart_item_id = ? AND cart_id = ? LIMIT 1",
      [cart_item_id, cartId]
    );

    if (!itemRows.length) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
      });
    }

    // Delete the item
    await pool.query(
      "DELETE FROM cart_items WHERE cart_item_id = ?",
      [cart_item_id]
    );

    return res.json({
      success: true,
      message: "Item removed from cart"
    });

  } catch (error) {
    console.error("REMOVE FROM CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove item from cart"
    });
  }
});

//create razorpay order
router.post("/razorpay-order",requireAuth, async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  const { amount, currency = "INR" } = req.body;
  const razorOrder = await razorpay.orders.create({ amount: Number(amount), currency });
  return res.json({
    success: true,
    razorpay_order_id: razorOrder.id,
    amount: razorOrder.amount,
    razorpay_key: process.env.RAZORPAY_KEY_ID
  });
});

//verify razorpay payment
router.post("/razorpay-verify", requireAuth,async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id } = req.body;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");
  if (expected !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Signature verification failed" });
  }
  await pool.query(
    "UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE order_id = ?",
    [order_id]
  );
  return res.json({ success: true, message: "Payment verified successfully" });
});

module.exports = router;
