const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to generate transaction ID (same as in transactionController)
function generateTransactionId() {
  return (
    "TXN" +
    Date.now().toString(36).toUpperCase() +
    Math.floor(Math.random() * 1000000)
  );
}

// Get wallet balance
exports.getBalance = async (req, res) => {
  try {
    const userId = req.userId;
    const wallet = await Wallet.findOne({ user_id: userId });
    res.json({ success: true, balance: wallet?.balance || 0 });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch balance" });
  }
};

// Send money to another user (by email, mobile, or UPI ID)
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

    // Get receiver wallet (create if not exists – safety)
    let receiverWallet = await Wallet.findOne({
      user_id: receiver._id,
    }).session(session);
    if (!receiverWallet) {
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

    // Sender's transaction (debit)
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

    // Receiver's transaction (credit)
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
          title: `Received from ${senderWallet.user_id}`, // optionally fetch sender's name
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

    // Optionally add notification to receiver
    if (receiver.notifications) {
      receiver.notifications.push({
        title: "Money Received",
        message: `₹${amount} received from ${senderWallet.user_id}`,
        type: "success",
        read: false,
        time: new Date().toISOString(),
      });
      await receiver.save({ session });
    }

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
