const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/crypto");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    // ==================== PERSONAL INFO ====================
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

    // ==================== UPI ====================
    upi_id: {
      type: String,
      default: null,
      sparse: true,
      trim: true,
    },

    // ==================== SECURITY ====================
    password_hash: {
      type: String,
      required: true,
    },

    // 2FA / TOTP
    is_2fa_enabled: { type: Boolean, default: false },
    totp_secret: { type: String, default: null },
    totp_temp: { type: String, default: null },

    // Backup codes for 2FA (encrypted)
    backupCodes: { type: [String], default: [] },

    // ==================== PASSWORD RESET OTP FIELDS ====================
    resetOtp: {
      type: String,
      default: null,
    },
    resetOtpExpires: {
      type: Date,
      default: null,
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },

    // ==================== BANK DETAILS ====================
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
    branch: {
      type: String,
      default: null,
      trim: true,
    },

    // ==================== WALLET ====================
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
      max: [10000000, "Balance limit exceeded"],
    },

    wallet_key: {
      type: String,
      unique: true,
      sparse: true,
    },

    // ==================== ROLE ====================
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },

    // ==================== STATUS ====================
    is_verified: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },

    // ==================== AWS REKOGNITION ====================
    awsFaceId: { type: String, default: null, index: true },
    faceImageUrl: { type: String, default: null },
    faceEnrolledAt: { type: Date, default: null },

    // ==================== DASHBOARD FIELDS ====================
    profile_picture: { type: String, default: null },
    referral_code: { type: String, unique: true, sparse: true },
    referred_by: { type: String, default: null },

    // ==================== REWARDS SYSTEM ====================
    coins: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastClaimDate: { type: Date },
    lastSpinDate: { type: Date, default: null }, // 👈 ADDED FOR SPIN COOLDOWN
    totalCashback: { type: Number, default: 0 },
    referralChainBonus: { type: Number, default: 0 },
    billSplitRewards: { type: Number, default: 0 },
    upiStreak: { type: Number, default: 0 },
    lastTransactionDate: { type: Date },
    scratchCardAvailable: { type: Boolean, default: false },
    // ----- New shield fields -----
    hasShield: { type: Boolean, default: false },
    shieldExpiry: { type: Date, default: null },

    // ==================== NOTIFICATIONS ====================
    notifications: [
      {
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
          type: String,
          enum: ["info", "success", "warning", "error"],
          default: "info",
        },
        read: { type: Boolean, default: false },
        time: {
          type: String,
          default: () => new Date().toISOString(),
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ==================== KYC FIELDS ====================
    kyc_status: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "submitted",
        "under_review",
        "verified",
        "rejected",
      ],
      default: "pending",
      index: true,
    },
    kyc_level: { type: Number, enum: [0, 1, 2], default: 0 },
    kyc_verified: { type: Boolean, default: false, index: true },
    kyc_submitted_at: { type: Date, default: null },
    kyc_verified_at: { type: Date, default: null },
    kyc_rejected_at: { type: Date, default: null },
    kyc_rejection_reason: { type: String, default: null },
    kyc_session_id: { type: String, default: null, index: true },

    // Aadhaar (Encrypted)
    aadhaar_number: { type: String, default: null, sparse: true },
    aadhaar_name: { type: String, default: null },
    aadhaar_dob: { type: Date, default: null },
    aadhaar_gender: {
      type: String,
      enum: ["Male", "Female", "Other", null],
      default: null,
    },
    aadhaar_address: { type: String, default: null },
    aadhaar_image_front: { type: String, default: null },
    aadhaar_image_back: { type: String, default: null },
    aadhaar_verified: { type: Boolean, default: false },
    aadhaar_verified_at: { type: Date, default: null },
    aadhaar_transaction_id: { type: String, default: null },

    // PAN (Encrypted)
    pan_number: { type: String, default: null, sparse: true },
    pan_name: { type: String, default: null },
    pan_dob: { type: Date, default: null },
    pan_image: { type: String, default: null },
    pan_verified: { type: Boolean, default: false },
    pan_verified_at: { type: Date, default: null },

    // Selfie & Liveness
    selfie_image: { type: String, default: null },
    selfie_verified: { type: Boolean, default: false },
    selfie_liveness_score: { type: Number, default: null, min: 0, max: 100 },
    selfie_face_match_score: { type: Number, default: null, min: 0, max: 100 },
    selfie_verified_at: { type: Date, default: null },

    // Bank (KYC - Encrypted)
    bank_account_number: { type: String, default: null },
    bank_ifsc: { type: String, default: null },
    bank_account_holder_name: { type: String, default: null },
    bank_account_type: {
      type: String,
      enum: ["savings", "current", null],
      default: null,
    },
    bank_verified: { type: Boolean, default: false },
    bank_verified_at: { type: Date, default: null },

    // Address
    address_house: { type: String, default: null },
    address_street: { type: String, default: null },
    address_city: { type: String, default: null },
    address_state: { type: String, default: null },
    address_pincode: {
      type: String,
      default: null,
      match: [/^[0-9]{6}$/, "Invalid pincode"],
    },
    address_gps_lat: { type: Number, default: null },
    address_gps_lng: { type: Number, default: null },
    address_verified: { type: Boolean, default: false },

    // Terms
    terms_accepted: { type: Boolean, default: false },
    terms_accepted_at: { type: Date, default: null },

    // ==================== TRANSACTION LIMITS ====================
    daily_limit: { type: Number, default: 10000, min: 0 },
    monthly_limit: { type: Number, default: 50000, min: 0 },

    // ==================== RISK & FRAUD ====================
    risk_score: { type: Number, default: 0, min: 0, max: 100 },
    fraud_flags: [
      {
        type: { type: String, required: true },
        reason: { type: String, required: true },
        created_at: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// ==================== INDEXES ====================
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mobile: 1 }, { unique: true });
userSchema.index({ account_number: 1 }, { unique: true });
userSchema.index({ wallet_key: 1 }, { unique: true, sparse: true });
userSchema.index({ kyc_status: 1 });
userSchema.index({ kyc_verified: 1 });
userSchema.index({ kyc_session_id: 1 });
userSchema.index({ awsFaceId: 1 });
userSchema.index({ referral_code: 1 }, { unique: true, sparse: true });
userSchema.index({ resetToken: 1 }, { sparse: true });
userSchema.index({ lastTransactionDate: 1 });

// ==================== PRE-SAVE HOOK ====================
userSchema.pre("save", async function (next) {
  // Generate wallet key for new users
  if (this.isNew && !this.wallet_key) {
    this.wallet_key = `W-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    console.log("✅ Generated wallet key:", this.wallet_key);
  }

  // Generate referral code for new users
  if (this.isNew && !this.referral_code) {
    this.referral_code = `FP${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // Helper to check if a field is already encrypted
  const isEncrypted = (val) =>
    val && (val.startsWith("enc:") || val.includes(":"));

  // Encrypt sensitive fields
  if (this.isModified("email") && this.email && !isEncrypted(this.email)) {
    this.email = encrypt(this.email);
  }
  if (this.isModified("mobile") && this.mobile && !isEncrypted(this.mobile)) {
    this.mobile = encrypt(this.mobile);
  }
  if (
    this.isModified("account_number") &&
    this.account_number &&
    !isEncrypted(this.account_number)
  ) {
    this.account_number = encrypt(this.account_number);
  }
  if (
    this.isModified("aadhaar_number") &&
    this.aadhaar_number &&
    !isEncrypted(this.aadhaar_number)
  ) {
    this.aadhaar_number = encrypt(this.aadhaar_number);
  }
  if (
    this.isModified("pan_number") &&
    this.pan_number &&
    !isEncrypted(this.pan_number)
  ) {
    this.pan_number = encrypt(this.pan_number);
  }
  if (
    this.isModified("bank_account_number") &&
    this.bank_account_number &&
    !isEncrypted(this.bank_account_number)
  ) {
    this.bank_account_number = encrypt(this.bank_account_number);
  }

  // Encrypt backup codes if they are new or modified and not already encrypted
  if (this.isModified("backupCodes") && Array.isArray(this.backupCodes)) {
    this.backupCodes = this.backupCodes.map((code) => {
      if (code && !isEncrypted(code)) {
        return encrypt(code);
      }
      return code;
    });
  }

  // Hash password
  if (
    this.isModified("password_hash") &&
    this.password_hash &&
    !this.password_hash.startsWith("$2")
  ) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
  }

  next();
});

// ==================== INSTANCE METHODS ====================

/**
 * Decrypt sensitive fields for API returns (safe object without secrets)
 */
userSchema.methods.toDecrypted = function () {
  const out = this.toObject();

  const decryptField = (field) => {
    if (!field) return field;
    try {
      return decrypt(field);
    } catch (err) {
      console.error("Decryption error for field:", err);
      return null;
    }
  };

  out.email = decryptField(out.email) || "";
  out.mobile = decryptField(out.mobile) || "";
  out.account_number = decryptField(out.account_number) || "";
  out.aadhaar_number = decryptField(out.aadhaar_number);
  out.pan_number = decryptField(out.pan_number);
  out.bank_account_number = decryptField(out.bank_account_number);

  // Decrypt backup codes? Usually we don't return them in general profile.
  // We'll handle backup codes via a separate method.
  delete out.backupCodes;

  // Remove ALL sensitive fields
  delete out.password_hash;
  delete out.totp_secret;
  delete out.totp_temp;
  delete out.resetOtp;
  delete out.resetOtpExpires;
  delete out.resetToken;
  delete out.resetTokenExpires;

  return out;
};

/**
 * Get decrypted backup codes (only if 2FA enabled)
 */
userSchema.methods.getDecryptedBackupCodes = function () {
  if (!this.backupCodes || !Array.isArray(this.backupCodes)) return [];
  return this.backupCodes.map((code) => {
    try {
      return decrypt(code);
    } catch {
      return code; // fallback to original if decryption fails (maybe plain)
    }
  });
};

/**
 * Encrypt a field
 */
userSchema.methods.encryptField = function (data) {
  if (!data) return null;
  return encrypt(data);
};

/**
 * Decrypt a field
 */
userSchema.methods.decryptField = function (data) {
  if (!data) return null;
  try {
    return decrypt(data);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

// ==================== STATIC METHODS ====================

/**
 * Find user by unencrypted field value
 */
userSchema.statics.findByUnencrypted = function (query) {
  const encQuery = { ...query };
  if (encQuery.email) encQuery.email = encrypt(encQuery.email);
  if (encQuery.mobile) encQuery.mobile = encrypt(encQuery.mobile);
  if (encQuery.account_number)
    encQuery.account_number = encrypt(encQuery.account_number);
  if (encQuery.aadhaar_number)
    encQuery.aadhaar_number = encrypt(encQuery.aadhaar_number);
  if (encQuery.pan_number) encQuery.pan_number = encrypt(encQuery.pan_number);
  return this.findOne(encQuery);
};

/**
 * Find all users by unencrypted field value
 */
userSchema.statics.findAllByUnencrypted = function (query) {
  const encQuery = { ...query };
  if (encQuery.email) encQuery.email = encrypt(encQuery.email);
  if (encQuery.mobile) encQuery.mobile = encrypt(encQuery.mobile);
  if (encQuery.account_number)
    encQuery.account_number = encrypt(encQuery.account_number);
  if (encQuery.aadhaar_number)
    encQuery.aadhaar_number = encrypt(encQuery.aadhaar_number);
  if (encQuery.pan_number) encQuery.pan_number = encrypt(encQuery.pan_number);
  return this.find(encQuery);
};

module.exports = mongoose.model("User", userSchema);
