// ✅ FIX: Transporter ko function ke andar banao taaki env load hone ke baad use ho
function createTransporter() {
  const nodemailer = require("nodemailer");
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // 465 ke liye true, 587 ke liye false
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // ✅ FIX: Timeout add karo taaki hang na ho
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });
}

module.exports = async function sendOtpEmail(to, otp) {
  // ✅ FIX: Credentials check karo pehle
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ SMTP credentials missing in .env!");
    throw new Error("Email service not configured");
  }

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: `"FacePay Security" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your FacePay Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #4f46e5;">FacePay Security</h2>
          <p>Your OTP for password reset is:</p>
          <div style="font-size: 2em; font-weight: bold; color: #4f46e5; letter-spacing: 8px; margin: 16px 0;">${otp}</div>
          <p style="color: #6b7280; font-size: 0.9em;">This OTP will expire in <b>10 minutes</b>.</p>
          <p style="color: #6b7280; font-size: 0.9em;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log(`✅ OTP email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw new Error("Failed to send OTP email: " + error.message);
  }
};
