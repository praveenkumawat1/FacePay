const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/security");
const sendOtpEmail = require("../utils/sendOtpEmail");

// Multer config for face image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/faces");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, JPG, and PNG images are allowed"));
    }
  },
});

// ========================================
// PUBLIC ROUTES
// ========================================

// Registration & Login
router.post(
  "/register",
  upload.single("face_image"),
  authController.registerUser,
);
router.post("/login", authController.loginUser);
router.post("/login/verify-otp", authController.verifyLoginOTP);
router.post("/login/resend-otp", authController.resendLoginOTP);
router.post("/login/face", authController.faceLogin);

// ================================================
// FORGOT PASSWORD / OTP FLOW (Public — no token needed)
// ================================================

router.post("/request-reset-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({
      success: false,
      message: "Email required.",
      next: "signup",
    });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return res.json({
      success: false,
      next: "signup",
      message: "No account found for this email. Please sign up.",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetOtp = otp;
  user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  // ✅ FIX: Decrypt email before sending
  const decrypted = user.toDecrypted();
  await sendOtpEmail(decrypted.email, otp);

  return res.json({
    success: true,
    next: "reset",
    message: "OTP sent to your email.",
  });
});

router.post("/verify-reset-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.json({ success: false, message: "Missing params." });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (
    !user ||
    !user.resetOtp ||
    !user.resetOtpExpires ||
    user.resetOtp !== otp ||
    Date.now() > user.resetOtpExpires
  ) {
    return res.json({ success: false, message: "Invalid or expired OTP." });
  }

  const resetToken = crypto.randomBytes(24).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpires = Date.now() + 15 * 60 * 1000;
  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;
  await user.save();

  return res.json({ success: true, token: resetToken });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.json({ success: false, message: "Missing params." });
  }

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.json({
      success: false,
      message: "Invalid or expired reset token.",
    });
  }

  user.password_hash = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  return res.json({ success: true, message: "Password changed successfully." });
});

// ================================================
// ✅ PROFILE PASSWORD RESET via OTP (Protected — token required)
// ================================================

/**
 * 1️⃣ Logged-in user ke email pe OTP bhejo
 * Frontend call: POST /api/auth/forgot-password-otp
 */
router.post("/forgot-password-otp", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).maxTimeMS(8000);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ✅ KEY FIX: Email encrypted hai DB mein — pehle decrypt karo
    const decrypted = user.toDecrypted();
    const plainEmail = decrypted.email;

    if (!plainEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email not found on account" });
    }

    // OTP generate karo
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    // ✅ Decrypted plaintext email pe bhejo
    await sendOtpEmail(plainEmail, otp);
    console.log(`✅ OTP sent to ${plainEmail}`);

    // Email mask karke return karo
    const [emailUser, domain] = plainEmail.split("@");
    const masked = `${emailUser.slice(0, 2)}${"*".repeat(Math.max(2, emailUser.length - 2))}@${domain}`;

    return res.json({
      success: true,
      message: "OTP sent to your registered email",
      email: masked,
    });
  } catch (error) {
    console.error("❌ forgot-password-otp error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP: " + error.message,
    });
  }
});

/**
 * 2️⃣ OTP verify karo (logged-in user)
 * Frontend call: POST /api/auth/verify-forgot-password-otp
 */
router.post("/verify-forgot-password-otp", protect, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP required" });
    }

    const user = await User.findById(req.userId).maxTimeMS(8000);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (
      !user.resetOtp ||
      !user.resetOtpExpires ||
      user.resetOtp !== otp.toString() ||
      Date.now() > user.resetOtpExpires
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP clear karo — verified
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Identity verified successfully",
    });
  } catch (error) {
    console.error("❌ verify-forgot-password-otp error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to verify OTP" });
  }
});

// ========================================
// PROTECTED ROUTES (Require Authentication)
// ========================================

router.get("/profile", protect, authController.getProfile);
router.put("/update-profile", protect, authController.updateProfile);
router.post("/change-password", protect, authController.changePassword);

// 2FA / TOTP
router.get("/totp/setup", protect, authController.getTotpSetup);
router.post("/totp/verify", protect, authController.verifyTotp);
router.post("/totp/login", authController.loginWithTotp);

// ========================================
// DEPRECATED ROUTES
// ========================================
router.post("/request-view-password-otp", protect, async (req, res) => {
  res.status(410).json({
    success: false,
    message:
      "This endpoint is deprecated. Use /api/auth/forgot-password-otp instead.",
  });
});

router.post("/verify-view-password-otp", protect, async (req, res) => {
  res.status(410).json({
    success: false,
    message:
      "This endpoint is deprecated. Use /api/auth/verify-forgot-password-otp instead.",
  });
});

module.exports = router;
