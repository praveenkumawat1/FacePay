const User = require("../models/User");
const FaceData = require("../models/FaceData");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");

// Temporary face descriptor extraction
const extractFaceDescriptor = async (imagePath) => {
  return {
    descriptor: Array(128)
      .fill(0)
      .map(() => Math.random()),
    confidence: 0.95,
  };
};

// Register User
exports.registerUser = async (req, res) => {
  try {
    console.log("📝 Registration Request Body:", req.body);
    console.log("📸 File:", req.file);

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

    // Check existing user
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

    // Create user
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
    console.log("✅ User created:", newUser._id);

    // Save face data
    const newFaceData = new FaceData({
      user_id: newUser._id,
      face_descriptor: faceData.descriptor,
      image_path: faceImage.path,
      confidence_score: faceData.confidence,
    });

    await newFaceData.save();
    console.log("✅ Face data saved");

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: newUser._id,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        user_id: newUser._id,
        full_name: newUser.full_name,
        email: newUser.email,
        mobile: newUser.mobile,
        balance: newUser.balance,
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

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

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
      { user_id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user._id,
        full_name: user.full_name,
        email: user.email,
        balance: user.balance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select("-password_hash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
