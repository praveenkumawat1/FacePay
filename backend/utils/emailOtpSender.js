const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Validate env vars at startup
 * App crash karega agar config galat ho – silent fail nahi hoga
 */
if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASS) {
  console.error("❌ EMAIL CONFIG MISSING in .env");
  process.exit(1);
}

/**
 * Create reusable transporter
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASS, // Gmail App Password (NOT normal password)
  },
});

/**
 * Verify transporter at startup (VERY IMPORTANT)
 */
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email transporter verification failed:", err.message);
  } else {
    console.log("✅ Email transporter ready");
  }
});

/**
 * Send OTP Email (Production Safe)
 * @param {string} toEmail
 * @param {string} otp
 */
async function sendOtpEmail(toEmail, otp) {
  if (!toEmail || !otp) {
    throw new Error("INVALID_EMAIL_OR_OTP");
  }

  try {
    const info = await transporter.sendMail({
      from: `"Security Team" <${process.env.EMAIL_FROM}>`,
      to: toEmail,
      subject: "Your One-Time Password (OTP)",
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;padding:20px">
          <h2 style="color:#111">Your OTP Code</h2>
          <p style="font-size:16px;color:#444">
            Use the following OTP to verify your email address:
          </p>

          <div style="
            font-size:28px;
            letter-spacing:6px;
            font-weight:bold;
            background:#f5f5f5;
            padding:14px;
            text-align:center;
            border-radius:8px;
            margin:20px 0;
          ">
            ${otp}
          </div>

          <p style="color:#666;font-size:14px">
            ⏳ This OTP will expire in <b>90 seconds</b>.
          </p>

          <p style="color:#999;font-size:12px;margin-top:30px">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    // Successful send
    console.log(
      `📧 OTP email sent to ${toEmail} | MessageID: ${info.messageId}`,
    );

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err) {
    // VERY IMPORTANT: log real error
    console.error("❌ Failed to send OTP email:", err.message);

    // Throw controlled error (never return undefined)
    throw new Error("EMAIL_OTP_SEND_FAILED");
  }
}

module.exports = { sendOtpEmail };
