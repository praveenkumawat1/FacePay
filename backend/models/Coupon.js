const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      enum: ["Food", "Travel", "Shopping", "Entertainment", "Other"],
      default: "Other",
    },
    discount: {
      type: String, // e.g., "50% OFF", "₹100 off"
      default: null,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    icon: {
      type: String,
      default: "FiTag", // matches the icon component name
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  },
);

// Index for expiry-based queries (e.g., expiring soon)
couponSchema.index({ expiryDate: 1 });

module.exports = mongoose.model("Coupon", couponSchema);
