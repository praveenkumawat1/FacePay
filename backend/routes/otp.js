const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { sendOtpEmail } = require("../utils/emailOtpSender");

// DUMMY SMS SENDER
async function sendSmsOtp(mobile, otp) {
  // Kuch bhi real SMS nahi jayega, aur OTP hamesha 123456 hi hoga!
  console.log(`[DUMMY SMS] Pretend SMS sent to ${mobile}: OTP = 123456`);
  return { success: true };
}

// DEMO in-memory DB
const otpDB = {}; // key: { emailHash, mobileHash, expires, attempts, lastSent, emailOtp }

function getKey(email, mobile) {
  return `${email || ""}_${mobile || ""}`;
}
function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

const OTP_EXPIRY_MS = 90 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;

/* ========== SEND OTP ========== */
router.post("/send-otp", async (req, res) => {
  try {
    const { email, mobile } = req.body || {};
    if (!email && !mobile) {
      return res
        .status(400)
        .json({ success: false, error: "Email or mobile required" });
    }

    const key = getKey(email, mobile);
    const now = Date.now();

    // Resend cooldown
    if (otpDB[key] && now - otpDB[key].lastSent < RESEND_COOLDOWN_MS) {
      return res.status(429).json({
        success: false,
        error: "Please wait before requesting OTP again",
      });
    }

    // OTP generation rules
    const emailOtp = email
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : null;
    const mobileOtp = mobile ? "123456" : null;

    try {
      const resultArr = [];
      if (email) resultArr.push(sendOtpEmail(email, emailOtp));
      if (mobile) resultArr.push(sendSmsOtp(mobile, mobileOtp));
      const results = await Promise.all(resultArr);

      if (email && results[0] && results[0].success === false) {
        return res
          .status(500)
          .json({ success: false, error: "Failed to send Email OTP" });
      }
      if (mobile) {
        let smsResult = email ? results[1] : results[0];
        if (smsResult && smsResult.success === false) {
          return res.status(500).json({
            success: false,
            error:
              "Failed to send SMS OTP" +
              (smsResult.error ? ` (${smsResult.error})` : ""),
          });
        }
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
        "OTP sent successfully (Mobile: 123456, Email: " +
        (emailOtp || "") +
        ")",
    });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to send OTP" });
  }
});

/* ========== VERIFY OTP ========== */
router.post("/verify-otp", (req, res) => {
  try {
    const { email, mobile, emailOtp, mobileOtp } = req.body || {};
    const key = getKey(email, mobile);
    const rec = otpDB[key];

    if (!rec) {
      return res
        .status(400)
        .json({ success: false, error: "No OTP request found" });
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

    if (email && hashOtp(emailOtp) !== rec.emailHash) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Email OTP" });
    }
    if (mobile && hashOtp(mobileOtp) !== rec.mobileHash) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Mobile OTP" });
    }

    // ✅ Verified
    delete otpDB[key];
    return res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
