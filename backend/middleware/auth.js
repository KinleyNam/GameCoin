const jwt = require("jsonwebtoken");

const ACCESS_COOKIE = process.env.SESSION_COOKIE_NAME || "auth_token";

// Require a valid access token
function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[ACCESS_COOKIE];
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // { uid, walletAddress, roles }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Optional auth (does not block)
function optionalAuth(req, res, next) {
  try {
    const token = req.cookies?.[ACCESS_COOKIE];
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
  } catch (err) {
    // ignore errors, user stays unauthenticated
  }
  next();
}

// Require admin role
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  const roles = req.user.roles || [];
  if (!roles.includes("admin")) return res.status(403).json({ error: "Forbidden" });
  next();
}

module.exports = { requireAuth, optionalAuth, requireAdmin };
