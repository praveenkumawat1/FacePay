const User = require("../models/User");
const { indexFace } = require("../utils/awsRekognition");
const mongoose = require("mongoose");
const fs = require("fs").promises; // ✅ Optimized: use async fs for faster cleanup

/**
 * Enroll user's face with AWS Rekognition
 *
 * Performance Optimizations:
 * 1. Parallel Task Execution where possible
 * 2. Async file cleanup to prevent thread blocking
 * 3. Minimal DB fetch using .exists() instead of full document load
 */

exports.enrollFace = async (req, res) => {
  try {
    const { userId } = req.body;
    const faceImage = req.file;

    // ─── Parallel Validation & Existence Check ────────────────────────────────
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

    // ─── Optimized: Face Indexing & DB Check in Parallel ─────────────────────
    // Instead of waiting for DB check then starting AWS, do both now.
    // If user doesn't exist, AWS indexing is wasteful but safe,
    // and DB check usually finishes in <5ms.

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

    // ─── Step 2: Finalize ────────────────────────────────────────────────────
    const imageUrl = `/uploads/faces/${faceImage.filename}`;

    const updatePromise = User.updateOne(
      { _id: userId },
      {
        $set: {
          awsFaceId: awsResult.faceId,
          faceImageUrl: imageUrl,
          faceEnrolledAt: new Date(),
        },
      },
    );

    // ✅ Respond to frontend ASAP
    const result = await updatePromise;
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
