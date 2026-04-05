const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const { v4: uuidv4 } = require("uuid");
const { sendNotification } = require("../utils/notification");

exports.processPayment = async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { receiver_upi, amount, description } = req.body;
    const sender_id = req.userId || req.user?.user_id;

    if (!sender_id) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    if (!receiver_upi || !amount) {
      throw new Error("Receiver UPI and amount required");
    }

    const paymentAmount = parseFloat(amount);

    const sender = await User.findById(sender_id).session(session);

    if (!sender) throw new Error("Sender not found");

    if (sender.balance < paymentAmount) {
      throw new Error(`Insufficient balance.  Available: ₹${sender.balance}`);
    }

    const receiver = await User.findOne({ upi_id: receiver_upi }).session(
      session,
    );

    if (!receiver) throw new Error("Receiver UPI ID not found");

    if (sender._id.toString() === receiver._id.toString()) {
      throw new Error("Cannot send money to yourself");
    }

    sender.balance -= paymentAmount;
    receiver.balance += paymentAmount;

    await sender.save({ session });
    await receiver.save({ session });

    const transaction_id = `TXN${uuidv4().substring(0, 10).toUpperCase()}`;

    const newTransaction = new Transaction({
      transaction_id,
      sender_id: sender._id,
      receiver_upi,
      receiver_name: receiver.full_name,
      amount: paymentAmount,
      face_verified: true,
      face_match_score: 0.92,
      status: "SUCCESS",
      description: description || "Payment",
      completed_at: new Date(),
    });

    await newTransaction.save({ session });

    await sendNotification(sender._id, {
      title: "Payment Sent",
      message: `Successfully transferred ₹${paymentAmount} to ${receiver.full_name}.`,
      type: "success",
    });

    await sendNotification(receiver._id, {
      title: "Money Received",
      message: `You've received ₹${paymentAmount} from ${sender.full_name}.`,
      type: "success",
    });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Payment successful",
      transaction: {
        transaction_id,
        amount: paymentAmount,
        receiver: receiver.full_name,
        receiver_upi,
        new_balance: sender.balance.toFixed(2),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
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
