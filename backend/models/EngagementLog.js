const mongoose = require("mongoose");

const EngagementLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Can be anonymous
      index: true,
    },
    sessionId: { type: String, required: true, index: true },
    sectionId: { type: String, required: true }, // e.g., "hero", "features", "pricing"
    dwellTime: { type: Number, required: true, default: 0 }, // in milliseconds
    scrollDepth: { type: Number, default: 0 }, // percentage of section scrolled
    clickCount: { type: Number, default: 0 },
    lastVisited: { type: Date, default: Date.now },
    deviceInfo: {
      browser: String,
      os: String,
      deviceType: String,
    },
  },
  { timestamps: true },
);

EngagementLogSchema.index({ sessionId: 1, sectionId: 1 }, { unique: true });

module.exports = mongoose.model("EngagementLog", EngagementLogSchema);
