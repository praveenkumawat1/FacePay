// server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
console.log("🔄 Connecting to MongoDB Atlas...");
connectDB();

// Ensure upload dirs exist
["uploads/faces", "uploads/temp"].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// IMPORT ROUTES — check all paths carefully!
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const otpRoutes = require("./routes/otp"); // <-- Make sure routes/otp.js exists and has module.exports = router;

// REGISTER ROUTES — THESE ARE CASE SENSITIVE!
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/otp", otpRoutes);

// Simple home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 FacePay Backend API - Running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      authentication: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/profile (Protected)",
      },
      payments: {
        makePayment: "POST /api/payment/pay (Protected)",
        getTransactions: "GET /api/payment/transactions (Protected)",
        getBalance: "GET /api/payment/balance (Protected)",
      },
    },
    documentation: {
      register: {
        method: "POST",
        url: "/api/auth/register",
        body: {
          full_name: "string",
          email: "string",
          phone: "string (10 digits)",
          upi_id: "string",
          pin: "string",
          face_image: "file (form-data)",
        },
      },
      login: {
        method: "POST",
        url: "/api/auth/login",
        body: {
          email: "string",
          pin: "string",
        },
      },
      payment: {
        method: "POST",
        url: "/api/payment/pay",
        headers: {
          Authorization: "Bearer YOUR_JWT_TOKEN",
        },
        body: {
          receiver_upi: "string",
          amount: "number",
          description: "string (optional)",
        },
      },
    },
  });
});

// Health Check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "Healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: "Connected",
  });
});

// API doc
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "FacePay API Documentation",
    baseURL: `http://localhost:${PORT}`,
    endpoints: {
      auth: {
        register: {
          method: "POST",
          path: "/api/auth/register",
          description: "Register new user with face image",
          contentType: "multipart/form-data",
          required: [
            "full_name",
            "email",
            "phone",
            "upi_id",
            "pin",
            "face_image",
          ],
        },
        login: {
          method: "POST",
          path: "/api/auth/login",
          description: "Login with email and PIN",
          contentType: "application/json",
          required: ["email", "pin"],
        },
        profile: {
          method: "GET",
          path: "/api/auth/profile",
          description: "Get user profile",
          protected: true,
          headers: { Authorization: "Bearer TOKEN" },
        },
      },
      payment: {
        pay: {
          method: "POST",
          path: "/api/payment/pay",
          description: "Make payment to UPI ID",
          protected: true,
          required: ["receiver_upi", "amount"],
        },
        transactions: {
          method: "GET",
          path: "/api/payment/transactions",
          description: "Get transaction history",
          protected: true,
        },
        balance: {
          method: "GET",
          path: "/api/payment/balance",
          description: "Get account balance",
          protected: true,
        },
      },
    },
  });
});

// 404 HANDLER: must be below all other routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: [
      "GET /",
      "GET /health",
      "GET /api",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/profile",
      "POST /api/payment/pay",
      "GET /api/payment/transactions",
      "GET /api/payment/balance",
      "POST /api/otp/send-otp",
      "POST /api/otp/verify-otp",
    ],
  });
});

// ERROR HANDLER: for unhandled errors
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error:
      process.env.NODE_ENV === "development"
        ? { message: err.message, stack: err.stack }
        : {},
  });
});

// Start server
app.listen(PORT, () => {
  console.log("");
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║         🚀 FacePay Backend Server Started           ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
  console.log(`📍 Server URL:         http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check:      http://localhost:${PORT}/health`);
  console.log(`🌍 Environment:       ${process.env.NODE_ENV || "development"}`);
  console.log(`⏰ Started at:        ${new Date().toLocaleString()}`);
  console.log("");
  console.log("📊 MongoDB Atlas:  Check connection status above ⬆️");
  console.log("");
  console.log("✨ Ready to accept requests!");
  console.log("───────────────────────────────────────────────────────");
  console.log("");
});

// Node process crash guards (important for dev)
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM signal received:  closing HTTP server");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("👋 SIGINT signal received: closing HTTP server");
  process.exit(0);
});
