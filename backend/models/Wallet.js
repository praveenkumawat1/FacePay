const mongoose = require("mongoose");
const crypto = require("crypto");

const walletSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ensures one wallet per user
      index: true,
    },
    wallet_key: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(32).toString("hex"),
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    // ✅ Added: wallet freeze feature ke liye (future use)
    status: {
      type: String,
      enum: ["active", "frozen"],
      default: "active",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

// Pre-save hook to ensure wallet_key is always set
walletSchema.pre("save", function (next) {
  if (!this.wallet_key) {
    this.wallet_key = crypto.randomBytes(32).toString("hex");
  }
  next();
});

// ✅ Index: dashboard mein Wallet.findOne({ user_id }) fast hoga
walletSchema.index({ user_id: 1 }, { unique: true });
walletSchema.index({ wallet_key: 1 }, { unique: true });

module.exports = mongoose.model("Wallet", walletSchema);
