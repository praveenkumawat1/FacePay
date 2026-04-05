const User = require("../models/User");

/**
 * Enhanced notification utility to send real-time alerts to users.
 * This updates the user's notification array in MongoDB.
 *
 * @param {string} userId - The ID of the user to notify
 * @param {Object} notification - Notification details
 * @param {string} notification.title - Short descriptive title
 * @param {string} notification.message - Detailed message
 * @param {string} notification.type - 'info', 'success', 'warning', 'error'
 */
exports.sendNotification = async (
  userId,
  { title, message, type = "info" },
) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (!user.notifications) user.notifications = [];

    // Add new notification to the beginning of the array
    user.notifications.unshift({
      title,
      message,
      type,
      read: false,
      time: new Date().toISOString(),
      createdAt: new Date(),
    });

    // Keep only last 50 notifications to prevent document size explosion
    if (user.notifications.length > 50) {
      user.notifications = user.notifications.slice(0, 50);
    }

    await user.save();
    console.log(`🔔 Notification Sent to ${userId}: ${title}`);
    return true;
  } catch (error) {
    console.error("❌ Send notification error:", error.message);
    return false;
  }
};
