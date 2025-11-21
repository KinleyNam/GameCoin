const express = require("express");
const User = require("../models/User");
const { requireAuth } = require("../../middleware/auth");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// GET /users/me
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.uid)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await User.findById(req.user.uid).select("name walletAddress roles createdAt");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json({ user });
  } catch (err) { next(err); }
});

router.put(
  "/me",
  requireAuth,
  [ body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters").escape() ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user || !req.user.uid) return res.status(401).json({ error: "Unauthorized" });
    if (!req.body.name) return res.status(400).json({ error: "Name is required" });

    try {
      const user = await User.findByIdAndUpdate(
        req.user.uid,
        { name: req.body.name },
        { new: true }
      ).select("name walletAddress roles createdAt");

      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({ user });
    } catch (err) {
      console.error("Update profile failed:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// DELETE /users/me
router.delete("/me", requireAuth, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.uid);
    res.clearCookie(process.env.SESSION_COOKIE_NAME || "auth_token");
    res.clearCookie(process.env.REFRESH_COOKIE_NAME || "refresh_token");
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
