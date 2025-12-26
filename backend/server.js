const express = require("express");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
console.log("🔄 Connecting to MongoDB Atlas...");
connectDB();

// Create upload directories if not exist
const dirs = ["uploads/faces", "uploads/temp"];
dirs.forEach((dir) => {
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

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// Import Routes
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

// Home Route
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

// API Documentation
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

// 404 Handler
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
    ],
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error:
      process.env.NODE_ENV === "development"
        ? {
            message: err.message,
            stack: err.stack,
          }
        : {},
  });
});

// Start Server
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

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM signal received:  closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("👋 SIGINT signal received: closing HTTP server");
  process.exit(0);
});
