const express = require("express");
const FaceData = require("../models/FaceData");
const User = require("../models/User");

const router = express.Router();

/**
 * Helper: Euclidean distance between 2 vectors
 */
function euclideanDistance(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    throw new Error("Invalid vectors for distance calculation");
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * POST /api/face/enroll
 * Content-Type: application/json
 * Body:
 *  - user_id: string (Mongo ObjectId)
 *  - faceEmbedding: number[] (vector from frontend)
 */
router.post("/enroll", async (req, res) => {
  try {
    const { user_id, faceEmbedding } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, error: "user_id is required" });
    }

    if (!Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
      return res.status(400).json({
        success: false,
        error: "faceEmbedding (non-empty number array) is required",
      });
    }

    const faceData = await FaceData.findOneAndUpdate(
      { user_id },
      {
        user_id,
        face_descriptor: faceEmbedding,
        image_path: "", // image ab use nahi kar rahe, to empty string
        confidence_score: 1,
        is_active: true,
      },
      { upsert: true, new: true },
    );

    return res.json({
      success: true,
      message: "Face enrolled successfully",
      data: {
        id: faceData._id,
        user_id: faceData.user_id,
      },
    });
  } catch (err) {
    console.error("Enroll error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to enroll face",
    });
  }
});

/**
 * POST /api/face/verify
 * Content-Type: application/json
 * Body:
 *  - user_id: string
 *  - faceEmbedding: number[]
 */
router.post("/verify", async (req, res) => {
  try {
    const { user_id, faceEmbedding } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, error: "user_id is required" });
    }

    if (!Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
      return res.status(400).json({
        success: false,
        error: "faceEmbedding (non-empty number array) is required",
      });
    }

    const faceData = await FaceData.findOne({ user_id, is_active: true });
    if (!faceData) {
      return res.status(404).json({
        success: false,
        error: "No enrolled face data found for this user",
      });
    }

    const storedDescriptor = faceData.face_descriptor;
    const currentDescriptor = faceEmbedding;

    if (
      !Array.isArray(storedDescriptor) ||
      storedDescriptor.length !== currentDescriptor.length
    ) {
      return res.status(400).json({
        success: false,
        error: "Stored and current face vectors are incompatible",
      });
    }

    const distance = euclideanDistance(currentDescriptor, storedDescriptor);
    const THRESHOLD = 0.6; // tune later as needed

    const isMatch = distance < THRESHOLD;

    return res.json({
      success: isMatch,
      message: isMatch
        ? "Face verification successful"
        : "Face verification failed",
      distance,
      threshold: THRESHOLD,
    });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to verify face",
    });
  }
});

/**
 * PURE FACE LOGIN
 * POST /api/face/login
 * Body:
 *  - faceEmbedding: number[]
 *
 * Sabhi active FaceData se compare karke best match user return karta hai
 */
router.post("/login", async (req, res) => {
  try {
    const { faceEmbedding } = req.body;

    if (!Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
      return res.status(400).json({
        success: false,
        error: "faceEmbedding (non-empty number array) is required",
      });
    }

    const allFaces = await FaceData.find({ is_active: true });

    if (!allFaces || allFaces.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No enrolled faces found in system",
      });
    }

    const currentDescriptor = faceEmbedding;
    const THRESHOLD = 0.6; // experiment & tune

    let bestMatch = null;

    for (const face of allFaces) {
      const storedDescriptor = face.face_descriptor;

      if (
        !Array.isArray(storedDescriptor) ||
        storedDescriptor.length !== currentDescriptor.length
      ) {
        continue;
      }

      const distance = euclideanDistance(currentDescriptor, storedDescriptor);

      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = {
          user_id: face.user_id,
          distance,
        };
      }
    }

    if (!bestMatch) {
      return res.status(400).json({
        success: false,
        error: "No compatible face descriptors found",
      });
    }

    const isMatch = bestMatch.distance < THRESHOLD;

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "No matching face found",
        distance: bestMatch.distance,
        threshold: THRESHOLD,
      });
    }

    const matchedUser = await User.findById(bestMatch.user_id).select(
      "_id full_name email",
    );

    if (!matchedUser) {
      return res.status(404).json({
        success: false,
        error: "Matched user not found",
      });
    }

    // TODO: yahan tum JWT token generate kar sakte ho
    return res.json({
      success: true,
      message: "Face login successful",
      user: {
        _id: matchedUser._id,
        full_name: matchedUser.full_name,
        email: matchedUser.email,
      },
      distance: bestMatch.distance,
      threshold: THRESHOLD,
    });
  } catch (err) {
    console.error("Face login error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to login with face",
    });
  }
});

module.exports = router;
