const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceItem",
      default: null, // in case item is deleted later
    },
    itemTitle: {
      type: String,
      required: true,
      trim: true,
    },
    coinsSpent: {
      type: Number,
      required: true,
      min: [0, "Coins spent cannot be negative"],
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
    // Optional: if redemption generates a coupon, store its code
    couponCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt (though we have redeemedAt)
  },
);

// Index for efficient user history queries
redemptionSchema.index({ userId: 1, redeemedAt: -1 });

module.exports = mongoose.model("Redemption", redemptionSchema);
