import React, { useState, useEffect } from "react";
import {
  FiCreditCard,
  FiSend,
  FiDownload,
  FiCamera,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiPlus,
  FiX,
  FiUserCheck,
  FiLink,
  FiGift,
  FiAlertTriangle,
  FiCopy,
  FiBell,
  FiMessageCircle,
  FiMail,
  FiHelpCircle,
  FiArrowRight,
  FiSmartphone,
  FiActivity,
  FiShield,
  FiSearch,
  FiChevronRight,
  FiTrendingUp,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK DATA ---
const MOCK_TRANSACTIONS = [
  {
    id: 1,
    title: "Amazon Order",
    meta: "#12311",
    amount: -750,
    status: "success",
    date: "Today, 10:23 AM",
    icon: "🛍️",
  },
  {
    id: 2,
    title: "Swiggy Food",
    meta: "#12932",
    amount: -250,
    status: "success",
    date: "Yesterday, 8:15 PM",
    icon: "🍔",
  },
  {
    id: 3,
    title: "Salary Credited",
    meta: "Tech Solutions",
    amount: 45000,
    status: "success",
    date: "25 Jan, 9:00 AM",
    icon: "💰",
  },
  {
    id: 4,
    title: "Mobile Recharge",
    meta: "+91 98*** ***12",
    amount: -299,
    status: "failed",
    date: "22 Jan, 4:30 PM",
    icon: "📱",
  },
];

const BANKS = [
  {
    id: 1,
    name: "HDFC Bank",
    last4: "8271",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg",
    status: "Primary",
  },
  {
    id: 2,
    name: "SBI Bank",
    last4: "1102",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg",
    status: "Linked",
  },
];

const WALLET_UPI = "praveen@facepay";

// --- COMPONENTS ---

// 1. ADD MONEY MODAL (New Feature)
function AddMoneyModal({ open, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("input"); // input, processing, success
  const [method, setMethod] = useState("upi");

  const quickAmounts = [100, 500, 1000, 2000];

  const handlePay = () => {
    if (!amount) return;
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      onSuccess(parseFloat(amount));
    }, 2000);
  };

  const reset = () => {
    setAmount("");
    setStep("input");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          >
            {step === "input" && (
              <>
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Add Money</h2>
                  <button
                    onClick={onClose}
                    className="p-2 bg-gray-50 rounded-full hover:bg-gray-100"
                  >
                    <FiX />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-2">
                    Enter Amount
                  </p>
                  <div className="relative mb-6">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      autoFocus
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 text-4xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-indigo-600 outline-none pb-2 bg-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex gap-2 mb-8">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAmount(amt)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-3">
                    Payment Method
                  </p>
                  <div className="space-y-3 mb-8">
                    <div
                      onClick={() => setMethod("upi")}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${method === "upi" ? "border-indigo-600 bg-indigo-50" : "border-gray-200"}`}
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                        <FiSmartphone className="text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">
                          UPI Apps
                        </p>
                        <p className="text-xs text-gray-500">
                          Google Pay, PhonePe, Paytm
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === "upi" ? "border-indigo-600" : "border-gray-300"}`}
                      >
                        {method === "upi" && (
                          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div
                      onClick={() => setMethod("card")}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${method === "card" ? "border-indigo-600 bg-indigo-50" : "border-gray-200"}`}
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                        <FiCreditCard className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">
                          Credit/Debit Card
                        </p>
                        <p className="text-xs text-gray-500">
                          Visa, Mastercard
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === "card" ? "border-indigo-600" : "border-gray-300"}`}
                      >
                        {method === "card" && (
                          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={!amount}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all"
                  >
                    Proceed to Add ₹{amount || 0}
                  </button>
                </div>
              </>
            )}

            {step === "processing" && (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-gray-900">
                  Processing Payment
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                  Please wait while we secure your transaction...
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="p-12 flex flex-col items-center justify-center text-center bg-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm"
                >
                  <FiCheckCircle />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Money Added!
                </h3>
                <p className="text-gray-500 text-sm mt-2 mb-8">
                  ₹{amount} has been added to your wallet successfully.
                </p>
                <button
                  onClick={reset}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 2. Notification Slide-over
function NotificationsSheet({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-sm bg-white shadow-2xl border-l border-gray-100 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <FiBell className="text-indigo-600" /> Notifications
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-800"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div className="p-4 hover:bg-indigo-50/50 rounded-xl transition-colors cursor-pointer border-b border-gray-50">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                    <FiGift />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Cashback Received
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      You received ₹50 cashback on your last electricity bill
                      payment.
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                      2 mins ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// 3. Support Modal
function SupportModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">Help & Support</h2>
                <p className="text-indigo-200 text-sm mt-1">
                  We are here to help you 24/7
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white/20 p-2 rounded-full hover:bg-white/30"
              >
                <FiX />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 transition-all group">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FiMessageCircle size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Chat with Us</p>
                  <p className="text-xs text-gray-500">
                    Instant support via WhatsApp
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- MAIN PAGE ---
export default function Wallet() {
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(15720.5);
  const [showNotif, setShowNotif] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false); // Modal State
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCardDetails, setShowCardDetails] = useState(false); // Virtual Card Toggle

  const filteredTxns =
    statusFilter === "all"
      ? MOCK_TRANSACTIONS
      : MOCK_TRANSACTIONS.filter((t) => t.status === statusFilter);

  const handleMoneyAdded = (addedAmount) => {
    setBalance((prev) => prev + addedAmount);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-10">
      {/* 1. TOP HEADER */}
      <header className="bg-white sticky top-0 z-40 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <FiCreditCard className="text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              FacePay Wallet
            </h1>
            <p className="text-xs text-gray-500 font-medium">Secure & Fast</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSupport(true)}
            className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
          >
            <FiHelpCircle size={22} />
          </button>
          <button
            onClick={() => setShowNotif(true)}
            className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiBell size={22} />
            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-100 transition-all">
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (Span 8) */}
        <div className="lg:col-span-8 space-y-8">
          {/* 2. MAIN WALLET CARD (Credit Card Style) */}
          <div className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-500/20 group">
            {/* Background Gradient & Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5] to-[#3730a3]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-10 transition-opacity duration-500"></div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-indigo-200 text-sm font-medium tracking-wide uppercase mb-1">
                    Total Balance
                  </p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-5xl font-bold tracking-tight">
                      {showBalance
                        ? `₹${balance.toLocaleString()}`
                        : "••••••••"}
                    </h2>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {showBalance ? (
                        <FiEyeOff size={22} />
                      ) : (
                        <FiEye size={22} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                  <FiShield className="text-green-300" />
                  <span className="text-xs font-bold tracking-wide">
                    FaceAuth Active
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-8">
                <div>
                  <p className="text-xs text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Virtual Card
                    <button
                      onClick={() => setShowCardDetails(!showCardDetails)}
                      className="opacity-70 hover:opacity-100"
                    >
                      <FiEye size={12} />
                    </button>
                  </p>
                  <div className="flex items-center gap-4 font-mono text-lg tracking-widest opacity-90">
                    <span>4821</span>
                    <span>8812</span>
                    <span>{showCardDetails ? "4591" : "••••"}</span>
                    <span>{showCardDetails ? "9921" : "••••"}</span>
                  </div>
                  {showCardDetails && (
                    <div className="flex gap-4 mt-1 text-xs text-indigo-200 font-bold">
                      <span>EXP: 09/28</span>
                      <span>CVV: 882</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons inside Card */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddMoney(true)}
                    className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <FiPlus size={16} /> Add Money
                  </button>
                  <button className="bg-indigo-800/50 backdrop-blur-md border border-white/20 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700/50 transition-all">
                    <FiDownload size={16} /> Statement
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2.5 SPENDING GRAPH (Visual Aid) */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 w-full">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiTrendingUp className="text-indigo-600" /> Spending Analysis
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Your weekly expenses summary
              </p>

              {/* CSS Bar Chart */}
              <div className="mt-6 flex items-end gap-2 h-24 w-full">
                {[40, 70, 30, 85, 50, 60, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col justify-end group cursor-pointer"
                  >
                    <div
                      className="w-full bg-indigo-50 rounded-t-lg group-hover:bg-indigo-600 transition-all duration-300 relative"
                      style={{ height: `${h}%` }}
                    >
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        ₹{h * 100}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* 3. QUICK ACTIONS GRID */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: <FiSend />,
                  label: "Send Money",
                  color: "text-indigo-600 bg-indigo-50",
                },
                {
                  icon: <FiCamera />,
                  label: "Scan & Pay",
                  color: "text-purple-600 bg-purple-50",
                },
                {
                  icon: <FiActivity />,
                  label: "Self Transfer",
                  color: "text-blue-600 bg-blue-50",
                },
                {
                  icon: <FiSmartphone />,
                  label: "Recharge",
                  color: "text-green-600 bg-green-50",
                },
              ].map((action, i) => (
                <motion.button
                  key={i}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 group"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${action.color} group-hover:scale-110 transition-transform`}
                  >
                    {action.icon}
                  </div>
                  <span className="font-bold text-gray-700 text-sm">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* 4. TRANSACTIONS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Transactions</h3>
              <div className="flex bg-gray-50 p-1 rounded-lg">
                {["all", "success", "failed"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setStatusFilter(t)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${statusFilter === t ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {filteredTxns.length > 0 ? (
                filteredTxns.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-xl group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                        {txn.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {txn.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>{txn.date}</span>
                          <span>•</span>
                          <span>{txn.meta}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-bold text-sm ${txn.amount > 0 ? "text-green-600" : "text-gray-900"}`}
                      >
                        {txn.amount > 0 ? "+" : ""}
                        {txn.amount.toLocaleString()}
                      </div>
                      <div
                        className={`text-[10px] font-bold uppercase mt-1 px-2 py-0.5 rounded-full inline-block ${txn.status === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                      >
                        {txn.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 text-sm">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Span 4) */}
        <div className="lg:col-span-4 space-y-8">
          {/* 5. LINKED ACCOUNTS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <FiLink /> Accounts
              </h3>
              <button className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors">
                <FiPlus />
              </button>
            </div>

            <div className="space-y-4">
              {BANKS.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-white rounded-xl p-2 border border-gray-100 flex items-center justify-center group-hover:border-indigo-50">
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-gray-900">
                      {bank.name}
                    </h4>
                    <p className="text-xs text-gray-500">•••• {bank.last4}</p>
                  </div>
                  {bank.status === "Primary" && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 6. SECURITY STATUS */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-500 text-2xl shadow-sm">
                <FiShield />
              </div>
              <div>
                <h3 className="font-bold text-green-900">System Secure</h3>
                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                  FaceID is active. Your wallet is protected by biometric
                  authentication.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-100 flex justify-between items-center">
              <span className="text-xs font-bold text-green-800">
                Last scan: 10 mins ago
              </span>
              <button className="text-xs font-bold bg-white text-green-700 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all">
                Check Now
              </button>
            </div>
          </div>

          {/* 7. PROMO BANNER */}
          <div className="relative overflow-hidden bg-gray-900 rounded-3xl p-6 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[50px] opacity-40"></div>
            <div className="relative z-10">
              <FiGift className="text-3xl text-yellow-400 mb-3" />
              <h3 className="font-bold text-lg">Refer & Earn ₹500</h3>
              <p className="text-sm text-gray-400 mt-1 mb-4">
                Invite friends to FacePay and get instant rewards.
              </p>
              <button className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                Invite Friends
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- FLOATING HELP --- */}
      <button
        onClick={() => setShowSupport(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/40 hover:scale-110 transition-transform"
      >
        <FiMessageCircle size={24} />
      </button>

      {/* MODALS */}
      <AddMoneyModal
        open={showAddMoney}
        onClose={() => setShowAddMoney(false)}
        onSuccess={handleMoneyAdded}
      />
      <NotificationsSheet
        open={showNotif}
        onClose={() => setShowNotif(false)}
      />
      <SupportModal open={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
}
