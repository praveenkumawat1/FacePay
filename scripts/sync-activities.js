const mongoose = require("mongoose");
const User = require("./backend/models/User");
const { ActivityLog } = require("./backend/models/Security");
const { sendNotification } = require("./backend/utils/notification");

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
        .limit(10);

      console.log(
        `Processing user ${user.full_name} (${user._id}) - activities: ${activities.length}`,
      );

      if (activities.length === 0) continue;

      // Extract titles and messages and avoid exact duplicates if they already exist in user.notifications
      for (const activity of activities) {
        const title = activity.action;
        const message = `Activity detected on ${activity.device || "unknown device"} at ${activity.location || "unknown location"}. Status: ${activity.status}`;

        // Check if this specific activity is already in notifications
        const exists = user.notifications.some(
          (n) =>
            n.title === title &&
            n.message.includes(activity.device || "unknown device") &&
            n.message.includes(activity.location || "unknown location"),
        );

        if (!exists) {
          await sendNotification(user._id, {
            title: title,
            message: message,
            type: activity.status === "success" ? "info" : "warning",
          });
          console.log(`  - Added notification for: ${title}`);
        }
      }
    }

    console.log("✅ Finished syncing notifications");
    process.exit(0);
  } catch (err) {
    console.error("❌ Sync Error:", err);
    process.exit(1);
  }
}

syncRecentActivitiesToNotifications();
