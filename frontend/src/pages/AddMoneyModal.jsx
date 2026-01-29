import { FiPlus, FiX, FiInfo, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const ADD_MONEY_PRESETS = [100, 500, 1000, 2000];
const ADD_MONEY_FEE = 2;

export default function AddMoneyModal({ open, onClose, onAdd }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const netAmount = amount ? Math.max(Number(amount) - ADD_MONEY_FEE, 0) : 0;

  const handleAdd = () => {
    const num = Number(amount);
    if (!num || num < 1) {
      setError("Please enter amount");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      setLoading(false);
      onAdd(num);
      setAmount("");
      onClose();
    }, 1400);
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
            className="w-full max-w-[380px] mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
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
                  <p className="text-sm text-gray-500">Submitted Now</p>
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

            {/* Pending / Status Bar (image jaisa) */}
            <div className="mx-6 mb-6 bg-blue-50/50 rounded-xl py-3 px-4 flex items-center gap-3 border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">Processing</p>
                <p className="text-xs text-blue-600">Pending confirmation</p>
              </div>
              <FiInfo className="text-blue-500" />
            </div>

            {/* Fee & Details Section */}
            <div className="px-6 pb-8 space-y-4 text-sm border-t border-gray-100 pt-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                    <span className="text-xs">₹</span>
                  </div>
                  <span>Wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-yellow-100 flex items-center justify-center">
                    <span className="text-xs">₹</span>
                  </div>
                  <span className="font-medium text-gray-800">You</span>
                </div>
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
                onClick={handleAdd}
                className={`w-full py-4 rounded-2xl font-semibold text-base shadow-md transition-all ${
                  loading || !amount || netAmount <= 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "Processing..." : "Confirm & Add"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
