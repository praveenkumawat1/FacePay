const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT Auth middleware
module.exports = async function (req, res, next) {
  // Read the Bearer token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id); // assumes token created as: { id: user._id }
    if (!req.user) throw new Error("User not found");
    next();
  } catch (err) {
    // Debug log for error tracing
    console.error("AUTH ERROR (JWT):", err);
    res.status(401).json({ error: "Token invalid" });
  }
};
