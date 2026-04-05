const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");
const Session = require("../models/Session");
const ActivityLog = require("../models/ActivityLog");
const ConnectedAccount = require("../models/ConnectedAccount");
const User = require("../models/User");
const { getDeviceInfo, logActivity } = require("../middleware/security");
const { sendNotification } = require("../utils/notification");

// Helper to generate backup codes (plain)
const generateBackupCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
  }
  return codes;
};

// @desc Get all active sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    const formattedSessions = sessions.map((s) => ({
      id: s._id,
      device: s.device,
      browser: s.browser,
      os: s.os,
      location: s.location,
      ipAddress: s.ipAddress,
      lastActive: new Date(s.lastActive).toLocaleString(),
      isCurrent: false,
    }));

    res.json({ success: true, sessions: formattedSessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching sessions" });
  }
};

// @desc Revoke a session
exports.revokeSession = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    await session.deleteOne();

    logActivity(req.userId, "Session Revoked", "success", req).catch(
      console.error,
    );

    res.json({ success: true, message: "Session revoked successfully" });
  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({ success: false, message: "Error revoking session" });
  }
};

// @desc Get activity log
exports.getActivity = async (req, res) => {
  try {
    const activities = await ActivityLog.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const formatted = activities.map((a) => ({
      id: a._id,
      action: a.action,
      date: new Date(a.createdAt).toLocaleString(),
      device: a.device,
      status: a.status,
    }));

    res.json({ success: true, activities: formatted });
  } catch (error) {
    console.error("Get activity error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching activity log" });
  }
};

// @desc Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both current and new password",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const user = await User.findById(req.userId).select("+password_hash");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password_hash = newPassword;
    await user.save();

    logActivity(req.userId, "Password Changed", "success", req).catch(
      console.error,
    );

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error changing password" });
  }
};

// @desc Enable 2FA - Generate QR code (OPTIMIZED)
exports.enable2FA = async (req, res) => {
  try {
    // Only fetch required fields
    const user = await User.findById(req.userId).select(
      "email totp_temp is_2fa_enabled",
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const secret = speakeasy.generateSecret({
      name: `FacePay (${user.email})`,
      issuer: "FacePay",
    });

    user.totp_temp = secret.base32;
    user.is_2fa_enabled = false;
    await user.save();

    // 🚀 Optimized QR generation
    const qrCode = await QRCode.toDataURL(secret.otpauth_url, {
      errorCorrectionLevel: "L", // Low error correction = faster
      width: 200, // Smaller image = faster transfer
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });

    res.json({ success: true, qrCode, secret: secret.base32 });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    res.status(500).json({ success: false, message: "Error enabling 2FA" });
  }
};

// @desc Verify 2FA code and enable (step 2)
exports.verify2FA = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.userId);

    if (!user || !user.totp_temp) {
      return res
        .status(400)
        .json({ success: false, message: "No 2FA setup in progress" });
    }

    if (!code || code.length !== 6) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.totp_temp,
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (!verified) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
    }

    const plainCodes = generateBackupCodes(8);

    user.is_2fa_enabled = true;
    user.totp_secret = user.totp_temp;
    user.totp_temp = null;
    user.backupCodes = plainCodes; // will be encrypted in pre-save
    await user.save();

    await Promise.all([
      logActivity(req.userId, "2FA Enabled", "success", req),
      sendNotification(req.userId, {
        title: "2FA Protection Active 🛡️",
        message:
          "Two-factor authentication is now enabled. Your account is significantly more secure.",
        type: "success",
      }),
    ]).catch(console.error);

    res.json({ success: true, backupCodes: plainCodes });
  } catch (error) {
    console.error("Verify 2FA error:", error);
    res.status(500).json({ success: false, message: "Error verifying 2FA" });
  }
};

// @desc Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.is_2fa_enabled = false;
    user.totp_secret = null;
    user.totp_temp = null;
    user.backupCodes = [];
    await user.save();

    logActivity(req.userId, "2FA Disabled", "success", req).catch(
      console.error,
    );

    res.json({ success: true, message: "2FA disabled successfully" });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    res.status(500).json({ success: false, message: "Error disabling 2FA" });
  }
};

// @desc Get 2FA status
exports.get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("is_2fa_enabled");
    res.json({ success: true, enabled: user?.is_2fa_enabled || false });
  } catch (error) {
    console.error("Get 2FA status error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching 2FA status" });
  }
};

// @desc Get backup codes (plain – only if 2FA enabled)
exports.getBackupCodes = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.is_2fa_enabled) {
      return res
        .status(400)
        .json({ success: false, message: "2FA not enabled" });
    }
    const plainCodes = user.getDecryptedBackupCodes();
    res.json({ success: true, codes: plainCodes });
  } catch (error) {
    console.error("Get backup codes error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching backup codes" });
  }
};

// @desc Regenerate backup codes (old ones are replaced)
exports.regenerateBackupCodes = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.is_2fa_enabled) {
      return res
        .status(400)
        .json({ success: false, message: "2FA not enabled" });
    }

    const plainCodes = generateBackupCodes(8);
    user.backupCodes = plainCodes;
    await user.save();

    logActivity(req.userId, "Backup Codes Regenerated", "success", req).catch(
      console.error,
    );

    res.json({ success: true, backupCodes: plainCodes });
  } catch (error) {
    console.error("Regenerate backup codes error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error regenerating backup codes" });
  }
};

// @desc Get connected accounts
exports.getConnectedAccounts = async (req, res) => {
  try {
    const accounts = await ConnectedAccount.find({ userId: req.userId }).lean();
    const formatted = accounts.map((acc) => ({
      id: acc.provider,
      name: acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1),
      icon: acc.provider,
      connected: acc.connected,
    }));
    res.json({ success: true, accounts: formatted });
  } catch (error) {
    console.error("Get connected accounts error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching connected accounts" });
  }
};

// @desc Connect an account (mock – real OAuth needed)
exports.connectAccount = async (req, res) => {
  const { provider } = req.body;
  try {
    let account = await ConnectedAccount.findOne({
      userId: req.userId,
      provider,
    });
    if (account) {
      account.connected = !account.connected;
    } else {
      account = new ConnectedAccount({
        userId: req.userId,
        provider,
        connected: true,
      });
    }
    await account.save();
    res.json({ success: true, connected: account.connected });
  } catch (error) {
    console.error("Connect account error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error connecting account" });
  }
};

// @desc Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password required to delete account",
      });
    }

    const user = await User.findById(req.userId).select("+password_hash");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    await Promise.all([
      Session.deleteMany({ userId: req.userId }),
      ActivityLog.deleteMany({ userId: req.userId }),
      ConnectedAccount.deleteMany({ userId: req.userId }),
      user.deleteOne(),
    ]);

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ success: false, message: "Error deleting account" });
  }
};
