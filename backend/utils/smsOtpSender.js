// utils/smsOtpSender.js
async function sendSmsOtp(toMobile, otp) {
  // AB KOI SMS API CALL NAHI, SIRF DUMMY PRINT!
  console.log(`[DUMMY][SMS OTP] Pretend SMS sent to ${toMobile}: OTP = 123456`);
  return { success: true };
}
module.exports = { sendSmsOtp };
