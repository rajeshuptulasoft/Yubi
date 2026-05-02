const crypto = require("crypto");
const jwt = require("jsonwebtoken");

function normalizeItems(items) {
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      return JSON.parse(items);
    } catch (_error) {
      return [];
    }
  }
  return [];
}

function createRefreshToken() {
  return crypto.randomBytes(40).toString("hex");
}

function generateToken(user) {
  const payload = {
    id: user.user_id,
    role: user.role,
    email: user.email,
    fullName: user.name
  };
  const secret = process.env.JWT_SECRET || "your_secret_key";
  const token = jwt.sign(payload, secret, { expiresIn: "7d" });
  return token;
}

module.exports = {
  normalizeItems,
  createRefreshToken,
  generateToken
};
