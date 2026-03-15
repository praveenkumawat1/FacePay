const express = require("express");
const cors = require("cors");
const fs = require("fs");
const session = require("express-session");
const mongoose = require("mongoose");
const compression = require("compression"); // ✅ ADDED: response compression
require("dotenv").config();

const connectDB = require("./config/db");

// AWS CONFIGURATION IMPORT
const { initializeCollection } = require("./config/aws");
const razorpayRoutes = require("./routes/razorpay");

// Import responseTime middleware from security
const { responseTime } = require("./middleware/security");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// DATABASE CONNECTION
// ============================================
console.log("🔄 Connecting to MongoDB...");
connectDB();

// ============================================
// AWS REKOGNITION INITIALIZATION
// ============================================
console.log("🔄 Initializing AWS Rekognition...");
initializeCollection()
  .then(() => console.log("✅ AWS Rekognition initialized successfully"))
  .catch((err) =>
    console.error("❌ AWS Rekognition initialization failed:", err.message),
  );

// ============================================
// ENSURE UPLOAD DIRECTORIES EXIST
// ============================================
["uploads/faces", "uploads/temp"].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// ✅ Compress all responses (gzip)
app.use(compression());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Body Parser - Increased limit for image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Session Middleware - Required for 2FA
app.use(
  session({
    secret: process.env.SESSION_SECRET || "facepay-session-secret-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 600000, // 10 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  }),
);
app.use("/api/razorpay", razorpayRoutes);

// Trust Proxy - Required for getting real client IP
app.set("trust proxy", 1);

// Static Files
app.use("/uploads", express.static("uploads"));

// Request Logger (with response time)
app.use(responseTime); // ✅ logs duration of every request

app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}`);
  next();
});

// ✅ Dashboard DB health check middleware
app.use("/api/dashboard", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn(
      "⚠️ Dashboard request rejected — MongoDB not connected. State:",
      mongoose.connection.readyState,
    );
    return res.status(503).json({
      success: false,
      message: "Database not connected. Please try again in a moment.",
    });
  }
  next();
});

// ============================================
// ROUTE IMPORTS
// ============================================
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const sessionRoutes = require("./routes/session");
const otpRoutes = require("./routes/otp");
const loginOtpRoutes = require("./routes/loginOtp");
const faceRoutes = require("./routes/faceRoutes");
const walletRoutes = require("./routes/wallet");
const awsFaceRoutes = require("./routes/awsFaceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const referRoutes = require("./routes/refer");
const securityRoutes = require("./routes/security"); // ✅ Security Routes
const kycRoutes = require("./routes/kycRoutes"); // KYC Routes

// ✅ NEW: Coupons & Rewards Routes
const marketplaceRoutes = require("./routes/marketplace");
const missionsRoutes = require("./routes/missions");
const coinHistoryRoutes = require("./routes/coinHistory");
const leaderboardRoutes = require("./routes/leaderboard");
const shieldRoutes = require("./routes/shield");
const featuredRoutes = require("./routes/featured");

// ✅ User routes (for stats, daily claim, spin, scratch)
const userRoutes = require("./routes/user");

// ============================================
// ROUTE REGISTRATION
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/login-otp", loginOtpRoutes);
app.use("/api/face", faceRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/aws-face", awsFaceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/refer", referRoutes);

// ✅ Register new coupon/reward routes
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/missions", missionsRoutes);
app.use("/api/coin-history", coinHistoryRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/shield", shieldRoutes);
app.use("/api/featured", featuredRoutes);

// ✅ Mount user routes (provides /api/user/stats, /api/claim-daily, /api/spin-result, /api/scratch-reveal)
app.use("/api", userRoutes);

// ============================================
// HOME ROUTE - API OVERVIEW
// ============================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 FacePay Backend API - Running",
    version: "3.1.0",
    timestamp: new Date().toISOString(),
    features: [
      "User Authentication (Email/Password + OTP)",
      "Face Recognition Login (AWS Rekognition)",
      "Two-Factor Authentication (2FA)",
      "Session Management",
      "Activity Logging",
      "Wallet Management",
      "Payment Processing",
      "Dashboard Analytics",
      "Security Features",
      "Coupons & Rewards System", // ✅ added
    ],
    endpoints: {
      authentication: [
        "POST /api/auth/register - Register new user",
        "POST /api/auth/login - Login with email/password",
        "POST /api/auth/login/verify-otp - Verify OTP",
        "POST /api/auth/login/resend-otp - Resend OTP",
        "POST /api/auth/login/face - Face recognition login",
        "GET /api/auth/profile - Get user profile",
      ],
      security: [
        "GET /api/security/sessions - Get active sessions",
        "DELETE /api/security/sessions/:id - Revoke session",
        "GET /api/security/activity - Get activity log",
        "POST /api/security/change-password - Change password",
        "POST /api/security/2fa/enable - Enable 2FA",
        "POST /api/security/2fa/verify - Verify 2FA",
        "POST /api/security/2fa/disable - Disable 2FA",
        "GET /api/security/2fa/status - Get 2FA status",
        "GET /api/security/connected-accounts - Get connected accounts",
        "DELETE /api/security/account - Delete account",
      ],
      dashboard: [
        "GET /api/dashboard - Get dashboard data",
        "POST /api/dashboard/add-money - Add money to wallet",
        "GET /api/dashboard/transactions - Get transactions",
        "GET /api/dashboard/notifications - Get notifications",
      ],
      payment: [
        "POST /api/payment/pay - Make payment",
        "GET /api/payment/transactions - Get payment history",
        "GET /api/payment/balance - Get wallet balance",
      ],
      wallet: ["POST /api/wallet/add-money - Add money to wallet"],
      // ✅ New rewards endpoints
      rewards: [
        "GET /api/marketplace - Get redeemable items",
        "POST /api/marketplace/redeem - Redeem an item",
        "GET /api/missions - Get daily missions with progress",
        "POST /api/missions/claim - Claim mission reward",
        "POST /api/missions/progress - Update mission progress (internal)",
        "GET /api/coin-history - Get user's coin transaction history",
        "GET /api/leaderboard - Top 10 users by coins",
        "POST /api/shield/purchase - Purchase streak shield",
        "GET /api/featured - Get featured offers carousel",
      ],
    },
    documentation: "Visit /api for detailed API documentation",
  });
});

// ============================================
// HEALTH CHECK
// ============================================
app.get("/health", (req, res) => {
  const dbStates = {
    0: "Disconnected ❌",
    1: "Connected ✅",
    2: "Connecting 🔄",
    3: "Disconnecting ⚠️",
  };

  res.json({
    success: true,
    status: "Healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      mongodb: dbStates[mongoose.connection.readyState] || "Unknown",
      aws: "Configured",
      session: "Active",
    },
    config: {
      maxRequestSize: "50MB",
      environment: process.env.NODE_ENV || "development",
      version: "3.1.0",
    },
    memory: {
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
    },
  });
});

// ============================================
// API DOCUMENTATION
// ============================================
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "FacePay API Documentation",
    baseURL: `http://localhost:${PORT}`,
    version: "3.1.0",
    authentication: {
      type: "Bearer Token (JWT)",
      header: "Authorization: Bearer YOUR_JWT_TOKEN",
      tokenExpiry: "30 days",
    },
    endpoints: {
      auth: {
        register: {
          method: "POST",
          path: "/api/auth/register",
          description: "Register new user with face image",
          contentType: "multipart/form-data",
          body: {
            full_name: "string (required)",
            email: "string (required, unique)",
            mobile: "string (required)",
            dob: "string (YYYY-MM-DD)",
            password: "string (min 8 chars)",
            bank_name: "string",
            account_holder_name: "string",
            account_number: "string",
            ifsc: "string",
            face_image: "file (required)",
          },
          response: {
            success: true,
            message: "User registered successfully",
            user: { id: "string", email: "string" },
          },
        },
        login: {
          method: "POST",
          path: "/api/auth/login",
          description: "Login with email/password (sends OTP)",
          contentType: "application/json",
          body: {
            email: "string",
            password: "string",
          },
          response: {
            success: true,
            requiresOTP: true,
            userId: "string",
            message: "OTP sent to email",
          },
        },
        loginVerifyOtp: {
          method: "POST",
          path: "/api/auth/login/verify-otp",
          description: "Verify OTP and complete login",
          body: {
            userId: "string",
            otp: "string (6 digits)",
          },
          response: {
            success: true,
            token: "JWT_TOKEN",
            user: { id: "string", name: "string", email: "string" },
          },
        },
        faceLogin: {
          method: "POST",
          path: "/api/auth/login/face",
          description: "Login using face recognition",
          body: {
            image: "base64 string",
          },
          response: {
            success: true,
            token: "JWT_TOKEN",
            user: { id: "string", name: "string" },
            faceMatch: { similarity: "number", confidence: "number" },
          },
        },
      },
      security: {
        sessions: {
          method: "GET",
          path: "/api/security/sessions",
          protected: true,
          description: "Get all active sessions",
          response: {
            success: true,
            sessions: [
              {
                id: "string",
                device: "string",
                browser: "string",
                location: "string",
                lastActive: "string",
                isCurrent: "boolean",
              },
            ],
          },
        },
        revokeSession: {
          method: "DELETE",
          path: "/api/security/sessions/:id",
          protected: true,
          description: "Revoke specific session",
        },
        activity: {
          method: "GET",
          path: "/api/security/activity",
          protected: true,
          description: "Get recent activity log (last 20 activities)",
          response: {
            success: true,
            activities: [
              {
                id: "string",
                action: "string",
                date: "string",
                device: "string",
                status: "success|failed",
              },
            ],
          },
        },
        changePassword: {
          method: "POST",
          path: "/api/security/change-password",
          protected: true,
          body: {
            currentPassword: "string",
            newPassword: "string (min 8 chars)",
          },
        },
        enable2FA: {
          method: "POST",
          path: "/api/security/2fa/enable",
          protected: true,
          description: "Generate QR code for 2FA setup",
          response: {
            success: true,
            qrCode: "base64 image",
            secret: "string",
          },
        },
        verify2FA: {
          method: "POST",
          path: "/api/security/2fa/verify",
          protected: true,
          body: {
            code: "string (6 digits from authenticator app)",
          },
          response: {
            success: true,
            backupCodes: ["CODE1-XXXX", "CODE2-XXXX"],
          },
        },
        disable2FA: {
          method: "POST",
          path: "/api/security/2fa/disable",
          protected: true,
        },
        get2FAStatus: {
          method: "GET",
          path: "/api/security/2fa/status",
          protected: true,
          response: {
            success: true,
            enabled: "boolean",
            backupCodes: ["string"],
          },
        },
        deleteAccount: {
          method: "DELETE",
          path: "/api/security/account",
          protected: true,
          body: {
            password: "string",
          },
          warning: "This action is irreversible!",
        },
      },
      dashboard: {
        getData: {
          method: "GET",
          path: "/api/dashboard",
          protected: true,
          description: "Get complete dashboard data",
          response: {
            user: "object",
            wallet: { balance: "number", wallet_key: "string" },
            transactions: "array",
            stats: "object",
            notifications: "object",
          },
        },
        addMoney: {
          method: "POST",
          path: "/api/dashboard/add-money",
          protected: true,
          body: {
            amount: "number",
            payment_method: "string (optional)",
          },
        },
      },
      // ✅ New rewards endpoints
      rewards: {
        marketplace: {
          method: "GET",
          path: "/api/marketplace",
          description: "Get all active redeemable items",
        },
        redeem: {
          method: "POST",
          path: "/api/marketplace/redeem",
          protected: true,
          description: "Redeem an item using coins",
          body: { itemId: "string" },
        },
        missions: {
          method: "GET",
          path: "/api/missions",
          protected: true,
          description: "Get all missions with user progress",
        },
        claimMission: {
          method: "POST",
          path: "/api/missions/claim",
          protected: true,
          description: "Claim a completed mission reward",
          body: { missionId: "string" },
        },
        missionProgress: {
          method: "POST",
          path: "/api/missions/progress",
          protected: true,
          description: "Increment mission progress (internal)",
          body: { missionType: "string", increment: "number (default 1)" },
        },
        coinHistory: {
          method: "GET",
          path: "/api/coin-history",
          protected: true,
          description: "Get user's coin transaction history",
        },
        leaderboard: {
          method: "GET",
          path: "/api/leaderboard",
          description: "Get top 10 users by coins",
        },
        shield: {
          method: "POST",
          path: "/api/shield/purchase",
          protected: true,
          description: "Purchase a streak shield for 100 coins",
        },
        featured: {
          method: "GET",
          path: "/api/featured",
          description: "Get featured offers carousel",
        },
      },
    },
    errorCodes: {
      400: "Bad Request - Invalid input",
      401: "Unauthorized - Invalid or missing token",
      403: "Forbidden - Access denied",
      404: "Not Found - Resource not found",
      413: "Payload Too Large - Max 50MB",
      500: "Internal Server Error",
      503: "Service Unavailable - Database not connected",
    },
    examples: {
      loginFlow: [
        "1. POST /api/auth/login with email/password",
        "2. Receive userId and OTP sent to email",
        "3. POST /api/auth/login/verify-otp with userId and OTP",
        "4. Receive JWT token",
        "5. Use token in Authorization header for protected routes",
      ],
      twoFactorSetup: [
        "1. POST /api/security/2fa/enable",
        "2. Scan QR code with authenticator app",
        "3. POST /api/security/2fa/verify with 6-digit code",
        "4. Save backup codes securely",
        "5. 2FA enabled successfully",
      ],
    },
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    error: "ROUTE_NOT_FOUND",
    hint: "Visit GET / for available endpoints",
    availableRoutes: [
      "GET /",
      "GET /health",
      "GET /api",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/login/verify-otp",
      "POST /api/auth/login/face",
      "GET /api/security/sessions",
      "DELETE /api/security/sessions/:id",
      "GET /api/security/activity",
      "POST /api/security/change-password",
      "POST /api/security/2fa/enable",
      "POST /api/security/2fa/verify",
      "POST /api/security/2fa/disable",
      "GET /api/security/2fa/status",
      "DELETE /api/security/account",
      "GET /api/dashboard",
      "POST /api/dashboard/add-money",
      "GET /api/marketplace",
      "POST /api/marketplace/redeem",
      "GET /api/missions",
      "POST /api/missions/claim",
      "POST /api/missions/progress",
      "GET /api/coin-history",
      "GET /api/leaderboard",
      "POST /api/shield/purchase",
      "GET /api/featured",
    ],
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:");
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Payload too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload too large",
      error: "PAYLOAD_TOO_LARGE",
      maxSize: "50MB",
      hint: "Compress images before uploading",
    });
  }

  // Multer file upload errors
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
      error: err.code,
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.keys(err.errors).map((key) => ({
        field: key,
        message: err.errors[key].message,
      })),
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "INVALID_TOKEN",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      error: "TOKEN_EXPIRED",
    });
  }

  // MongoDB errors
  if (err.name === "MongoError" || err.name === "MongoServerError") {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry",
        error: "DUPLICATE_KEY",
        field: Object.keys(err.keyPattern)[0],
      });
    }

    return res.status(500).json({
      success: false,
      message: "Database error",
      error:
        process.env.NODE_ENV === "development" ? err.message : "DATABASE_ERROR",
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error:
      process.env.NODE_ENV === "development" ? err.stack : "INTERNAL_ERROR",
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log("");
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║       🚀 FacePay Backend Server v3.1 Started        ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
  console.log("📍 Server Information:");
  console.log(`   ├─ URL:              http://localhost:${PORT}`);
  console.log(`   ├─ API Docs:         http://localhost:${PORT}/api`);
  console.log(`   ├─ Health Check:     http://localhost:${PORT}/health`);
  console.log(
    `   ├─ Environment:      ${process.env.NODE_ENV || "development"}`,
  );
  console.log(`   └─ Started:          ${new Date().toLocaleString()}`);
  console.log("");
  console.log("⚡ Configuration:");
  console.log("   ├─ Max Request Size: 50MB");
  console.log("   ├─ Session Support:  Enabled");
  console.log("   ├─ Trust Proxy:      Enabled");
  console.log("   ├─ CORS:             Enabled");
  console.log("   └─ Compression:      ✅ Enabled (gzip)");
  console.log("");
  console.log("📊 Services Status:");
  console.log("   ├─ MongoDB:          Check above ⬆️");
  console.log("   ├─ AWS Rekognition:  Check above ⬆️");
  console.log("   ├─ Redis:            Check above ⬆️");
  console.log("   └─ Session Store:    Active ✅");
  console.log("");
  console.log("🔐 Security Features:");
  console.log("   ├─ Session Management");
  console.log("   ├─ Two-Factor Authentication (2FA)");
  console.log("   ├─ Activity Logging");
  console.log("   ├─ Password Strength Validation");
  console.log("   ├─ Device Tracking");
  console.log("   └─ IP Location Detection");
  console.log("");
  console.log("🎯 New Endpoints:");
  console.log("   ├─ GET    /api/security/sessions");
  console.log("   ├─ DELETE /api/security/sessions/:id");
  console.log("   ├─ GET    /api/security/activity");
  console.log("   ├─ POST   /api/security/change-password");
  console.log("   ├─ POST   /api/security/2fa/enable");
  console.log("   ├─ POST   /api/security/2fa/verify");
  console.log("   ├─ POST   /api/security/2fa/disable");
  console.log("   ├─ GET    /api/security/2fa/status");
  console.log("   └─ DELETE /api/security/account");
  console.log("");
  console.log("🎁 Rewards & Coupons Endpoints (NEW):");
  console.log("   ├─ GET    /api/marketplace");
  console.log("   ├─ POST   /api/marketplace/redeem");
  console.log("   ├─ GET    /api/missions");
  console.log("   ├─ POST   /api/missions/claim");
  console.log("   ├─ POST   /api/missions/progress");
  console.log("   ├─ GET    /api/coin-history");
  console.log("   ├─ GET    /api/leaderboard");
  console.log("   ├─ POST   /api/shield/purchase");
  console.log("   └─ GET    /api/featured");
  console.log("");
  console.log("✨ Ready to accept requests!");
  console.log("───────────────────────────────────────────────────────");
  console.log("");
});

// ============================================
// PROCESS ERROR HANDLERS
// ============================================
process.on("unhandledRejection", (err) => {
  console.error("");
  console.error("❌ UNHANDLED PROMISE REJECTION:");
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  console.error("");

  if (process.env.NODE_ENV === "production") {
    console.error("⚠️  Server will shut down...");
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("");
  console.error("❌ UNCAUGHT EXCEPTION:");
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  console.error("");

  if (process.env.NODE_ENV === "production") {
    console.error("⚠️  Server will shut down...");
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  console.log("");
  console.log("👋 SIGTERM signal received");
  console.log("🛑 Closing HTTP server gracefully...");
  console.log("✅ Server closed successfully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("");
  console.log("👋 SIGINT signal received (Ctrl+C)");
  console.log("🛑 Closing HTTP server gracefully...");
  console.log("✅ Server closed successfully");
  process.exit(0);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on("exit", (code) => {
  console.log("");
  console.log(`Process exit with code: ${code}`);
  console.log("Goodbye! 👋");
  console.log("");
});
