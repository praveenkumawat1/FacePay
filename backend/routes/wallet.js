const express = require("express");
const router = express.Router();
const Wallet = require("../models/Wallet");
const auth = require("../middleware/auth");

// GET /api/wallet/info  →  Wallet details for the logged-in user
router.get("/info", auth, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) wallet = await Wallet.create({ user: req.user._id });
    res.json({ success: true, wallet });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;
