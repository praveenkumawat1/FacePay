// routes/marketplace.js — FIXED VERSION
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const MarketplaceItem = require("../models/MarketplaceItem");
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Redemption = require("../models/Redemption");
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

// GET /api/marketplace — all active items
router.get("/", async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ active: true })
      .sort({ price: 1 })
      .lean();
    res.json(items);
  } catch (err) {
    console.error("Marketplace GET error:", err.message);
    res.status(500).json({ error: "Failed to fetch marketplace items" });
  }
});

// POST /api/marketplace/redeem
router.post("/redeem", auth, async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: "itemId is required" });

    const [user, item] = await Promise.all([
      User.findById(req.userId),
      MarketplaceItem.findById(itemId),
    ]);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!item || !item.active)
      return res.status(404).json({ error: "Item not found or inactive" });
    if (user.coins < item.price)
      return res.status(400).json({ error: "Insufficient coins" });

    user.coins -= item.price;
    await user.save();

    await Redemption.create({
      userId: user._id,
      itemId: item._id,
      itemTitle: item.title,
      coinsSpent: item.price,
    });

    // Generate coupon code for the redeemed item
    let couponCode = null;
    if (item.brand) {
      couponCode = `${item.brand.substring(0, 3).toUpperCase()}${Date.now().toString(36).substring(2, 8).toUpperCase()}`;
      await Coupon.create({
        brand: item.brand,
        description: item.title,
        code: couponCode,
        category: "Other",
        discount: "Special",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    await recordHistory(
      req.userId,
      `Redeemed ${item.title}`,
      item.price,
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
      couponCode,
      message: `Successfully redeemed ${item.title}`,
    });
  } catch (err) {
    console.error("Redeem error:", err.message);
    res.status(500).json({ error: "Redemption failed" });
  }
});

module.exports = router;
