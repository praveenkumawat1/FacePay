const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/security");

router.post("/pay", protect, paymentController.processPayment);
router.get("/transactions", protect, paymentController.getTransactions);
router.get("/balance", protect, paymentController.getBalance);

module.exports = router;
