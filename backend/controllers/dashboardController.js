const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const crypto = require("crypto");
const redis = require("../config/redis");

function generateTransactionId() {
  return (
    "TXN" +
    Date.now().toString(36).toUpperCase() +
    Math.floor(Math.random() * 10000)
  );
}

// ─── Coupon Config ─────────────────────────────────────────────────────────────
// Frontend ke saath match karna zaroori hai
const COUPONS = {
  WALLET50: {
    discount: 50,
    minAmount: 500,
    validPayment: ["upi", "card", "netbanking", "qr"],
    description: "₹50 Cashback",
  },
  FOODFEST: {
    discount: 100,
    minAmount: 800,
    validPayment: ["card"],
    description: "₹100 Food Cashback",
  },
};

// ─── Fee Calculator ────────────────────────────────────────────────────────────
function calculateFee(paymentMethod, amount) {
  switch (paymentMethod) {
    case "card":
      return parseFloat((amount * 0.02).toFixed(2)); // 2%
    case "netbanking":
      return 10; // flat ₹10
    case "upi":
    case "qr":
    default:
      return 0;
  }
}

/**
 * ================= DASHBOARD API =================
 */
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User ID not found in token" });
    }

    // ✅ Redis cache check
    const cacheKey = `dashboard:${userId}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log("⚡ [Dashboard] Redis cache hit");
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.warn("⚠️ [Redis] Read failed:", cacheErr.message);
    }

    console.log("📊 [Dashboard] MongoDB se fetch ho raha hai...");
    const start = Date.now();

    const thisMonthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const [user, wallet, transactions, monthlyTransactions] = await Promise.all(
      [
        User.findById(userId).select("-password_hash").lean(),
        Wallet.findOne({ user_id: userId }).lean(),
        Transaction.find({ user_id: userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Transaction.find({
          user_id: userId,
          createdAt: { $gte: thisMonthStart },
        })
          .select("type amount category")
          .lean(),
      ],
    );

    console.log(`📊 [Dashboard] MongoDB fetch done in ${Date.now() - start}ms`);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let userData = user;
    try {
      const userInstance = new User(user);
      userData = userInstance.toDecrypted();
    } catch (err) {
      console.error("Decryption error:", err.message);
    }

    let walletData = wallet;
    if (!wallet) {
      const wallet_key = crypto.randomBytes(32).toString("hex");
      walletData = await Wallet.create({
        user_id: userId,
        wallet_key,
        balance: 100,
      });
    }

    const monthlySpending = monthlyTransactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyIncome = monthlyTransactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);

    const categorySpending = monthlyTransactions
      .filter((t) => t.type === "debit")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const unreadNotifications = user.notifications
      ? user.notifications.filter((n) => !n.read).length
      : 0;

    const responseData = {
      success: true,
      user: {
        _id: user._id,
        name: userData.full_name || user.full_name,
        full_name: userData.full_name || user.full_name,
        email: userData.email,
        mobile: userData.mobile,
        profile_picture: user.profile_picture,
        kyc_verified: user.kyc_verified || false,
        createdAt: user.createdAt,
      },
      wallet: {
        balance: walletData?.balance ?? 0,
        wallet_key: walletData?.wallet_key ?? "----",
      },
      transactions: transactions.map((t) => ({
        id: t._id,
        title: t.title,
        amount: t.type === "credit" ? t.amount : -t.amount,
        category: t.category,
        status: t.status,
        date: t.createdAt,
        transaction_id: t.transaction_id,
      })),
      stats: {
        monthlySpending,
        monthlyIncome,
        categorySpending,
        transactionCount: transactions.length,
      },
      notifications: {
        unread: unreadNotifications,
        total: user.notifications ? user.notifications.length : 0,
      },
    };

    try {
      await redis.setex(cacheKey, 120, JSON.stringify(responseData));
      console.log("✅ [Redis] Cached for 2 minutes");
    } catch (cacheErr) {
      console.warn("⚠️ [Redis] Write failed:", cacheErr.message);
    }

    res.setHeader("X-Cache", "MISS");
    return res.json(responseData);
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * =============== ADD MONEY =================
 * Supports:
 *  - payment_method: upi | card | netbanking | qr
 *  - coupon: WALLET50 | FOODFEST (optional)
 *  - razorpay_payment_id: Razorpay se verify ke baad pass karo (optional)
 *  - razorpay_order_id: Razorpay order ID (optional)
 *  - razorpay_signature: Razorpay signature (optional)
 */
exports.addMoney = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      amount,
      payment_method,
      coupon,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 10) {
      return res
        .status(400)
        .json({ success: false, message: "Minimum amount is ₹10" });
    }
    if (numAmount > 50000) {
      return res.status(400).json({
        success: false,
        message: "Maximum amount per transaction is ₹50,000",
      });
    }

    const validMethods = ["upi", "card", "netbanking", "qr"];
    if (payment_method && !validMethods.includes(payment_method)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment method" });
    }

    // ── Razorpay Signature Verify (agar Razorpay use kar rahe ho) ───────────
    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        console.error("❌ [Razorpay] Invalid signature");
        return res.status(400).json({
          success: false,
          message: "Payment verification failed. Invalid signature.",
        });
      }
      console.log("✅ [Razorpay] Signature verified");
    }

    // ── Fee Calculate karo ──────────────────────────────────────────────────
    const fee = calculateFee(payment_method || "upi", numAmount);
    const totalCharged = numAmount + fee; // user ne kitna pay kiya

    // ── Coupon Validate karo ────────────────────────────────────────────────
    let couponApplied = null;
    let cashbackAmount = 0;

    if (coupon) {
      const couponData = COUPONS[coupon.toUpperCase()];

      if (!couponData) {
        return res
          .status(400)
          .json({ success: false, message: `Invalid coupon code: ${coupon}` });
      }

      if (numAmount < couponData.minAmount) {
        return res.status(400).json({
          success: false,
          message: `Coupon "${coupon}" requires minimum ₹${couponData.minAmount}`,
        });
      }

      if (payment_method && !couponData.validPayment.includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: `Coupon "${coupon}" is not valid for ${payment_method}`,
        });
      }

      couponApplied = coupon.toUpperCase();
      cashbackAmount = couponData.discount;
      console.log(
        `✅ [Coupon] ${couponApplied} applied — cashback: ₹${cashbackAmount}`,
      );
    }

    // ── User + Wallet fetch karo ────────────────────────────────────────────
    const [user, wallet] = await Promise.all([
      User.findById(userId),
      Wallet.findOne({ user_id: userId }),
    ]);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let activeWallet = wallet;
    if (!activeWallet) {
      const wallet_key = crypto.randomBytes(32).toString("hex");
      activeWallet = await Wallet.create({
        user_id: userId,
        wallet_key,
        balance: 0,
      });
    }

    // ── Balance update karo ─────────────────────────────────────────────────
    const balanceBefore = activeWallet.balance;
    const balanceAfterTopup = balanceBefore + numAmount;
    const balanceAfterCashback = balanceAfterTopup + cashbackAmount;

    activeWallet.balance = balanceAfterCashback;

    // ── Main Transaction ────────────────────────────────────────────────────
    const mainTxn = new Transaction({
      user_id: userId,
      type: "credit",
      amount: numAmount,
      fee: fee,
      balance_before: balanceBefore,
      balance_after: balanceAfterTopup,
      category: "Add Money",
      title: "Money Added to Wallet",
      description: `Added ₹${numAmount} via ${payment_method || "wallet"}${couponApplied ? ` | Coupon: ${couponApplied}` : ""}`,
      status: "success",
      payment_method: payment_method || "upi",
      transaction_id: generateTransactionId(),
      ...(razorpay_payment_id && { razorpay_payment_id }),
      ...(razorpay_order_id && { razorpay_order_id }),
      ...(couponApplied && { coupon_code: couponApplied }),
    });

    // ── Cashback Transaction (agar coupon laga) ─────────────────────────────
    let cashbackTxn = null;
    if (cashbackAmount > 0) {
      cashbackTxn = new Transaction({
        user_id: userId,
        type: "credit",
        amount: cashbackAmount,
        fee: 0,
        balance_before: balanceAfterTopup,
        balance_after: balanceAfterCashback,
        category: "Cashback",
        title: `Cashback — ${couponApplied}`,
        description: `${COUPONS[couponApplied].description} cashback credited`,
        status: "success",
        payment_method: "cashback",
        transaction_id: generateTransactionId(),
        coupon_code: couponApplied,
      });
    }

    // ── Notification ────────────────────────────────────────────────────────
    if (!user.notifications) user.notifications = [];

    user.notifications.unshift({
      title: "Money Added Successfully",
      message: `₹${numAmount.toLocaleString()} added to your wallet via ${payment_method?.toUpperCase() || "UPI"}`,
      type: "success",
      read: false,
    });

    if (cashbackAmount > 0) {
      user.notifications.unshift({
        title: `₹${cashbackAmount} Cashback Credited!`,
        message: `${COUPONS[couponApplied].description} applied on your top-up`,
        type: "success",
        read: false,
      });
    }

    if (user.notifications.length > 50) {
      user.notifications = user.notifications.slice(0, 50);
    }

    // ── Save sab ek saath ───────────────────────────────────────────────────
    const saveOperations = [activeWallet.save(), mainTxn.save(), user.save()];
    if (cashbackTxn) saveOperations.push(cashbackTxn.save());

    await Promise.all(saveOperations);

    // ── Redis cache clear ───────────────────────────────────────────────────
    try {
      await redis.del(`dashboard:${userId}`);
      console.log("✅ [Redis] Cache cleared after addMoney");
    } catch (err) {
      console.warn("⚠️ [Redis] Cache clear failed:", err.message);
    }

    console.log(
      `✅ [AddMoney] ₹${numAmount} added for user ${userId} | Fee: ₹${fee} | Cashback: ₹${cashbackAmount}`,
    );

    // ── Response ────────────────────────────────────────────────────────────
    return res.json({
      success: true,
      message: "Money added successfully",
      wallet: {
        balance: activeWallet.balance,
        wallet_key: activeWallet.wallet_key,
      },
      transaction: {
        id: mainTxn._id,
        transaction_id: mainTxn.transaction_id,
        amount: numAmount,
        fee: fee,
        total_charged: totalCharged,
        balance: activeWallet.balance,
        date: mainTxn.createdAt,
        title: mainTxn.title,
        category: mainTxn.category,
        status: mainTxn.status,
        payment_method: payment_method,
        ...(couponApplied && {
          coupon: {
            code: couponApplied,
            cashback: cashbackAmount,
            description: COUPONS[couponApplied].description,
          },
        }),
      },
    });
  } catch (error) {
    console.error("❌ Add money error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to add money" });
  }
};

/**
 * ================ GET TRANSACTIONS =================
 */
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, type, category } = req.query;

    const query = { user_id: userId };
    if (type) query.type = type;
    if (category) query.category = category;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
      Transaction.countDocuments(query),
    ]);

    return res.json({
      success: true,
      transactions: transactions.map((t) => ({
        id: t._id,
        title: t.title,
        amount: t.type === "credit" ? t.amount : -t.amount,
        category: t.category,
        status: t.status,
        date: t.createdAt,
        transaction_id: t.transaction_id,
        balance_after: t.balance_after,
        description: t.description,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Get transactions error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch transactions" });
  }
};

/**
 * ================ GET NOTIFICATIONS =================
 */
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("notifications").lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const notifications = user.notifications || [];
    const unread = notifications.filter((n) => !n.read).length;

    return res.json({ success: true, notifications, unread });
  } catch (error) {
    console.error("❌ Get notifications error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications" });
  }
};

/**
 * ================ MARK NOTIFICATION READ =================
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const notification = user.notifications.id(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    notification.read = true;
    await user.save();

    try {
      await redis.del(`dashboard:${userId}`);
    } catch (err) {
      /* silent */
    }

    return res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("❌ Mark notification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark notification" });
  }
};

/**
 * ============ WELCOME NOTIFICATION =============
 */
exports.sendWelcomeNotification = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (!user.notifications) user.notifications = [];

    user.notifications.push(
      {
        title: "Welcome to FacePay!",
        message: `Hi ${user.full_name}! Your account has been created successfully. Start by adding money to your wallet!`,
        type: "success",
        read: false,
      },
      {
        title: "Complete KYC Verification",
        message:
          "Verify your account to unlock all features and higher transaction limits.",
        type: "info",
        read: false,
      },
    );

    if (user.referral_code) {
      user.notifications.push({
        title: "Refer & Earn Rewards",
        message: `Your referral code: ${user.referral_code}. Share with friends to earn rewards!`,
        type: "info",
        read: false,
      });
    }

    if (user.notifications.length > 50)
      user.notifications = user.notifications.slice(-50);
    await user.save();
  } catch (error) {
    console.error("❌ Welcome notification error:", error);
  }
};
