const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true, // hashed refresh token or JWT identifier
  },
  device: { type: String, default: "Unknown" },
  browser: { type: String, default: "Unknown" },
  os: { type: String, default: "Unknown" },
  location: { type: String, default: "Unknown" },
  ipAddress: { type: String, default: "Unknown" },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Index for quick session lookups per user
SessionSchema.index({ userId: 1, lastActive: -1 });

module.exports =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);
