const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/emailOtpSender");

// In-memory OTP store
const otpDB = {};

function normEmail(email) {
  return (email || "").trim().toLowerCase();
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

const OTP_EXPIRY_MS = 90 * 1000; // 90 seconds
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds

// ======= SEND OTP =======
router.post("/send-otp", async (req, res) => {
  try {
    let { email } = req.body || {};
    email = normEmail(email);

    if (!email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required." });
    }

    const key = `login_${email}`;
    const now = Date.now();

    // Resend cooldown
    if (otpDB[key] && now - otpDB[key].lastSent < RESEND_COOLDOWN_MS) {
      return res.status(429).json({
        success: false,
        error: "Please wait before requesting OTP again",
        retryAfter: Math.ceil(
          (RESEND_COOLDOWN_MS - (now - otpDB[key].lastSent)) / 1000,
        ),
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const result = await sendOtpEmail(email, otp, "login");
      if (result && result.success === false) {
        return res
          .status(500)
          .json({ success: false, error: "Failed to send Email OTP" });
      }
    } catch (e) {
      console.error("OTP email send failed: ", e);
      return res.status(500).json({ success: false, error: "OTP send failed" });
    }

    otpDB[key] = {
      emailHash: hashOtp(otp),
      expires: now + OTP_EXPIRY_MS,
      attempts: 0,
      lastSent: now,
    };

    return res.json({
      success: true,
      message: "OTP sent for login",
    });
  } catch (err) {
    console.error("SEND OTP Error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send OTP" });
  }
});

// ======= VERIFY OTP =======
router.post("/verify-otp", async (req, res) => {
  try {
    let { email, emailOtp } = req.body || {};
    email = normEmail(email);

    if (!email || !emailOtp) {
      return res
        .status(400)
        .json({ success: false, error: "Email and OTP required." });
    }

    const key = `login_${email}`;
    const rec = otpDB[key];

    if (!rec) {
      return res.status(400).json({
        success: false,
        error: "No OTP request found. Please request OTP first.",
      });
    }

    if (rec.expires < Date.now()) {
      delete otpDB[key];
      return res
        .status(400)
        .json({ success: false, error: "OTP expired. Please resend." });
    }

    rec.attempts += 1;
    if (rec.attempts > MAX_ATTEMPTS) {
      delete otpDB[key];
      return res.status(429).json({
        success: false,
        error: "Too many failed attempts. OTP blocked.",
      });
    }

    if (hashOtp(emailOtp) !== rec.emailHash) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Email OTP" });
    }

    // Success: OTP sahi hai
    delete otpDB[key];

    // YAHAN: user find karo (email encrypted hai DB me)
    // Tumhara User model me email encrypted store hota hai,
    // to yahan sirf email se user nahi milega jab tak hum encrypt use na karein.
    // Lekin login OTP flow ke liye agar tum guaranteed ho ki user exist hai,
    // to optional: try-catch me dekh sakte ho, nahi mile to bhi minimal token de sakte ho.
    //
    // Best: yahi encrypt(email) use karke user nikaalo; pehle crypto utils import karte hain:

    const { encrypt } = require("../utils/crypto");

    const user = await User.findOne({ email: encrypt(email) });

    if (!user) {
      // Safety: agar OTP kisi unknown email pe gaya ho, to bhi error de do
      return res
        .status(404)
        .json({ success: false, error: "User not found for this email." });
    }

    // JWT token generate, exactly same style jaisa loginUser/loginWithTotp me
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      message: "OTP verified",
      token,
    });
  } catch (err) {
    console.error("VERIFY OTP Error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
