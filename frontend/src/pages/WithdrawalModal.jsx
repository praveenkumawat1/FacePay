import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiArrowRight,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { FiLoader } from "react-icons/fi";
import { toast } from "react-hot-toast";

const WithdrawalModal = ({ open, onClose, balance, onWithdraw, dm, lang }) => {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(""); // 'bank' or 'upi'
  const [destination, setDestination] = useState("");
  const [accountName, setAccountName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [txnDetails, setTxnDetails] = useState(null);

  const minWithdrawal = 100;

  const reset = () => {
    setAmount("");
    setStep(1);
    setMethod("");
    setDestination("");
    setAccountName("");
    setIfsc("");
    setPhone("");
    setOtp("");
    setLoading(false);
    setTxnDetails(null);
  };

  const requestOtp = async () => {
    if (method === "bank") {
      if (!accountName) return toast.error("Account holder name required");
      if (!ifsc || ifsc.length !== 11)
        return toast.error("Valid IFSC required");
    }
    if (!destination) return toast.error("Account/UPI required");

    handleWithdraw();
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("facepay_token");
      const res = await fetch("http://localhost:5000/api/dashboard/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          method,
          destination,
          account_name: accountName,
          ifsc,
          phone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTxnDetails(data);
        onWithdraw(data.balance);
        setStep(4);
      } else {
        toast.error(data.message || "Withdrawal failed");
      }
    } catch (err) {
      toast.error("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border ${
            dm ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
          }`}
        >
          {/* Header - More compact */}
          <div className="relative p-4 text-center border-b border-slate-800/10">
            {step < 4 && (
              <button
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FiX className={dm ? "text-slate-400" : "text-slate-500"} />
              </button>
            )}
            <h2
              className={`text-xl font-black mt-1 ${dm ? "text-white" : "text-slate-900"}`}
            >
              {step === 4 ? "Success!" : "Withdraw Money"}
            </h2>
          </div>

          <div className="p-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div
                  className={`p-3 rounded-2xl ${dm ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-100"}`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${dm ? "text-indigo-400" : "text-indigo-600"}`}
                  >
                    Available Balance
                  </p>
                  <p
                    className={`text-2xl font-black ${dm ? "text-white" : "text-slate-900"}`}
                  >
                    ₹{balance.toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <label
                    className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${dm ? "text-slate-500" : "text-slate-400"}`}
                  >
                    Amount
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-indigo-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className={`w-full bg-transparent border-2 rounded-xl py-3 pl-10 pr-4 text-xl font-bold outline-none transition-all ${dm ? "border-slate-800 focus:border-indigo-500 text-white" : "border-slate-100 focus:border-indigo-500 text-slate-900"}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {["bank", "upi"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`py-3 rounded-xl border-2 font-bold capitalize transition-all ${method === m ? "border-indigo-500 bg-indigo-500/10 text-indigo-500" : dm ? "border-slate-800 text-slate-500 hover:border-slate-700" : "border-slate-100 text-slate-400 hover:border-slate-200"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <button
                  disabled={!amount || !method || amount < minWithdrawal}
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  Next <FiArrowRight />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-indigo-500 underline"
                >
                  ← Back
                </button>

                <div>
                  <label
                    className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${dm ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {method === "bank" ? "Account Number" : "UPI ID"}
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={method === "bank" ? "Acc No" : "name@upi"}
                    className={`w-full bg-transparent border-2 rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all ${dm ? "border-slate-800 focus:border-indigo-500 text-white" : "border-slate-100 focus:border-indigo-500 text-slate-900"}`}
                  />
                </div>

                {method === "bank" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${dm ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="John"
                        className={`w-full bg-transparent border-2 rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all ${dm ? "border-slate-800 focus:border-indigo-500 text-white" : "border-slate-100 focus:border-indigo-500 text-slate-900"}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ${dm ? "text-slate-500" : "text-slate-400"}`}
                      >
                        IFSC
                      </label>
                      <input
                        type="text"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        placeholder="IFSC"
                        maxLength={11}
                        className={`w-full bg-transparent border-2 rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all ${dm ? "border-slate-800 focus:border-indigo-500 text-white" : "border-slate-100 focus:border-indigo-500 text-slate-900"}`}
                      />
                    </div>
                  </div>
                )}

                <div
                  className={`p-3 rounded-xl text-xs ${dm ? "bg-slate-800/50" : "bg-slate-50"}`}
                >
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Total Payout</span>
                    <span className="text-indigo-500">₹{amount}</span>
                  </div>
                </div>

                <button
                  disabled={loading || !destination}
                  onClick={requestOtp}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  {loading ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    "Verify Identity"
                  )}
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5 text-center"
              >
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                  OTP
                </div>
                <div>
                  <h3
                    className={`font-bold ${dm ? "text-white" : "text-slate-900"}`}
                  >
                    Verify Withdrawal
                  </h3>
                  <p
                    className={`text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Enter the 6-digit code sent to your email.
                  </p>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`w-40 mx-auto bg-transparent border-b-2 py-2 text-3xl text-center font-black outline-none transition-all tracking-[0.5em] ${dm ? "border-slate-800 focus:border-indigo-500 text-white" : "border-slate-200 focus:border-indigo-500 text-slate-900"}`}
                  placeholder="000000"
                />
                <button
                  disabled={loading || otp.length < 6}
                  onClick={handleWithdraw}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    "Confirm Payout"
                  )}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-slate-500 font-medium"
                >
                  Changed details? Go back
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6 text-center py-4"
              >
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-3xl shadow-lg shadow-green-500/30">
                  <FiCheckCircle />
                </div>
                <div>
                  <h2
                    className={`text-2xl font-black ${dm ? "text-white" : "text-slate-900"}`}
                  >
                    ₹{amount} Sent!
                  </h2>
                  <p
                    className={`text-xs mt-1 ${dm ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Transaction processed successfully.
                  </p>
                </div>
                <div
                  className={`p-4 rounded-2xl border text-left space-y-2 ${dm ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"}`}
                >
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Transaction ID</span>
                    <span className={dm ? "text-slate-300" : "text-slate-700"}>
                      {txnDetails?.transaction_id || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Destination</span>
                    <span className={dm ? "text-slate-300" : "text-slate-700"}>
                      {destination}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Status</span>
                    <span className="text-green-500">COMPLETED</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-black hover:opacity-90 transition-all shadow-xl"
                >
                  DONE
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WithdrawalModal;
