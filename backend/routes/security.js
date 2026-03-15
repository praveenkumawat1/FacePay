const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/security"); // named export
const {
  getSessions,
  revokeSession,
  getActivity,
  changePassword,
  enable2FA,
  verify2FA,
  disable2FA,
  get2FAStatus,
  getBackupCodes,
  regenerateBackupCodes,
  getConnectedAccounts,
  connectAccount,
  deleteAccount,
} = require("../controllers/securityController");

// --- Sessions
router.get("/sessions", protect, getSessions);
router.delete("/sessions/:id", protect, revokeSession);

// --- Activity log
router.get("/activity", protect, getActivity);

// --- Password change
router.post("/change-password", protect, changePassword);

// --- 2FA routes
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/verify", protect, verify2FA);
router.post("/2fa/disable", protect, disable2FA);
router.get("/2fa/status", protect, get2FAStatus);
router.get("/2fa/backup-codes", protect, getBackupCodes); // NEW
router.post("/2fa/backup-codes/regenerate", protect, regenerateBackupCodes); // NEW

// --- Connected accounts
router.get("/connected-accounts", protect, getConnectedAccounts);
router.post("/connect-account", protect, connectAccount); // demo endpoint

// --- Account deletion
router.delete("/account", protect, deleteAccount);

module.exports = router;
