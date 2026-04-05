const User = require("../models/User");
const ConnectedAccount = require("../models/ConnectedAccount");

exports.getBankInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ success: false });

    // Get primary bank info from user model
    const { bank_name, account_number, ifsc, branch } = user;

    // Get additional linked accounts
    const linkedAccounts = await ConnectedAccount.find({
      user_id: userId,
    }).lean();

    res.json({
      success: true,
      bank: { bank_name, account_number, ifsc, branch },
      linkedAccounts: linkedAccounts.map((acc) => ({
        _id: acc._id,
        type: acc.type,
        name: acc.bankName || acc.nickname || "Linked Account",
        key: acc.accountNumber || acc.upiId || acc.cardNumber || "****",
        isPrimary: false,
      })),
    });
  } catch (e) {
    console.error("Get bank info error:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch bank info" });
  }
};

exports.linkAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { type, ...formData } = req.body;

    const newAccount = await ConnectedAccount.create({
      user_id: userId,
      type,
      ...formData,
    });

    res.json({ success: true, account: newAccount });
  } catch (e) {
    console.error("Link account error:", e);
    res.status(500).json({ success: false, message: "Failed to link account" });
  }
};

exports.removeAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { accountId } = req.params;

    await ConnectedAccount.findOneAndDelete({
      _id: accountId,
      user_id: userId,
    });
    res.json({ success: true, message: "Account removed" });
  } catch (e) {
    console.error("Remove account error:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove account" });
  }
};
