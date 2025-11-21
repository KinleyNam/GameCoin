const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authLimiter } = require("../../middleware/rateLimit");
const { requireAuth } = require("../../middleware/auth");

const { body, validationResult } = require("express-validator");

const router = express.Router();
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "auth_token";

// Helpers
function signAccessToken(user) {
  return jwt.sign(
    { uid: user._id, walletAddress: user.walletAddress, roles: user.roles },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
  );
}

const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

// Register
router.post(
  "/register", 
  authLimiter,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters").escape(),
    body("walletAddress").trim().isHexadecimal().isLength({ min: 42, max: 42 }).withMessage("Wallet address must be 42 hex characters").toLowerCase(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars").matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/).withMessage("Password must contain at least one uppercase letter, one number, and one special character"),
  ],async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, walletAddress, password } = req.body;
      if (!name || !walletAddress || !password)
        return res.status(400).json({ error: "Missing fields" });

      const existing = await User.findOne({ walletAddress });
      if (existing)
        return res.status(409).json({ error: "Wallet already registered" });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, walletAddress, passwordHash });

      res.status(201).json({ id: user._id, walletAddress: user.walletAddress });
    } catch (err) {
      next(err);
    }
  }
);

// Login
router.post(
  "/login",
  authLimiter,
  [
    body("walletAddress").trim().isHexadecimal().isLength({ min: 42, max: 42 }).withMessage("Wallet address must be 42 hex characters").toLowerCase(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters").matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/).withMessage("Password must contain at least one uppercase letter, one number, and one special character"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { walletAddress, password } = req.body;
      const user = await User.findOne({ walletAddress });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });

      const token = signAccessToken(user);
      res.cookie(COOKIE_NAME, token, COOKIE_SETTINGS);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  }
);

// Logout
router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    res.clearCookie(COOKIE_NAME, { ...COOKIE_SETTINGS, path: "/" });
    res.json({ ok: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
