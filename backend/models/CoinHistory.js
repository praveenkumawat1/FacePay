const express = require("express");
const router = express.Router();
// const auth = require("../middleware/auth"); // temporarily removed

// GET /api/coin-history - get user's coin history (latest 50 entries)
// Without auth, return an empty array to avoid frontend errors
router.get("/", async (req, res) => {
  try {
    // For testing, return empty array
    res.json([]);
  } catch (err) {
    console.error("CoinHistory GET error:", err.message);
    res.status(500).json({ error: "Failed to fetch coin history" });
  }
});

module.exports = router;
