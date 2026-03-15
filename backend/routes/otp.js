const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils/emailOtpSender");

// Dummy SMS sender (replace with real in prod)
async function sendSmsOtp(mobile, otp, purpose) {
  console.log(`[DUMMY SMS] Pretend SMS sent to ${mobile}: OTP = ${otp}`);
  return { success: true };
}

const otpDB = {};
function getKey({ email, mobile, purpose }) {
  const safeEmail = (email || "").trim().toLowerCase();
  const safeMobile = (mobile || "").trim();
  const safePurpose = (purpose || "signup").toLowerCase();
  return `${safeEmail}_${safeMobile}_${safePurpose}`;
}
function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
const OTP_EXPIRY_MS = 90 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;

// ---------- SEND OTP (Signup: Email + Mobile) ----------
router.post("/send-otp", async (req, res) => {
  try {
    let { email, mobile, purpose } = req.body || {};
    if (!email && !mobile)
      return res
        .status(400)
        .json({ success: false, error: "Email or Mobile required." });

    email = email ? email.trim().toLowerCase() : "";
    mobile = mobile ? mobile.trim() : "";
    purpose = (purpose || "signup").toLowerCase();

    const key = getKey({ email, mobile, purpose });
    const now = Date.now();

    if (otpDB[key] && now - otpDB[key].lastSent < RESEND_COOLDOWN_MS) {
      return res.status(429).json({
        success: false,
        error: "Please wait before requesting OTP again",
        retryAfter: Math.ceil(
          (RESEND_COOLDOWN_MS - (now - otpDB[key].lastSent)) / 1000,
        ),
      });
    }

    const emailOtp = email
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : null;
    const mobileOtp = mobile
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : null;

    try {
      const resultArr = [];
      if (email) resultArr.push(sendOtpEmail(email, emailOtp, purpose));
      if (mobile) resultArr.push(sendSmsOtp(mobile, mobileOtp, purpose));
      const results = await Promise.all(resultArr);

      if (email && results[0] && results[0].success === false)
        return res
          .status(500)
          .json({ success: false, error: "Failed to send Email OTP" });
      if (mobile) {
        let smsResult = email ? results[1] : results[0];
        if (smsResult && smsResult.success === false)
          return res
            .status(500)
            .json({ success: false, error: "Failed to send Mobile OTP" });
      }
    } catch (e) {
      console.error("OTP send error:", e);
      return res
        .status(500)
        .json({ success: false, error: "OTP service temporarily unavailable" });
    }

    otpDB[key] = {
      emailHash: emailOtp ? hashOtp(emailOtp) : null,
      mobileHash: mobileOtp ? hashOtp(mobileOtp) : null,
      expires: now + OTP_EXPIRY_MS,
      attempts: 0,
      lastSent: now,
    };

    return res.json({
      success: true,
      message:
        "OTP sent successfully" +
        (email ? " (Email)" : "") +
        (mobile ? " (Mobile)" : ""),
      info:
        process.env.NODE_ENV === "development"
          ? { emailOtp, mobileOtp, for: purpose }
          : undefined,
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send OTP" });
  }
});

// ---------- VERIFY OTP (Signup) ----------
router.post("/verify-otp", (req, res) => {
  try {
    let { email, mobile, emailOtp, mobileOtp, purpose } = req.body || {};
    email = email ? email.trim().toLowerCase() : "";
    mobile = mobile ? mobile.trim() : "";
    purpose = (purpose || "signup").toLowerCase();

    if ((!email && !mobile) || (email && !emailOtp) || (mobile && !mobileOtp)) {
      return res
        .status(400)
        .json({ success: false, error: "All required fields missing." });
    }

    const key = getKey({ email, mobile, purpose });
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

    if (email && hashOtp(emailOtp) !== rec.emailHash)
      return res
        .status(400)
        .json({ success: false, error: "Invalid Email OTP" });
    if (mobile && hashOtp(mobileOtp) !== rec.mobileHash)
      return res
        .status(400)
        .json({ success: false, error: "Invalid Mobile OTP" });

    delete otpDB[key];
    return res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
