const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { enrollFace } = require("../controllers/awsFaceController"); // ⚡ Import function

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
    fileSize: 5 * 1024 * 1024, // 5MB max
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

/**
 * POST /api/aws-face/enroll
 * Enroll face in AWS Rekognition
 */
router.post("/enroll", upload.single("faceImage"), enrollFace); // ⚡ Use imported function

module.exports = router;
