const mongoose = require("mongoose");
require("dotenv").config();
const Coupon = require("../models/Coupon");
const User = require("../models/User");

async function seed() {
  try {
    console.log("URI:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ DB Connected");

    const coupons = [
      {
        brand: "FacePay Welcome",
        description: "Free starter coupon",
        code: "WELCOME100",
        category: "Shopping",
        discount: "₹100 Off",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ];

    for (let c of coupons) {
      await Coupon.findOneAndUpdate({ code: c.code }, c, { upsert: true });
      console.log("Upserted coupon:", c.code);
    }

    const res = await User.updateMany({}, { $inc: { coins: 150 } });
    console.log(`✅ Success! Added 150 coins to ${res.modifiedCount} users.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ SEED ERROR:", err.message);
    process.exit(1);
  }
}

seed();
