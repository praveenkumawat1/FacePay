const jwt = require("jsonwebtoken");
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");
const Session = require("../models/Session");
const ActivityLog = require("../models/ActivityLog");

// Get Device & Location Info
const getDeviceInfo = (req) => {
  const ua = new UAParser(req.headers["user-agent"]);
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const cleanIp = ip.replace(/^::ffff:/, "");
  const geo = geoip.lookup(cleanIp);

  return {
    device: ua.getDevice().model || "Desktop",
    browser: ua.getBrowser().name || "Unknown",
    os: ua.getOS().name || "Unknown",
    ipAddress: cleanIp,
    location: geo ? `${geo.city || "Unknown"}, ${geo.country}` : "Unknown",
  };
};

// Auth Middleware
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      console.log("❌ No token provided");
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);

    const userId =
      decoded.id ||
      decoded.userId ||
      decoded._id ||
      decoded.user_id ||
      decoded.sub;

    if (!userId) {
      console.log("❌ No userId in token:", decoded);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Session check with timeout – optional, can be skipped if you want pure token auth
    try {
      const sessionPromise = Session.findOne({ userId, token });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Session lookup timeout")), 5000),
      );

      const userSession = await Promise.race([sessionPromise, timeoutPromise]);

      if (!userSession) {
        console.log("❌ Session not found for user:", userId);
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
        });
      }

      // Update last active (async)
      Session.findByIdAndUpdate(userSession._id, {
        lastActive: Date.now(),
      }).catch((err) => console.error("Session update error:", err.message));

      req.userSession = userSession;
    } catch (sessionError) {
      console.warn(
        "⚠️ Session check failed:",
        sessionError.message,
        "— proceeding with token only",
      );
      // If session DB is down, still allow request (token is valid)
    }

    // Set user data
    req.user = { id: userId, email: decoded.email };
    req.userId = userId;

    console.log("✅ User authenticated:", userId);
    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized",
      error: error.message,
    });
  }
};

// Log Activity
const logActivity = async (userId, action, status, req) => {
  try {
    const info = getDeviceInfo(req);
    await ActivityLog.create({
      userId,
      action,
      device: `${info.device} - ${info.browser}`,
      location: info.location,
      status,
    });
    console.log(`📝 Activity logged: ${action} for user ${userId}`);
  } catch (error) {
    console.error("❌ Activity log error:", error.message);
  }
};

// Response Time Tracker (optional)
const responseTime = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`⏱️  ${req.method} ${req.path} - ${duration}ms`);
    if (duration > 2000) {
      console.warn(`⚠️  Slow response: ${req.path} took ${duration}ms`);
    }
  });
  next();
};

module.exports = { protect, getDeviceInfo, logActivity, responseTime };
