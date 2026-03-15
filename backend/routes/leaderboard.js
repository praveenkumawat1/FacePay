const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/leaderboard - top 10 users by coins
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ is_active: true })
      .sort({ coins: -1 })
      .limit(10)
      .select("full_name coins")
      .lean();

    const result = users.map((u, index) => ({
      rank: index + 1,
      name: u.full_name,
      coins: u.coins,
      isMe: false, // Frontend will identify the current user
    }));

    res.json(result);
  } catch (err) {
    console.error("Leaderboard GET error:", err.message);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
