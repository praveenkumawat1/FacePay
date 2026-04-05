const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middleware/security");

// All routes are protected
router.use(protect);

/**
 * GET /api/dashboard
 * Get dashboard data
 */
router.get("/", dashboardController.getDashboardData);

/**
 * POST /api/dashboard/add-money
 * Add money to wallet
 */
router.post("/add-money", dashboardController.addMoney);

/**
 * POST /api/dashboard/withdraw
 * Withdraw money from wallet
 */
router.post("/withdraw", dashboardController.withdrawMoney);

/**
 * GET /api/dashboard/transactions
 * Get all transactions
 */
router.get("/transactions", dashboardController.getTransactions);

/**
 * GET /api/dashboard/users
 * Search users for request money
 */
router.get("/users", dashboardController.getSearchUsers);

/**
 * POST /api/dashboard/request-money
 * Request money from a user
 */
router.post("/request-money", dashboardController.requestMoney);

/**
 * GET /api/dashboard/notifications
 * Get all notifications
 */
router.get("/notifications", dashboardController.getNotifications);

/**
 * PATCH /api/dashboard/notifications/:notificationId/read
 * Mark notification as read
 */
router.patch(
  "/notifications/:notificationId/read",
  dashboardController.markNotificationRead,
);

module.exports = router;
