// const jwt = require("jsonwebtoken");

// function issueToken(payload) {
//   return jwt.sign(payload, process.env.JWT_SECRET || "change_this_secret", {
//     expiresIn: "24h"
//   });
// }

// function requireAuth(req, res, next) {
//   const header = req.headers.authorization || "";
//   const token = header.startsWith("Bearer ") ? header.slice(7) : null;

//   if (!token) {
//     return res.status(401).json({ success: false, message: "Unauthorized" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || "change_this_secret");
//     req.user = decoded;
//     return next();
//   } catch (error) {
//     return res.status(401).json({ success: false, message: "Invalid token" });
//   }
// }

// module.exports = {
//   issueToken,
//   requireAuth
// };
const jwt = require("jsonwebtoken");


// 🔐 CONFIG
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_in_dev_only";
const isProduction = process.env.NODE_ENV === "production";

if (!process.env.JWT_SECRET && isProduction) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}


// 🎟️ ISSUE TOKEN
function issueToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h"
  });
}


// 🔍 EXTRACT TOKEN

function extractToken(req) {
  const header = req.headers.authorization || "";

  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  return null;
}


// 🔐 REQUIRE AUTH

function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔥 Attach user to request
    req.user = {
      id: decoded.id,
      role: decoded.role || null
    };

    return next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token"
    });
  }
}


// 🛡️ OPTIONAL ROLE CHECK

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions"
      });
    }

    next();
  };
}

module.exports = {
  issueToken,
  requireAuth,
  requireRole
};