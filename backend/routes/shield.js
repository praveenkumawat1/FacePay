// routes/shield.js — FIXED VERSION
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const User = require("../models/User");
const CoinHistory = require("../models/CoinHistory");

async function recordHistory(userId, label, coins, type = "credit") {
  try {
    await CoinHistory.create({
      userId,
      label,
      coins,
      type,
      time: new Date().toLocaleString("en-IN"),
    });
  } catch (_) {}
}

// POST /api/shield/purchase
router.post("/purchase", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const SHIELD_COST = 100;
    if (user.coins < SHIELD_COST) {
      return res.status(400).json({ error: "Insufficient coins" });
    }

    user.coins -= SHIELD_COST;
    user.hasShield = true;
    user.shieldExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    await recordHistory(
      req.userId,
      "Purchased Streak Shield",
      SHIELD_COST,
      "debit",
    );

    if (req.io) {
      req.io
        .to(user._id.toString())
        .emit("message", { type: "coins_updated", coins: user.coins });
    }

    res.json({
      success: true,
      newCoins: user.coins, // ← frontend expects newCoins ✓
      message: "Streak Shield activated for 30 days",
    });
  } catch (err) {
    console.error("Shield purchase error:", err.message);
    res.status(500).json({ error: "Failed to purchase shield" });
  }
});

module.exports = router;
