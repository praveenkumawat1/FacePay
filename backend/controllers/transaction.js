const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to generate transaction ID
function generateTransactionId() {
  return (
    "TXN" +
    Date.now().toString(36).toUpperCase() +
    Math.floor(Math.random() * 1000000)
  );
}

// Get transaction history for the logged-in user
exports.getHistory = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all transactions where the user is involved:
    // - as the owner (user_id)
    // - as the sender (sender field)
    // - as the recipient (recipient field)
    const transactions = await Transaction.find({
      $or: [{ user_id: userId }, { sender: userId }, { recipient: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Map to frontend format expected by SendMoneyPremium.jsx
    const formatted = transactions.map((t) => ({
      id: t._id,
      // Determine user-facing type based on flow or infer from fields
      type: t.flow || (t.sender?.toString() === userId ? "send" : "receive"),
      category: t.category || "Other",
      // Use recipient field if available, otherwise counterparty name/ID
      name: t.recipient || (t.counterparty_id ? "User" : "Unknown"),
      amount: t.amount,
      time: t.createdAt,
      details: t.note || t.description || "",
      transactionId: t.transaction_id,
      avatar: null, // optional – can be populated later
    }));

    res.json({ success: true, transactions: formatted });
  } catch (error) {
    console.error("Get history error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch transactions" });
  }
};

// Send money
exports.sendMoney = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const senderId = req.userId;
    const { recipient, amount, note, category } = req.body;

    // Validate input
    if (!recipient || !amount || amount <= 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Invalid recipient or amount" });
    }

    // Find receiver by email, mobile, or upi_id
    const receiver = await User.findOne({
      $or: [{ email: recipient }, { mobile: recipient }, { upi_id: recipient }],
    });
    if (!receiver) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Receiver not found" });
    }

    // Get sender wallet
    const senderWallet = await Wallet.findOne({ user_id: senderId }).session(
      session,
    );
    if (!senderWallet || senderWallet.balance < amount) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });
    }

    // Get receiver wallet
    let receiverWallet = await Wallet.findOne({
      user_id: receiver._id,
    }).session(session);
    if (!receiverWallet) {
      // Create wallet if not exists (should not happen, but safety)
      receiverWallet = await Wallet.create(
        [
          {
            user_id: receiver._id,
            wallet_key: `W-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            balance: 0,
          },
        ],
        { session },
      );
      receiverWallet = receiverWallet[0];
    }

    // Update balances
    senderWallet.balance -= amount;
    await senderWallet.save({ session });

    receiverWallet.balance += amount;
    await receiverWallet.save({ session });

    // Create transaction records for both parties
    const senderTxnId = generateTransactionId();
    const receiverTxnId = generateTransactionId();

    await Transaction.create(
      [
        {
          user_id: senderId,
          type: "debit",
          flow: "send",
          amount,
          balance_before: senderWallet.balance + amount,
          balance_after: senderWallet.balance,
          category: category || "Transfer",
          title: `Sent to ${recipient}`,
          description: note || "",
          note: note || "",
          counterparty_id: receiver._id,
          recipient: recipient,
          status: "success",
          transaction_id: senderTxnId,
        },
      ],
      { session },
    );

    await Transaction.create(
      [
        {
          user_id: receiver._id,
          type: "credit",
          flow: "receive",
          amount,
          balance_before: receiverWallet.balance - amount,
          balance_after: receiverWallet.balance,
          category: category || "Transfer",
          title: `Received from ${senderWallet.user_id}`, // you may want to fetch sender's name
          description: note || "",
          note: note || "",
          counterparty_id: senderId,
          recipient: recipient, // optional
          status: "success",
          transaction_id: receiverTxnId,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // Return the sender's transaction to frontend
    const newTransaction = {
      _id: senderTxnId,
      type: "send",
      category: category || "Transfer",
      name: recipient,
      amount,
      time: new Date(),
      details: note || "",
      transactionId: senderTxnId,
    };

    res.json({
      success: true,
      transaction: newTransaction,
      message: "Money sent successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Send money error:", error);
    res.status(500).json({ success: false, message: "Transaction failed" });
  }
};
