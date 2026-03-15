const mongoose = require("mongoose");
require("dotenv").config();

// Import User model without pre-save hooks
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema, "users");

async function fixWalletKeys() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const userId = "698953e46e9439e49a852e09";

    // Find user
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log("📊 BEFORE Update:", {
      id: user._id,
      balance: user.balance,
      wallet_balance: user.wallet_balance,
      wallet_key: user.wallet_key,
    });

    // Generate wallet key
    const newWalletKey = `W-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Update directly in database (bypass validation)
    const result = await User.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          balance: 0,
          wallet_balance: 0,
          wallet_key: newWalletKey,
        },
      },
    );

    console.log("✅ Update result:", result);

    // Verify update
    const updatedUser = await User.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });

    console.log("✅ AFTER Update:", {
      id: updatedUser._id,
      balance: updatedUser.balance,
      wallet_balance: updatedUser.wallet_balance,
      wallet_key: updatedUser.wallet_key,
    });

    console.log("\n🎉 User fixed successfully!");
    console.log(`✅ Balance: ${updatedUser.balance}`);
    console.log(`✅ Wallet Balance: ${updatedUser.wallet_balance}`);
    console.log(`✅ Wallet Key: ${updatedUser.wallet_key}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixWalletKeys();
