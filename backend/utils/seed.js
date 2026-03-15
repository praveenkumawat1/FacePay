const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");
const MarketplaceItem = require("../models/MarketplaceItem");
const Mission = require("../models/Mission");
const FeaturedOffer = require("../models/FeaturedOffer");
const connectDB = require("../config/db");
require("dotenv").config();

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Coupon.deleteMany();
    await MarketplaceItem.deleteMany();
    await Mission.deleteMany();
    await FeaturedOffer.deleteMany();

    console.log("🗑️ Cleared existing data");

    // ========== COUPONS ==========
    // 6 default coupons
    const coupons = [
      {
        brand: "Zomato",
        description: "10% off on first order",
        code: "FOOD10",
        category: "Food",
        discount: "10%",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        icon: "FiTag",
      },
      {
        brand: "MakeMyTrip",
        description: "₹50 off on bus tickets",
        code: "TRAVEL50",
        category: "Travel",
        discount: "₹50",
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        icon: "FiTag",
      },
      {
        brand: "Myntra",
        description: "20% off on fashion",
        code: "SHOP20",
        category: "Shopping",
        discount: "20%",
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        icon: "FiTag",
      },
      {
        brand: "Dominos",
        description: "₹25 off on pizza",
        code: "PIZZA25",
        category: "Food",
        discount: "₹25",
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        icon: "FiTag",
      },
      {
        brand: "Uber",
        description: "15% off on rides",
        code: "UBER15",
        category: "Travel",
        discount: "15%",
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        icon: "FiTag",
      },
      {
        brand: "Amazon",
        description: "₹100 off on electronics",
        code: "AMZN100",
        category: "Shopping",
        discount: "₹100",
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        icon: "FiTag",
      },
    ];
    await Coupon.insertMany(coupons);
    console.log(`✅ Inserted ${coupons.length} default coupons`);

    // 100+ extra coupons
    const extraCoupons = [];
    for (let i = 1; i <= 100; i++) {
      const category = ["Food", "Travel", "Shopping", "Entertainment", "Other"][
        i % 5
      ];
      extraCoupons.push({
        brand: `Brand ${i}`,
        description: `Special offer ${i}`,
        code: `COUPON${i}`,
        category,
        discount: `${(i % 20) + 5}% off`,
        expiryDate: new Date(Date.now() + ((i % 30) + 1) * 24 * 60 * 60 * 1000),
        icon: "FiTag",
      });
    }
    await Coupon.insertMany(extraCoupons);
    console.log(`✅ Inserted ${extraCoupons.length} extra coupons`);

    // ========== MARKETPLACE ITEMS ==========
    const marketplaceItems = [
      {
        title: "Amazon Gift Card",
        brand: "Amazon",
        description: "₹500 Amazon shopping voucher",
        price: 500,
        icon: "FiGift",
      },
      {
        title: "Flipkart Voucher",
        brand: "Flipkart",
        description: "₹300 Flipkart gift card",
        price: 300,
        icon: "FiCreditCard",
      },
      {
        title: "Netflix Subscription",
        brand: "Netflix",
        description: "1 month Netflix subscription",
        price: 800,
        icon: "FiPackage",
      },
      {
        title: "Swiggy Money",
        brand: "Swiggy",
        description: "₹200 Swiggy wallet credit",
        price: 200,
        icon: "FiPackage",
      },
      {
        title: "Uber Credits",
        brand: "Uber",
        description: "₹250 Uber ride credits",
        price: 250,
        icon: "FiCreditCard",
      },
    ];
    await MarketplaceItem.insertMany(marketplaceItems);
    console.log(`✅ Inserted ${marketplaceItems.length} marketplace items`);

    // ========== MISSIONS ==========
    const missions = [
      {
        title: "Daily Login",
        description: "Login to the app every day",
        reward: 10,
        total: 1,
        type: "daily_login",
        icon: "FiClock",
      },
      {
        title: "Refer a Friend",
        description: "Refer a friend who signs up",
        reward: 100,
        total: 1,
        type: "referral",
        icon: "FiUsers",
      },
      {
        title: "UPI Streak",
        description: "Make 5 UPI transactions",
        reward: 50,
        total: 5,
        type: "upi",
        icon: "FiZap",
      },
      {
        title: "Shopping Spree",
        description: "Make 3 purchases using coupons",
        reward: 30,
        total: 3,
        type: "purchase",
        icon: "FiShoppingBag",
      },
    ];
    await Mission.insertMany(missions);
    console.log(`✅ Inserted ${missions.length} missions`);

    // ========== FEATURED OFFERS ==========
    const featuredOffers = [
      {
        brand: "Zomato",
        discount: "Flat 20% off",
        code: "ZOMATO20",
        bg: "linear-gradient(135deg,#cb356b,#bd3f32)",
      },
      {
        brand: "Uber",
        discount: "₹50 off on first ride",
        code: "UBER50",
        bg: "linear-gradient(135deg,#000000,#434343)",
      },
      {
        brand: "Myntra",
        discount: "Min 40% off",
        code: "MYNTRA40",
        bg: "linear-gradient(135deg,#e52d27,#b31217)",
      },
    ];
    await FeaturedOffer.insertMany(featuredOffers);
    console.log(`✅ Inserted ${featuredOffers.length} featured offers`);

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
