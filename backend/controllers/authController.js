const User = require("../models/User");
const FaceData = require("../models/FaceData");
const Wallet = require("../models/Wallet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Encryption helpers (only for manual decrypt for API return)
const { decrypt } = require("../utils/crypto");

// === TOTP dependencies ===
const { authenticator } = require("otplib");
const qrcode = require("qrcode");

// Temporary face descriptor extraction
const extractFaceDescriptor = async (imagePath) => {
  return {
    descriptor: Array(128)
      .fill(0)
      .map(() => Math.random()),
    confidence: 0.95,
  };
};

// Register User (NO encryption in controller, model hook handles it!)
exports.registerUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      mobile,
      dob,
      password,
      bank_name,
      account_holder_name,
      account_number,
      ifsc,
    } = req.body;

    const faceImage = req.file;

    // Validation
    if (
      !full_name ||
      !email ||
      !mobile ||
      !dob ||
      !password ||
      !bank_name ||
      !account_holder_name ||
      !account_number ||
      !ifsc
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!faceImage) {
      return res.status(400).json({
        success: false,
        message: "Face image is required",
      });
    }

    // Check existing user (use schema static so query is encrypted based on plain)
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }, { account_number }],
    });

    if (existingUser) {
      if (faceImage) fs.unlinkSync(faceImage.path);
      return res.status(400).json({
        success: false,
        message:
          "User already exists with this email, mobile or account number",
      });
    }

    // Extract face descriptor
    const faceData = await extractFaceDescriptor(faceImage.path);

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user (plain values, will auto-encrypt in model)
    const newUser = new User({
      full_name,
      email,
      mobile,
      dob: new Date(dob),
      password_hash,
      bank_name,
      account_holder_name,
      account_number,
      ifsc,
    });

    await newUser.save();

    // Save face data
    const newFaceData = new FaceData({
      user_id: newUser._id,
      face_descriptor: faceData.descriptor,
      image_path: faceImage.path,
      confidence_score: faceData.confidence,
    });

    await newFaceData.save();

    // *********** WALLET CREATE section ***********
    const wallet_key = uuidv4();
    const wallet = new Wallet({
      user_id: newUser._id,
      wallet_key,
      balance: 0,
    });
    await wallet.save();

    // Generate JWT
    const token = jwt.sign(
      { user_id: newUser._id, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Prepare response: decrypted user fields for return
    const userDecrypted = newUser.toDecrypted();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        user_id: newUser._id,
        full_name: newUser.full_name,
        email: userDecrypted.email,
        mobile: userDecrypted.mobile,
        dob: newUser.dob,
        bank_name: newUser.bank_name,
        account_holder_name: newUser.account_holder_name,
        account_number: userDecrypted.account_number,
        ifsc: newUser.ifsc,
        is_2fa_enabled: !!newUser.is_2fa_enabled,
      },
      wallet: {
        wallet_key: wallet.wallet_key,
        balance: wallet.balance,
        createdAt: wallet.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Registration Error:", error);

    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {}
    }

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login User (plain email, model decrypts/encrypts as needed)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // Find user by plain email (model hooks will encrypt in query)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { user_id: user._id, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const wallet = await Wallet.findOne({ user_id: user._id });

    // Decrypt for return
    const userDecrypted = user.toDecrypted();

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user._id,
        full_name: user.full_name,
        email: userDecrypted.email,
        mobile: userDecrypted.mobile,
        dob: user.dob,
        bank_name: user.bank_name,
        account_holder_name: user.account_holder_name,
        account_number: userDecrypted.account_number,
        ifsc: user.ifsc,
        is_2fa_enabled: !!user.is_2fa_enabled,
      },
      wallet: wallet
        ? {
            wallet_key: wallet.wallet_key,
            balance: wallet.balance,
            createdAt: wallet.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.user_id).select(
      "-password_hash",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch wallet info for the logged-in user
    const wallet = await Wallet.findOne({ user_id: user._id });

    // Decrypt to return
    const userDecrypted = user.toDecrypted();

    res.json({
      success: true,
      user: {
        ...userDecrypted,
        is_2fa_enabled: !!user.is_2fa_enabled,
      },
      wallet: wallet
        ? {
            wallet_key: wallet.wallet_key,
            balance: wallet.balance,
            createdAt: wallet.createdAt,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ GetProfile Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ==== TOTP / 2FA GOOGLE AUTH SECTION ====
exports.getTotpSetup = async (req, res) => {
  try {
    const user = req.user;
    let emailToUse = user.email;
    try {
      emailToUse = decrypt(user.email);
    } catch {}
    if (!user || !emailToUse) {
      return res.status(401).json({
        success: false,
        message: "Auth error (user not found)",
      });
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(emailToUse, "FacePay", secret);
    const qrDataUrl = await qrcode.toDataURL(otpauth);

    user.totp_temp = secret;
    await user.save();

    res.json({ qr: qrDataUrl, secret });
  } catch (err) {
    console.error("❌ TOTP Setup Error:", err);
    res.status(500).json({ success: false, message: "Failed to setup 2FA" });
  }
};

exports.verifyTotp = async (req, res) => {
  const { code } = req.body;
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Auth error (user missing)",
      });
    }
    const secret = user.totp_temp;
    if (!secret)
      return res
        .status(400)
        .json({ success: false, message: "TOTP setup not started" });

    const valid = authenticator.check(code, secret);
    if (!valid)
      return res.status(400).json({ success: false, message: "Invalid code" });

    user.totp_secret = secret;
    user.totp_temp = null;
    user.is_2fa_enabled = true;
    await user.save();

    res.json({ success: true, message: "Two-factor authentication enabled!" });
  } catch (err) {
    console.error("❌ TOTP Verify Error:", err);
    res.status(500).json({ success: false, message: "Unable to enable 2FA" });
  }
};

exports.loginWithTotp = async (req, res) => {
  const { email, code } = req.body;
  try {
    // Find user by plain email
    const user = await User.findOne({ email });
    if (!user || !user.totp_secret) {
      return res
        .status(400)
        .json({ success: false, message: "2FA not enabled" });
    }

    const valid = authenticator.check(code, user.totp_secret);
    if (!valid)
      return res
        .status(400)
        .json({ success: false, message: "Invalid 2FA code" });

    // Issue a JWT token
    const token = jwt.sign(
      { user_id: user._id, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // Get wallet/info
    const wallet = await Wallet.findOne({ user_id: user._id });
    const userDecrypted = user.toDecrypted();

    res.json({
      success: true,
      message: "2FA verified!",
      token,
      user: {
        user_id: user._id,
        full_name: user.full_name,
        email: userDecrypted.email,
        dob: user.dob,
        bank_name: user.bank_name,
        account_holder_name: user.account_holder_name,
        account_number: userDecrypted.account_number,
        ifsc: user.ifsc,
        is_2fa_enabled: !!user.is_2fa_enabled,
      },
      wallet: wallet
        ? {
            wallet_key: wallet.wallet_key,
            balance: wallet.balance,
            createdAt: wallet.createdAt,
          }
        : null,
    });
  } catch (err) {
    console.error("❌ TOTP Login Error:", err);
    res
      .status(500)
      .json({ success: false, message: "TOTP verification error" });
  }
};
