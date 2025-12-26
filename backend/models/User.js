const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Personal Info
    full_name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter valid email",
      ],
    },
    mobile: {
      type: String,
      required: [true, "Mobile is required"],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Mobile must be 10 digits"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },

    // Security
    password_hash: {
      type: String,
      required: true,
    },

    // Bank Details
    bank_name: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
    },
    account_holder_name: {
      type: String,
      required: [true, "Account holder name is required"],
      trim: true,
    },
    account_number: {
      type: String,
      required: [true, "Account number is required"],
      unique: true,
      trim: true,
    },
    ifsc: {
      type: String,
      required: [true, "IFSC code is required"],
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"],
    },

    // Wallet
    balance: {
      type: Number,
      default: 1000.0,
      min: [0, "Balance cannot be negative"],
    },

    // Status
    is_verified: {
      type: Boolean,
      default: false,
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

// Indexes for faster queries
userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });
userSchema.index({ account_number: 1 });

module.exports = mongoose.model("User", userSchema);
