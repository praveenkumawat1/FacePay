import { Outlet, useLocation } from "react-router-dom";
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
  FiAlertTriangle,
  FiPlus,
  FiBell,
  FiGift,
  FiMessageCircle,
  FiX,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserProfile } from "../services/api";

import AddMoneyModal from "./AddMoneyModal";

const COLORS = {
  cardBg: "rgba(255,255,255,0.80)",
  border: "rgba(255,255,255,0.6)",
  shadow: "0 4px 12px 0 rgba(79,70,229,0.10), 0 2px 8px 0 rgba(0,0,0,0.02)",
  primary: "#4f46e5",
  accent: "#6366f1",
  text: "#0f172a",
  textMuted: "#64748b",
  success: "#10b981",
  successBg: "rgba(16,185,129,0.12)",
  error: "#ef4444",
  errorBg: "rgba(239,68,68,0.10)",
  rowHover: "rgba(99,102,241,0.09)",
  buttonBg: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  buttonText: "#fff",
};

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    title: "Amazon",
    amount: -750,
    status: "success",
    date: "2026-01-27T13:22:00Z",
    icon: <FiCreditCard />,
  },
  {
    id: 2,
    title: "Swiggy",
    amount: -250,
    status: "success",
    date: "2026-01-26T21:15:00Z",
    icon: <FiCreditCard />,
  },
  {
    id: 3,
    title: "Recharge",
    amount: -150,
    status: "failed",
    date: "2026-01-26T14:29:00Z",
    icon: <FiDownload />,
  },
  {
    id: 4,
    title: "Rahul Kumar",
    amount: -300,
    status: "success",
    date: "2026-01-25T18:24:00Z",
    icon: <FiSend />,
  },
  {
    id: 5,
    title: "Google Play",
    amount: -1000,
    status: "failed",
    date: "2026-01-10T12:40:00Z",
    icon: <FiCreditCard />,
  },
  {
    id: 6,
    title: "Paytm UPI",
    amount: -550,
    status: "success",
    date: "2025-12-29T16:07:00Z",
    icon: <FiDownload />,
  },
];

const ActionButton = ({ icon, label }) => (
  <motion.button
    whileHover={{ scale: 1.035, y: -1.5 }}
    whileTap={{ scale: 0.97 }}
    className="group flex flex-col items-center justify-center w-full border transition-all duration-200 focus:outline-none select-none"
    style={{
      background: COLORS.cardBg,
      backdropFilter: "blur(12px)",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "1rem",
      padding: "1rem 0.6rem",
      boxShadow: COLORS.shadow,
      minHeight: 82,
      minWidth: 0,
    }}
  >
    <span className="text-xl mb-1 text-indigo-600 group-hover:text-indigo-700 transition-colors">
      {icon}
    </span>
    <span
      className="text-xs font-medium tracking-wide uppercase"
      style={{ color: COLORS.text, letterSpacing: "0.05em" }}
    >
      {label}
    </span>
  </motion.button>
);

function StylishSkeleton({ width = "130px", height = "2.3rem" }) {
  return (
    <div
      style={{
        display: "inline-block",
        borderRadius: "8px",
        width,
        height,
        background:
          "linear-gradient(90deg,#f3f3f7 25%,#e0e7ff 50%,#f3f3f7 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1s linear infinite",
      }}
      className="animate-shimmer"
    />
  );
}

const style = document.createElement("style");
style.textContent = `
@keyframes skeleton-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
.animate-shimmer { animation: skeleton-shimmer 1.15s infinite linear; }
`;
if (!document.getElementById("skeleton-shimmer-style")) {
  style.id = "skeleton-shimmer-style";
  document.head.appendChild(style);
}

export default function Dashboard() {
  const location = useLocation();
  const isRoot = location.pathname === "/dashboard";
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [balanceUI, setBalanceUI] = useState("hidden");

  useEffect(() => {
    if (showBalance) setTimeout(() => setBalanceUI("shown"), 70);
    else setBalanceUI("hidden");
  }, [showBalance]);

  const [showRewards, setShowRewards] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [notiCount, setNotiCount] = useState(2);

  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("thismonth");

  const faceStatus = { verified: true, lastScan: "2026-01-27T12:22:00Z" };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/";
          return;
        }
        const result = await getUserProfile(token);
        setUser(result.user);
        setWallet(result.wallet || null);
      } catch (error) {
        localStorage.clear();
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const today = new Date();

  function handleAISubmit(e) {
    e.preventDefault();
    setAiLoading(true);
    setAiResponse("");
    setTimeout(() => {
      setAiResponse(
        aiQuery.toLowerCase().includes("restaurant") ||
          aiQuery.toLowerCase().includes("food")
          ? "This month, you spent ₹1,220 on Restaurants and Food."
          : "You spent a total of ₹7,050 this month. Need details on any category?",
      );
      setAiLoading(false);
    }, 1100);
  }

  function filterTransactions(transactions) {
    let filtered = [...transactions];
    const now = new Date();
    if (dateFilter === "thismonth") {
      filtered = filtered.filter((txn) => {
        const d = new Date(txn.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    } else if (dateFilter === "lastmonth") {
      let prevMonth = now.getMonth() - 1;
      let prevYear = now.getFullYear();
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear--;
      }
      filtered = filtered.filter((txn) => {
        const d = new Date(txn.date);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      });
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((txn) => txn.status === statusFilter);
    }
    return filtered;
  }

  const filteredTransactions = filterTransactions(MOCK_TRANSACTIONS);

  const handleAddMoneySuccess = (addedAmount) => {
    setWallet((prev) => ({
      ...prev,
      balance: (prev?.balance || 0) + addedAmount,
    }));
    setShowAddMoney(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-blue-50/40">
      <Sidebar
        onLogout={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
      />
      <main className="md:ml-72 flex flex-col px-4 sm:px-6 lg:px-8 pb-6 -mt-180 min-h-screen">
        <div className="w-full h-full mx-auto space-y-4">
          {isRoot && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between px-1 pt-1 pb-1"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-base">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
                <span
                  className="text-base md:text-lg font-bold tracking-tight"
                  style={{ color: COLORS.text }}
                >
                  Hey, {user?.name?.split(" ")[0] || "User"}
                </span>
              </div>
              <span className="flex items-center gap-4">
                <span className="text-xs text-gray-600 mt-1 sm:mt-0">
                  {today.toLocaleDateString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <button
                  className="relative flex items-center justify-center w-9 h-9 rounded-full border bg-white hover:bg-indigo-50 border-gray-200 shadow transition duration-150"
                  style={{ marginLeft: 8 }}
                  onClick={() => setNotiCount(0)}
                >
                  <FiBell className="text-lg text-indigo-600" />
                  {notiCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white font-bold text-[10px] border border-white">
                      {notiCount}
                    </span>
                  )}
                </button>
              </span>
            </motion.div>
          )}

          {isRoot && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.25 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border backdrop-blur-xl"
              style={{
                background: COLORS.cardBg,
                borderColor: COLORS.border,
                boxShadow: COLORS.shadow,
              }}
            >
              <FiBell className="text-base text-indigo-600" />
              <span
                className="font-medium text-xs"
                style={{ color: COLORS.text }}
              >
                Welcome back!
                <span
                  className="ml-2 inline-flex items-center"
                  style={{ color: COLORS.accent, fontWeight: 500 }}
                >
                  <span className="relative flex h-3 w-3 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-40" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600">
                      <FiGift className="text-white text-[10px] p-0.5" />
                    </span>
                  </span>
                  1 new offer in Rewards
                </span>
              </span>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowRewards(true)}
                className="ml-auto px-4 py-1.5 rounded-full font-semibold text-xs shadow transition-all"
                style={{
                  background: COLORS.buttonBg,
                  color: COLORS.buttonText,
                }}
              >
                View
              </motion.button>
            </motion.div>
          )}

          {isRoot && !loading && (
            <>
              <motion.section
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.25 }}
                className="w-full"
              >
                <div
                  className="relative px-4 py-4 pb-14 rounded-xl border overflow-hidden backdrop-blur-xl"
                  style={{
                    background: COLORS.cardBg,
                    borderColor: COLORS.border,
                    boxShadow: COLORS.shadow,
                  }}
                >
                  <div
                    className="absolute right-4 top-3 flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border z-10"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      borderColor: "rgba(16,185,129,0.32)",
                      color: COLORS.success,
                    }}
                  >
                    <FiCheckCircle className="text-xs" />
                    Face Verified
                    <span className="ml-1.5 font-mono opacity-70">
                      {new Date(faceStatus.lastScan).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md text-white">
                      <FiCreditCard className="text-xs" />
                    </div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: COLORS.text }}
                    >
                      Wallet Balance
                    </span>
                    <button
                      onClick={() => setShowBalance((v) => !v)}
                      className="ml-1 px-2 py-1 rounded-full border border-gray-200 hover:bg-indigo-50 text-indigo-800 transition inline-flex items-center"
                      title={showBalance ? "Hide balance" : "Show balance"}
                    >
                      {showBalance ? (
                        <FiEyeOff className="text-xs" />
                      ) : (
                        <FiEye className="text-xs" />
                      )}
                      <span className="ml-1 text-xs font-semibold">
                        {showBalance ? "Hide" : "Show"}
                      </span>
                    </button>
                    <button
                      className="ml-2 p-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 transition"
                      title="AI Expense Assistant"
                      onClick={() => setShowAIAssist(true)}
                    >
                      <FiMessageCircle className="text-indigo-600 text-base" />
                    </button>
                  </div>

                  <div
                    className="text-3xl font-bold tracking-tight mb-2 min-h-[2.6rem] flex items-center"
                    style={{ color: COLORS.primary, minHeight: "2.2rem" }}
                  >
                    <AnimatePresence mode="wait">
                      {showBalance && balanceUI === "shown" ? (
                        <motion.span
                          key="real-balance"
                          initial={{ opacity: 0, y: -15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.36 }}
                        >
                          ₹
                          {wallet?.balance?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          }) || "0.00"}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="shimmer"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.31 }}
                          style={{ display: "inline-block" }}
                        >
                          <StylishSkeleton width="120px" height="2.3rem" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Wallet ID & Created Date - FIXED & WORKING */}
                  <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    <div>
                      <div
                        className="uppercase text-xs font-medium mb-1"
                        style={{ color: COLORS.textMuted }}
                      >
                        Wallet ID
                      </div>
                      <code
                        className="px-2 py-1.5 rounded-lg font-mono text-sm bg-white/40 backdrop-blur-sm border border-white/30 break-all"
                        style={{ color: COLORS.primary }}
                      >
                        {loading
                          ? "Loading..."
                          : wallet?.wallet_key || "Not generated"}
                      </code>
                    </div>
                    <div>
                      <div
                        className="uppercase text-xs font-medium mb-1"
                        style={{ color: COLORS.textMuted }}
                      >
                        Created
                      </div>
                      <span
                        className="font-mono text-sm"
                        style={{ color: COLORS.textMuted }}
                      >
                        {loading
                          ? "Loading..."
                          : wallet?.createdAt
                            ? new Date(wallet.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "Not available"}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs shadow transition-all group"
                    style={{
                      background: COLORS.buttonBg,
                      color: COLORS.buttonText,
                    }}
                    onClick={() => setShowAddMoney(true)}
                  >
                    <FiPlus className="text-sm" />
                    <span>Add Money</span>
                  </motion.button>
                </div>

                <AddMoneyModal
                  open={showAddMoney}
                  onClose={() => setShowAddMoney(false)}
                  onAdd={(addedAmount) => {
                    setWallet((prev) => ({
                      ...prev,
                      balance: (prev?.balance || 0) + addedAmount,
                    }));
                    setShowAddMoney(false);
                  }}
                />

                <AnimatePresence>
                  {showAIAssist && (
                    <motion.div
                      key="ai-modal"
                      initial={{ opacity: 0, scale: 0.97, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, y: 16 }}
                      transition={{ duration: 0.27 }}
                      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-3"
                      style={{ zIndex: 1300 }}
                    >
                      <motion.div
                        initial={{ y: 28, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 28, opacity: 0 }}
                        className="w-full max-w-sm rounded-xl p-6 relative backdrop-blur-2xl border bg-white"
                        style={{
                          borderColor: COLORS.border,
                          boxShadow: COLORS.shadow,
                        }}
                      >
                        <button
                          className="absolute right-5 top-5 text-gray-500 hover:text-indigo-700 text-2xl"
                          onClick={() => setShowAIAssist(false)}
                        >
                          <FiX />
                        </button>
                        <div className="flex flex-col items-center mb-2">
                          <div className="p-3 rounded-full bg-indigo-100 mb-2">
                            <FiMessageCircle className="text-indigo-800 text-2xl" />
                          </div>
                          <h2
                            className="text-xl font-extrabold mb-0.5"
                            style={{ color: COLORS.primary }}
                          >
                            AI Expense Assistant
                          </h2>
                          <div className="text-xs mb-4 text-gray-600 text-center">
                            Ask me anything about your expenses!
                          </div>
                        </div>
                        <form
                          onSubmit={handleAISubmit}
                          className="flex flex-col gap-1"
                        >
                          <input
                            type="text"
                            className="px-3 py-2 rounded-lg border text-gray-800 font-medium text-sm focus:outline-none focus:ring-2 ring-indigo-200 mb-1 transition"
                            placeholder="Eg. How much I spent on food this month?"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            style={{ borderColor: COLORS.accent }}
                            disabled={aiLoading}
                            autoFocus
                            maxLength={120}
                            required
                          />
                          <button
                            type="submit"
                            disabled={aiLoading || !aiQuery.trim()}
                            className="w-full py-2 rounded-lg font-semibold text-sm mt-1 shadow-md"
                            style={{
                              background: COLORS.buttonBg,
                              color: COLORS.buttonText,
                              opacity: aiLoading ? 0.7 : 1,
                            }}
                          >
                            {aiLoading ? "Thinking..." : "Ask Now"}
                          </button>
                        </form>
                        <div className="text-left min-h-[36px] mt-2">
                          {aiLoading ? (
                            <div className="animate-pulse text-indigo-700 text-sm">
                              <span className="mr-2">🤖</span> AI is analyzing
                              your expenses...
                            </div>
                          ) : aiResponse ? (
                            <motion.div
                              initial={{ opacity: 0, y: 7 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.22 }}
                              className="py-2 px-2 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-sm"
                            >
                              <span className="mr-2">🤖</span> {aiResponse}
                            </motion.div>
                          ) : (
                            <div className="text-[13px] text-gray-400 py-2 text-center">
                              Try asking: “How much did I spend last month?”
                              <br />
                              or “Show food expenses”.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>

              <section className="w-full">
                <motion.h2
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-base font-bold mb-2 px-1"
                  style={{ color: COLORS.text }}
                >
                  Quick Actions
                </motion.h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <ActionButton icon={<FiSend />} label="Send Money" />
                  <ActionButton icon={<FiPocket />} label="Request Money" />
                  <ActionButton icon={<FiDownload />} label="Add Money" />
                  <ActionButton icon={<FiCamera />} label="Pay with Face" />
                </div>
              </section>

              <section className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between mb-2 px-1"
                >
                  <h2
                    className="text-base font-bold"
                    style={{ color: COLORS.text }}
                  >
                    Recent Transactions
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="px-3 py-1.5 rounded-full font-semibold text-xs shadow hidden sm:block"
                    style={{
                      background: COLORS.buttonBg,
                      color: COLORS.buttonText,
                    }}
                  >
                    View All
                  </motion.button>
                </motion.div>

                <div className="flex items-center gap-2 mb-2 px-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2 py-1 rounded-md border text-xs font-semibold text-gray-700"
                    style={{ borderColor: COLORS.border, background: "#fff" }}
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-2 py-1 rounded-md border text-xs font-semibold text-gray-700"
                    style={{ borderColor: COLORS.border, background: "#fff" }}
                  >
                    <option value="thismonth">This Month</option>
                    <option value="lastmonth">Last Month</option>
                    <option value="all">All Time</option>
                  </select>
                  <span className="ml-auto text-xs text-gray-400">
                    {filteredTransactions.length} shown
                  </span>
                </div>

                <div
                  className="rounded-lg border backdrop-blur-xl overflow-hidden"
                  style={{
                    background: COLORS.cardBg,
                    borderColor: COLORS.border,
                    boxShadow: COLORS.shadow,
                  }}
                >
                  {filteredTransactions.length > 0 &&
                    filteredTransactions.slice(0, 8).map((txn, idx) => (
                      <motion.div
                        key={txn.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center justify-between py-2.5 px-3 border-b last:border-b-0 hover:bg-indigo-50/20 transition-colors"
                        style={{ borderBottomColor: "rgba(255,255,255,0.2)" }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-md bg-indigo-50/60 text-indigo-600 text-base">
                            {txn.icon}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="font-medium"
                              style={{ color: COLORS.text }}
                            >
                              {txn.title}
                            </div>
                            <div className="text-[11px] mt-0.5 text-gray-500">
                              {new Date(txn.date).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span
                            className="font-mono font-bold text-xs"
                            style={{
                              color:
                                txn.amount < 0 ? COLORS.error : COLORS.success,
                            }}
                          >
                            {txn.amount < 0 ? "−" : "+"}₹
                            {Math.abs(txn.amount).toLocaleString()}
                          </span>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                            style={{
                              background:
                                txn.status === "success"
                                  ? COLORS.successBg
                                  : COLORS.errorBg,
                              color:
                                txn.status === "success"
                                  ? COLORS.success
                                  : COLORS.error,
                              borderColor:
                                txn.status === "success"
                                  ? "rgba(16,185,129,0.4)"
                                  : "rgba(239,68,68,0.4)",
                            }}
                          >
                            {txn.status === "success" ? "Success" : "Failed"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  {filteredTransactions.length === 0 && (
                    <div className="py-8 text-center text-gray-500 font-medium text-sm">
                      No transactions found for selected filters.
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {showRewards && (
            <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-3">
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                className="w-full max-w-xs rounded-xl p-6 relative backdrop-blur-2xl border"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  borderColor: COLORS.border,
                  boxShadow: COLORS.shadow,
                }}
              >
                <button
                  className="absolute right-5 top-5 text-gray-500 hover:text-indigo-700 text-2xl"
                  onClick={() => setShowRewards(false)}
                >
                  ✕
                </button>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow">
                    <FiGift className="text-2xl text-white" />
                  </div>
                  <h2
                    className="text-xl font-extrabold mb-1"
                    style={{ color: COLORS.primary }}
                  >
                    Special Rewards
                  </h2>
                  <p className="text-gray-700 mb-3 text-sm">
                    <strong>
                      Congratulations {user?.name?.split(" ")[0] || "User"}!
                    </strong>
                    <br />
                    <span style={{ color: COLORS.success }}>
                      1 exclusive offer
                    </span>{" "}
                    unlocked:
                  </p>
                  <div
                    className="w-full p-3 rounded-xl border border-dashed mb-4"
                    style={{
                      borderColor: COLORS.accent,
                      background: "rgba(99,102,241,0.06)",
                    }}
                  >
                    <div
                      className="text-sm font-bold mb-1"
                      style={{ color: COLORS.primary }}
                    >
                      Flat 20% Cashback
                    </div>
                    <div
                      className="text-xs font-mono"
                      style={{ color: COLORS.textMuted }}
                    >
                      Use code:{" "}
                      <strong className="text-indigo-700">REWARD20</strong>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowRewards(false)}
                    className="w-full py-3 rounded-xl font-bold text-base shadow-md"
                    style={{
                      background: COLORS.buttonBg,
                      color: COLORS.buttonText,
                    }}
                  >
                    Awesome, Thanks!
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}

          <Outlet />
        </div>
      </main>
    </div>
  );
}
