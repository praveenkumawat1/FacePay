const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");
const wallet = require("../controllers/wallet");
const transaction = require("../controllers/transaction");

// JWT Auth Middleware (protects ALL endpoints below)
router.use(auth.jwtAuth);

// Profile endpoints
router.get("/profile", auth.getProfile);
router.get("/notifications", auth.getNotifications);

// Wallet endpoints
router.get("/wallet/balance", wallet.getBalance);
router.post("/wallet/send", wallet.sendMoney);

// Transaction history
router.get("/wallet/history", transaction.getHistory);

module.exports = router;
