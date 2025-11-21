const rateLimit = require("express-rate-limit");

// Global limiter (light)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth limiter (strict)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 10,
  message: { error: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalLimiter, authLimiter };
