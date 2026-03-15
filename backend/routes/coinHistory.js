// models/CoinHistory.js
const mongoose = require("mongoose");

const coinHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    coins: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    // Human-readable time string for display
    time: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt used for sorting
  },
);

coinHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("CoinHistory", coinHistorySchema);
