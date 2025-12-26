const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/faces/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `face_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only . jpg, .jpeg, . png images are allowed"));
    }
  },
});

// Public routes
router.post(
  "/register",
  upload.single("face_image"),
  authController.registerUser
);
router.post("/login", authController.loginUser);

// Protected routes
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
