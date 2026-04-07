const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { sendNotification } = require("../utils/notification");

exports.processPayment = async (req, res) => {
  // ⚡ ULTRA-FAST: Optimized Transaction Handling
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipient_id, amount, note } = req.body;
    const sender_id = req.userId || req.user?.id;

    if (!sender_id || !recipient_id || !amount) {
      throw new Error("Missing required payment fields");
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) throw new Error("Invalid amount");

    // 1. Parallel Fetching with specialized projection for speed
    const [sender, recipient, senderWallet, recipientWallet] = await Promise.all([
      User.findById(sender_id).session(session).select("full_name").lean(),
      User.findById(recipient_id).session(session).select("full_name faceImageUrl").lean(),
      Wallet.findOne({ user_id: sender_id }).session(session),
      Wallet.findOne({ user_id: recipient_id }).session(session)
    ]);

    if (!sender || !recipient) throw new Error("User profile not found");
    if (sender._id.toString() === recipient._id.toString()) throw new Error("Cannot send money to yourself");
    if (!senderWallet || senderWallet.balance < paymentAmount) {
      throw new Error(`Insufficient balance (₹${senderWallet?.balance || 0})`);
    }

    // 2. Atomic Balance Update
    const transaction_id = `TXN${uuidv4().substring(0, 8).toUpperCase()}`;
    const senderPrevBalance = senderWallet.balance;
    
    senderWallet.balance -= paymentAmount;
    await senderWallet.save({ session });

    let activeRecipientWallet = recipientWallet;
    if (!activeRecipientWallet) {
       activeRecipientWallet = new Wallet({ user_id: recipient._id, balance: paymentAmount });
    } else {
       activeRecipientWallet.balance += paymentAmount;
    }
    await activeRecipientWallet.save({ session });

    // 3. Fire-and-forget Transaction Logging (Optimized for speed)
    const commonFields = {
      transaction_id,
      amount: paymentAmount,
      note,
      status: "success",
      completed_at: new Date(),
      category: "Transfer",
    };

    // Parallel save transaction records
    Promise.all([
      new Transaction({ ...commonFields, user_id: sender._id, type: "debit", flow: "send", balance_before: senderPrevBalance, balance_after: senderWallet.balance, title: `Sent to ${recipient.full_name}`, counterparty_id: recipient._id, recipient: recipient.full_name, sender: sender._id }).save({ session }),
      new Transaction({ ...commonFields, user_id: recipient._id, type: "credit", flow: "receive", balance_before: recipientWallet?.balance || 0, balance_after: activeRecipientWallet.balance, title: `Received from ${sender.full_name}`, counterparty_id: sender._id, recipient: recipient.full_name, sender: sender._id }).save({ session })
    ]).catch(err => console.error("Txn Log Error:", err));

    // 4. Rewards Notification (Parallel with Commit)
    const couponPromise = paymentAmount >= 50 ? Promise.resolve({
      code: `WIN${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      message: "Scratch card won!",
      type: "scratch_card"
    }) : Promise.resolve(null);

    // 5. Commit Transaction & Return ASAP
    await session.commitTransaction();
    session.endSession();

    // Fire non-critical tasks in background
    setImmediate(() => {
      // Parallel background tasks
      Promise.all([
        // Scratch card logic (already prepared in 4)
        couponPromise,
        // Notifications
        sendNotification(sender._id, { title: "Payment Successful", message: `₹${paymentAmount} sent`, type: "success" }),
        sendNotification(recipient._id, { title: "Payment Received", message: `₹${paymentAmount} received`, type: "success" })
      ]).catch(() => {});
    });

    return res.json({
      success: true,
      message: "Payment successful",
      transaction: {
        id: transaction_id,
        amount: paymentAmount,
        recipient: { name: recipient.full_name, id: recipient._id, profile_picture: recipient.faceImageUrl },
        coupon: await couponPromise, // This is already a resolved or quick promise
        new_balance: senderWallet.balance,
      },
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("Payment Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const userId = req.userId || req.user?.user_id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const transactions = await Transaction.find({
      $or: [
        { user_id: userId },
        { sender: userId },
        { recipient: userId },
        { sender_id: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formatted = transactions.map((t) => {
      const isMeSender =
        (t.sender && t.sender.toString() === userId?.toString()) ||
        (t.sender_id && t.sender_id.toString() === userId?.toString()) ||
        (t.user_id?.toString() === userId?.toString() && t.type === "debit");

      return {
        id: t._id,
        title:
          t.title || (t.type === "credit" ? "Money Received" : "Money Sent"),
        amount: isMeSender ? -t.amount : t.amount,
        category: t.category || "Payment",
        status: (t.status || "success").toLowerCase(),
        date: t.createdAt,
        transaction_id: t.transaction_id,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      transactions: formatted,
    });
  } catch (error) {
    console.error("❌ Get transactions error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const userId = req.userId || req.user?.user_id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }
    const [user, wallet] = await Promise.all([
      User.findById(userId).select("balance full_name upi_id"),
      Wallet.findOne({ user_id: userId }).select("balance"),
    ]);

    // Use Wallet balance as primary source, fallback to User balance if needed
    const balance = wallet ? wallet.balance : user?.balance || 0;

    res.json({
      success: true,
      balance: parseFloat(balance).toFixed(2),
      user: {
        name: user?.full_name,
        upi_id: user?.upi_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
