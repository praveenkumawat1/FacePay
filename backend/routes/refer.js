const express = require("express");
const router = express.Router();
const { getReferralStats } = require("../controllers/referController");

router.get("/stats", getReferralStats);

module.exports = router;
