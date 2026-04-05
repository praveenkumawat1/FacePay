const mongoose = require("mongoose");
require("dotenv").config();
const Coupon = require("./models/Coupon");
const User = require("./models/User");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to DB");

    // 1. ADD FREE COUPONS
    const coupons = [
      {
        brand: "FacePay Freebie",
        description: "Free starter coupon for all users",
        code: "WELCOME50",
        category: "Shopping",
        discount: "₹50 Off",
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        brand: "Swiggy Free",
        description: "Free Delivery for first 3 orders",
        code: "FREEFLY",
        category: "Food",
        discount: "Free Delivery",
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      {
        brand: "Zomato Special",
        description: "Flat ₹100 Off on orders above ₹199",
        code: "ZOMATOFAST",
        category: "Food",
        discount: "₹100 Off",
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    ];

    for (let c of coupons) {
      const exists = await Coupon.findOne({ code: c.code });
      if (!exists) {
        await Coupon.create(c);
        console.log(`Created coupon: ${c.code}`);
      }
    }

    // 2. ENSURE ALL USERS HAVE STARTER COINS (At least 100)
    const result = await User.updateMany(
      { coins: { $lt: 50 } }, // If less than 50 or doesn't exist
      { $set: { coins: 150 } }, // Give 150 coins so they can spin at least 15 times
    );
    console.log(
      `✅ Updated ${result.modifiedCount} users with starter coins (150).`,
    );

    // 3. FIX any users missing the coins field entirely
    const res2 = await User.updateMany(
      { coins: { $exists: false } },
      { $set: { coins: 150 } },
    );
    console.log(
      `✅ Fixed ${res2.modifiedCount} users with missing coins field.`,
    );

    console.log("🎉 Seed process completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
