const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET /api/leaderboard - optimized top users fetch
router.get("/", auth, async (req, res) => {
  try {
    const myId = req.userId.toString();

    // 1. Get Top 10 users directly (very fast)
    const top10Users = await User.find({ is_active: true })
      .sort({ coins: -1 })
      .limit(10)
      .select("full_name coins _id")
      .lean();

    const response = top10Users.map((u, index) => ({
      rank: index + 1,
      name: u.full_name || "User",
      coins: u.coins || 0,
      isMe: u._id.toString() === myId,
    }));

    // 2. Check if current user is in Top 10
    const inTop10 = response.some((u) => u.isMe);

    if (!inTop10) {
      // 3. Find current user's actual rank only if not in top 10
      const myUser = await User.findById(myId).select("coins full_name");
      if (myUser) {
        const countHigher = await User.countDocuments({
          is_active: true,
          coins: { $gt: myUser.coins },
        });

        response.push({
          rank: countHigher + 1,
          name: myUser.full_name || "You",
          coins: myUser.coins || 0,
          isMe: true,
          isGap: true,
        });
      }
    }

    res.json(response);
  } catch (err) {
    console.error("Leaderboard GET error:", err.message);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
