const router = require("express").Router();
const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-south-1" });
const rekognition = new AWS.Rekognition();
const Session = require("../models/Session");
const User = require("../models/User");

// ================= MOBILE SCAN UPLOAD =================
router.post("/upload", async (req, res) => {
  const { token, image } = req.body;
  if (!token || !image)
    return res.status(400).json({ error: "Missing params" });

  const session = await Session.findOne({ token });
  if (!session) return res.status(404).json({ error: "Invalid session" });

  try {
    // AWS Rekognition - Search By Image
    const params = {
      CollectionId: "facepay-users",
      Image: {
        Bytes: Buffer.from(image.split(",")[1], "base64"),
      },
      FaceMatchThreshold: 85,
      MaxFaces: 1,
    };
    const result = await rekognition.searchFacesByImage(params).promise();

    if (!result.FaceMatches || !result.FaceMatches.length) {
      return res.json({
        success: false,
        matched: false,
        message: "Face not recognized",
      });
    }

    const matchedFaceId = result.FaceMatches[0].Face.FaceId;
    const user = await User.findOne({ awsFaceId: matchedFaceId });

    if (user) {
      session.verified = true;
      session.userId = user._id;
      await session.save();

      // ✅ NEW: PC ko WebSocket se real-time notify karo
      if (global.pcClients) {
        const pcWs = global.pcClients.get(token);
        if (pcWs && pcWs.readyState === 1) {
          // 1 = WebSocket.OPEN
          pcWs.send(
            JSON.stringify({
              event: "face_matched",
              user: {
                _id: user._id,
                name: user.full_name,
                email: user.email,
              },
              similarity: result.FaceMatches[0].Similarity,
            }),
          );
          console.log(`✅ PC notified via WebSocket for session: ${token}`);
        } else {
          console.log(
            `⚠️  No PC WebSocket found for token: ${token} (polling fallback will work)`,
          );
        }
      }
      // ✅ END NEW

      return res.json({
        success: true,
        matched: true,
        similarity: result.FaceMatches[0].Similarity,
        user: { _id: user._id, name: user.full_name, email: user.email },
      });
    }

    return res.json({
      success: false,
      matched: false,
      message: "Face recognized by AWS but user not found in DB",
    });
  } catch (err) {
    console.error("AWS Rekognition Error:", err);
    return res.status(500).json({
      success: false,
      error: "Recognition error",
      message: err.message || "Face recognition failed",
    });
  }
});

// ================= PC POLLS TO CHECK STATUS =================
// (Ye pehle jaisa hai — WebSocket na mile to polling fallback ke liye)
router.get("/status", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.json({ verified: false });
  const session = await Session.findOne({ token });
  if (!session) return res.json({ verified: false });
  if (session.verified && session.userId) {
    return res.json({ verified: true, userId: session.userId });
  }
  return res.json({ verified: false });
});

module.exports = router;
