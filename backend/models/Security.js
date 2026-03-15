const mongoose = require("mongoose");

// Session Schema
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  device: String,
  browser: String,
  os: String,
  ipAddress: String,
  location: String,
  isCurrent: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000, // 30 days auto delete
  },
});

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  device: String,
  location: String,
  status: {
    type: String,
    enum: ["success", "failed"],
    default: "success",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 2FA Schema
const twoFactorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  secret: String,
  backupCodes: [
    {
      code: String,
      used: {
        type: Boolean,
        default: false,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Connected Accounts Schema
const connectedAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  provider: {
    type: String,
    enum: ["google", "github", "apple"],
    required: true,
  },
  email: String,
  providerId: String,
  connectedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
sessionSchema.index({ userId: 1, token: 1 });
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
activityLogSchema.index({ userId: 1, createdAt: -1 });

// SAFE MODEL DEFINITIONS:
const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);
const ActivityLog =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", activityLogSchema);
const TwoFactor =
  mongoose.models.TwoFactor || mongoose.model("TwoFactor", twoFactorSchema);
const ConnectedAccount =
  mongoose.models.ConnectedAccount ||
  mongoose.model("ConnectedAccount", connectedAccountSchema);

module.exports = {
  Session,
  ActivityLog,
  TwoFactor,
  ConnectedAccount,
};
