const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    // 1. Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error("FATAL: JWT_SECRET is not defined");
      return res.status(500).json({
        error:
          "JWT_SECRET not set in environment. Please set JWT_SECRET in your .env file.",
      });
    }

    // 2. Extract token from Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Invalid authorization header. Use: Bearer <token>" });
    }
    const token = authHeader.split(" ")[1];
    if (!token || token === "null" || token === "undefined") {
      return res
        .status(401)
        .json({ error: "No token provided or token invalid" });
    }

    // 3. Verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification error:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    // Attach userId from payload (support multiple formats)
    req.userId =
      payload.userId ||
      payload.id ||
      payload._id ||
      payload.user_id ||
      payload.sub;
    if (!req.userId) {
      return res
        .status(401)
        .json({ error: "User ID not found in token payload" });
    }

    // 5. (Optional) Attach minimal user data for performance
    //    Only select fields that are frequently needed (e.g., role, email)
    //    Use .lean() to get a plain object (faster)
    const user = await User.findById(req.userId)
      .select("full_name email role profile_picture kyc_verified") // adjust as needed
      .lean();
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user; // now a plain object, not a Mongoose document

    next();
  } catch (err) {
    // Log error internally, but send generic message to client
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
