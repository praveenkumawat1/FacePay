const express = require("express");
const router = express.Router();
const { getHistory, sendMoney } = require("../controllers/transaction");
const { protect } = require("../middleware/security");
const bank = require("../controllers/bank");
const refer = require("../controllers/referController");
const statement = require("../controllers/statementController");

// All wallet routes require authentication
router.use(protect);

router.get("/history", getHistory);
router.post("/send", sendMoney);
router.post("/send-statement", statement.sendStatementEmail);

// Linked Accounts (Banks/UPI)
router.get("/bank-info", bank.getBankInfo);
router.post("/link-account", bank.linkAccount);
router.delete("/remove-account/:accountId", bank.removeAccount);

// Referral Stats
router.get("/referral/stats", refer.getReferralStats);

module.exports = router;
