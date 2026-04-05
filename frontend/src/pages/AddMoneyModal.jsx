import { FiPlus, FiX, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const ADD_MONEY_PRESETS = [100, 500, 1000, 2000];
const ADD_MONEY_FEE = 2;
const API_URL = "http://localhost:5000/api";
const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_xxxxxxxx";

export default function AddMoneyModal({ open, onClose, onAdd }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 Dynamically load Razorpay script only when modal is open
  useEffect(() => {
    if (open && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [open]);

  const netAmount = amount ? Math.max(Number(amount) - ADD_MONEY_FEE, 0) : 0;

  // Razorpay Payment Integration
  const handleRazorpayPayment = async () => {
    const num = Number(amount);
    if (!num || num < 1) {
      setError("Please enter a valid amount");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("facepay_token");
      const res = await fetch(`${API_URL}/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: num }),
      });
      const data = await res.json();

      if (!data.success || (!data.order && !data.order_id)) {
        setError(data.message || "Failed to create payment order");
        setLoading(false);
        return;
      }

      const orderId = data.order_id || data.order?.id;
      const orderAmount = data.amount_in_paise || data.order?.amount;

      // 2. Open Razorpay Checkout
      const options = {
        key: data.key_id || RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: data.currency || "INR",
        name: "FacePay",
        description: "Add Money to Wallet",
        order_id: orderId,
        handler: async function (response) {
          setLoading(true);
          setError("");
          try {
            const confirmRes = await fetch(`${API_URL}/dashboard/add-money`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                amount: num,
                payment_method: "razorpay",
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const confirmData = await confirmRes.json();
            setLoading(false);

            if (confirmData.success) {
              onAdd(confirmData.wallet.balance);
              setAmount("");
              onClose();
            } else {
              setError(
                confirmData.message || "Money add failed after payment.",
              );
            }
          } catch (err) {
            setLoading(false);
            setError("Server error after payment: " + err.message);
          }
        },
        prefill: {},
        theme: { color: "#4f46e5" },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      setLoading(false);

      if (!window.Razorpay) {
        setError("Razorpay is not loaded. Please refresh and try again.");
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError("Payment failed: " + err.message);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-[380px] mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative"
          >
            {/* -- Close Button (✕) -- */}
            <button
              type="button"
              onClick={() => {
                if (!loading) {
                  setAmount("");
                  setError("");
                  onClose();
                }
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 rounded-full p-2 transition-colors z-20"
              title="Close"
              disabled={loading}
            >
              <FiX size={22} />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiPlus className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Adding to Wallet
                  </h3>
                  <p className="text-sm text-gray-500">Real Money Transfer</p>
                </div>
              </div>
            </div>

            {/* Big Amount */}
            <div className="px-6 py-8 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-5xl font-bold text-gray-900">₹</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  className="text-5xl font-bold text-gray-900 bg-transparent outline-none text-center w-40 placeholder:text-gray-300 caret-blue-600"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
              )}
            </div>

            {/* Presets */}
            <div className="px-6 pb-6 grid grid-cols-4 gap-3">
              {ADD_MONEY_PRESETS.map((val) => (
                <button
                  key={val}
                  className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                    amount === val.toString()
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                  onClick={() => setAmount(val.toString())}
                  disabled={loading}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            {/* Info Bar */}
            <div className="mx-6 mb-6 bg-blue-50/50 rounded-xl py-3 px-4 flex items-center gap-3 border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  Secure Razorpay Payment
                </p>
                <p className="text-xs text-blue-600">
                  Bank to wallet, real money
                </p>
              </div>
              <FiInfo className="text-blue-500" />
            </div>

            {/* Fee & Details */}
            <div className="px-6 pb-8 space-y-4 text-sm border-t border-gray-100 pt-5">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-xs">
                    ₹
                  </span>
                  Wallet
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-yellow-100 flex items-center justify-center text-xs">
                    ₹
                  </span>
                  <span className="font-medium text-gray-800">You</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Network Fee</span>
                <span className="font-medium text-gray-800">
                  ₹{ADD_MONEY_FEE}
                </span>
              </div>
            </div>

            {/* Add Button */}
            <div className="px-6 pb-6">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={loading || !amount || netAmount <= 0}
                onClick={handleRazorpayPayment}
                className={`w-full py-4 rounded-2xl font-semibold text-base shadow-md transition-all ${
                  loading || !amount || netAmount <= 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "Processing..." : "Confirm & Pay"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
