const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  action: { type: String, required: true },
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success",
  },
  device: { type: String, default: "Unknown" },
  ipAddress: { type: String, default: "Unknown" },
  location: { type: String, default: "Unknown" },
  createdAt: { type: Date, default: Date.now },
});

// Index for sorting activity by date
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);
