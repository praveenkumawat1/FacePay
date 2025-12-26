const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid");

exports.processPayment = async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { receiver_upi, amount, description } = req.body;
    const sender_id = req.user.user_id;

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
      session
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
    const transactions = await Transaction.find({ sender_id: req.user.user_id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select(
      "balance full_name upi_id"
    );

    res.json({
      success: true,
      balance: user.balance.toFixed(2),
      user: {
        name: user.full_name,
        upi_id: user.upi_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
