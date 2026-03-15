const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise me bhejna hai
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay order error:", err.message);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};
