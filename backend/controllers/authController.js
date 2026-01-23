const User = require("../models/User");
const FaceData = require("../models/FaceData");
const Wallet = require("../models/Wallet");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { encrypt, decrypt } = require("../utils/crypto");

const { authenticator } = require("otplib");
const qrcode = require("qrcode");

const extractFaceDescriptor = async (imagePath) => {
  return {
    descriptor: Array(128)
      .fill(0)
      .map(() => Math.random()),
    confidence: 0.95,
  };
};

exports.registerUser = async (req, res) => {
  try {
    let {
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

    // Normalize
    email = (email || "").trim().toLowerCase();
    mobile = (mobile || "").trim();
    account_number = (account_number || "").trim();

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

    // ENCRYPTED duplicate check
    const existingUser = await User.findOne({
      $or: [
        { email: encrypt(email) },
        { mobile: encrypt(mobile) },
        { account_number: encrypt(account_number) },
      ],
    });

    if (existingUser) {
      if (faceImage) fs.unlinkSync(faceImage.path);
      return res.status(400).json({
        success: false,
        message:
          "User already exists with this email, mobile or account number",
      });
    }

    const faceData = await extractFaceDescriptor(faceImage.path);
    const password_hash = await bcrypt.hash(password, 10);

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

    const newFaceData = new FaceData({
      user_id: newUser._id,
      face_descriptor: faceData.descriptor,
      image_path: faceImage.path,
      confidence_score: faceData.confidence,
    });

    await newFaceData.save();

    const wallet_key = uuidv4();
    const wallet = new Wallet({
      user_id: newUser._id,
      wallet_key,
      balance: 0,
    });
    await wallet.save();

    const token = jwt.sign(
      { user_id: newUser._id, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

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

exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = (email || "").trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // ENCRYPTED email for user search
    const user = await User.findOne({ email: encrypt(email) });
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

    const wallet = await Wallet.findOne({ user_id: user._id });
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
    // Normalize email
    let normEmail = (email || "").trim().toLowerCase();
    // Find user by ENCRYPTED email
    const user = await User.findOne({ email: encrypt(normEmail) });
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

    const token = jwt.sign(
      { user_id: user._id, email: normEmail },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

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
