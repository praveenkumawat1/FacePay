const User = require("../models/User");

// Dummy referral stats API
exports.getReferralStats = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.json({ stats: null });

  // Dummy data for now
  res.json({
    stats: {
      total: 5,
      joined: 3,
      rewards: 1500,
      recent: [
        { name: "Amit Kumar", email: "amit@email.com", date: new Date() },
        {
          name: "Priya Singh",
          email: "priya@email.com",
          date: new Date(Date.now() - 86400000),
        },
        {
          name: "Rahul",
          email: "rahul@email.com",
          date: new Date(Date.now() - 2 * 86400000),
        },
      ],
    },
  });
};
