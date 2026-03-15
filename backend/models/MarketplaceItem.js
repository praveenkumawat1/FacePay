const mongoose = require("mongoose");

const marketplaceItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    icon: {
      type: String,
      default: "FiGift", // name of the icon component used in frontend
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for active items queries
marketplaceItemSchema.index({ active: 1, price: 1 });

module.exports = mongoose.model("MarketplaceItem", marketplaceItemSchema);
