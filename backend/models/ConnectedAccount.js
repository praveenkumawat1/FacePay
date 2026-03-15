const mongoose = require("mongoose");

const ConnectedAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  provider: {
    type: String,
    enum: ["google", "github", "apple", "microsoft", "facebook", "twitter"],
    required: true,
  },
  providerId: { type: String }, // ID from the OAuth provider
  email: { type: String },
  name: { type: String },
  connected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Ensure a user can only have one connection per provider
ConnectedAccountSchema.index({ userId: 1, provider: 1 }, { unique: true });

module.exports =
  mongoose.models.ConnectedAccount ||
  mongoose.model("ConnectedAccount", ConnectedAccountSchema);
