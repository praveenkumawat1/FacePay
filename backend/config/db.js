const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log(
      "Connection string:",
      process.env.MONGODB_URI?.substring(0, 50) + "...",
    );

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10, // ✅ Already tha
      minPoolSize: 3, // ✅ ADD: 3 connections hamesha ready
      maxIdleTimeMS: 30000, // ✅ ADD: 30s tak idle connection rakho
      compressors: "zlib", // ✅ ADD: data compress karke bhejo — faster
    });

    console.log("✅ MongoDB connected successfully");
    console.log("📊 Database name:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected from MongoDB");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB connection closed through app termination");
  process.exit(0);
});

module.exports = connectDB;
