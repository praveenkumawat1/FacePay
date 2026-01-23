const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/crypto");
const bcrypt = require("bcryptjs");

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

    // === 2FA / TOTP (Google Authenticator) ===
    totp_secret: {
      type: String,
      default: null,
    },
    totp_temp: {
      type: String,
      default: null,
    },
    is_2fa_enabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 });
userSchema.index({ mobile: 1 });
userSchema.index({ account_number: 1 });

// === Encrypt on save ONLY if value not already encrypted (guard for ":") ===
userSchema.pre("save", async function (next) {
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
  if (
    this.isModified("password_hash") &&
    !this.password_hash.startsWith("$2")
  ) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
  }
  next();
});

// === Decrypt method for APIs ===
userSchema.methods.toDecrypted = function () {
  const cloned = { ...this._doc };
  try {
    cloned.email = cloned.email ? decrypt(cloned.email) : "";
    cloned.mobile = cloned.mobile ? decrypt(cloned.mobile) : "";
    cloned.account_number = cloned.account_number
      ? decrypt(cloned.account_number)
      : "";
  } catch (e) {
    cloned.email = "";
    cloned.mobile = "";
    cloned.account_number = "";
  }
  delete cloned.password_hash;
  return cloned;
};

// === Static query helpers for encrypted fields ===
userSchema.statics.findByUnencrypted = async function (query) {
  // Accepts query with possible email/mobile/account_number in plain
  const encQuery = { ...query };
  if (encQuery.email) encQuery.email = encrypt(encQuery.email);
  if (encQuery.mobile) encQuery.mobile = encrypt(encQuery.mobile);
  if (encQuery.account_number)
    encQuery.account_number = encrypt(encQuery.account_number);
  return this.findOne(encQuery);
};

userSchema.statics.findAllByUnencrypted = async function (query) {
  // Array results for admin tools etc
  const encQuery = { ...query };
  if (encQuery.email) encQuery.email = encrypt(encQuery.email);
  if (encQuery.mobile) encQuery.mobile = encrypt(encQuery.mobile);
  if (encQuery.account_number)
    encQuery.account_number = encrypt(encQuery.account_number);
  return this.find(encQuery);
};

module.exports = mongoose.model("User", userSchema);
