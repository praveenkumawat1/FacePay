const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const crypto = require("crypto");
const redis = require("../config/redis");
const sendOtpEmail = require("../utils/sendOtpEmail");

function generateTransactionId() {
  return (
    "TXN" +
    Date.now().toString(36).toUpperCase() +
    Math.floor(Math.random() * 10000)
  );
}

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

function calculateFee(paymentMethod, amount) {
  switch (paymentMethod) {
    case "card":
      return parseFloat((amount * 0.02).toFixed(2));
    case "netbanking":
      return 10;
    case "razorpay":
    case "upi":
    case "qr":
    default:
      return 0;
  }
}

// ─── DASHBOARD API ────────────────────────────────────────────────────────────
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
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.warn("⚠️ [Redis] Read failed:", cacheErr.message);
    }

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
          .limit(50)
          .lean(),
        Transaction.find({
          user_id: userId,
          createdAt: { $gte: thisMonthStart },
        })
          .select("type amount category")
          .lean(),
      ],
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // ✅ FIX: Decrypt manually instead of instantiating full Mongoose document
    const { decrypt } = require("../utils/crypto");
    const safeDecrypt = (val) => {
      if (!val) return val;
      try {
        return decrypt(val);
      } catch {
        return val;
      }
    };

    const walletData =
      wallet ||
      (await Wallet.create({
        user_id: userId,
        wallet_key: crypto.randomBytes(32).toString("hex"),
        balance: 100,
      }));

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
        name: user.full_name,
        full_name: user.full_name,
        email: safeDecrypt(user.email),
        mobile: safeDecrypt(user.mobile),
        profile_picture: user.profile_picture,
        kyc_verified: user.kyc_verified || false,
        face_enrolled: !!user.awsFaceId, // ✅ ADDED: Front-end checking
        awsFaceId: user.awsFaceId, // ✅ ADDED: Front-end checking
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        upi_id: user.upi_id,
        kyc_status: user.kyc_status || "not_started",
        kyc_level: user.kyc_level || 0,
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
      notifications: user.notifications || [],
    };

    try {
      await redis.setex(cacheKey, 120, JSON.stringify(responseData));
    } catch (cacheErr) {
      console.warn("⚠️ [Redis] Write failed:", cacheErr.message);
    }

    res.setHeader("X-Cache", "MISS");
    return res.json(responseData);
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard data" });
  }
};

// ─── ADD MONEY ────────────────────────────────────────────────────────────────
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

    const validMethods = ["upi", "card", "netbanking", "qr", "razorpay"];
    if (payment_method && !validMethods.includes(payment_method)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment method" });
    }

    if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed. Invalid signature.",
        });
      }
    }

    const fee = calculateFee(payment_method || "upi", numAmount);
    const totalCharged = numAmount + fee;

    let couponApplied = null;
    let cashbackAmount = 0;

    if (coupon) {
      const couponData = COUPONS[coupon.toUpperCase()];
      if (!couponData)
        return res
          .status(400)
          .json({ success: false, message: `Invalid coupon code: ${coupon}` });
      if (numAmount < couponData.minAmount)
        return res.status(400).json({
          success: false,
          message: `Coupon "${coupon}" requires minimum ₹${couponData.minAmount}`,
        });
      if (payment_method && !couponData.validPayment.includes(payment_method))
        return res.status(400).json({
          success: false,
          message: `Coupon "${coupon}" is not valid for ${payment_method}`,
        });
      couponApplied = coupon.toUpperCase();
      cashbackAmount = couponData.discount;
    }

    const [wallet] = await Promise.all([Wallet.findOne({ user_id: userId })]);

    // ✅ FIX: User.exists() — no full document load needed just for wallet check
    const userExists = await User.exists({ _id: userId });
    if (!userExists)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    let activeWallet = wallet;
    if (!activeWallet) {
      activeWallet = await Wallet.create({
        user_id: userId,
        wallet_key: crypto.randomBytes(32).toString("hex"),
        balance: 0,
      });
    }

    const balanceBefore = activeWallet.balance;
    const balanceAfterTopup = balanceBefore + numAmount;
    const balanceAfterCashback = balanceAfterTopup + cashbackAmount;

    activeWallet.balance = balanceAfterCashback;

    const mainTxn = new Transaction({
      user_id: userId,
      type: "credit",
      amount: numAmount,
      fee,
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

    // ✅ FIX: Notification add using updateOne — NO user.save(), NO pre-save hook
    const notifEntry = {
      _id: new (require("mongoose").Types.ObjectId)(),
      title: "Money Added Successfully",
      message: `₹${numAmount.toLocaleString()} added to your wallet via ${payment_method?.toUpperCase() || "UPI"}`,
      type: "success",
      read: false,
      time: new Date().toISOString(),
      createdAt: new Date(),
    };

    const pushNotifs = [notifEntry];
    if (cashbackAmount > 0) {
      pushNotifs.unshift({
        _id: new (require("mongoose").Types.ObjectId)(),
        title: `₹${cashbackAmount} Cashback Credited!`,
        message: `${COUPONS[couponApplied].description} applied on your top-up`,
        type: "success",
        read: false,
        time: new Date().toISOString(),
        createdAt: new Date(),
      });
    }

    const saveOps = [
      activeWallet.save(),
      mainTxn.save(),
      // ✅ updateOne — skips the entire pre-save hook (no bcrypt, no encryption)
      User.updateOne(
        { _id: userId },
        {
          $push: { notifications: { $each: pushNotifs, $position: 0 } },
          $set: { lastTransactionDate: new Date() },
        },
      ),
    ];
    if (cashbackTxn) saveOps.push(cashbackTxn.save());

    await Promise.all(saveOps);

    // ✅ Redis cache clear
    try {
      await redis.del(`dashboard:${userId}`);
    } catch (err) {
      console.warn("⚠️ [Redis] Cache clear failed:", err.message);
    }

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
        fee,
        total_charged: totalCharged,
        balance: activeWallet.balance,
        date: mainTxn.createdAt,
        title: mainTxn.title,
        category: mainTxn.category,
        status: mainTxn.status,
        payment_method,
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

// ─── WITHDRAW MONEY ─────────────────────────────────────────────────────────
exports.withdrawMoney = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount, method, destination, account_name, ifsc, phone } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const numAmount = parseFloat(amount);
    const minWithdrawal = 100;
    if (numAmount < minWithdrawal) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal is ₹${minWithdrawal}`,
      });
    }

    const validMethods = ["bank", "upi", "razorpay"];
    if (!validMethods.includes(method)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid withdrawal method" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const wallet = await Wallet.findOne({ user_id: userId });
    if (!wallet || wallet.balance < numAmount) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    const fee = calculateFee(method, numAmount);
    const totalDeduction = numAmount + fee;

    if (wallet.balance < totalDeduction) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance to cover withdrawal + ₹${fee} fee`,
      });
    }

    // --- RAZORPAY PAYOUT LOGIC ---
    let payoutStatus = "processed"; // Default for simulation
    let razorpayPayoutId = "PO_" + Date.now().toString(36).toUpperCase();

    // In a real production app with Razorpay Payouts enabled:
    /*
    const Razorpay = require("razorpay");
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    
    // Choose mode based on amount: IMPS (default), NEFT (>2L), or RTGS (>2L)
    let transferMode = "IMPS";
    if (numAmount > 200000) {
      transferMode = "NEFT"; // Or RTGS based on business logic
    }

    try {
      const payout = await razorpay.payouts.create({
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // Merchant account
        amount: Math.round(numAmount * 100),
        currency: "INR",
        mode: method === 'upi' ? 'UPI' : transferMode,
        purpose: "payout",
        fund_account: {
          account_type: method === 'upi' ? 'vpa' : 'bank_account',
          vpa: method === 'upi' ? { address: destination } : undefined,
          bank_account: method === 'bank' ? {
            name: account_name || user.full_name,
            ifsc: ifsc || "HDFC0000001",
            account_number: destination
          } : undefined,
          contact: {
            name: user.full_name,
            email: user.email,
            contact: phone || user.mobile || "9999999999",
            type: "customer"
          }
        },
        queue_if_low_balance: true,
        reference_id: "WDR_" + Date.now().toString(36).toUpperCase(),
      });
      
      payoutStatus = payout.status; // 'processed', 'pending', 'reversed', etc.
      razorpayPayoutId = payout.id;
    } catch (error) {
       console.error("Razorpay Payout Error:", error);
       return res.status(400).json({ 
         success: false, 
         message: "Razorpay payout failed",
         error: error.description 
       });
    }
    */
    // --- RAZORPAY PAYOUT LOGIC END ---

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - totalDeduction;

    wallet.balance = balanceAfter;

    const txnId = "WDR" + Date.now().toString(36).toUpperCase();

    const withdrawalTxn = new Transaction({
      user_id: userId,
      type: "debit",
      flow: "withdrawal",
      amount: numAmount,
      fee,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      category: "Withdrawal",
      title: "Money Withdrawn",
      description: `Withdrawn ₹${numAmount} to ${method.toUpperCase()} (${destination}) via Razorpay`,
      status: payoutStatus === "processed" ? "success" : "pending",
      payment_method: method === "bank" ? "netbanking" : method,
      transaction_id: txnId,
      razorpay_payout_id: razorpayPayoutId,
    });

    const notif = {
      _id: new (require("mongoose").Types.ObjectId)(),
      title: "Withdrawal Successful",
      message: `₹${numAmount.toLocaleString()} has been withdrawn to your ${method.toUpperCase()}. Reference: ${txnId}`,
      type: "info",
      read: false,
      time: new Date().toISOString(),
      createdAt: new Date(),
    };

    await Promise.all([
      wallet.save(),
      withdrawalTxn.save(),
      User.updateOne(
        { _id: userId },
        { $push: { notifications: { $each: [notif], $position: 0 } } },
      ),
      redis
        .del(`dashboard:${userId}`)
        .catch((e) => console.warn("Redis Clear Warning:", e.message)),
    ]);

    res.json({
      success: true,
      message: "Withdrawal processed successfully",
      balance: wallet.balance,
      transaction_id: txnId,
      amount: numAmount,
      destination,
    });
  } catch (err) {
    console.error("Withdrawal Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── GET TRANSACTIONS ────────────────────────────────────────────────────────
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

// ─── GET NOTIFICATIONS ───────────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("notifications").lean();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

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

// ─── MARK NOTIFICATION READ ──────────────────────────────────────────────────
exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.params;

    // ✅ FIX: updateOne + $set — no user.save(), no pre-save hook
    const result = await User.updateOne(
      { _id: userId, "notifications._id": notificationId },
      { $set: { "notifications.$.read": true } },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    try {
      await redis.del(`dashboard:${userId}`);
    } catch {
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

// ─── WELCOME NOTIFICATION ────────────────────────────────────────────────────
exports.sendWelcomeNotification = async (userId, userName, referralCode) => {
  try {
    const notifs = [
      {
        _id: new (require("mongoose").Types.ObjectId)(),
        title: "Welcome to FacePay!",
        message: `Hi ${userName}! Your account has been created successfully. Start by adding money to your wallet!`,
        type: "success",
        read: false,
        time: new Date().toISOString(),
        createdAt: new Date(),
      },
      {
        _id: new (require("mongoose").Types.ObjectId)(),
        title: "Complete KYC Verification",
        message:
          "Verify your account to unlock all features and higher transaction limits.",
        type: "info",
        read: false,
        time: new Date().toISOString(),
        createdAt: new Date(),
      },
    ];

    if (referralCode) {
      notifs.push({
        _id: new (require("mongoose").Types.ObjectId)(),
        title: "Refer & Earn Rewards",
        message: `Your referral code: ${referralCode}. Share with friends to earn rewards!`,
        type: "info",
        read: false,
        time: new Date().toISOString(),
        createdAt: new Date(),
      });
    }

    // ✅ updateOne — no pre-save hook triggered
    await User.updateOne(
      { _id: userId },
      { $push: { notifications: { $each: notifs } } },
    );
  } catch (error) {
    console.error("❌ Welcome notification error:", error.message);
  }
};

// ─── SEARCH USERS FOR REQUEST MONEY ──────────────────────────────────────────
exports.getSearchUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ success: true, users: [] });
    }

    const { decrypt } = require("../utils/crypto");
    const fuzzy = new RegExp(query, "i");

    // Fetch potential matches
    const users = await User.find({
      _id: { $ne: userId },
      $or: [{ full_name: fuzzy }, { upi_id: fuzzy }],
    })
      .select("full_name email mobile profile_picture upi_id")
      .limit(10)
      .lean();

    // Mapping to safe output
    const safeUsers = users.map((u) => ({
      id: u._id,
      name: u.full_name,
      upi_id:
        u.upi_id || `${u.full_name.toLowerCase().replace(/\s/g, "")}@facepay`,
      profile_picture: u.profile_picture,
    }));

    res.json({ success: true, users: safeUsers });
  } catch (error) {
    console.error("❌ Search users error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

// ─── REQUEST MONEY ──────────────────────────────────────────────────────────
exports.requestMoney = async (req, res) => {
  try {
    const senderId = req.userId; // The one asking for money
    const { recipientId, amount, note } = req.body;

    if (!recipientId || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const [sender, recipient] = await Promise.all([
      User.findById(senderId).select("full_name").lean(),
      User.findById(recipientId).select("notifications").lean(),
    ]);

    if (!sender || !recipient) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const requestId = "REQ" + Date.now().toString(36).toUpperCase();

    // Create Notification for the Recipient
    const notification = {
      _id: new (require("mongoose").Types.ObjectId)(),
      title: "Money Request Received",
      message: `${sender.full_name} is requesting ₹${amount} from you.`,
      type: "payment_request",
      amount: parseFloat(amount),
      senderId,
      senderName: sender.full_name,
      requestId,
      note: note || "",
      read: false,
      time: new Date().toISOString(),
      createdAt: new Date(),
    };

    // Store in Transaction as PENDING
    const transaction = new Transaction({
      user_id: recipientId, // The one who HAS to pay
      type: "debit",
      flow: "request",
      amount: parseFloat(amount),
      balance_before: 0,
      balance_after: 0,
      status: "pending",
      category: "Transfer",
      title: `Request from ${sender.full_name}`,
      description: note || "Money request",
      transaction_id: requestId,
    });

    await Promise.all([
      User.updateOne(
        { _id: recipientId },
        { $push: { notifications: { $each: [notification], $position: 0 } } },
      ),
      transaction.save(),
      redis.del(`dashboard:${recipientId}`).catch(() => {}), // Clear cache
    ]);

    // REAL-TIME NOTIFICATION via WebSocket
    const recipientConns = req.clients ? req.clients.get(recipientId) : null;
    if (recipientConns) {
      const liveNotif = JSON.stringify({
        type: "NOTIFICATION",
        data: notification,
      });
      recipientConns.forEach((ws) => {
        if (ws.readyState === 1) ws.send(liveNotif);
      });
    }

    res.json({
      success: true,
      message: "Request sent successfully",
      requestId,
    });
  } catch (error) {
    console.error("❌ Request money error:", error);
    res.status(500).json({ success: false, message: "Request failed" });
  }
};
