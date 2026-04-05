const User = require("../models/User");

// Real-time referral stats API
exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId)
      .select("referral_code name email")
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find users referred by this user
    const referredUsers = await User.find({ referred_by: user.referral_code })
      .select("full_name name email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Reward calculation: ₹500 per friend
    const rewards = referredUsers.length * 500;

    res.json({
      success: true,
      stats: {
        total: referredUsers.length,
        joined: referredUsers.length,
        rewards: rewards,
        recent: referredUsers.map((u) => ({
          name: u.full_name || u.name || "User",
          email: u.email,
          date: u.createdAt,
        })),
      },
      referral_code: user.referral_code,
    });
  } catch (error) {
    console.error("Get referral stats error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
