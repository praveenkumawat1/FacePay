const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(
      `[${new Date().toLocaleTimeString()}] 💳 RAZORPAY: Order request for ₹${amount}`,
    );

    if (!amount || isNaN(amount) || amount <= 0) {
      console.error("❌ RAZORPAY: Invalid amount received:", amount);
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const orderOptions = {
      amount: Math.round(amount * 100), // paise me bhejna hai, ensuring integer
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    };

    console.log("📡 RAZORPAY: Creating order via SDK...", orderOptions);
    const order = await razorpay.orders.create(orderOptions);
    console.log("✅ RAZORPAY: Order created successfully:", order.id);

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ RAZORPAY ERROR:", err.message);
    if (err.description) console.error("📝 Description:", err.description);
    if (err.response)
      console.error("📦 Raw Response:", JSON.stringify(err.response));

    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: err.message,
    });
  }
};
