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

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Purchase error" });
  }
});

// AI SECURITY ENHANCEMENTS: Tracking & Geo-Log
const ActivityLog = require("../models/ActivityLog");
const EngagementLog = require("../models/EngagementLog");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer Config for Voice Logs
const voiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/security_voice/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const userId = req.userId || "anonymous";
    cb(null, `voice_${userId}_${Date.now()}.wav`);
  },
});
const uploadVoice = multer({ storage: voiceStorage });

router.post("/update-location", auth, async (req, res) => {
  const { lat, lon } = req.body;
  try {
    if (!req.userId) return res.status(401).send("Unauthorized");
    await ActivityLog.create({
      userId: req.userId,
      action: "GEO_HEARTBEAT",
      location: { lat, lon },
      ipAddress: req.ip,
      device: req.headers["user-agent"],
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Geo error:", err);
    res.status(500).send("Geo log error");
  }
});

router.post(
  "/voice-log",
  auth,
  uploadVoice.single("audio"),
  async (req, res) => {
    try {
      const userId = req.userId;
      const filePath = req.file ? req.file.path : null;

      if (!filePath)
        return res.status(400).json({ error: "No audio file uploaded" });

      // Log the voice recording in ActivityLog
      await ActivityLog.create({
        userId,
        action: "VOICE_RECORDING_CAPTURED",
        ipAddress: req.ip,
        device: req.headers["user-agent"],
        location: { country: "Stored", city: filePath }, // Storing path in city field for easy lookup
      });

      console.log(`[VOICE LOG] Recorded for ${userId}: ${filePath}`);
      res.json({ success: true, file: filePath });
    } catch (err) {
      console.error("Voice log error:", err);
      res.status(500).send("Voice log error");
    }
  },
);

router.post("/engagement-pulse", async (req, res) => {
  const { userId, sessionId, sectionId, dwellTime, scrollDepth, clickCount } =
    req.body;
  try {
    await EngagementLog.findOneAndUpdate(
      { sessionId, sectionId },
      { userId, $inc: { dwellTime, clickCount }, scrollDepth },
      { upsert: true },
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Pulse error:", err);
    res.status(500).send("Engagement log error");
  }
});

module.exports = router;
