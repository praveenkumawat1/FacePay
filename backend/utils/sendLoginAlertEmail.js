const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const UAParser = require("ua-parser-js");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Get location by IP address
async function getGeo(ip) {
  try {
    if (
      ip === "::1" ||
      ip === "127.0.0.1" ||
      ip === "localhost" ||
      ip.startsWith("192.168.")
    )
      return "Local Network/Localhost";
    const resp = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await resp.json();
    if (data && data.city) {
      return `${data.city}, ${data.region}, ${data.country_name}`;
    }
    return "Unknown";
  } catch {
    return "Unknown";
  }
}

async function sendLoginAlertEmail(to, deviceInfo = {}) {
  const {
    ip = "Unknown",
    userAgent = "Unknown",
    loginTime = new Date().toISOString(),
  } = deviceInfo;

  // Get better location info
  const userLocation = await getGeo(ip);

  // Parse user agent
  const parser = new UAParser();
  const uaData = parser.setUA(userAgent).getResult();
  const browserDetails = `${uaData.browser.name || "Unknown"} ${uaData.browser.version || ""}`;
  const osDetails = `${uaData.os.name || ""} ${uaData.os.version || ""}`;
  const deviceDetails =
    uaData.device.vendor && uaData.device.model
      ? `${uaData.device.vendor} ${uaData.device.model}`
      : "Unknown";

  let html = `
    <h2 style="color:#537FE7">New Login Detected on Your FacePay Account</h2>
    <p style="color:#222"><b>IP Address:</b> ${ip}</p>
    <p style="color:#222"><b>Location:</b> ${userLocation}</p>
    <p style="color:#222"><b>Browser:</b> ${browserDetails}</p>
    <p style="color:#222"><b>Operating System:</b> ${osDetails}</p>
    <p style="color:#222"><b>Device:</b> ${deviceDetails}</p>
    <p style="color:#484848"><b>Full User Agent:</b> <code>${userAgent}</code></p>
    <p style="color:#222"><b>Time:</b> ${loginTime}</p>
    <br>
    <p style="color:red">If this was not you, <b>IMMEDIATELY change your password and contact FacePay support.</b></p>
    <p style="color:#7b7b7b; font-size:12px">— FacePay Security Team</p>
  `;

  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: "FacePay: New Login Alert",
    html,
  });
}

module.exports = sendLoginAlertEmail;
