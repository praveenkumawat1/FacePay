const mongoose = require("mongoose");

const featuredOfferSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    discount: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    bg: {
      type: String,
      required: true, // e.g. "linear-gradient(135deg,#cb356b,#bd3f32)"
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

module.exports = mongoose.model("FeaturedOffer", featuredOfferSchema);
