const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  walletAddress: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: ["user"] },
  refreshToken: { type: String, default: null },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
}, { timestamps: true });

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model("User", userSchema);
