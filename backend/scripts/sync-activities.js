const mongoose = require("mongoose");
const User = require("../models/User");
const { ActivityLog } = require("../models/Security");
const { sendNotification } = require("../utils/notification");

async function syncRecentActivitiesToNotifications() {
  try {
    const mongoUri =
      "mongodb+srv://kumawatpraveen050_db_user:Rd451E0hHKK2t5R7@cluster0.p1bda.mongodb.net/facepay?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      // Get last 5 activities for this user
      const activities = await ActivityLog.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(5); // Keep it to 5 most recent

      if (activities.length === 0) continue;

      console.log(
        `Processing user: ${user._id} | Activities to sync: ${activities.length}`,
      );

      for (const activity of activities) {
        // Construct notification data
        const title = activity.action;
        const message = `Security Event: ${activity.action} detected on ${activity.device || "unknown device"}. Status: ${activity.status}`;
        const type = activity.status === "success" ? "info" : "warning";

        // Check if user already has this NOTIFICATION (not just activity log)
        const alreadyExists = user.notifications.some(
          (n) =>
            n.title === title &&
            n.message.includes(activity.device || "unknown"),
        );

        if (!alreadyExists) {
          user.notifications.unshift({
            title,
            message,
            type,
            read: false,
            time: activity.createdAt.toISOString(),
          });
          console.log(`  + Added Notification: ${title}`);
        }
      }

      // Limit to 50 latest notifications
      if (user.notifications.length > 50) {
        user.notifications = user.notifications.slice(0, 50);
      }

      await user.save();
    }

    console.log("✅ All recent activities synced to notifications");
    process.exit(0);
  } catch (err) {
    console.error("❌ Sync Error:", err);
    process.exit(1);
  }
}

syncRecentActivitiesToNotifications();
