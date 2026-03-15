const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kycController");
const { protect } = require("../middleware/security");

// All routes require authentication
router.use(protect);

// Get KYC status
router.get("/status", kycController.getKYCStatus);

// Step 1: Aadhaar
router.post("/aadhaar/submit", kycController.submitAadhaar);
router.post("/aadhaar/send-otp", kycController.sendAadhaarOTP);
router.post("/aadhaar/verify-otp", kycController.verifyAadhaarOTP);

// Step 2: PAN
router.post("/pan/submit", kycController.submitPAN);

// Step 3: Selfie
router.post("/selfie/submit", kycController.submitSelfie);

// Step 4: Bank
router.post("/bank/submit", kycController.submitBankDetails);

// Step 5: Address
router.post("/address/submit", kycController.submitAddress);

// Step 6: Complete
router.post("/complete", kycController.completeKYC);

module.exports = router;
