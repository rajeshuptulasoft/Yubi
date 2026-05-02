const pool = require("../config/db");

function columnNameSet(rows) {
  return new Set(rows.map((c) => String(c.Field).toLowerCase()));
}

/** Primary key column on `deliverypartners`: init schema uses `delivery_partner_id`, legacy DBs often use `id`. */
async function deliveryPartnerIdColumn() {
  const [columns] = await pool.query("SHOW COLUMNS FROM deliverypartners");
  const names = columnNameSet(columns);
  if (names.has("delivery_partner_id")) return "delivery_partner_id";
  if (names.has("id")) return "id";
  return "delivery_partner_id";
}

module.exports = { deliveryPartnerIdColumn, columnNameSet };
