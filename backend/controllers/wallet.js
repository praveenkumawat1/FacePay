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

    // Fetch sender details for receiver's notification
    const sender = await User.findById(senderId).session(session);

    // Update balances
    senderWallet.balance -= amount;
    await senderWallet.save({ session });

    receiverWallet.balance += amount;
    await receiverWallet.save({ session });

    // Create transaction records for both parties
    const senderTxnId = generateTransactionId();
    const receiverTxnId = generateTransactionId();

    // Sender's transaction (debit)
    const senderTxn = await Transaction.create(
      [
        {
          user_id: senderId,
          type: "debit",
          flow: "send",
          amount,
          balance_before: senderWallet.balance + amount,
          balance_after: senderWallet.balance,
          category: category || "Transfer",
          title: `Sent to ${receiver.full_name}`,
          description:
            note || `Flash Pay to ${receiver.upi_id || receiver.mobile}`,
          note: note || "",
          counterparty_id: receiver._id,
          recipient: receiver.full_name,
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
          title: `Received from ${sender.full_name}`,
          description:
            note || `Flash Pay from ${sender.upi_id || sender.mobile}`,
          note: note || "",
          counterparty_id: senderId,
          recipient: sender.full_name,
          status: "success",
          transaction_id: receiverTxnId,
        },
      ],
      { session },
    );

    // Create a Coupon if amount > 100 (Bonus logic)
    let generatedCoupon = null;
    if (amount >= 100) {
      const couponCode =
        "FLASH" + Math.random().toString(36).substr(2, 5).toUpperCase();
      // Assuming a Coupon model exists or we just return it for UI
      generatedCoupon = {
        code: couponCode,
        discount: "10%",
        message: "Flash Pay Bonus",
      };
    }

    // Add notification to receiver
    // Note: Checking if notifications array exists on receiver
    if (receiver.notifications) {
      receiver.notifications.push({
        title: "⚡ Flash Received",
        message: `₹${amount} received from ${sender.full_name}`,
        type: "success",
        read: false,
        time: new Date().toISOString(),
      });
      await receiver.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Return the sender's transaction to frontend with enhanced data
    const newTransaction = {
      id: senderTxnId,
      type: "send",
      category: category || "Transfer",
      recipient: {
        name: receiver.full_name,
        upi: receiver.upi_id,
      },
      amount,
      time: new Date(),
      note: note || "",
      coupon: generatedCoupon,
    };

    res.json({
      success: true,
      transaction: newTransaction,
      message: "Flash Payment Successful",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Send money error:", error);
    res.status(500).json({ success: false, message: "Transaction failed" });
  }
};
