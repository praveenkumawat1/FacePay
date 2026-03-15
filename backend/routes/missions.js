// routes/missions.js — FIXED VERSION
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const Mission = require("../models/Mission");
const UserMission = require("../models/UserMission");
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

// Middleware: optional auth — attach userId if token present, skip if not
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next(); // no token — continue without userId
  const token = header.split(" ")[1];
  if (!token) return next();
  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || decoded.id || decoded._id;
  } catch (_) {
    // invalid/expired token — continue without userId
  }
  next();
};

// GET /api/missions — optional auth, returns user progress if logged in
router.get("/", optionalAuth, async (req, res) => {
  try {
    const missions = await Mission.find().lean();

    // If user is authenticated, fetch their progress
    let progressMap = {};
    if (req.userId) {
      const userMissions = await UserMission.find({
        userId: req.userId,
      }).lean();
      userMissions.forEach((um) => {
        progressMap[um.missionId.toString()] = um;
      });
    }

    const result = missions.map((mission) => {
      const um = progressMap[mission._id.toString()];
      return {
        id: mission._id,
        title: mission.title,
        desc: mission.description,
        reward: mission.reward,
        total: mission.total,
        type: mission.type,
        icon: mission.icon,
        progress: um?.progress ?? 0,
        claimed: um?.claimed ?? false,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Missions GET error:", err.message);
    res.status(500).json({ error: "Failed to fetch missions" });
  }
});

// POST /api/missions/claim
router.post("/claim", auth, async (req, res) => {
  try {
    const { missionId } = req.body;
    if (!missionId)
      return res.status(400).json({ error: "missionId is required" });

    const mission = await Mission.findById(missionId);
    if (!mission) return res.status(404).json({ error: "Mission not found" });

    const userMission = await UserMission.findOne({
      userId: req.userId,
      missionId,
    });
    if (!userMission)
      return res.status(400).json({ error: "No progress found" });
    if (userMission.claimed)
      return res.status(400).json({ error: "Already claimed" });
    if (userMission.progress < mission.total)
      return res.status(400).json({ error: "Mission not completed yet" });

    userMission.claimed = true;
    await userMission.save();

    const user = await User.findById(req.userId);
    user.coins += mission.reward;
    await user.save();

    await recordHistory(
      req.userId,
      `Mission: ${mission.title}`,
      mission.reward,
      "credit",
    );

    if (req.io) {
      req.io
        .to(user._id.toString())
        .emit("message", { type: "coins_updated", coins: user.coins });
    }

    res.json({
      success: true,
      newCoins: user.coins, // ← frontend expects newCoins ✓
      message: `Claimed ${mission.reward} coins!`,
    });
  } catch (err) {
    console.error("Claim mission error:", err.message);
    res.status(500).json({ error: "Failed to claim mission" });
  }
});

// POST /api/missions/progress — update progress (called internally from other routes)
router.post("/progress", auth, async (req, res) => {
  try {
    const { missionType, increment = 1 } = req.body;
    if (!missionType)
      return res.status(400).json({ error: "missionType is required" });

    const missions = await Mission.find({ type: missionType });
    for (const mission of missions) {
      let um = await UserMission.findOne({
        userId: req.userId,
        missionId: mission._id,
      });
      if (!um) {
        um = new UserMission({
          userId: req.userId,
          missionId: mission._id,
          progress: 0,
          claimed: false,
        });
      }
      if (!um.claimed) {
        um.progress = Math.min(um.progress + increment, mission.total);
        await um.save();
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Mission progress error:", err.message);
    res.status(500).json({ error: "Failed to update mission progress" });
  }
});

module.exports = router;
