const express = require("express");
const router = express.Router();
const FeaturedOffer = require("../models/FeaturedOffer");

// GET /api/featured-offers - get all active featured offers
router.get("/", async (req, res) => {
  try {
    const offers = await FeaturedOffer.find({ active: true }).lean();
    res.json(offers);
  } catch (err) {
    console.error("Featured offers GET error:", err.message);
    res.status(500).json({ error: "Failed to fetch featured offers" });
  }
});

module.exports = router;
