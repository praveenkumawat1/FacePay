// ─────────────────────────────────────────────────────────────
// routes/coupons.js  — COMPLETE FIXED VERSION
// ─────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // expects req.userId

const User = require("../models/User");
const Coupon = require("../models/Coupon");
const MarketplaceItem = require("../models/MarketplaceItem");
const Redemption = require("../models/Redemption");
const Mission = require("../models/Mission");
const UserMission = require("../models/UserMission");
const CoinHistory = require("../models/CoinHistory");

// ── FeaturedOffer model — optional, falls back to hardcoded data ─
let FeaturedOffer = null;
try {
  FeaturedOffer = require("../models/FeaturedOffer");
} catch (_) {
  console.log("ℹ️  FeaturedOffer model not found — using hardcoded offers");
}

// Hardcoded featured offers (used when DB has no data or model missing)
const HARDCODED_OFFERS = [
  {
    brand: "Swiggy",
    discount: "Up to 60% off",
    code: "SWIG60",
    bg: "linear-gradient(135deg,#fc5c7d,#6a3093)",
  },
  {
    brand: "Amazon",
    discount: "₹200 off on ₹999",
    code: "AMZ200",
    bg: "linear-gradient(135deg,#f7971e,#ffd200)",
  },
  {
    brand: "MakeMyTrip",
    discount: "Flat ₹500 off",
    code: "MMT500",
    bg: "linear-gradient(135deg,#11998e,#38ef7d)",
  },
  {
    brand: "Zomato",
    discount: "40% off upto ₹80",
    code: "ZOM40",
    bg: "linear-gradient(135deg,#e52d27,#b31217)",
  },
  {
    brand: "Myntra",
    discount: "Extra 20% off",
    code: "MYN20",
    bg: "linear-gradient(135deg,#f953c6,#b91d73)",
  },
];

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE — optional auth (won't fail if no token)
// ─────────────────────────────────────────────────────────────
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();
  const token = header.split(" ")[1];
  if (!token) return next();
  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || decoded.id || decoded._id;
  } catch (_) {}
  next();
};

// ─────────────────────────────────────────────────────────────
// HELPER — same-day check
// ─────────────────────────────────────────────────────────────
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// ─────────────────────────────────────────────────────────────
// HELPER — safe CoinHistory create (won't crash if model missing)
// ─────────────────────────────────────────────────────────────
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

// ═════════════════════════════════════════════════════════════
// 1.  GET /api/coupons/dashboard
//     Main data endpoint — called by frontend as /api/user/stats equivalent
// ═════════════════════════════════════════════════════════════
router.get("/dashboard", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "coins streak lastClaimDate referralCode totalCashback referralChainBonus billSplitRewards upiStreak lastSpinDate hasShield shieldExpiry scratchAvail",
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const claimedToday = user.lastClaimDate
      ? isSameDay(user.lastClaimDate, new Date())
      : false;

    // Scratch card available?
    // Simple logic: available once per day, tracked via scratchAvail field
    const scratchAvail = user.scratchAvail ?? false;

    // Shield still valid?
    const hasShield =
      user.hasShield && user.shieldExpiry && user.shieldExpiry > new Date();

    res.json({
      success: true,
      coins: user.coins || 0,
      streak: user.streak || 0,
      claimedToday,
      referralCode: user.referralCode || "",
      totalCashback: user.totalCashback || 0,
      referralChainBonus: user.referralChainBonus || 0,
      billSplitRewards: user.billSplitRewards || 0,
      upiStreak: user.upiStreak || 0,
      scratchAvail,
      hasShield: !!hasShield,
    });
  } catch (err) {
    console.error("❌ Dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════
// 2.  GET /api/coupons  (global public coupons list)
// ═════════════════════════════════════════════════════════════
router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find({ expiryDate: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .lean();
    res.json(coupons);
  } catch (err) {
    console.error("❌ Coupons fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════
// 3.  GET /api/coupons/featured
//     FeaturedCarousel data
// ═════════════════════════════════════════════════════════════
router.get("/featured", async (req, res) => {
  try {
    // If model exists, try DB first
    if (FeaturedOffer) {
      const dbOffers = await FeaturedOffer.find({ active: true }).lean();
      // If DB has offers, return them; otherwise fall through to hardcoded
      if (dbOffers && dbOffers.length > 0) {
        return res.json(dbOffers);
      }
    }
    // Always fallback to hardcoded — never return empty or error
    return res.json(HARDCODED_OFFERS);
  } catch (err) {
    console.error("❌ Featured offers error:", err);
    // Even on error — return hardcoded data so frontend never breaks
    return res.json(HARDCODED_OFFERS);
  }
});

// ═════════════════════════════════════════════════════════════
// 4.  GET /api/coupons/leaderboard
// ═════════════════════════════════════════════════════════════
router.get("/leaderboard", auth, async (req, res) => {
  try {
    // Top 10 users by coins
    const topUsers = await User.find()
      .sort({ coins: -1 })
      .limit(10)
      .select("coins referralCode")
      .lean();

    const leaderboard = topUsers.map((u, i) => ({
      rank: i + 1,
      // Use referralCode prefix as display name (replace with actual name field if you have one)
      name: u.name || u.referralCode || `User #${i + 1}`,
      coins: u.coins || 0,
      tier: u.coins >= 1000 ? "Platinum" : u.coins >= 500 ? "Gold" : "Silver",
      isMe: u._id.toString() === req.userId.toString(),
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error("❌ Leaderboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════
// 5.  GET /api/coupons/coin-history
// ═════════════════════════════════════════════════════════════
router.get("/coin-history", optionalAuth, async (req, res) => {
  try {
    // If not logged in, return empty array (no error)
    if (!req.userId) return res.json([]);

    const history = await CoinHistory.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Map to frontend expected format: { label, time, coins, pos }
    const formatted = history.map((h) => ({
      label: h.label,
      time: h.time || new Date(h.createdAt).toLocaleString("en-IN"),
      coins: h.coins,
      pos: h.type === "credit",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Coin history error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════
// 6.  POST /api/coupons/claim-daily
// ═════════════════════════════════════════════════════════════
router.post("/claim-daily", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const today = new Date();
    const lastClaim = user.lastClaimDate ? new Date(user.lastClaimDate) : null;

    // Already claimed today
    if (lastClaim && isSameDay(lastClaim, today)) {
      return res.json({
        success: true,
        claimedToday: true,
        newBalance: user.coins,
        newCoins: user.coins, // alias for safety
        newStreak: user.streak,
        streak: user.streak, // alias for safety
        reward: 0,
        scratchAvail: user.scratchAvail || false,
      });
    }

    let streak = user.streak || 0;

    if (lastClaim) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (isSameDay(lastClaim, yesterday)) {
        // Consecutive day
        streak += 1;
      } else if (
        user.hasShield &&
        user.shieldExpiry &&
        new Date(user.shieldExpiry) > today
      ) {
        // Shield saves the streak for one missed day
        streak += 1;
        user.hasShield = false;
        user.shieldExpiry = null;
      } else {
        // Streak broken — reset
        streak = 1;
      }
    } else {
      // First ever claim
      streak = 1;
    }

    // Reset streak after day 7 (cycle restarts)
    if (streak > 7) streak = 1;

    // Reward calculation
    let reward = 50; // base daily reward
    if (streak === 7)
      reward = 500; // Day 7 super box
    else if (streak >= 3) reward = 75; // Streak bonus

    user.coins = (user.coins || 0) + reward;
    user.streak = streak;
    user.lastClaimDate = today;

    // Unlock scratch card every 3rd day streak
    let scratchUnlocked = false;
    if (streak % 3 === 0) {
      user.scratchAvail = true;
      scratchUnlocked = true;
    }

    await user.save();

    await recordHistory(
      req.userId,
      `Daily Check-in Day ${streak}`,
      reward,
      "credit",
    );

    if (req.io) {
      req.io
        .to(user._id.toString())
        .emit("message", { type: "coins_updated", coins: user.coins });
    }

    res.json({
      success: true,
      claimedToday: false,
      newBalance: user.coins, // primary field
      newCoins: user.coins, // alias — frontend safety
      newStreak: streak, // primary field
      streak: streak, // alias — frontend safety
      reward,
      scratchAvail: user.scratchAvail || false,
      scratchUnlocked,
    });
  } catch (err) {
    console.error("❌ Claim daily error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════
// 7.  POST /api/coupons/spin
//     Frontend calls this AFTER animation to confirm result.
//     Backend deducted 10 coins already in optimistic update,
//     so here we just confirm the server-side balance.
// ═════════════════════════════════════════════════════════════
router.post("/spin", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const SPIN_COST = 10;
    const { result } = req.body; // result sent from frontend { label, value, type }

    if ((user.coins || 0) < SPIN_COST) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient coins" });
    }

    // Deduct spin cost
    user.coins -= SPIN_COST;
    let wonLabel = result?.label || "Try Again";
    let coinGain = 0;

    // Apply prize
    if (
      result?.type === "coins" &&
      typeof result?.value === "number" &&
      result.value > 0
    ) {
      coinGain = result.value;
      user.coins += coinGain;
    } else if (result?.type === "coupon") {
      const code = `SPIN${Date.now().toString(36).substring(2, 8).toUpperCase()}`;
      await Coupon.create({
        brand: "Spin Win",
        description: "Won from Spin Wheel",
        code,
        category: "Other",
        discount: "Special",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    } else if (result?.type === "mystery") {
      coinGain = 75;
      user.coins += coinGain;
    }
    // type === "none" / try_again: no extra coins

    user.lastSpinDate = new Date();
    await user.save();

    const net = coinGain - SPIN_COST;
    await recordHistory(
      req.userId,
      `Spin Wheel — ${wonLabel}`,
      Math.abs(net),
      net >= 0 ? "credit" : "debit",
    );

    if (req.io) {
      req.io
        .to(user._id.toString())
        .emit("message", { type: "coins_updated", coins: user.coins });
    }

    res.json({
      success: true,
      newBalance: user.coins, // frontend reads newBalance
      prize: wonLabel,
    });
  } catch (err) {
    console.error("❌ Spin error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════
// 8.  POST /api/coupons/scratch-reveal
// ═════════════════════════════════════════════════════════════
router.post("/scratch-reveal", auth, async (req, res) => {
  try {
    const { prize } = req.body;
    if (!prize)
      return res
        .status(400)
        .json({ success: false, message: "Prize is required" });

    const user = await User.findById(req.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Mark scratch used so user cannot reuse
    user.scratchAvail = false;
    let wonCoins = 0;
    const isWin = !prize.toLowerCase().includes("luck");

    if (isWin) {
      // Cash prize: ₹10, ₹50, ₹100
      const cashMatch = prize.match(/₹(\d+)/);
      if (cashMatch) {
        wonCoins = parseInt(cashMatch[1]);
        user.coins += wonCoins;
        await recordHistory(
          req.userId,
          `Scratch Card — ${prize}`,
          wonCoins,
          "credit",
        );
      } else if (prize.toLowerCase().includes("coupon")) {
        // Generate a free coupon
        const code = `SCR${Date.now().toString(36).substring(2, 7).toUpperCase()}`;
        await Coupon.create({
          brand: "Scratch Win",
          description: "Free coupon won from Scratch Card",
          code,
          category: "Other",
          discount: "Special Offer",
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      }
    }

    await user.save();

    if (req.io) {
      req.io
        .to(user._id.toString())
        .emit("message", { type: "coins_updated", coins: user.coins });
    }

    res.json({
      success: true,
      newCoins: user.coins,
      newBalance: user.coins,
      wonCoins,
      prize,
      isWin,
      scratchAvail: false, // used up
    });
  } catch (err) {
    console.error("❌ Scratch reveal error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════
// 9.  POST /api/coupons/redeem  (marketplace item)
// ═════════════════════════════════════════════════════════════
router.post("/redeem", auth, async (req, res) => {
  const { itemId } = req.body;
  if (!itemId)
    return res
      .status(400)
      .json({ success: false, message: "Item ID required" });

  try {
    const item = await MarketplaceItem.findById(itemId);
    if (!item || !item.active)
      return res
        .status(404)
        .json({ success: false, message: "Item not available" });

    const user = await User.findById(req.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if ((user.coins || 0) < item.price) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient coins" });
    }

    user.coins -= item.price;
    await user.save();

    await Redemption.create({
      userId: user._id,
      itemId: item._id,
      itemTitle: item.title,
      coinsSpent: item.price,
    });

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

    res.json({ success: true, newCoins: user.coins, couponCode });
  } catch (err) {
    console.error("❌ Redeem error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════
// 10. GET /api/coupons/referral-code
// ═════════════════════════════════════════════════════════════
router.get("/referral-code", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("referralCode");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.referralCode) {
      const gen = () =>
        "FP" + Math.random().toString(36).substring(2, 8).toUpperCase();
      let code = gen();
      while (await User.findOne({ referralCode: code })) code = gen();
      user.referralCode = code;
      await user.save();
    }

    res.json({ success: true, code: user.referralCode });
  } catch (err) {
    console.error("❌ Referral code error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ═════════════════════════════════════════════════════════════
// 11. POST /api/coupons/apply-referral
// ═════════════════════════════════════════════════════════════
router.post("/apply-referral", auth, async (req, res) => {
  const { code } = req.body;
  if (!code)
    return res.status(400).json({ success: false, message: "Code required" });

  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.referredBy)
      return res
        .status(400)
        .json({ success: false, message: "Referral already applied" });

    const referrer = await User.findOne({ referralCode: code });
    if (!referrer)
      return res.status(404).json({ success: false, message: "Invalid code" });
    if (referrer._id.toString() === user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot refer yourself" });
    }

    const BONUS = 100;
    user.coins = (user.coins || 0) + BONUS;
    user.referredBy = code;
    await user.save();

    referrer.coins = (referrer.coins || 0) + BONUS;
    referrer.referralChainBonus = (referrer.referralChainBonus || 0) + BONUS;
    await referrer.save();

    await recordHistory(req.userId, "Referral Bonus", BONUS, "credit");
    await recordHistory(referrer._id, "Referral Reward", BONUS, "credit");

    if (req.io) {
      req.io
        .to(user._id.toString())
        .emit("message", { type: "coins_updated", coins: user.coins });
      req.io
        .to(referrer._id.toString())
        .emit("message", { type: "coins_updated", coins: referrer.coins });
    }

    res.json({ success: true, message: "Referral applied!" });
  } catch (err) {
    console.error("❌ Apply referral error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
