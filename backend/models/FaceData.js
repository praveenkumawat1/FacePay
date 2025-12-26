const mongoose = require("mongoose");

const faceDataSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    face_descriptor: {
      type: [Number],
      required: true,
    },
    image_path: {
      type: String,
      required: true,
    },
    confidence_score: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

faceDataSchema.index({ user_id: 1 });

module.exports = mongoose.model("FaceData", faceDataSchema);
