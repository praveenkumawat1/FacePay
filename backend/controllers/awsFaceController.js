const User = require("../models/User");
const { indexFace } = require("../utils/awsRekognition");
const path = require("path");

/**
 * FAST & ROBUST: Enroll user's face with AWS Rekognition
 */
exports.enrollFace = async (req, res) => {
  try {
    const { userId } = req.body;
    const faceImage = req.file;

    console.log("📥 Enroll face request received: ", {
      userId,
      faceImage: faceImage?.filename,
    });

    // Step 1: Input validation
    if (!userId || !faceImage) {
      return res.status(400).json({
        success: false,
        message: "User ID and face image are required",
      });
    }

    // Step 2: Find user (5 second timeout)
    console.log("🔍 Finding user...");
    let user;
    try {
      user = await Promise.race([
        User.findById(userId),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Database timeout finding user")),
            5000,
          ),
        ),
      ]);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log("✅ User found:", user._id);

    // Step 3: Index face on AWS Rekognition (15s timeout)
    console.log("🔐 Indexing face in AWS Rekognition...");
    let awsResult;
    try {
      awsResult = await Promise.race([
        indexFace(faceImage.path, userId),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("AWS Rekognition timeout after 15s")),
            15000,
          ),
        ),
      ]);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    if (!awsResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to index face in AWS",
        awsError: awsResult.message || undefined,
      });
    }
    console.log("✅ Face indexed:", awsResult.faceId);

    // Step 4: Update user document in background (non-blocking)
    const imageUrl = `/uploads/faces/${faceImage.filename}`;
    User.findByIdAndUpdate(
      userId,
      {
        awsFaceId: awsResult.faceId,
        faceImageUrl: imageUrl,
        faceEnrolledAt: new Date(),
      },
      { new: true },
    )
      .exec()
      .then(() => {
        console.log("✅ User updated successfully with face data");
      })
      .catch((err) => {
        console.error("❌ Failed to update user with face data:", err.message);
      });

    // Step 5: Send response immediately
    res.json({
      success: true,
      message: "Face enrolled successfully",
      data: {
        faceId: awsResult.faceId,
        confidence: awsResult.confidence,
      },
    });
    console.log("✅ Response sent. (User update happens in background)");
  } catch (error) {
    console.error("❌ Enroll face error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to enroll face",
      });
    }
  }
};
