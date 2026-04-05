const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

async function checkRecent() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/facepay",
    );
    console.log("✅ Connected to MongoDB");

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "full_name email awsFaceId faceImageUrl faceEnrolledAt createdAt updatedBy",
      );

    console.log("\n--- RECENT USERS ---");
    recentUsers.forEach((u) => {
      console.log(`\nName: ${u.full_name}`);
      console.log(`Email: ${u.email}`);
      console.log(`awsFaceId: ${u.awsFaceId}`);
      console.log(`faceImageUrl: ${u.faceImageUrl}`);
      console.log(`faceEnrolledAt: ${u.faceEnrolledAt}`);
      console.log(`Created: ${u.createdAt}`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkRecent();
