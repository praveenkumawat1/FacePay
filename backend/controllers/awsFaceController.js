const User = require("../models/User");
const Wallet = require("../models/Wallet");
const { indexFace, searchFace } = require("../utils/awsRekognition");
const mongoose = require("mongoose");
const fs = require("fs").promises; // ✅ Optimized: use async fs for faster cleanup

/**
 * Enroll user's face with AWS Rekognition
 */
exports.enrollFace = async (req, res) => {
  try {
    const { userId } = req.body;
    const faceImage = req.file;

    if (!userId || !faceImage) {
      if (faceImage) fs.unlink(faceImage.path).catch(console.error);
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      fs.unlink(faceImage.path).catch(console.error);
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    console.time("TotalEnrollTime");

    const [userExists, awsResult] = await Promise.all([
      User.exists({ _id: userId }),
      indexFace(faceImage.path, userId).catch((err) => ({
        success: false,
        error: err.message,
      })),
    ]);

    if (!userExists) {
      fs.unlink(faceImage.path).catch(console.error);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!awsResult?.success) {
      console.error("❌ AWS indexing failed:", awsResult.error);
      fs.unlink(faceImage.path).catch(console.error);
      return res.status(500).json({
        success: false,
        message: "Biometric analysis failed. Ensure face is clear.",
        error: awsResult.error,
      });
    }

    console.log("✅ Face indexed successfully with AWS.");

    const imageUrl = `/uploads/faces/${faceImage.filename}`;
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          awsFaceId: awsResult.faceId,
          faceImageUrl: imageUrl,
          faceEnrolledAt: new Date(),
        },
      },
    );

    console.timeEnd("TotalEnrollTime");

    return res.status(200).json({
      success: true,
      message: "Face enrolled",
      data: {
        faceId: awsResult.faceId,
        faceImageUrl: imageUrl,
      },
    });
  } catch (error) {
    console.error("❌ Unexpected error in enrollFace:", error);
    if (req.file) fs.unlink(req.file.path).catch(console.error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

/**
 * Search/Verify face against AWS Rekognition Collection
 */
exports.searchByFace = async (req, res) => {
  try {
    const faceImage = req.file;

    if (!faceImage) {
      if (faceImage && faceImage.path)
        fs.unlink(faceImage.path).catch(console.error);
      return res
        .status(400)
        .json({ success: false, message: "No face image provided" });
    }

    console.time("SearchFaceTime");

    // 1. Search in Rekognition
    const awsResult = await searchFace(faceImage.path).catch((err) => {
      console.error("Rekognition search error:", err);
      return {
        success: false,
        error: err.message,
      };
    });

    // Cleanup uploaded file
    await fs.unlink(faceImage.path).catch(console.error);

    if (!awsResult?.success) {
      return res.status(404).json({
        success: false,
        message: awsResult.message || "Face not recognized",
        error: awsResult.error,
      });
    }

    // 2. Map ExternalImageId (userId) to User profile
    const matchedUserId = awsResult.userId;

    if (!matchedUserId) {
      return res.status(404).json({
        success: false,
        message: "Face recognized but no external identity mapping found",
      });
    }

    const user = await User.findById(matchedUserId).select(
      "full_name email mobile upi_id faceImageUrl profile_picture",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found for this identity",
      });
    }

    let wallet = await Wallet.findOne({ user_id: user._id });

    // If wallet not found, create one automatically to avoid "NOT-FOUND"
    if (!wallet) {
      console.log(`Initialising wallet for user: ${user._id}`);
      wallet = await Wallet.create({
        user_id: user._id,
        balance: 0,
      });
    }

    console.timeEnd("SearchFaceTime");

    return res.status(200).json({
      success: true,
      message: "Face verified",
      user: {
        id: user._id,
        name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        upi_id: user.upi_id,
        wallet_id: wallet ? wallet._id : null,
        balance: wallet ? wallet.balance : 0,
        imageUrl:
          user.profile_picture ||
          user.faceImageUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=4f46e5&color=fff`,
      },
    });
  } catch (error) {
    console.error("❌ Search face error:", error);
    if (req.file && req.file.path)
      await fs.unlink(req.file.path).catch(console.error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during face search",
    });
  }
};
