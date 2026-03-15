const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper for debug logging (only in development)
const debugLog = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
};

/**
 * Authentication Middleware
 * Verifies JWT token, attaches userId and optional user object to req.
 */
module.exports = async (req, res, next) => {
  try {
    debugLog("🔐 Auth middleware triggered for", req.method, req.path);

    // 1. Ensure JWT_SECRET is defined (fail fast)
    if (!process.env.JWT_SECRET) {
      console.error("FATAL: JWT_SECRET environment variable is not set.");
      return res.status(500).json({
        success: false,
        message: "Internal server configuration error",
      });
    }

    // 2. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      debugLog("❌ No Authorization header");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      debugLog("❌ Invalid Authorization header format");
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use: Bearer <token>",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token || token === "null" || token === "undefined") {
      debugLog("❌ Token is empty or invalid");
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
      });
    }

    debugLog(
      "🎫 Token extracted (first 20 chars):",
      token.substring(0, 20) + "...",
    );

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    debugLog("✅ Token verified. Decoded payload:", {
      userId: decoded.userId,
      id: decoded.id,
      email: decoded.email,
      iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : undefined,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : undefined,
    });

    // 4. Extract userId (support multiple possible field names)
    const userId =
      decoded.userId ||
      decoded.id ||
      decoded._id ||
      decoded.user_id ||
      decoded.sub;
    if (!userId) {
      console.error(
        "❌ No user identifier found in token payload. Available fields:",
        Object.keys(decoded),
      );
      return res.status(401).json({
        success: false,
        message: "Invalid token: No user identifier",
      });
    }

    // 5. Attach userId to request (required for controllers)
    req.userId = userId;
    req.userEmail = decoded.email || null;

    // 6. (Optional) Fetch minimal user data for performance
    //    If you need the user object in controllers, uncomment the following lines.
    /*
    const user = await User.findById(userId)
      .select("full_name email role profile_picture kyc_verified") // adjust as needed
      .lean();
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = user; // plain object, not Mongoose document
    */

    debugLog("✅ Authentication successful. User ID:", userId);
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);

    // Handle specific JWT errors with user-friendly messages
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
        error: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
        error: "INVALID_TOKEN",
      });
    }

    // Generic error – hide details in production
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      ...(process.env.NODE_ENV !== "production" && { details: error.message }),
    });
  }
};
