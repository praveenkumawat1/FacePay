const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reward: {
      type: Number,
      required: true,
      min: [0, "Reward cannot be negative"],
    },
    total: {
      type: Number,
      required: true,
      min: [1, "Total must be at least 1"],
    },
    type: {
      type: String,
      enum: ["daily_login", "referral", "upi", "purchase", "other"],
      default: "other",
    },
    icon: {
      type: String,
      default: "FiTarget",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Mission", missionSchema);
