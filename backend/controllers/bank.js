const User = require("../models/User");
exports.getBankInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false });
    const { bank_name, account_number, ifsc, branch } = user;
    res.json({
      success: true,
      bank: { bank_name, account_number, ifsc, branch },
    });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch bank info" });
  }
};
