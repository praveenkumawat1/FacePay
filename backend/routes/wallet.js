const express = require("express");
const router = express.Router();
const { getHistory, sendMoney } = require("../controllers/transaction");
const { jwtAuth } = require("../controllers/authController"); // or your own auth middleware

// All wallet routes require authentication
router.use(jwtAuth);

router.get("/history", getHistory);
router.post("/send", sendMoney);

module.exports = router;
