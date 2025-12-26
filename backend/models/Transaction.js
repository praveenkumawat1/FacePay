const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: true,
      unique: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver_upi: {
      type: String,
      required: true,
    },
    receiver_name: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
    face_match_score: {
      type: Number,
      default: 0,
    },
    face_verified: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: "",
    },
    completed_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ sender_id: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
