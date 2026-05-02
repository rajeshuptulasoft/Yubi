const pool = require("./db");

async function hasColumn(tableName, columnName) {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return rows.length > 0;
}

async function addColumnIfMissing(tableName, columnName, definition) {
  if (!(await hasColumn(tableName, columnName))) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function hasIndex(tableName, indexName) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.statistics
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?
     LIMIT 1`,
    [tableName, indexName]
  );
  return rows.length > 0;
}

async function ensureCoreTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      phone VARCHAR(20) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
      profile_picture VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      category_id INT AUTO_INCREMENT PRIMARY KEY,
      category_name VARCHAR(120) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      product_id INT AUTO_INCREMENT PRIMARY KEY,
      product_name VARCHAR(180) NOT NULL,
      description TEXT NULL,
      category VARCHAR(120) NOT NULL,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      stock INT NOT NULL DEFAULT 0,
      image_url VARCHAR(500) NULL,
      is_available TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_products_category_available (category, is_available)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blog (
      id INT AUTO_INCREMENT PRIMARY KEY,
      header VARCHAR(255) NOT NULL,
      paragraph TEXT NOT NULL,
      advimg VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_contact_messages_created_at (created_at)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NULL,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      address TEXT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      message TEXT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_enquiries_status_created_at (status, created_at)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS deliverypartners (
      delivery_partner_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(150) NULL,
      password VARCHAR(255) NULL,
      available TINYINT(1) NOT NULL DEFAULT 1,
      is_available TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_user (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      phone VARCHAR(20) NOT NULL UNIQUE,
      email VARCHAR(150) NULL,
      password VARCHAR(255) NOT NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_delivery_user_phone (phone),
      INDEX idx_delivery_user_status (status)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_addresses (
      address_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      address_line_1 VARCHAR(255) NOT NULL,
      address_line_2 VARCHAR(255) NULL,
      city VARCHAR(120) NOT NULL,
      state VARCHAR(120) NOT NULL,
      pincode VARCHAR(12) NOT NULL,
      landmark VARCHAR(255) NULL,
      is_default TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_addresses_user_default (user_id, is_default)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      customer_name VARCHAR(120) NOT NULL,
      customer_phone VARCHAR(20) NOT NULL,
      delivery_address TEXT NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      email VARCHAR(150) NULL,
      payment_method VARCHAR(40) NOT NULL DEFAULT 'cod',
      payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',
      payment_id VARCHAR(255) NULL,
      razorpay_order_id VARCHAR(255) NULL,
      status VARCHAR(40) NOT NULL DEFAULT 'pending',
      cancelled_by VARCHAR(30) NULL,
      cancel_code VARCHAR(80) NULL,
      cancel_reason TEXT NULL,
      cancelled_at DATETIME NULL,
      refund_status VARCHAR(40) NOT NULL DEFAULT 'none',
      delivery_partner_id INT NULL,
      assigned_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_orders_user_id (user_id),
      INDEX idx_orders_email (email),
      INDEX idx_orders_phone (customer_phone),
      INDEX idx_orders_status_created (status, created_at),
      INDEX idx_orders_delivery_partner (delivery_partner_id),
      UNIQUE KEY uk_orders_payment_id (payment_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NULL,
      product_name VARCHAR(180) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_order_items_order_id (order_id),
      INDEX idx_order_items_product_id (product_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS carts (
      cart_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_carts_user_id (user_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
      cart_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_cart_items_cart_product (cart_id, product_id),
      INDEX idx_cart_items_cart_id (cart_id),
      INDEX idx_cart_items_product_id (product_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_refresh_tokens_user_id (user_id),
      CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
    )
  `);

  await addColumnIfMissing("refresh_tokens", "token", "VARCHAR(255) NULL");
  await addColumnIfMissing("refresh_tokens", "expires_at", "DATETIME NULL");
  await addColumnIfMissing("users", "profile_picture", "VARCHAR(500) NULL");
  await addColumnIfMissing("orders", "user_id", "INT NULL");
  await addColumnIfMissing("orders", "email", "VARCHAR(150) NULL");
  await addColumnIfMissing("orders", "payment_status", "VARCHAR(40) NOT NULL DEFAULT 'pending'");
  await addColumnIfMissing("orders", "delivery_partner_id", "INT NULL");
  await addColumnIfMissing("orders", "assigned_at", "DATETIME NULL");
  await addColumnIfMissing("orders", "delivered_at", "DATETIME NULL");
  await addColumnIfMissing("orders", "payment_id", "VARCHAR(255) NULL");
  await addColumnIfMissing("orders", "razorpay_order_id", "VARCHAR(255) NULL");
  await addColumnIfMissing("orders", "cancelled_by", "VARCHAR(30) NULL");
  await addColumnIfMissing("orders", "cancel_code", "VARCHAR(80) NULL");
  await addColumnIfMissing("orders", "cancel_reason", "TEXT NULL");
  await addColumnIfMissing("orders", "cancelled_at", "DATETIME NULL");
  await addColumnIfMissing("orders", "refund_status", "VARCHAR(40) NOT NULL DEFAULT 'none'");
  if ((await hasColumn("orders", "payment_id")) && !(await hasIndex("orders", "uk_orders_payment_id"))) {
    await pool.query("CREATE UNIQUE INDEX uk_orders_payment_id ON orders (payment_id)");
  }
  await addColumnIfMissing("products", "product_name", "VARCHAR(180) NULL");
  await addColumnIfMissing("products", "description", "TEXT NULL");
  await addColumnIfMissing("products", "category", "VARCHAR(120) NULL");
  await addColumnIfMissing("products", "price", "DECIMAL(10, 2) NOT NULL DEFAULT 0.00");
  await addColumnIfMissing("products", "image_url", "VARCHAR(500) NULL");
  await addColumnIfMissing("products", "is_available", "TINYINT(1) NOT NULL DEFAULT 1");
  await addColumnIfMissing("products", "stock", "INT NOT NULL DEFAULT 0");
  await addColumnIfMissing("order_items", "product_id", "INT NULL");
  await addColumnIfMissing("deliverypartners", "available", "TINYINT(1) NOT NULL DEFAULT 1");
  await addColumnIfMissing("delivery_user", "email", "VARCHAR(150) NULL");
  await addColumnIfMissing("delivery_user", "status", "VARCHAR(40) NOT NULL DEFAULT 'active'");

  if (await hasColumn("products", "name")) {
    await pool.query("UPDATE products SET product_name = name WHERE (product_name IS NULL OR product_name = '')");
  }
  if (await hasColumn("products", "image")) {
    await pool.query("UPDATE products SET image_url = image WHERE image_url IS NULL");
  }
  if (await hasColumn("products", "available")) {
    await pool.query("UPDATE products SET is_available = available WHERE is_available IS NULL");
  }
  if (await hasColumn("products", "product_price")) {
    await pool.query("UPDATE products SET price = product_price WHERE price = 0 OR price IS NULL");
  }

  if (!(await hasColumn("deliverypartners", "is_available")) && (await hasColumn("deliverypartners", "available"))) {
    await pool.query("ALTER TABLE deliverypartners ADD COLUMN is_available TINYINT(1) NOT NULL DEFAULT 1");
  }
  if (await hasColumn("deliverypartners", "available") && (await hasColumn("deliverypartners", "is_available"))) {
    await pool.query("UPDATE deliverypartners SET is_available = available WHERE is_available IS NULL");
  }

  if (await hasColumn("refresh_tokens", "refresh_token")) {
    await pool.query("UPDATE refresh_tokens SET token = refresh_token WHERE token IS NULL");
  }

  await pool.query("UPDATE refresh_tokens SET expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE expires_at IS NULL");
  await pool.query("ALTER TABLE refresh_tokens MODIFY token VARCHAR(255) NOT NULL");
  await pool.query("ALTER TABLE refresh_tokens MODIFY expires_at DATETIME NOT NULL");
}

module.exports = { ensureCoreTables };
