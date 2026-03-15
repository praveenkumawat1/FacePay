// scripts/fixPasswordEncrypted.js
const mongoose = require("mongoose");
const User = require("../models/User");
const { encrypt } = require("../utils/crypto");
require("dotenv").config();

async function fixPasswordEncrypted() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const users = await User.find({ password_encrypted: { $in: [null, ""] } });
  let updated = 0;
  for (const user of users) {
    if (user.password_hash && !user.password_encrypted) {
      user.password_encrypted = encrypt(user.password_hash);
      await user.save();
      updated++;
      console.log(`Updated user: ${user.email}`);
    }
  }
  console.log(`Done. Updated ${updated} users.`);
  await mongoose.disconnect();
}

fixPasswordEncrypted().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
