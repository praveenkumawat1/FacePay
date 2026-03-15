const mongoose = require("mongoose");

const userMissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mission",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure one document per user per mission
userMissionSchema.index({ userId: 1, missionId: 1 }, { unique: true });

module.exports = mongoose.model("UserMission", userMissionSchema);
