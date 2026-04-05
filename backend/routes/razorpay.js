const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
} = require("../controllers/Razorpaycontroller");
const { protect } = require("../middleware/security");

// All routes protected
router.use(protect);

/**
 * POST /api/razorpay/create-order
 * Razorpay order create karo → frontend checkout ke liye
 */
router.post("/create-order", createRazorpayOrder);

/**
 * POST /api/razorpay/verify
 * Payment complete hone ke baad signature verify karo
 */
router.post("/verify", verifyPayment);

module.exports = router;
