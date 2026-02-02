import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FiCreditCard,
  FiSend,
  FiPocket,
  FiDownload,
  FiCamera,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiPlus,
  FiBell,
  FiGift,
  FiMessageCircle,
  FiX,
  FiSearch,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowUpRight,
  FiArrowDownLeft,
} from "react-icons/fi";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserProfile } from "../services/api";

// Assuming AddMoneyModal is in the same directory
import AddMoneyModal from "./AddMoneyModal";

// --- THEME CONSTANTS ---
const COLORS = {
  bgGradient: "bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f5f3ff]",
  cardBg: "rgba(255, 255, 255, 0.75)",
  glassEffect: {
    background: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.04)",
  },
};

// --- MOCK DATA ---
const MOCK_TRANSACTIONS = [
  {
    id: 1,
    title: "Spotify Subscription",
    amount: -119,
    status: "success",
    date: "2026-02-01T10:00:00Z",
    category: "Entertainment",
  },
  {
    id: 2,
    title: "Salary Credited",
    amount: 45000,
    status: "success",
    date: "2026-02-01T09:00:00Z",
    category: "Salary",
  },
  {
    id: 3,
    title: "Zomato Order",
    amount: -450,
    status: "success",
    date: "2026-01-31T20:15:00Z",
    category: "Food",
  },
  {
    id: 4,
    title: "Mobile Recharge",
    amount: -299,
    status: "failed",
    date: "2026-01-30T14:00:00Z",
    category: "Utility",
  },
  {
    id: 5,
    title: "Rahul Transfer",
    amount: -2000,
    status: "success",
    date: "2026-01-29T18:30:00Z",
    category: "Transfer",
  },
  {
    id: 6,
    title: "Cashback Received",
    amount: 50,
    status: "success",
    date: "2026-01-28T12:00:00Z",
    category: "Reward",
  },
];

// --- SUB-COMPONENTS ---

const ActionButton = ({ icon, label, onClick, delay }) => (
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay, duration: 0.3 }}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="group relative flex flex-col items-center justify-center p-4 rounded-2xl w-full transition-all duration-200"
    style={COLORS.glassEffect}
  >
    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
      <span className="text-xl">{icon}</span>
    </div>
    <span className="text-xs font-bold text-slate-600 tracking-wide uppercase group-hover:text-slate-900">
      {label}
    </span>
  </motion.button>
);

// --- MAIN COMPONENT ---

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === "/dashboard";

  // Data States - FIXED INITIAL STATE
  const [user, setUser] = useState({ name: "Guest User" });
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI States
  const [showBalance, setShowBalance] = useState(true);
  const [notiCount, setNotiCount] = useState(3);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);

  // AI States
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        // In real app, redirect if no token
        // if (!token) navigate("/");

        try {
          const result = await getUserProfile(token);

          // --- FIX IS HERE: Robust Fallbacks ---
          const userData = result.user || {};
          // If name is missing, give a default
          if (!userData.name) userData.name = "Guest User";

          setUser(userData);
          setWallet(result.wallet || { balance: 0, wallet_key: "W-PENDING" });
        } catch (apiError) {
          // Fallback for Demo/Error
          console.warn("API Error, using mock data");
          setUser({ name: "Praveen Kumawat" });
          setWallet({ balance: 12500.5, wallet_key: "W-8821-9921" });
        }
      } catch (error) {
        console.error("Critical Profile Error", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  // Derived Data
  const filteredTransactions = useMemo(() => {
    if (filterType === "all") return MOCK_TRANSACTIONS;
    return MOCK_TRANSACTIONS.filter((t) =>
      filterType === "income" ? t.amount > 0 : t.amount < 0,
    );
  }, [filterType]);

  // Handlers
  const handleAISubmit = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse("");

    setTimeout(() => {
      const lowerQ = aiQuery.toLowerCase();
      let resp =
        "I'm not sure about that. Try asking about your balance or spending.";
      if (lowerQ.includes("spend") || lowerQ.includes("expense"))
        resp =
          "You spent ₹2,800 on Food & Dining this month. That's 15% more than last month.";
      if (lowerQ.includes("balance"))
        resp = `Your current balance is ₹${wallet?.balance?.toLocaleString()}.`;
      if (lowerQ.includes("save"))
        resp = "You saved ₹500 from coupons this week! Great job.";

      setAiResponse(resp);
      setAiLoading(false);
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Helper to safely get First Name
  const getFirstName = () => {
    if (!user || !user.name) return "User";
    return user.name.split(" ")[0];
  };

  // Helper to safely get Initial
  const getInitial = () => {
    if (!user || !user.name) return "U";
    return user.name.charAt(0);
  };

  return (
    <div
      className={`min-h-screen ${COLORS.bgGradient} font-sans text-slate-800`}
    >
      <Sidebar onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="md:ml-72 flex flex-col px-4 sm:px-6 lg:px-8 py-6 min-h-screen transition-all duration-300 -mt-[45em] ">
        {/* Top Header Bar */}
        {isRoot && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          >
            <div>
              {/* FIX: Using Helper function to prevent crash */}
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Hello, {getFirstName()} <span className="text-2xl">👋</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="hidden md:flex items-center bg-white px-3 py-2 rounded-full border border-slate-200 shadow-sm">
                <FiSearch className="text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm outline-none w-32 placeholder-slate-400"
                />
              </div>

              <button
                onClick={() => setNotiCount(0)}
                className="relative p-2.5 bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <FiBell className="text-slate-600 text-lg" />
                {notiCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {notiCount}
                  </span>
                )}
              </button>

              {/* FIX: Using Helper function */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white cursor-pointer hover:scale-105 transition-transform">
                {getInitial()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Dashboard Content */}
        {isRoot && (
          <div className="space-y-6 max-w-7xl mx-auto w-full">
            {/* 1. Wallet Card & Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Main Wallet Card */}
              <div
                className="lg:col-span-2 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
                  color: "white",
                }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium tracking-wide uppercase mb-1">
                        Total Balance
                      </p>
                      <div className="flex items-center gap-3">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                          {showBalance
                            ? `₹${wallet?.balance?.toLocaleString() || "0"}`
                            : "••••••••"}
                        </h2>
                        <button
                          onClick={() => setShowBalance(!showBalance)}
                          className="opacity-70 hover:opacity-100 transition-opacity"
                        >
                          {showBalance ? (
                            <FiEyeOff size={20} />
                          ) : (
                            <FiEye size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                      <FiCheckCircle className="text-green-400" />
                      <span className="text-xs font-semibold">Verified</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                    <div className="text-sm text-indigo-200 font-mono bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                      WALLET ID: {wallet?.wallet_key || "----"}
                    </div>
                    <button
                      onClick={() => setShowAddMoney(true)}
                      className="bg-white text-indigo-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                    >
                      <FiPlus className="text-lg" /> Add Money
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side Stats / Promo */}
              <div className="grid grid-rows-2 gap-4">
                {/* Offer Card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  onClick={() => setShowRewards(true)}
                  className="rounded-3xl p-5 cursor-pointer flex flex-col justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-all border border-indigo-100 bg-white"
                >
                  <div className="absolute right-0 top-0 w-24 h-24 bg-purple-100 rounded-full -mr-4 -mt-4 opacity-50"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                      <FiGift size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Rewards</h3>
                      <p className="text-xs text-slate-500">
                        1 new scratch card available
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* AI Assistant Card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  onClick={() => setShowAIAssist(true)}
                  className="rounded-3xl p-5 cursor-pointer flex flex-col justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-all border border-blue-100 bg-white"
                >
                  <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-50 rounded-full -mr-4 -mb-4 opacity-50"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                      <FiMessageCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">Ask AI</h3>
                      <p className="text-xs text-slate-500">
                        Analyze your spending habits
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* 2. Quick Actions */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 ml-1">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ActionButton icon={<FiSend />} label="Send" delay={0.1} />
                <ActionButton icon={<FiPocket />} label="Request" delay={0.2} />
                <ActionButton
                  icon={<FiDownload />}
                  label="Withdraw"
                  delay={0.3}
                />
                <ActionButton icon={<FiCamera />} label="Scan QR" delay={0.4} />
              </div>
            </section>

            {/* 3. Recent Transactions */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Recent Activity
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                    {MOCK_TRANSACTIONS.length}
                  </span>
                </h3>

                {/* Filters */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-max">
                  {["all", "income", "expense"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filterType === f ? "bg-white shadow text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <AnimatePresence>
                  {filteredTransactions.map((txn, idx) => (
                    <motion.div
                      key={txn.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex items-center justify-between p-4 rounded-xl hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            txn.amount > 0
                              ? "bg-green-100 text-green-600"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {txn.amount > 0 ? (
                            <FiArrowDownLeft />
                          ) : (
                            <FiArrowUpRight />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                            {txn.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>
                              {new Date(txn.date).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{txn.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold text-sm ${txn.amount > 0 ? "text-green-600" : "text-slate-900"}`}
                        >
                          {txn.amount > 0 ? "+" : ""}
                          {txn.amount.toLocaleString()}
                        </div>
                        <div
                          className={`text-[10px] font-bold uppercase mt-1 ${txn.status === "success" ? "text-green-500" : "text-red-500"}`}
                        >
                          {txn.status}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredTransactions.length === 0 && (
                  <div className="py-10 text-center text-slate-400 text-sm">
                    No transactions found.
                  </div>
                )}
              </div>

              <button className="w-full mt-4 py-3 text-center text-indigo-600 text-sm font-bold hover:bg-indigo-50 rounded-xl transition-colors">
                View All History
              </button>
            </section>
          </div>
        )}

        {/* --- MODALS --- */}

        {/* AI Assistant Modal */}
        <AnimatePresence>
          {showAIAssist && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowAIAssist(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative overflow-hidden"
              >
                <button
                  onClick={() => setShowAIAssist(false)}
                  className="absolute right-5 top-5 text-slate-400 hover:text-slate-800"
                >
                  <FiX size={20} />
                </button>

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    AI Financial Assistant
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Ask about expenses, savings, or tips!
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 min-h-[100px] flex items-center justify-center text-center text-sm text-slate-600 border border-slate-100 mb-4">
                  {aiLoading ? (
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  ) : aiResponse ? (
                    <span className="font-medium text-indigo-800 leading-relaxed">
                      {aiResponse}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">
                      "How much did I spend on food?"
                    </span>
                  )}
                </div>

                <form onSubmit={handleAISubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!aiQuery.trim() || aiLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiArrowUpRight />
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rewards Modal */}
        <AnimatePresence>
          {showRewards && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowRewards(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white w-full max-w-sm rounded-3xl p-6 text-center relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowRewards(false)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-800"
                >
                  <FiX size={20} />
                </button>
                <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  🎁
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  You won a Scratch Card!
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Claim your reward now to win up to ₹500 cashback.
                </p>
                <button
                  onClick={() => setShowRewards(false)}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                >
                  Claim Now
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Money Modal (External) */}
        <AddMoneyModal
          open={showAddMoney}
          onClose={() => setShowAddMoney(false)}
          onAdd={(amt) => {
            setWallet((prev) => ({
              ...prev,
              balance: (prev?.balance || 0) + amt,
            }));
            setShowAddMoney(false);
          }}
        />

        {/* RENDER OUTLET (For nested routes like History, Profile etc) */}
        <div className="w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
