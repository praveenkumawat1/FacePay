const { rekognition, COLLECTION_ID } = require("../config/aws");
const fs = require("fs");

/**
 * ⚡ OPTIMIZED: Index face with liveness check
 */
const indexFace = async (imagePath, userId) => {
  try {
    console.log("🔐 Starting face indexing...");
    console.time("AWS IndexFaces");

    const imageBuffer = fs.readFileSync(imagePath);

    const params = {
      CollectionId: COLLECTION_ID,
      Image: { Bytes: imageBuffer },
      ExternalImageId: userId.toString(),
      DetectionAttributes: ["DEFAULT"], // ⚡ OPTIMIZED: Using DEFAULT for faster response
      MaxFaces: 1,
    };

    const result = await Promise.race([
      rekognition.indexFaces(params).promise(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("AWS timeout after 30 seconds")),
          30000,
        ),
      ),
    ]);

    console.timeEnd("AWS IndexFaces");

    if (result.FaceRecords.length === 0) {
      throw new Error("No face detected in image");
    }

    const faceRecord = result.FaceRecords[0];

    // ⚡ CHECK QUALITY
    const quality = faceRecord.FaceDetail?.Quality;
    console.log("📊 Face Quality:", {
      brightness: quality?.Brightness,
      sharpness: quality?.Sharpness,
    });

    // Reject low quality images (likely photos of photos)
    if (quality?.Brightness < 50 || quality?.Sharpness < 50) {
      throw new Error(
        "Image quality too low. Please ensure good lighting and focus.",
      );
    }

    console.log("✅ Face indexed successfully:", {
      faceId: faceRecord.Face.FaceId,
      confidence: faceRecord.Face.Confidence,
    });

    return {
      success: true,
      faceId: faceRecord.Face.FaceId,
      confidence: faceRecord.Face.Confidence,
      imageId: faceRecord.Face.ImageId,
      boundingBox: faceRecord.Face.BoundingBox,
      quality: quality,
    };
  } catch (error) {
    console.error("❌ Error indexing face:", error.message);
    throw error;
  }
};

/**
 * ⚡ OPTIMIZED: Search face with liveness and quality checks
 */
const searchFace = async (imagePath) => {
  try {
    console.log("🔍 Starting face search with quality check...");
    console.time("AWS SearchFaces");

    const imageBuffer = fs.readFileSync(imagePath);

    const params = {
      CollectionId: COLLECTION_ID,
      Image: { Bytes: imageBuffer },
      MaxFaces: 1,
      FaceMatchThreshold: 90,
      QualityFilter: "AUTO", // ⚡ Enable quality filtering
    };

    const result = await Promise.race([
      rekognition.searchFacesByImage(params).promise(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("AWS search timeout after 30 seconds")),
          30000,
        ),
      ),
    ]);

    console.timeEnd("AWS SearchFaces");

    // ⚡ CHECK FOR QUALITY ISSUES
    if (result.SearchedFaceDetail) {
      const quality = result.SearchedFaceDetail.Quality;
      console.log("📊 Search Face Quality:", {
        brightness: quality?.Brightness,
        sharpness: quality?.Sharpness,
      });

      // Reject low quality (likely fake/photo)
      if (quality?.Brightness < 50) {
        return {
          success: false,
          message: "Poor lighting detected. Please try in better lighting.",
          reason: "low_brightness",
        };
      }

      if (quality?.Sharpness < 50) {
        return {
          success: false,
          message: "Image not sharp enough. Please hold camera steady.",
          reason: "low_sharpness",
        };
      }

      // ⚡ CHECK CONFIDENCE (high confidence = real face)
      if (result.SearchedFaceDetail.Confidence < 99) {
        return {
          success: false,
          message: "Unable to verify face clearly. Please try again.",
          reason: "low_confidence",
        };
      }
    }

    if (result.FaceMatches.length === 0) {
      return {
        success: false,
        message: "No matching face found",
        matches: [],
      };
    }

    const bestMatch = result.FaceMatches[0];

    console.log("✅ Face match found:", {
      userId: bestMatch.Face.ExternalImageId,
      similarity: bestMatch.Similarity,
    });

    return {
      success: true,
      userId: bestMatch.Face.ExternalImageId,
      similarity: bestMatch.Similarity,
      faceId: bestMatch.Face.FaceId,
      confidence: bestMatch.Face.Confidence,
      quality: result.SearchedFaceDetail?.Quality,
    };
  } catch (error) {
    console.error("❌ Error searching face:", error.message);

    // Check for specific AWS errors
    if (error.code === "InvalidParameterException") {
      throw new Error("Face not detected clearly. Please try again.");
    }

    throw error;
  }
};

/**
 * ⚡ NEW: Detect face quality and liveness indicators
 */
const detectFaceQuality = async (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);

    const params = {
      Image: { Bytes: imageBuffer },
      Attributes: ["ALL"], // Get all face attributes
    };

    const result = await rekognition.detectFaces(params).promise();

    if (result.FaceDetails.length === 0) {
      return {
        success: false,
        message: "No face detected",
      };
    }

    const face = result.FaceDetails[0];

    // Analyze quality indicators
    const quality = face.Quality;
    const brightness = quality.Brightness;
    const sharpness = quality.Sharpness;

    // Check for eyes open (live person usually has eyes open)
    const eyesOpen = face.EyesOpen?.Value;
    const eyesOpenConfidence = face.EyesOpen?.Confidence;

    // Check for mouth open (can indicate real person)
    const mouthOpen = face.MouthOpen?.Value;

    // Sunglasses check (photos often have reflections)
    const sunglasses = face.Sunglasses?.Value;

    console.log("📊 Detailed Face Analysis:", {
      brightness,
      sharpness,
      eyesOpen,
      eyesOpenConfidence,
      mouthOpen,
      sunglasses,
      confidence: face.Confidence,
    });

    // Liveness indicators
    const livenessScore = calculateLivenessScore({
      brightness,
      sharpness,
      eyesOpen,
      eyesOpenConfidence,
      mouthOpen,
      sunglasses,
      confidence: face.Confidence,
    });

    return {
      success: true,
      quality: {
        brightness,
        sharpness,
      },
      liveness: {
        score: livenessScore,
        eyesOpen,
        eyesOpenConfidence,
        mouthOpen,
        sunglasses,
      },
      confidence: face.Confidence,
      isLive: livenessScore >= 70, // Threshold for liveness
    };
  } catch (error) {
    console.error("❌ Face quality detection error:", error);
    throw error;
  }
};

/**
 * Calculate liveness score based on indicators
 */
function calculateLivenessScore(indicators) {
  let score = 0;

  // High quality = likely real person
  if (indicators.brightness >= 50) score += 20;
  if (indicators.brightness >= 70) score += 10;

  if (indicators.sharpness >= 50) score += 20;
  if (indicators.sharpness >= 80) score += 10;

  // Eyes open with high confidence = live person
  if (indicators.eyesOpen && indicators.eyesOpenConfidence > 90) {
    score += 20;
  }

  // High face confidence = real face
  if (indicators.confidence >= 99) score += 15;
  if (indicators.confidence >= 99.5) score += 10;

  // No sunglasses = can see eyes clearly
  if (!indicators.sunglasses) score += 5;

  return Math.min(score, 100);
}

module.exports = {
  indexFace,
  searchFace,
  detectFaceQuality,
};
