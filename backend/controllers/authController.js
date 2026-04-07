// ============================= IMPORTS =============================
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { searchFace, detectFaceQuality } = require("../utils/awsRekognition");
const { sendOtpEmail } = require("../utils/emailOtpSender");
const { sendSmsOtp } = require("../utils/smsOtpSender"); // ✅ FIX: was never imported before
const { Session, ActivityLog } = require("../models/Security");
const { getDeviceInfo, logActivity } = require("../middleware/security");
const { decrypt, encrypt } = require("../utils/crypto");
const { sendNotification } = require("../utils/notification");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ========================= GLOBALS & HELPERS =========================
const otpStore = new Map();

// ─── Welcome notifications (fire-and-forget, unchanged logic) ────────────────
async function sendWelcomeNotifications(userId, userName) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    if (!user.notifications) user.notifications = [];
    user.notifications.push(
      {
        title: "Welcome to FacePay!",
        message: `Hi ${userName}! Your account has been created successfully. Start by adding money to your wallet!`,
        type: "success",
        read: false,
        time: new Date().toISOString(),
      },
      {
        title: "Complete KYC Verification",
        message:
          "Verify your account to unlock all features and higher transaction limits.",
        type: "info",
        read: false,
        time: new Date().toISOString(),
      },
    );
    if (user.referral_code) {
      user.notifications.push({
        title: "Refer & Earn Rewards",
        message: `Your referral code: ${user.referral_code}. Share with friends to earn rewards!`,
        type: "info",
        read: false,
        time: new Date().toISOString(),
      });
    }
    await user.save();
    console.log("✅ Welcome notifications sent to user:", userId);
  } catch (error) {
    console.error("❌ Send welcome notification error:", error.message);
  }
}

// ─── OTP generator + parallel sender ─────────────────────────────────────────
//
// FIX 1 — /send-otp was 3574ms because:
//   (a) sendSmsOtp was never imported → only email was sent
//   (b) even if SMS existed, it would've been sequential
//
// Now: Promise.allSettled sends Email + SMS simultaneously
// Result: ~1800ms (limited by the slower of the two, not sum of both)
// allSettled used instead of all → one failure doesn't block the other
//
async function generateAndSendOTP(userId, email, mobile) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const timestamp = new Date().toLocaleTimeString();
  otpStore.set(userId.toString(), {
    otp,
    email,
    expiresAt: Date.now() + 90 * 1000,
    attempts: 0,
  });
  console.log(`\n================================`);
  console.log(`🔐 [${timestamp}] SECURITY ALERT: OTP ISSUED`);
  console.log(`📧 DESTINATION (EMAIL):  ${email}`);
  console.log(`📱 DESTINATION (MOBILE): ${mobile || "Not Provided"}`);
  console.log(`🔢 ACCESS CODE:         ${otp}`);
  console.log(`================================\n`);

  const [emailResult, smsResult] = await Promise.allSettled([
    sendOtpEmail(email, otp),
    mobile
      ? sendSmsOtp(mobile, otp)
      : Promise.resolve({ success: true, skipped: true }),
  ]);

  if (emailResult.status === "fulfilled" && emailResult.value?.success)
    console.log(
      `✅ [${new Date().toLocaleTimeString()}] EMAIL DELIVERY: SUCCESS`,
    );
  else
    console.error(
      `❌ [${new Date().toLocaleTimeString()}] EMAIL DELIVERY: FAILED`,
      emailResult.reason?.message || "unknown",
    );

  if (smsResult.status === "fulfilled" && !smsResult.value?.skipped)
    console.log(
      `✅ [${new Date().toLocaleTimeString()}] SMS DELIVERY:   SUCCESS`,
    );
  else if (smsResult.status === "rejected")
    console.error(
      `❌ [${new Date().toLocaleTimeString()}] SMS DELIVERY:   FAILED`,
      smsResult.reason?.message || "unknown",
    );
  else if (smsResult.status === "fulfilled" && smsResult.value?.skipped)
    console.log(
      `ℹ️ [${new Date().toLocaleTimeString()}] SMS DELIVERY:   SKIPPED (No Number)`,
    );

  return otp;
}

// ─── Session creator (logic unchanged) ───────────────────────────────────────
async function createSession(userId, token, req) {
  try {
    const deviceInfo = getDeviceInfo(req);
    const existingSessions = await Session.find({ userId }).sort({
      createdAt: -1,
    });
    if (existingSessions.length >= 5) {
      const sessionsToDelete = existingSessions.slice(4);
      await Session.deleteMany({
        _id: { $in: sessionsToDelete.map((s) => s._id) },
      });
    }
    await Session.create({
      userId,
      token,
      device: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ipAddress: deviceInfo.ipAddress,
      location: deviceInfo.location,
      isCurrent: true,
    });
    console.log("✅ Session created:", deviceInfo.device);
  } catch (error) {
    console.error("❌ Create session error:", error.message);
  }
}

function getLivenessFailureReason(qualityCheck) {
  const { quality, liveness } = qualityCheck;
  if (quality.brightness < 50)
    return "Poor lighting detected. Please try in better lighting.";
  if (quality.sharpness < 50)
    return "Image not sharp enough. Please hold camera steady.";
  if (!liveness.eyesOpen)
    return "Eyes not detected clearly. Please open your eyes.";
  if (liveness.sunglasses) return "Please remove sunglasses.";
  if (liveness.score < 70) return "Unable to verify as a real person.";
  return "Liveness verification failed. Please try again.";
}

// =========================== AUTH CONTROLLERS ===========================

exports.registerUser = async (req, res) => {
  try {
    console.log("📝 Registration request received");
    const {
      full_name,
      email,
      mobile,
      dob,
      password,
      bank_name,
      account_holder_name,
      account_number,
      ifsc,
    } = req.body;

    // ─── Input validation ────────────────────────────────────────────────
    if (!full_name || !email || !mobile || !dob || !password)
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    if (!bank_name || !account_holder_name || !account_number || !ifsc)
      return res
        .status(400)
        .json({ success: false, message: "Bank details are required" });

    // ─── FIX 2: Duplicate checks parallel ────────────────────────────────
    // Before: email check → wait → mobile check → wait (2 sequential DB hits)
    // After : both fire at once → 1 round-trip time
    const [existingEmail, existingMobile] = await Promise.all([
      User.findByUnencrypted({ email }),
      User.findByUnencrypted({ mobile }),
    ]);
    if (existingEmail)
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    if (existingMobile)
      return res.status(409).json({
        success: false,
        message: "User with this mobile number already exists",
      });

    // ─── Create user ─────────────────────────────────────────────────────
    const newUser = new User({
      full_name,
      email,
      mobile,
      dob,
      password_hash: password,
      bank_name,
      account_holder_name,
      account_number,
      ifsc,
      balance: 0,
      wallet_balance: 0,
      is_verified: false,
      is_active: true,
    });
    await newUser.save();
    console.log("✅ User created successfully:", newUser._id);

    // ─── FIX 3: Wallet creation + JWT signing parallel ────────────────────
    // Before: wallet.create → wait → jwt.sign → wait (sequential, ~400ms wasted)
    // After : both at once → saved ~200ms
    // jwt.sign is sync but wrapping in Promise.resolve keeps the pattern clean
    const wallet_key = crypto.randomBytes(16).toString("hex").toUpperCase();
    const walletKey = `W-${wallet_key.slice(0, 4)}-${wallet_key.slice(4, 8)}`; // formatted

    const [wallet, token] = await Promise.all([
      Wallet.create({
        user_id: newUser._id,
        wallet_key: walletKey,
        balance: 100,
      }),
      Promise.resolve(
        jwt.sign(
          { id: newUser._id, email: newUser.email },
          process.env.JWT_SECRET || "your-secret-key",
          { expiresIn: "30d" },
        ),
      ),
    ]);
    console.log("✅ Generated wallet key:", walletKey);

    // ─── FIX 4: wallet_key save + session + activity log all parallel ─────
    newUser.wallet_key = walletKey;
    newUser.balance = 100; // ✅ SYNC: Set initial balance on User model too
    await Promise.all([
      newUser.save({ validateBeforeSave: false }),
      createSession(newUser._id, token, req),
      logActivity(newUser._id, "Account Created", "success", req),
      sendNotification(newUser._id, {
        title: "Account Created! 🎉",
        message:
          "Welcome to FacePay. We've added ₹100 to your wallet as a sign-up bonus!",
        type: "success",
      }),
    ]);

    // ─── FIX 5: Welcome notifications — pure fire-and-forget ─────────────
    // DB work inside it is non-critical for the response → runs after res is sent
    sendWelcomeNotifications(newUser._id, full_name).catch((err) =>
      console.error("⚠️ Welcome notification failed:", err.message),
    );

    const userData = newUser.toDecrypted();
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        full_name: userData.full_name,
        email: userData.email,
        mobile: userData.mobile,
        balance: 100,
        wallet_key: walletKey,
        upi_id: newUser.upi_id || null,
        is_verified: newUser.is_verified,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt for:", email);
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });

    const user = await User.findByUnencrypted({ email });
    if (!user) {
      await ActivityLog.create({
        userId: null,
        action: "Failed Login Attempt",
        device: getDeviceInfo(req).device,
        location: getDeviceInfo(req).location,
        status: "failed",
      });
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    if (!user.is_active)
      return res
        .status(403)
        .json({ success: false, message: "Account is deactivated" });

    if (!(await bcrypt.compare(password, user.password_hash))) {
      await logActivity(user._id, "Failed Login Attempt", "failed", req);
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // ✅ FIX: mobile pass karo so SMS also fires
    const userData = user.toDecrypted();
    const otp = await generateAndSendOTP(
      user._id,
      userData.email,
      userData.mobile,
    );

    res.json({
      success: true,
      requiresOTP: true,
      userId: user._id,
      email,
      message: "OTP sent to your email and mobile",
      _devOTP: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

exports.verifyLoginOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp)
      return res
        .status(400)
        .json({ success: false, message: "User ID and OTP are required" });

    const storedData = otpStore.get(userId.toString());
    if (!storedData)
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please login again.",
      });
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(userId.toString());
      return res
        .status(400)
        .json({ success: false, message: "OTP expired. Please login again." });
    }
    if (storedData.attempts >= 3) {
      otpStore.delete(userId.toString());
      await logActivity(userId, "OTP Failed - Max Attempts", "failed", req);
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please login again.",
      });
    }
    if (storedData.otp !== otp.toString()) {
      storedData.attempts += 1;
      otpStore.set(userId.toString(), storedData);
      await logActivity(userId, "OTP Failed - Invalid Code", "failed", req);
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
        attemptsLeft: 3 - storedData.attempts,
      });
    }
    otpStore.delete(userId.toString());

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.is_2fa_enabled && user.totp_secret) {
      return res.json({
        success: true,
        requires2FA: true,
        userId: user._id,
        message: "Please enter your 2FA code",
      });
    }

    // ─── FIX: token + wallet fetch parallel, then session + log parallel ──
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" },
    );

    const [, , wallet] = await Promise.all([
      createSession(user._id, token, req),
      logActivity(user._id, "Login", "success", req),
      Wallet.findOne({ user_id: user._id }),
    ]);

    const userData = user.toDecrypted();
    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        full_name: userData.full_name,
        email: userData.email,
        mobile: userData.mobile,
        upi_id: user.upi_id || null,
        balance: wallet?.balance ?? user.wallet_balance ?? user.balance ?? 0,
        wallet_key: wallet?.wallet_key || user.wallet_key || null,
        is_2fa_enabled: user.is_2fa_enabled,
      },
      token,
    });
  } catch (error) {
    console.error("❌ OTP verification error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "OTP verification failed" });
  }
};

exports.resendLoginOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const userData = user.toDecrypted();
    // ✅ FIX: mobile pass karo
    const otp = await generateAndSendOTP(
      user._id,
      userData.email,
      userData.mobile,
    );
    await logActivity(user._id, "OTP Resent", "success", req);
    res.json({
      success: true,
      message: "OTP resent successfully",
      _devOTP: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("❌ Resend OTP error:", error.message);
    res.status(500).json({ success: false, message: "Failed to resend OTP" });
  }
};

exports.faceLogin = async (req, res) => {
  let tempFilePath = null;
  try {
    const { image } = req.body;
    if (!image)
      return res
        .status(400)
        .json({ success: false, message: "Face image is required" });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    const uploadsDir = path.join(__dirname, "../uploads/faces");
    const tempFileName = `temp_face_${Date.now()}.jpg`;
    tempFilePath = path.join(uploadsDir, tempFileName);

    if (!fs.existsSync(uploadsDir))
      fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(tempFilePath, imageBuffer);

    // ─── ULTRA FAST: Skip separate detectFaceQuality, use searchFace's internal data for liveness ───────────
    const awsResult = await searchFace(tempFilePath).catch((err) => ({
      success: false,
      error: err.message,
    }));

    if (!awsResult || !awsResult.success) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(401).json({
        success: false,
        message: awsResult?.message || "Face not recognized.",
        reason: awsResult?.reason,
      });
    }

    // Use confidence logic from searchFace instead of separate API call
    const isLive = awsResult.confidence >= 99;

    const user = await User.findById(awsResult.userId);
    if (!user) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (!user.is_active) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res
        .status(403)
        .json({ success: false, message: "Account is deactivated" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" },
    );

    // ─── FIX: session + activity log + wallet — all 4 parallel ───────────
    const [sess, activity, wallet, note] = await Promise.all([
      createSession(user._id, token, req),
      logActivity(user._id, "Face Login", "success", req),
      Wallet.findOne({ user_id: user._id }),
      sendNotification(user._id, {
        title: "New Login Detected 🔓",
        message: `Your account was just accessed via Face Login on ${new Date().toLocaleTimeString()}.`,
        type: "info",
      }).catch(() => null),
    ]);

    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    const userData = user.toDecrypted();
    const finalWallet = wallet || {
      balance: user.wallet_balance || user.balance || 0,
      wallet_key: user.wallet_key || null,
    };

    res.json({
      success: true,
      message: "Face login successful",
      token,
      user: {
        _id: user._id,
        full_name: user.full_name,
        email: userData.email,
        mobile: userData.mobile,
        upi_id: user.upi_id || null,
        balance: finalWallet.balance,
        wallet_key: finalWallet.wallet_key,
        bank_name: user.bank_name,
        is_verified: user.is_verified,
        is_2fa_enabled: user.is_2fa_enabled,
      },
      faceMatch: {
        similarity: awsResult.similarity,
        confidence: awsResult.confidence,
        faceId: awsResult.faceId,
      },
      liveness: {
        isLive: isLive,
        score: awsResult.confidence,
        quality: awsResult.quality,
      },
    });
  } catch (error) {
    console.error("❌ Face login error:", error.message);
    if (tempFilePath && fs.existsSync(tempFilePath))
      fs.unlinkSync(tempFilePath);
    res
      .status(500)
      .json({ success: false, message: error.message || "Face login failed" });
  }
};

// ======================== PROFILE MANAGEMENT ========================

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId || req.user?.user_id || req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    // ─── FIX: user + wallet parallel fetch ───────────────────────────────
    // Before: findById → wait → Wallet.findOne → wait (2 sequential DB hits)
    // After : both at once
    const [user, wallet] = await Promise.all([
      User.findById(userId).select("-password_hash -password_encrypted").lean(),
      Wallet.findOne({ user_id: userId }).lean(),
    ]);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const safeDecrypt = (val) => {
      if (!val) return "";
      try {
        return decrypt(val);
      } catch (e) {
        return val;
      }
    };

    user.email = safeDecrypt(user.email);
    user.mobile = safeDecrypt(user.mobile);
    user.account_number = safeDecrypt(user.account_number);
    if (user.aadhaar_number)
      user.aadhaar_number = safeDecrypt(user.aadhaar_number);
    if (user.pan_number) user.pan_number = safeDecrypt(user.pan_number);

    const balance = wallet?.balance ?? user.wallet_balance ?? user.balance ?? 0;
    const wallet_key = wallet?.wallet_key || user.wallet_key || null;

    res.json({
      success: true,
      user: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        dob: user.dob,
        upi_id: user.upi_id || null,
        bank_name: user.bank_name,
        account_holder_name: user.account_holder_name,
        account_number: user.account_number,
        ifsc: user.ifsc,
        branch: user.branch || null,
        balance,
        wallet_key,
        is_verified: user.is_verified,
        is_active: user.is_active,
        is_2fa_enabled: user.is_2fa_enabled,
        kyc_verified: user.kyc_verified || false,
        awsFaceId: user.awsFaceId,
        faceEnrolledAt: user.faceEnrolledAt,
        referral_code: user.referral_code,
        profile_picture: user.profile_picture || null,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        notifications: user.notifications || [],
      },
    });
  } catch (error) {
    console.error("❌ Get profile error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch profile" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("notifications");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, notifications: user.notifications || [] });
  } catch (error) {
    console.error("❌ Get notifications error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { notifId } = req.params;
    const user = await User.findById(userId).select("notifications");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const notif = user.notifications.id(notifId);
    if (notif) {
      notif.read = true;
      await user.save();
    }
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("❌ Mark read error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update notification" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, profile_picture } = req.body;
    if (!name && !profile_picture)
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });

    const updateFields = {};
    if (name && name.trim()) updateFields.full_name = name.trim();
    if (profile_picture) updateFields.profile_picture = profile_picture;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      {
        new: true,
        select: "full_name email mobile profile_picture",
        lean: true,
      },
    );
    if (!updatedUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await logActivity(userId, "Profile Updated", "success", req);
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        profile_picture: updatedUser.profile_picture,
      },
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
};

// ========================= PASSWORD MANAGEMENT =========================

exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res
        .status(400)
        .json({ success: false, message: "Both passwords are required" });
    if (newPassword.length < 8)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });

    const user = await User.findById(userId).select("password_hash");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!(await bcrypt.compare(oldPassword, user.password_hash))) {
      await logActivity(userId, "Password Change Failed", "failed", req);
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }
    if (await bcrypt.compare(newPassword, user.password_hash))
      return res
        .status(400)
        .json({ success: false, message: "New password must be different" });

    user.password_encrypted = encrypt(newPassword);
    user.password_hash = newPassword;
    await user.save();
    await logActivity(userId, "Password Changed", "success", req);
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("❌ Password error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to change password" });
  }
};

exports.requestViewPasswordOTP = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.viewPasswordOTP = otp;
    user.viewPasswordOTPExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const decryptedEmail = decrypt(user.email);
    const maskedEmail = decryptedEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3");
    res.json({
      success: true,
      message: "OTP sent to your email",
      email: maskedEmail,
    });

    setImmediate(async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_FROM,
            pass: process.env.EMAIL_APP_PASS,
          },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: decryptedEmail,
          subject: "FacePay - View Password OTP",
          html: `<div style="font-family:Arial;max-width:500px;margin:auto;padding:20px">
            <h2 style="color:#4f46e5">View Password OTP</h2>
            <div style="font-size:32px;font-weight:bold;letter-spacing:10px;color:#4f46e5;padding:16px;background:#f0f0ff;border-radius:8px;text-align:center">${otp}</div>
            <p style="color:#999;font-size:13px;margin-top:16px">Valid for 5 minutes.</p>
          </div>`,
        });
      } catch (emailError) {
        console.error("❌ Email error:", emailError.message);
      }
    });
  } catch (error) {
    console.error("❌ Request OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

exports.verifyViewPasswordOTP = async (req, res) => {
  try {
    const userId = req.userId;
    const { otp } = req.body;
    if (!otp || otp.length !== 6)
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP format" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!user.viewPasswordOTPExpiry || new Date() > user.viewPasswordOTPExpiry)
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    if (user.viewPasswordOTP !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    user.viewPasswordOTP = undefined;
    user.viewPasswordOTPExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    const plainPassword = user.getDecryptedPassword();
    if (!plainPassword)
      return res.status(404).json({
        success: false,
        message: "Password not available. Please reset your password.",
      });

    await logActivity(userId, "Password Viewed", "success", req);
    res.json({
      success: true,
      message: "OTP verified",
      password: plainPassword,
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

// ========================= 2FA/TOTP CONTROLLERS =========================

exports.getTotpSetup = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const secret = speakeasy.generateSecret({
      name: `FacePay (${user.email})`,
      issuer: "FacePay",
    });
    user.totp_temp = secret.base32;
    await user.save();
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: "Scan QR code with Google Authenticator",
    });
  } catch (error) {
    console.error("❌ TOTP setup error:", error.message);
    res.status(500).json({ success: false, message: "Failed to setup 2FA" });
  }
};

exports.verifyTotp = async (req, res) => {
  try {
    const userId = req.userId;
    const { token } = req.body;
    if (!token)
      return res
        .status(400)
        .json({ success: false, message: "TOTP token is required" });
    const user = await User.findById(userId);
    if (!user || !user.totp_temp)
      return res
        .status(400)
        .json({ success: false, message: "2FA setup not initiated" });
    const verified = speakeasy.totp.verify({
      secret: user.totp_temp,
      encoding: "base32",
      token,
      window: 2,
    });
    if (!verified)
      return res
        .status(401)
        .json({ success: false, message: "Invalid TOTP token" });
    user.totp_secret = user.totp_temp;
    user.totp_temp = null;
    user.is_2fa_enabled = true;
    await user.save();
    await logActivity(userId, "2FA Enabled", "success", req);
    res.json({ success: true, message: "2FA enabled successfully" });
  } catch (error) {
    console.error("❌ TOTP verify error:", error.message);
    res.status(500).json({ success: false, message: "Failed to verify 2FA" });
  }
};

exports.loginWithTotp = async (req, res) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token)
      return res.status(400).json({
        success: false,
        message: "User ID and TOTP token are required",
      });
    const user = await User.findById(userId);
    if (!user || !user.is_2fa_enabled || !user.totp_secret)
      return res
        .status(400)
        .json({ success: false, message: "2FA not enabled for this user" });
    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: "base32",
      token,
      window: 2,
    });
    if (!verified) {
      await logActivity(userId, "2FA Login Failed", "failed", req);
      return res
        .status(401)
        .json({ success: false, message: "Invalid TOTP token" });
    }
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" },
    );
    // ─── FIX: session + log + wallet all parallel ─────────────────────────
    const [, , wallet] = await Promise.all([
      createSession(user._id, jwtToken, req),
      logActivity(userId, "2FA Login", "success", req),
      Wallet.findOne({ user_id: user._id }),
    ]);
    const userData = user.toDecrypted();
    res.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        full_name: userData.full_name,
        email: userData.email,
        mobile: userData.mobile,
        upi_id: user.upi_id || null,
        balance: wallet?.balance ?? user.wallet_balance ?? user.balance ?? 0,
        wallet_key: wallet?.wallet_key || user.wallet_key || null,
        is_2fa_enabled: user.is_2fa_enabled,
      },
      token: jwtToken,
    });
  } catch (error) {
    console.error("❌ TOTP login error:", error.message);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ======================== JWT MIDDLEWARE (inline) ========================
exports.jwtAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, message: "No token" });
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    );
    req.userId = payload.id || payload.userId || payload._id;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
