const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  enrollFace,
  searchByFace,
} = require("../controllers/awsFaceController"); // ⚡ Import function

// Multer configuration for face image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/faces/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `face_${Date.now()}.jpg`;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, .png images are allowed"));
    }
  },
});

const sharp = require("sharp");
const fs = require("fs");

// Middleware to resize image after upload (before controller)
async function resizeFaceImage(req, res, next) {
  if (!req.file) return next();
  try {
    const resizedPath = req.file.path.replace(
      /(\.jpg|\.jpeg|\.png)$/i,
      "_resized$1",
    );
    await sharp(req.file.path)
      .resize(500, 500, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toFile(resizedPath);

    // Cleanup old file
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    req.file.path = resizedPath;
    req.file.filename = resizedPath.split("/").pop();
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware to handle base64 images if multipart fails or user sends JSON
async function handleBase64Image(req, res, next) {
  if (req.file) return next();
  if (req.body.image) {
    try {
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filename = `face_${Date.now()}.jpg`;
      const filepath = path.join("uploads", "faces", filename);

      fs.writeFileSync(filepath, buffer);

      req.file = {
        path: filepath,
        filename: filename,
        mimetype: "image/jpeg",
      };

      return next();
    } catch (err) {
      console.error("Base64 decode error:", err);
    }
  }
  next();
}

/**
 * POST /api/aws-face/enroll
 * Enroll face in AWS Rekognition
 */
router.post("/enroll", upload.single("faceImage"), resizeFaceImage, enrollFace); // ⚡ Use imported function

/**
 * POST /api/aws-face/search
 * Search/Verify face using AWS Rekognition
 */
router.post(
  "/search",
  upload.single("faceImage"),
  handleBase64Image,
  resizeFaceImage,
  searchByFace,
);

module.exports = router;
