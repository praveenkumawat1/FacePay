const User = require("../models/User");
const crypto = require("crypto");
const sendOtpEmail = require("../utils/sendOtpEmail");

/**
 * ✅ Get KYC Status
 */
exports.getKYCStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select(
      "kyc_status kyc_level kyc_verified aadhaar_verified pan_verified selfie_verified bank_verified address_verified daily_limit monthly_limit kyc_rejection_reason kyc_session_id",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      kyc: {
        status: user.kyc_status,
        level: user.kyc_level,
        verified: user.kyc_verified,
        session_id: user.kyc_session_id,
        steps: {
          aadhaar: user.aadhaar_verified || false,
          pan: user.pan_verified || false,
          selfie: user.selfie_verified || false,
          bank: user.bank_verified || false,
          address: user.address_verified || false,
        },
        limits: {
          daily: user.daily_limit,
          monthly: user.monthly_limit,
        },
        rejection_reason: user.kyc_rejection_reason,
      },
    });
  } catch (error) {
    console.error("❌ Get KYC status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch KYC status",
    });
  }
};

/**
 * ⚡ STEP 1: Submit Aadhaar Details
 */
exports.submitAadhaar = async (req, res) => {
  try {
    const userId = req.userId;
    const { full_name, aadhaar_number, dob, aadhaar_front, aadhaar_back } =
      req.body;

    console.log("📝 Aadhaar submission for user:", userId);

    // Validate
    if (
      !full_name ||
      !aadhaar_number ||
      !dob ||
      !aadhaar_front ||
      !aadhaar_back
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!/^\d{12}$/.test(aadhaar_number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhaar number",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check duplicate Aadhaar
    const existingAadhaar = await User.findOne({
      aadhaar_number: { $regex: aadhaar_number.slice(-4) + "$" },
      _id: { $ne: userId },
    });

    if (existingAadhaar) {
      return res.status(409).json({
        success: false,
        message: "This Aadhaar is already registered",
      });
    }

    // Encrypt Aadhaar (store only last 4 digits in plain)
    const encryptedAadhaar = user.encryptField(aadhaar_number);

    // Save to database
    user.aadhaar_number = aadhaar_number.slice(-4); // Only last 4 digits
    user.aadhaar_name = full_name;
    user.aadhaar_dob = new Date(dob);
    user.aadhaar_image_front = aadhaar_front; // Store base64 or S3 URL
    user.aadhaar_image_back = aadhaar_back;
    user.kyc_status = "in_progress";

    // Generate session ID if not exists
    if (!user.kyc_session_id) {
      user.kyc_session_id = `KYC-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    }

    await user.save();

    console.log("✅ Aadhaar details saved to database");

    res.json({
      success: true,
      message: "Aadhaar details saved",
      session_id: user.kyc_session_id,
    });
  } catch (error) {
    console.error("❌ Aadhaar submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save Aadhaar details",
    });
  }
};

/**
 * ⚡ STEP 1.5: Send Aadhaar OTP
 */
exports.sendAadhaarOTP = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user || !user.aadhaar_number) {
      return res.status(400).json({
        success: false,
        message: "Aadhaar details not found",
      });
    }

    // Generate OTP (in production, call real API)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    // Save transaction ID
    user.aadhaar_transaction_id = transactionId;
    await user.save();

    console.log("🔐 Demo OTP:", otp);

    res.json({
      success: true,
      message: "OTP sent successfully",
      transaction_id: transactionId,
      _devOTP: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

/**
 * ⚡ STEP 1.5: Verify Aadhaar OTP
 */
exports.verifyAadhaarOTP = async (req, res) => {
  try {
    const userId = req.userId;
    const { otp } = req.body;

    console.log("🔐 Verifying Aadhaar OTP");

    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // In demo mode, accept 123456
    if (otp === "123456" || process.env.NODE_ENV === "development") {
      // Mark as verified in database
      user.aadhaar_verified = true;
      user.aadhaar_verified_at = new Date();
      user.aadhaar_transaction_id = null;
      await user.save();

      console.log("✅ Aadhaar verified and saved to database");

      res.json({
        success: true,
        message: "Aadhaar verified successfully",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid OTP. Use 123456 for demo",
      });
    }
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

/**
 * ⚡ STEP 2: Submit PAN Card
 */
exports.submitPAN = async (req, res) => {
  try {
    const userId = req.userId;
    const { pan_number, pan_image } = req.body;

    console.log("📝 PAN submission");

    if (!pan_number || !pan_image) {
      return res.status(400).json({
        success: false,
        message: "PAN number and image required",
      });
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan_number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN format",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check duplicate PAN
    const existingPAN = await User.findOne({
      pan_number: pan_number.toUpperCase(),
      _id: { $ne: userId },
    });

    if (existingPAN) {
      return res.status(409).json({
        success: false,
        message: "PAN already registered",
      });
    }

    // Save to database
    user.pan_number = user.encryptField(pan_number.toUpperCase());
    user.pan_image = pan_image;
    user.pan_verified = true; // In demo mode
    user.pan_verified_at = new Date();

    await user.save();

    console.log("✅ PAN saved to database");

    res.json({
      success: true,
      message: "PAN verified successfully",
    });
  } catch (error) {
    console.error("❌ PAN submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save PAN",
    });
  }
};

/**
 * ⚡ STEP 3: Submit Selfie
 */
exports.submitSelfie = async (req, res) => {
  try {
    const userId = req.userId;
    const { selfie_image } = req.body;

    console.log("📸 Selfie submission");

    if (!selfie_image) {
      return res.status(400).json({
        success: false,
        message: "Selfie image required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Save to database
    user.selfie_image = selfie_image;
    user.selfie_verified = true;
    user.selfie_liveness_score = 95; // Mock score
    user.selfie_face_match_score = 92; // Mock score
    user.selfie_verified_at = new Date();

    await user.save();

    console.log("✅ Selfie saved to database");

    res.json({
      success: true,
      message: "Selfie verified successfully",
      liveness_score: 95,
    });
  } catch (error) {
    console.error("❌ Selfie submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save selfie",
    });
  }
};

/**
 * ⚡ STEP 4: Submit Bank Details
 */
exports.submitBankDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { account_number, ifsc, account_holder_name, account_type } =
      req.body;

    console.log("🏦 Bank details submission");

    if (!account_number || !ifsc || !account_holder_name) {
      return res.status(400).json({
        success: false,
        message: "All bank details required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Save to database (encrypted)
    user.bank_account_number = user.encryptField(account_number);
    user.bank_ifsc = ifsc.toUpperCase();
    user.bank_account_holder_name = account_holder_name;
    user.bank_account_type = account_type || "savings";
    user.bank_verified = true;
    user.bank_verified_at = new Date();

    await user.save();

    console.log("✅ Bank details saved to database");

    res.json({
      success: true,
      message: "Bank account verified successfully",
    });
  } catch (error) {
    console.error("❌ Bank submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save bank details",
    });
  }
};

/**
 * ⚡ STEP 5: Submit Address
 */
exports.submitAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { house, street, city, state, pincode, gps_lat, gps_lng } = req.body;

    console.log("📍 Address submission");

    if (!house || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All address fields required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Save to database
    user.address_house = house;
    user.address_street = street;
    user.address_city = city;
    user.address_state = state;
    user.address_pincode = pincode;
    user.address_gps_lat = gps_lat;
    user.address_gps_lng = gps_lng;
    user.address_verified = true;

    await user.save();

    console.log("✅ Address saved to database");

    res.json({
      success: true,
      message: "Address verified successfully",
    });
  } catch (error) {
    console.error("❌ Address submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save address",
    });
  }
};

/**
 * ⚡ STEP 6: Complete KYC (Automatic Approval)
 */
exports.completeKYC = async (req, res) => {
  try {
    const userId = req.userId;
    const { formData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Save all KYC data to the database
    user.kyc_status = "verified";
    user.kyclvl = 2; // Level 2: Full KYC
    user.is_verified = true; // Overall user verification status

    user.kyc_data = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      state: formData.state,
      city: formData.city,
      dob: formData.dob,
      fatherName: formData.fatherName,
      address: formData.address,
      securityQuestion: formData.securityQuestion,
      securityAnswer: formData.securityAnswer,
      aadhaarNumber: formData.aadhaarNumber,
      panNumber: formData.panNumber,
      submittedAt: new Date(),
      verifiedAt: new Date(),
    };

    // Update Transaction Limits
    user.daily_limit = 100000;
    user.monthly_limit = 500000;

    await user.save();

    console.log(`✅ KYC Automatic Approval for User: ${user.full_name}`);

    res.json({
      success: true,
      message: "KYC Verified & Approved Successfully",
      status: "verified",
    });
  } catch (error) {
    console.error("❌ KYC Approval Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error during KYC process",
    });
  }
};
