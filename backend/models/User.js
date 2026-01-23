const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/crypto");
const bcrypt = require("bcryptjs");

/**
 * User Schema for FacePay
 * - Encrypts: email, mobile, account_number (at rest)
 * - Hashes: password_hash (bcrypt)
 * - Validation for all fields
 * - Static helpers for searching via unencrypted values
 * - .toDecrypted() instance method for filtered, decoded API return
 */

const userSchema = new mongoose.Schema(
  {
    // Personal Info
    full_name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
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
      required: true, // Will be set to bcrypt hash
    },

    // Bank Details
    bank_name: {
      type: String,
      required: [true, "Bank name is required"],
      trim: true,
      maxlength: [50, "Bank name too long"],
    },
    account_holder_name: {
      type: String,
      required: [true, "Account holder name is required"],
      trim: true,
      maxlength: [50, "Account holder name too long"],
    },
    account_number: {
      type: String,
      required: [true, "Account number is required"],
      unique: true,
      trim: true,
      maxlength: [32, "Account number too long"],
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
      max: [10000000, "Balance limit exceeded"],
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

    // 2FA / TOTP
    totp_secret: String, // Permanent for 2FA
    totp_temp: String, // Temporary setup secret
    is_2fa_enabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure uniqueness
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mobile: 1 }, { unique: true });
userSchema.index({ account_number: 1 }, { unique: true });

// ========== Pre-save hook for encryption + password hashing ==========
userSchema.pre("save", async function (next) {
  // Encrypt fields if updated and not already encrypted
  if (this.isModified("email") && this.email && !this.email.includes(":")) {
    this.email = encrypt(this.email);
  }
  if (this.isModified("mobile") && this.mobile && !this.mobile.includes(":")) {
    this.mobile = encrypt(this.mobile);
  }
  if (
    this.isModified("account_number") &&
    this.account_number &&
    !this.account_number.includes(":")
  ) {
    this.account_number = encrypt(this.account_number);
  }
  // Hash password if plain (not already bcrypt hashed)
  if (
    this.isModified("password_hash") &&
    !this.password_hash.startsWith("$2")
  ) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
  }
  next();
});

// ========== Instance method: Decrypt for API returns ==========
userSchema.methods.toDecrypted = function () {
  const out = { ...this._doc };
  try {
    out.email = out.email ? decrypt(out.email) : "";
    out.mobile = out.mobile ? decrypt(out.mobile) : "";
    out.account_number = out.account_number ? decrypt(out.account_number) : "";
  } catch (err) {
    out.email = "";
    out.mobile = "";
    out.account_number = "";
  }
  delete out.password_hash;
  return out;
};

// ========== Statics: Search by unencrypted value ==========
userSchema.statics.findByUnencrypted = function (query) {
  const encQuery = { ...query };
  if (encQuery.email) encQuery.email = encrypt(encQuery.email);
  if (encQuery.mobile) encQuery.mobile = encrypt(encQuery.mobile);
  if (encQuery.account_number)
    encQuery.account_number = encrypt(encQuery.account_number);
  return this.findOne(encQuery);
};

userSchema.statics.findAllByUnencrypted = function (query) {
  const encQuery = { ...query };
  if (encQuery.email) encQuery.email = encrypt(encQuery.email);
  if (encQuery.mobile) encQuery.mobile = encrypt(encQuery.mobile);
  if (encQuery.account_number)
    encQuery.account_number = encrypt(encQuery.account_number);
  return this.find(encQuery);
};

module.exports = mongoose.model("User", userSchema);
