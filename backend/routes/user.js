const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CoinHistory = require("../models/CoinHistory");
const auth = require("../middleware/auth");

// Helper function to generate unique referral code
const generateReferralCode = () =>
  "USER" + Math.random().toString(36).substring(2, 8).toUpperCase();

// ==================== USER STATS ====================
// GET /api/user/stats
router.get("/user/stats", auth, async (req, res) => {
  try {
    let user = await User.findById(req.userId);
    if (!user) {
      // New user – create with welcome bonus and scratch card
      const referralCode = generateReferralCode();
      user = new User({
        _id: req.userId,
        referral_code: referralCode,
        scratchCardAvailable: true, // free scratch card on signup
        coins: 50, // optional welcome bonus
      });
      await user.save();
    }
    res.json({
      coins: user.coins,
      streak: user.streak,
      claimedToday: user.lastClaimDate
        ? new Date(user.lastClaimDate).toDateString() ===
          new Date().toDateString()
        : false,
      referralCode: user.referral_code,
      totalCashback: user.totalCashback,
      referralBonus: user.referralChainBonus,
      splitRewards: user.billSplitRewards,
      upiStreak: user.upiStreak,
      scratchAvail: user.scratchCardAvailable,
      hasShield: user.hasShield,
    });
  } catch (err) {
    console.error("Error in /user/stats:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== DAILY CLAIM ====================
// POST /api/claim-daily
router.post("/claim-daily", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const today = new Date().setHours(0, 0, 0, 0);
    const lastClaim = user.lastClaimDate
      ? new Date(user.lastClaimDate).setHours(0, 0, 0, 0)
      : null;

    if (lastClaim === today) {
      return res.status(400).json({ error: "Already claimed today" });
    }

    // Streak logic
    if (lastClaim && lastClaim === today - 86400000) {
      user.streak += 1;
    } else {
      if (user.hasShield) {
        user.hasShield = false;
        user.shieldExpiry = null;
      } else {
        user.streak = 1;
      }
    }

    user.coins += 50;
    user.lastClaimDate = new Date();
    await user.save();

    await CoinHistory.create({
      userId: user._id,
      label: "Daily Claim",
      coins: 50,
      type: "credit",
    });

    res.json({ success: true, newCoins: user.coins, streak: user.streak });
  } catch (err) {
    console.error("Error in /claim-daily:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== SPIN RESULT ====================
// POST /api/spin-result
router.post("/spin-result", auth, async (req, res) => {
  try {
    const { result } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ----- COOLDOWN CHECK (24 hours) -----
    if (user.lastSpinDate) {
      const hoursSinceLastSpin =
        (Date.now() - new Date(user.lastSpinDate)) / (1000 * 60 * 60);
      if (hoursSinceLastSpin < 24) {
        const hoursLeft = 24 - Math.floor(hoursSinceLastSpin);
        return res.status(400).json({
          error: `Spin again in ${hoursLeft} hour(s)`,
          nextSpinTime: new Date(
            user.lastSpinDate.getTime() + 24 * 60 * 60 * 1000,
          ),
        });
      }
    }

    if (user.coins < 10)
      return res.status(400).json({ error: "Insufficient coins" });
    user.coins -= 10;

    let coinChange = 0;
    let historyLabel = "Spin: ";
    if (typeof result.value === "number" && result.value > 0) {
      coinChange = result.value;
      historyLabel += `won ${result.value} coins`;
    } else if (result.value === "coupon") {
      coinChange = 0;
      historyLabel += "won a coupon";
      // Optionally create a coupon for the user
    } else if (result.value === "mystery") {
      coinChange = 65;
      historyLabel += "mystery box";
    } else {
      coinChange = 0;
      historyLabel += "try again";
    }

    user.coins += coinChange;
    user.lastSpinDate = new Date(); // update last spin time
    await user.save();

    if (coinChange > 0) {
      await CoinHistory.create({
        userId: user._id,
        label: historyLabel,
        coins: coinChange,
        type: "credit",
      });
    }

    const nextSpinTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    res.json({ newCoins: user.coins, nextSpinTime });
  } catch (err) {
    console.error("Error in /spin-result:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== SCRATCH REVEAL ====================
// POST /api/scratch-reveal
router.post("/scratch-reveal", auth, async (req, res) => {
  try {
    const { prize } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.scratchCardAvailable)
      return res.status(400).json({ error: "No scratch card available" });

    user.scratchCardAvailable = false;
    let coinGain = 0;
    if (prize.includes("₹10")) coinGain = 10;
    else if (prize.includes("₹50")) coinGain = 50;
    else if (prize.includes("₹100")) coinGain = 100;
    else if (prize.includes("Coupon")) {
      // Create a coupon for the user – you can implement coupon creation here
      // For now, we just give 0 coins
    }

    user.coins += coinGain;
    await user.save();

    if (coinGain > 0) {
      await CoinHistory.create({
        userId: user._id,
        label: "Scratch Card",
        coins: coinGain,
        type: "credit",
      });
    }

    res.json({ newCoins: user.coins });
  } catch (err) {
    console.error("Error in /scratch-reveal:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== REFERRAL CODE ====================
// GET /api/referral-code
router.get("/referral-code", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("referral_code");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, code: user.referral_code });
  } catch (err) {
    console.error("Error in /referral-code:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== APPLY REFERRAL ====================
// POST /api/apply-referral
router.post("/apply-referral", auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Referral code required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.referred_by) {
      return res.status(400).json({ error: "Referral already applied" });
    }

    const referrer = await User.findOne({ referral_code: code });
    if (!referrer)
      return res.status(404).json({ error: "Invalid referral code" });
    if (referrer._id.toString() === user._id.toString()) {
      return res.status(400).json({ error: "Cannot refer yourself" });
    }

    const BONUS = 100;
    user.coins += BONUS;
    user.referred_by = code; // or referrer._id
    await user.save();

    referrer.coins += BONUS;
    referrer.referralChainBonus = (referrer.referralChainBonus || 0) + BONUS;
    await referrer.save();

    await CoinHistory.create({
      userId: user._id,
      label: "Referral Bonus",
      coins: BONUS,
      type: "credit",
    });
    await CoinHistory.create({
      userId: referrer._id,
      label: "Referral Bonus",
      coins: BONUS,
      type: "credit",
    });

    res.json({ success: true, message: "Referral applied successfully" });
  } catch (err) {
    console.error("Error in /apply-referral:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
