import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NotificationSidebar from "../components/NotificationSidebar";
import QRScannerModal from "../components/QRScannerModal";
import {
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
  FiArrowUpRight,
  FiArrowDownLeft,
  FiTrendingUp,
  FiTarget,
  FiTag,
  FiClock,
  FiCheck,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiMoon,
  FiSun,
  FiGlobe,
  FiAlertCircle,
} from "react-icons/fi";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddMoneyModal from "../pages/AddMoneyModal";
import { activeCoupons } from "./CouponsOffers";
import { saveAs } from "file-saver";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import SendMoneyFlow from "../pages/SendMoneyFlow";
import WithdrawalModal from "../pages/WithdrawalModal";
import RequestMoneyFlow from "../pages/RequestMoneyFlow";

const API = "http://localhost:5000";

// ─── Helper: apiFetch with auth header ───────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("facepay_token");
  return fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
}

// ─── ACTION BUTTON ────────────────────────────────────────────────────────────
const ActionButton = ({ icon, label, onClick, delay }) => {
  const { darkMode } = useDashboard();
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl w-full transition-all duration-200 ${
        darkMode
          ? "bg-white/5 border border-white/10 hover:bg-white/10"
          : "bg-white/65 border border-white/50"
      }`}
      style={{
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className={`p-3 rounded-full mb-2 transition-colors duration-300 ${
          darkMode
            ? "bg-indigo-900/50 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white"
            : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
        }`}
      >
        <span className="text-xl">{icon}</span>
      </div>
      <span
        className={`text-xs font-bold tracking-wide uppercase ${
          darkMode
            ? "text-slate-400 group-hover:text-slate-200"
            : "text-slate-600 group-hover:text-slate-900"
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
};

const ToggleSwitch = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${value ? "bg-indigo-600" : "bg-slate-300"}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${value ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

// ─── SETTINGS POPUP ───────────────────────────────────────────────────────────
const SettingsPopup = ({ onBack, onClose }) => {
  const {
    darkMode,
    setDarkMode,
    language,
    setLanguage,
    currency,
    setCurrency,
    notifications,
    setNotifications,
    t,
  } = useDashboard();
  const [saved, setSaved] = useState(false);
  const dm = darkMode;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border z-50 overflow-hidden ${dm ? "bg-slate-800/95 border-slate-700" : "bg-white/90 border-slate-100"}`}
      style={{
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 40px rgba(80,80,180,0.15)",
      }}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3.5 border-b ${dm ? "border-slate-700 bg-slate-900/50" : "border-slate-100 bg-linear-to-r from-indigo-50 to-purple-50"}`}
      >
        <button
          onClick={onBack}
          className={`p-1.5 rounded-lg transition-colors ${dm ? "hover:bg-slate-700 text-slate-400" : "hover:bg-white/70 text-slate-500"}`}
        >
          <FiChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${dm ? "bg-indigo-900" : "bg-indigo-100"}`}
          >
            <FiSettings size={14} className="text-indigo-500" />
          </div>
          <span
            className={`font-bold text-sm ${dm ? "text-slate-200" : "text-slate-800"}`}
          >
            {t("settings")}
          </span>
        </div>
        <button
          onClick={onClose}
          className={`ml-auto p-1.5 rounded-lg transition-colors ${dm ? "hover:bg-slate-700 text-slate-500" : "hover:bg-white/70 text-slate-400"}`}
        >
          <FiX size={14} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1">
        {/* Dark Mode */}
        <div
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group ${dm ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? "bg-slate-700" : "bg-slate-100"}`}
            >
              {darkMode ? (
                <FiMoon size={14} className="text-indigo-400" />
              ) : (
                <FiSun size={14} className="text-amber-500" />
              )}
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${dm ? "text-slate-200" : "text-slate-700"}`}
              >
                {t("darkMode")}
              </p>
              <p
                className={`text-[11px] ${dm ? "text-slate-500" : "text-slate-400"}`}
              >
                {darkMode ? t("on") : t("off")}
              </p>
            </div>
          </div>
          <ToggleSwitch value={darkMode} onChange={setDarkMode} />
        </div>

        {/* Notifications */}
        <div
          className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group ${dm ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? "bg-slate-700" : "bg-slate-100"}`}
            >
              <FiBell
                size={14}
                className={
                  notifications
                    ? "text-indigo-400"
                    : dm
                      ? "text-slate-500"
                      : "text-slate-400"
                }
              />
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${dm ? "text-slate-200" : "text-slate-700"}`}
              >
                {t("notifications")}
              </p>
              <p
                className={`text-[11px] ${dm ? "text-slate-500" : "text-slate-400"}`}
              >
                {notifications ? t("enabled") : t("disabled")}
              </p>
            </div>
          </div>
          <ToggleSwitch value={notifications} onChange={setNotifications} />
        </div>

        <div
          className={`border-t my-1 ${dm ? "border-slate-700" : "border-slate-100"}`}
        />

        {/* Language */}
        <div
          className={`px-3 py-2.5 rounded-xl ${dm ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? "bg-slate-700" : "bg-slate-100"}`}
            >
              <FiGlobe size={14} className="text-indigo-400" />
            </div>
            <p
              className={`text-sm font-semibold ${dm ? "text-slate-200" : "text-slate-700"}`}
            >
              {t("language")}
            </p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`w-full text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 border-0 ${dm ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"}`}
          >
            {["English", "Hindi", "Gujarati", "Marathi", "Tamil", "Telugu"].map(
              (l) => (
                <option key={l}>{l}</option>
              ),
            )}
          </select>
        </div>

        {/* Currency */}
        <div
          className={`px-3 py-2.5 rounded-xl ${dm ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? "bg-slate-700" : "bg-slate-100"}`}
            >
              <span className="text-sm font-bold text-indigo-400">₹</span>
            </div>
            <p
              className={`text-sm font-semibold ${dm ? "text-slate-200" : "text-slate-700"}`}
            >
              {t("currency")}
            </p>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={`w-full text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 border-0 ${dm ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"}`}
          >
            {["INR (₹)", "USD ($)", "EUR (€)", "GBP (£)"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={handleSave}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${saved ? "bg-green-500 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
        >
          {saved ? (
            <>
              <FiCheck size={15} /> {t("saved")}
            </>
          ) : (
            t("saveSettings")
          )}
        </button>
      </div>
    </motion.div>
  );
};

// ─── DASHBOARD INNER ──────────────────────────────────────────────────────────
function DashboardInner() {
  const { darkMode, t, formatCurrency } = useDashboard();
  const [rewardCopied, setRewardCopied] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isEmbed = new URLSearchParams(location.search).get("embed") === "true";
  const isRoot = location.pathname === "/dashboard";

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null); // Added setStats state
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [notiCount, setNotiCount] = useState(0);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedUser, setScannedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [popupView, setPopupView] = useState(null);
  const profileRef = useRef(null);
  const [rewardCode, setRewardCode] = useState(null);
  const [rewardExpiry, setRewardExpiry] = useState(null);
  const [rewardCountdown, setRewardCountdown] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "ai",
      content: "Hello! I'm your FacePay AI. How can I help you today?",
    },
  ]);
  const chatEndRef = useRef(null);
  const [filterType, setFilterType] = useState("all");

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (showAIAssist) {
      scrollToBottom();
    }
  }, [chatHistory, showAIAssist]);

  const dm = darkMode;
  const bgMain = dm
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
    : "bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f5f3ff]";
  const cardBg = dm
    ? "bg-slate-800/80 border-slate-700"
    : "bg-white border-slate-100";
  const textPrimary = dm ? "text-slate-100" : "text-slate-900";
  const textSecondary = dm ? "text-slate-400" : "text-slate-500";

  // ─── Dashboard load ───────────────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    try {
      const token = localStorage.getItem("facepay_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const result = await res.json();
      if (result.success) {
        // Only update if data actually changed to prevent render loops
        setUser((prev) =>
          JSON.stringify(prev) !== JSON.stringify(result.user)
            ? result.user
            : prev,
        );
        setWallet((prev) =>
          JSON.stringify(prev) !== JSON.stringify(result.wallet)
            ? result.wallet
            : prev,
        );
        setTransactions(result.transactions || []);
        setStats(result.stats);
        setNotiCount(result.notifications?.unread || 0);
      } else throw new Error(result.message);
    } catch (err) {
      console.error("❌ Dashboard load error:", err);
    }
  }, [navigate]); // Removed 'user' dependency

  // ─── WebSocket for Real-time Notifications ──────────────
  useEffect(() => {
    if (!user?._id) return;
    const userId = user._id;

    // Connect to Backend WebSocket
    const ws = new WebSocket(`${API.replace("http", "ws")}?userId=${userId}`);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "NOTIFICATION") {
          // Play a notification sound if available
          try {
            const audio = new Audio(
              "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
            );
            audio.play().catch(() => {});
          } catch (e) {}

          // Refresh dashboard data to show the new notification
          loadDashboard();
        }
      } catch (err) {
        console.error("WS error:", err);
      }
    };

    return () => {
      if (ws) ws.close();
    };
  }, [user?._id]); // Removed 'loadDashboard' dependency to prevent re-connects on function change

  // ─── Outside click ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setPopupView(null);
    };
    if (popupView) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [popupView]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // If we are already loading or already have data, don't trigger initial load multiple times
      if (user?._id && !loading) return;

      // ⚡ OPTIMIZATION: Check if we have cached user data to show UI immediately
      const cachedUser = localStorage.getItem("facepay_user");
      if (cachedUser && !user) {
        try {
          const parsed = JSON.parse(cachedUser);
          setUser({
            ...parsed,
            name: parsed.full_name || parsed.name,
          });
        } catch (e) {}
      }

      await loadDashboard();
      if (!cancelled) {
        setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [loadDashboard]);

  // ─── Auto-refresh (lightweight — only transactions + wallet) ──────────────
  // ✅ FIX: Does NOT call the full dashboard endpoint every 5s
  // Instead calls a lightweight transactions-only endpoint
  // This avoids hammering MongoDB and bypassing Redis cache
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem("facepay_token");
      if (!token) return;
      try {
        const res = await fetch(`${API}/api/payment/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const result = await res.json();
        if (result.success) {
          setTransactions(result.transactions || []);

          // Also refresh balance from a lightweight endpoint if possible
          const balRes = await fetch(`${API}/api/payment/balance`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const balData = await balRes.json();
          if (balData.success && wallet) {
            setWallet((prev) => ({ ...prev, balance: balData.balance }));
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000); // 5s interval for real-time experience
    return () => clearInterval(interval);
  }, [wallet]);

  // ─── Profile update listener ──────────────────────────────────────────────
  // ✅ FIX: Removed window.location.reload() on focus — was causing full page reloads
  // Instead: only reload dashboard data (state update, no page refresh)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "facepay_profile_updated") loadDashboard();
    };
    const onFocus = () => {
      // ✅ FIX: Only re-fetch data, never reload the page
      const last = localStorage.getItem("facepay_profile_last_update");
      if (last && user?.updatedAt && last !== user.updatedAt) {
        loadDashboard();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, loadDashboard]);

  // ─── Reward code ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      if (!user) return;
      const created = user.createdAt ? new Date(user.createdAt) : null;
      if (created && Date.now() - created.getTime() < 24 * 60 * 60 * 1000) {
        let code = localStorage.getItem("facepay_reward_code");
        let expiry = localStorage.getItem("facepay_reward_expiry");
        if (!code || !expiry || Date.now() > Number(expiry)) {
          code = Math.random().toString(36).substring(2, 10).toUpperCase();
          expiry = Date.now() + 24 * 60 * 60 * 1000;
          localStorage.setItem("facepay_reward_code", code);
          localStorage.setItem("facepay_reward_expiry", expiry);
        }
        setRewardCode(code);
        setRewardExpiry(Number(expiry));
      } else {
        setRewardCode(null);
        setRewardExpiry(null);
      }
    } catch (err) {
      console.error("Reward error:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!rewardExpiry) return;
    const interval = setInterval(() => {
      const diff = rewardExpiry - Date.now();
      if (diff <= 0) {
        setRewardCountdown("Expired");
        setRewardCode(null);
        localStorage.removeItem("facepay_reward_code");
        localStorage.removeItem("facepay_reward_expiry");
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / 3600000),
          m = Math.floor((diff % 3600000) / 60000),
          s = Math.floor((diff % 60000) / 1000);
        setRewardCountdown(`${h}h ${m}m ${s}s left`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [rewardExpiry]);

  // ─── Add money ────────────────────────────────────────────────────────────
  const handleAddMoney = async (amount) => {
    try {
      const res = await apiFetch("/api/dashboard/add-money", {
        method: "POST",
        body: JSON.stringify({ amount, payment_method: "wallet" }),
      });
      if (!res.ok) throw new Error("Failed");
      const result = await res.json();
      if (result.success) {
        setWallet(result.wallet);
        setTransactions((prev) => [result.transaction, ...prev]);
        setNotiCount((prev) => prev + 1);
        setShowAddMoney(false);
      } else throw new Error(result.message);
    } catch (err) {
      console.error("AddMoney error:", err);
      alert("Failed to add money.");
    }
  };

  // ─── Payment complete ─────────────────────────────────────────────────────
  const handlePaymentComplete = (txn) => {
    setWallet((prev) => ({
      ...prev,
      balance: (
        parseFloat(prev?.balance || 0) - parseFloat(txn.amount)
      ).toFixed(2),
    }));
    setTransactions((prev) => [
      {
        id: txn.txn_id || txn.id,
        title: `Sent to ${txn.recipient?.name || "User"}`,
        amount: -parseFloat(txn.amount),
        category: "Transfer",
        date: txn.created_at || new Date().toISOString(),
        status: "success",
      },
      ...prev,
    ]);
    setNotiCount((prev) => prev + 1);
  };

  // ─── Filters ──────────────────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    if (filterType === "all") return transactions;
    if (filterType === "income")
      return transactions.filter((t) => t.amount > 0);
    if (filterType === "expense")
      return transactions.filter((t) => t.amount < 0);
    return transactions;
  }, [filterType, transactions]);

  const getTotalInvested = () =>
    transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const downloadStatement = () => {
    try {
      const csv = [
        "Date,Title,Category,Amount,Status",
        ...transactions.map((t) =>
          [
            new Date(t.date).toLocaleString(),
            t.title,
            t.category,
            t.amount,
            t.status,
          ].join(","),
        ),
      ].join("\n");
      saveAs(
        new Blob([csv], { type: "text/csv;charset=utf-8;" }),
        "facepay_statement.csv",
      );
    } catch {
      alert("Failed to download.");
    }
  };

  // ─── AI submit ────────────────────────────────────────────────────────────
  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userMessage = { role: "user", content: aiQuery };
    setChatHistory((prev) => [...prev, userMessage]);
    setAiQuery("");
    setAiLoading(true);

    const q = aiQuery.toLowerCase();
    let resp =
      "I'm not sure about that. Try asking about your balance, coupons, investment, or statement.";
    let mode = null;

    try {
      if (
        q.includes("spend") ||
        q.includes("expense") ||
        q.includes("summary")
      ) {
        const res = await apiFetch("/api/dashboard");
        const data = await res.json();
        const spent = data?.stats?.monthlySpending || 0;
        resp = `You have spent ${formatCurrency(spent)} this month so far. You're ${spent > 5000 ? "slightly over" : "well within"} your average monthly budget!`;
      } else if (q.includes("balance") || q.includes("money")) {
        resp = `Current account balance: ${formatCurrency(wallet?.balance || 0)}. Would you like to add more or withdraw?`;
      } else if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
        resp = `Hello ${getFirstName()}! I can help you analyze your spending, check your balance, or find the best deals. What's on your mind?`;
      } else if (
        q.includes("save") ||
        q.includes("tip") ||
        q.includes("budget")
      ) {
        resp =
          "Smart saving starts with tracking. I've noticed you spend most on 'General'. Try setting a 10% lower limit this month to save more!";
      } else if (
        q.includes("coupon") ||
        q.includes("offer") ||
        q.includes("deal")
      ) {
        mode = "coupon";
        resp = "I've found some exciting offers for you! Check them out:";
      } else if (q.includes("invest") || q.includes("growth")) {
        mode = "invest";
        resp = `Your total investment flow is ${formatCurrency(getTotalInvested())}. Investing early is the key to financial freedom!`;
      } else if (
        q.includes("statement") ||
        q.includes("download") ||
        q.includes("history")
      ) {
        mode = "statement";
        resp =
          "Sure! I can generate your transaction history for you. Click the button below to download your statement.";
      } else if (q.includes("thank") || q.includes("bye")) {
        resp =
          "You're welcome! Feel free to ask whenever you need financial advice. Have a great day!";
      }
    } catch {
      resp =
        "Apologies, I'm having trouble accessing your real-time data right now. Please try again in a moment.";
    }

    setTimeout(() => {
      setChatHistory((prev) => [...prev, { role: "ai", content: resp, mode }]);
      setAiLoading(false);
    }, 600);
  };

  // ─── SEARCH LOGIC ────────────────────────────────────────────────────────
  const dashboardActions = useMemo(
    () => [
      {
        id: "send",
        label: "Send Money",
        icon: <FiSend />,
        details: "Transfer funds to friends",
        onClick: () => navigate("/dashboard/send"),
      },
      {
        id: "request",
        label: "Request Money",
        icon: <FiDownload />,
        details: "Ask friends for payment",
        onClick: () => navigate("/dashboard/request"),
      },
      {
        id: "add",
        label: "Add Money",
        icon: <FiPlus />,
        details: "Top up your wallet",
        onClick: () => setShowAddMoney(true),
      },
      {
        id: "withdraw",
        label: "Withdraw",
        icon: <FiArrowUpRight />,
        details: "Transfer to bank/UPI",
        onClick: () => setShowWithdraw(true),
      },
      {
        id: "profile",
        label: "My Profile",
        icon: <FiCheckCircle />,
        details: "Update your details",
        onClick: () => navigate("/dashboard/profile"),
      },
      {
        id: "settings",
        label: "Settings",
        icon: <FiSettings />,
        details: "General preferences",
        onClick: () => setPopupView("settings"),
      },
      {
        id: "rewards",
        label: "Rewards",
        icon: <FiGift />,
        details: "Current offers & coupons",
        onClick: () => setShowRewards(true),
      },
      {
        id: "ai",
        label: "Ask AI",
        icon: <FiMessageCircle />,
        details: "Financial assistant",
        onClick: () => setShowAIAssist(true),
      },
      {
        id: "leaderboard",
        label: "Leaderboard",
        icon: <FiTrendingUp />,
        details: "See top earners",
        onClick: () => navigate("/dashboard/leaderboard"),
      },
      {
        id: "missions",
        label: "Active Missions",
        icon: <FiTarget />,
        details: "Earn coins by tasks",
        onClick: () => navigate("/dashboard/missions"),
      },
      {
        id: "support",
        label: "Help & Support",
        icon: <FiMessageCircle />,
        details: "Get in touch with us",
        onClick: () => alert("Support coming soon!"),
      },
    ],
    [
      navigate,
      setShowAddMoney,
      setShowWithdraw,
      setShowRewards,
      setShowAIAssist,
      setPopupView,
    ],
  );

  const searchResults = useMemo(() => {
    const defaultCoupons = [
      {
        id: "wc10",
        title: "WELCOME10",
        description: "10% Cashback on first scan",
      },
      {
        id: "fp50",
        title: "FACEPAY50",
        description: "Flat ₹50 off on next utility",
      },
    ];
    const sourceCoupons =
      activeCoupons && activeCoupons.length > 0
        ? activeCoupons
        : defaultCoupons;

    if (!searchQuery.trim())
      return {
        actions: dashboardActions.slice(0, 4),
        transactions: transactions.slice(0, 3),
      };
    const q = searchQuery.toLowerCase();

    return {
      actions: dashboardActions.filter(
        (a) =>
          a.label.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q),
      ),
      transactions: transactions
        .filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.amount.toString().includes(q),
        )
        .slice(0, 5),
      coupons: sourceCoupons.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      ),
    };
  }, [searchQuery, transactions, dashboardActions]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
      if (e.key === "Escape") setShowSearch(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getFirstName = () => {
    if (!user) return "User";
    const n = user.name || user.full_name || user.fullName;
    return n ? n.split(" ")[0] : "User";
  };
  const getInitial = () => {
    if (!user) return "U";
    const n = user.name || user.full_name || user.fullName;
    return n ? n.charAt(0).toUpperCase() : "U";
  };
  const getProfilePicture = () => {
    if (user?.profile_picture) return user.profile_picture;
    const n = user?.name || user?.full_name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=4f46e5&color=fff&size=200&bold=true`;
  };

  if (loading && !isEmbed) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${dm ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <div className="text-center">
          <div
            className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${dm ? "border-indigo-400" : "border-slate-900"}`}
          />
          <p className={`font-medium ${textSecondary}`}>
            {t("loadingDashboard")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isEmbed ? "bg-white" : bgMain} font-sans transition-colors duration-300 ${dm ? "text-slate-100" : "text-slate-800"}`}
    >
      {!isEmbed && <Sidebar onLogout={handleLogout} />}
      <main
        className={`${isEmbed ? "ml-0" : "md:ml-72"} flex flex-col px-4 sm:px-6 lg:px-8 py-6 min-h-screen transition-all duration-300 ${isEmbed ? "" : "-mt-180"}`}
      >
        {isRoot && !isEmbed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          >
            <div>
              <h1
                className={`text-2xl font-bold flex items-center gap-2 ${textPrimary}`}
              >
                {t("hello")}, {getFirstName()}{" "}
                <span className="text-2xl">👋</span>
              </h1>
              <p className={`text-sm mt-1 ${textSecondary}`}>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {!isEmbed && (
                <div
                  className={`hidden md:flex items-center px-4 py-2.5 rounded-full border shadow-sm transition-all cursor-pointer group ${dm ? "bg-slate-800 border-slate-700 hover:bg-slate-700/80" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                  onClick={() => setShowSearch(true)}
                >
                  <FiSearch
                    className={`mr-2 transition-transform group-hover:scale-110 ${textSecondary}`}
                  />
                  <span
                    className={`text-sm select-none ${dm ? "text-slate-500" : "text-slate-400"}`}
                  >
                    {t("search")}...
                  </span>
                  <div
                    className={`ml-4 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-opacity ${dm ? "border-slate-600 text-slate-500" : "border-slate-200 text-slate-400 opacity-50Group-hover:opacity-100"}`}
                  >
                    ⌘K
                  </div>
                </div>
              )}

              {!isEmbed && (
                <button
                  onClick={() => setShowNotifications(true)}
                  className={`relative p-2.5 rounded-full shadow-sm border transition-colors ${dm ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                >
                  <FiBell
                    className={`text-lg ${dm ? "text-slate-400" : "text-slate-600"}`}
                  />
                  {notiCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                      {notiCount}
                    </span>
                  )}
                </button>
              )}

              {!isEmbed && (
                <div className="relative" ref={profileRef}>
                  <div
                    className="w-10 h-10 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                    onClick={() => setPopupView(popupView ? null : "profile")}
                  >
                    <img
                      src={getProfilePicture()}
                      alt={getFirstName()}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = getInitial();
                      }}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {popupView === "profile" && (
                      <motion.div
                        key="profile"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.18 }}
                        className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border z-50 p-5 flex flex-col gap-2 ${dm ? "bg-slate-800/95 border-slate-700" : "bg-white/85 border-slate-100"}`}
                        style={{ backdropFilter: "blur(20px)" }}
                      >
                        <div className="flex flex-col items-center gap-2 mb-2">
                          {user?.profile_picture ? (
                            <img
                              src={user.profile_picture}
                              alt={user?.name}
                              className="w-16 h-16 rounded-full border-4 border-indigo-200 object-cover shadow"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-200 bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow">
                              {getInitial()}
                            </div>
                          )}
                          <div className="text-center">
                            <div
                              className={`font-bold text-base ${textPrimary}`}
                            >
                              {user?.name || user?.full_name || "User"}
                            </div>
                            <div className={`text-xs ${textSecondary}`}>
                              {user?.email || ""}
                            </div>
                          </div>
                          <button
                            className="text-xs text-indigo-500 font-semibold mt-1 hover:underline"
                            onClick={() => {
                              setPopupView(null);
                              setTimeout(
                                () => navigate("/dashboard/profile"),
                                100,
                              );
                            }}
                          >
                            {t("viewProfile")}
                          </button>
                        </div>
                        <div
                          className={`border-t my-1 ${dm ? "border-slate-700" : "border-slate-100"}`}
                        />
                        <button
                          className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${dm ? "hover:bg-slate-700 text-slate-300" : "hover:bg-indigo-50 text-slate-700"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopupView("settings");
                          }}
                        >
                          <FiSettings className="text-indigo-400" />{" "}
                          {t("dashboardSettings")}
                          <span
                            className={`ml-auto text-xs ${dm ? "text-slate-600" : "text-slate-300"}`}
                          >
                            ›
                          </span>
                        </button>
                        <button
                          className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg font-medium text-sm transition-colors ${dm ? "hover:bg-red-900/30 text-red-400" : "hover:bg-red-50 text-red-600"}`}
                          onClick={handleLogout}
                        >
                          <FiLogOut className="text-red-400" /> {t("logout")}
                        </button>
                      </motion.div>
                    )}
                    {popupView === "settings" && !isEmbed && (
                      <SettingsPopup
                        onBack={() => setPopupView("profile")}
                        onClose={() => setPopupView(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {isRoot && (
          <div className="space-y-6 max-w-7xl mx-auto w-full">
            {/* Wallet + Rewards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div
                className="lg:col-span-2 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
                  color: "white",
                }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium tracking-wide uppercase mb-1">
                        {t("totalBalance")}
                      </p>
                      <div className="flex items-center gap-3">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                          {showBalance
                            ? formatCurrency(wallet?.balance || 0)
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
                      {user?.kyc_verified ||
                      user?.is_verified ||
                      user?.kyc_status === "verified" ? (
                        <>
                          <FiCheckCircle className="text-green-400" />
                          <span className="text-xs font-semibold text-green-300">
                            KYC VERIFIED
                          </span>
                        </>
                      ) : (
                        <>
                          <FiAlertCircle className="text-yellow-400" />
                          <span className="text-xs font-semibold">
                            UNVERIFIED
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                    <div className="text-sm text-indigo-200 font-mono bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                      {t("walletId")}: {wallet?.wallet_key || "W-XXXX-XXXX"}
                    </div>
                    <button
                      onClick={() => setShowAddMoney(true)}
                      className="bg-white text-indigo-900 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
                    >
                      <FiPlus className="text-lg" /> {t("addMoney")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-rows-2 gap-4">
                <motion.div
                  whileHover={{ y: -2 }}
                  onClick={() => setShowRewards(true)}
                  className={`rounded-3xl p-5 cursor-pointer flex flex-col justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-all border ${cardBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${dm ? "bg-purple-900/40 text-purple-400" : "bg-purple-100 text-purple-600"}`}
                    >
                      <FiGift size={24} />
                    </div>
                    <div>
                      <h3 className={`font-bold ${textPrimary}`}>
                        {t("rewards")}
                      </h3>
                      <p className={`text-xs ${textSecondary}`}>
                        {t("checkOffers")}
                      </p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2 }}
                  onClick={() => setShowAIAssist(true)}
                  className={`rounded-3xl p-5 cursor-pointer flex flex-col justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-all border ${cardBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${dm ? "bg-blue-900/40 text-blue-400" : "bg-blue-100 text-blue-600"}`}
                    >
                      <FiMessageCircle size={24} />
                    </div>
                    <div>
                      <h3 className={`font-bold ${textPrimary}`}>
                        {t("askAi")}
                      </h3>
                      <p className={`text-xs ${textSecondary}`}>
                        {t("analyzeSpending")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <section>
              <h3
                className={`text-sm font-bold uppercase tracking-wider mb-4 ml-1 ${textSecondary}`}
              >
                {t("quickActions")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SendMoneyFlow
                  darkMode={darkMode}
                  walletBalance={parseFloat(wallet?.balance || 0)}
                  onPaymentComplete={handlePaymentComplete}
                  delay={0.1}
                  initialStep={scannedUser ? "amount" : "intro"}
                  initialRecipient={scannedUser}
                  forceOpen={!!scannedUser}
                  onClose={() => setScannedUser(null)}
                />
                <RequestMoneyFlow
                  darkMode={darkMode}
                  delay={0.2}
                  onComplete={() => {}}
                />
                <ActionButton
                  icon={<FiDownload />}
                  label={t("withdraw")}
                  delay={0.3}
                  onClick={() => setShowWithdraw(true)}
                />
                <ActionButton
                  icon={<FiCamera />}
                  label={t("scanQr")}
                  delay={0.4}
                  onClick={() => setShowQRScanner(true)}
                />
              </div>
            </section>

            {/* Recent Activity */}
            <section className={`rounded-3xl p-6 shadow-sm border ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3
                  className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}
                >
                  {t("recentActivity")}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${dm ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}
                  >
                    {transactions.length}
                  </span>
                </h3>
                <div
                  className={`flex p-1 rounded-xl w-max ${dm ? "bg-slate-700" : "bg-slate-100"}`}
                >
                  {["all", "income", "expense"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        filterType === f
                          ? dm
                            ? "bg-slate-600 shadow text-indigo-400"
                            : "bg-white shadow text-indigo-600"
                          : dm
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {t(f)}
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
                      className={`group flex items-center justify-between p-4 rounded-xl transition-colors border border-transparent cursor-pointer ${dm ? "hover:bg-slate-700/50 hover:border-slate-600" : "hover:bg-indigo-50/50 hover:border-indigo-100"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${txn.amount > 0 ? (dm ? "bg-green-900/40 text-green-400" : "bg-green-100 text-green-600") : dm ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-600"}`}
                        >
                          {txn.amount > 0 ? (
                            <FiArrowDownLeft />
                          ) : (
                            <FiArrowUpRight />
                          )}
                        </div>
                        <div>
                          <h4
                            className={`font-bold text-sm ${dm ? "text-slate-200 group-hover:text-indigo-400" : "text-slate-900 group-hover:text-indigo-700"}`}
                          >
                            {txn.title}
                          </h4>
                          <div
                            className={`flex items-center gap-2 text-xs mt-0.5 ${textSecondary}`}
                          >
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
                          className={`font-bold text-sm ${txn.amount > 0 ? "text-green-500" : dm ? "text-slate-300" : "text-slate-900"}`}
                        >
                          {txn.amount > 0 ? "+" : ""}
                          {formatCurrency(txn.amount)}
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
                  <div className={`py-10 text-center text-sm ${textSecondary}`}>
                    {transactions.length === 0
                      ? t("noTransactions")
                      : t("noFilter")}
                  </div>
                )}
              </div>

              {transactions.length > 0 && (
                <button
                  className={`w-full mt-4 py-3 text-center text-sm font-bold rounded-xl transition-colors ${dm ? "text-indigo-400 hover:bg-slate-700" : "text-indigo-600 hover:bg-indigo-50"}`}
                  onClick={() => navigate("/dashboard/history")}
                >
                  {t("viewAllHistory")}
                </button>
              )}
            </section>
          </div>
        )}

        {/* AI Assist Modal */}
        <AnimatePresence>
          {showAIAssist && !isEmbed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-6 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowAIAssist(false)}
            >
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md h-full sm:h-[85vh] rounded-none sm:rounded-[32px] shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300 ${dm ? "bg-slate-900 border-l border-white/10" : "bg-white border text-slate-900"}`}
              >
                {/* Header */}
                <div
                  className={`p-5 border-b flex items-center justify-between ${dm ? "border-white/10 bg-slate-800/50" : "border-slate-100 bg-slate-50/50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                      <span className="text-xl">🤖</span>
                    </div>
                    <div>
                      <h2
                        className={`text-lg font-bold leading-tight ${textPrimary}`}
                      >
                        Finance Assistant
                      </h2>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span
                          className={`text-[11px] font-medium tracking-wide uppercase opacity-70 ${textSecondary}`}
                        >
                          Always active
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIAssist(false)}
                    className={`p-2 rounded-xl transition-all ${dm ? "hover:bg-white/10 text-slate-400" : "hover:bg-black/5 text-slate-400"}`}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 custom-scrollbar bg-transparent">
                  {chatHistory.map((chat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          chat.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : dm
                              ? "bg-slate-800 border border-white/5 text-slate-200 rounded-tl-none"
                              : "bg-slate-100 border border-slate-200 text-slate-700 rounded-tl-none"
                        }`}
                      >
                        {chat.content}

                        {chat.mode === "coupon" && (
                          <div className="w-full flex flex-col gap-2 mt-4">
                            {activeCoupons.map((c) => (
                              <motion.div
                                key={c.id}
                                whileHover={{ scale: 1.02, x: 2 }}
                                className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all ${dm ? "bg-indigo-950/40 border-indigo-500/20" : "bg-white border-indigo-100"}`}
                              >
                                <div className="flex flex-col items-start gap-1">
                                  <span className="font-bold text-indigo-400 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                                    <FiTag size={12} /> {c.brand}
                                  </span>
                                  <span
                                    className={`text-[11px] font-bold ${dm ? "text-slate-300" : "text-slate-900"}`}
                                  >
                                    {c.code}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`text-[10px] block opacity-70 uppercase font-bold ${textSecondary}`}
                                  >
                                    Offer
                                  </span>
                                  <span
                                    className={`text-[11px] font-bold text-green-500`}
                                  >
                                    {c.desc}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {chat.mode === "statement" && (
                          <button
                            onClick={downloadStatement}
                            className="mt-4 w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-xs hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                          >
                            <FiDownload /> Download History (CSV)
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {aiLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl rounded-tl-none border ${dm ? "bg-slate-800 border-white/5" : "bg-slate-100 border-slate-200"}`}
                      >
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 150}ms` }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div
                  className={`p-5 border-t ${dm ? "border-white/10 bg-slate-800/30" : "border-slate-100 bg-slate-50/50"}`}
                >
                  <form onSubmit={handleAISubmit} className="relative group">
                    <input
                      type="text"
                      placeholder="Ask about spending, tips or savings..."
                      className={`w-full rounded-2xl px-5 py-4 pr-14 text-[13px] font-medium focus:outline-none transition-all border ${
                        dm
                          ? "bg-slate-950 border-white/10 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-600"
                          : "bg-white border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      }`}
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || !aiQuery.trim()}
                      className={`absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-xl transition-all ${
                        aiQuery.trim()
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                          : dm
                            ? "bg-slate-800 text-slate-600"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <FiSend />
                    </button>
                  </form>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2 custom-scrollbar flex-nowrap">
                    {["Balance?", "Spending?", "Offers?", "Tips?"].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setAiQuery(q);
                        }}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${
                          dm
                            ? "bg-slate-800 border-white/10 text-slate-400 hover:border-indigo-500 hover:text-indigo-400"
                            : "bg-white border-slate-200 text-slate-500 hover:border-indigo-500 hover:text-indigo-500"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
              onClick={() => setShowRewards(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
                className={`w-full max-w-sm rounded-[40px] p-8 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(79,70,229,0.3)] border ${
                  dm
                    ? "bg-slate-900 border-white/10"
                    : "bg-white border-slate-100"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Decorative Background Elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

                <button
                  onClick={() => setShowRewards(false)}
                  className={`absolute right-6 top-6 p-2 rounded-full transition-all ${
                    dm
                      ? "hover:bg-white/10 text-slate-500"
                      : "hover:bg-slate-100 text-slate-400"
                  }`}
                >
                  <FiX size={20} />
                </button>

                <div className="relative mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-5xl shadow-2xl transform rotate-6 border-4 border-white/20"
                  >
                    🎁
                  </motion.div>
                  {/* Floating sparkles */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: [0, 1, 0], y: -40, x: (i - 2) * 20 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                      className="absolute top-0 left-1/2 text-yellow-400 text-xl pointer-events-none"
                    >
                      ✨
                    </motion.div>
                  ))}
                </div>

                <h2
                  className={`text-2xl font-black mb-3 tracking-tight ${textPrimary}`}
                >
                  {rewardCode ? "Exclusive Reward!" : "Unlock Rewards"}
                </h2>

                {rewardCode ? (
                  <div className="space-y-6">
                    <p
                      className={`text-sm leading-relaxed px-4 ${textSecondary}`}
                    >
                      High-five! You've unlocked a special welcome bonus. Copy
                      the code below to claim it.
                    </p>

                    <div className="relative group">
                      <div
                        className={`py-5 px-6 rounded-2xl font-mono text-2xl font-black tracking-[0.3em] border-2 border-dashed transition-all ${
                          dm
                            ? "bg-slate-950/50 border-purple-500/50 text-purple-400"
                            : "bg-purple-50 border-purple-200 text-purple-600"
                        }`}
                      >
                        {rewardCode}
                      </div>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
                        Promo Code
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <FiClock className="text-amber-500" />
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${dm ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Expires:{" "}
                        <span className="text-amber-500">
                          {rewardCountdown}
                        </span>
                      </span>
                    </div>

                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(rewardCode);
                        setRewardCopied(true);
                        setTimeout(() => setRewardCopied(false), 2000);
                      }}
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl group ${
                        rewardCopied
                          ? "bg-green-500 text-white"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:-translate-y-1 active:scale-95 shadow-purple-500/25"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {rewardCopied ? <FiCheck size={18} /> : <span>📋</span>}
                        {rewardCopied ? "Copied to Clipboard!" : "Copy & Claim"}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className={`text-sm leading-relaxed ${textSecondary}`}>
                      {rewardCountdown === "Expired"
                        ? "Oh no! Your welcome code has expired. But don't worry, more rewards are coming soon!"
                        : "Ready for your first bonus? Finish setting up your account and make your first payment to unlock 10% cashback!"}
                    </p>

                    <div
                      className={`p-4 rounded-2xl border ${dm ? "bg-slate-800/50 border-white/5" : "bg-slate-50 border-slate-100"}`}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                          <FiGift size={20} />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${textPrimary}`}>
                            Upcoming Mission
                          </p>
                          <p className="text-[11px] opacity-70">
                            Pay 3 times using FaceScan
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowRewards(false)}
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all border-2 ${
                        dm
                          ? "border-white/10 hover:bg-white/5 text-slate-300"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      Got it
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Search Modal */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4 bg-slate-950/40 backdrop-blur-md"
              onClick={() => setShowSearch(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: -20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: -20, opacity: 0 }}
                className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border ${dm ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`flex items-center gap-4 px-6 py-5 border-b sticky top-0 z-10 ${dm ? "bg-slate-900 border-white/5" : "bg-white border-slate-100"}`}
                >
                  <FiSearch
                    className={`text-xl ${dm ? "text-indigo-400" : "text-indigo-600"}`}
                  />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search anything... (Send, Rewards, Transactions)"
                    className={`flex-1 bg-transparent text-lg font-medium outline-none border-none placeholder-slate-500 ${dm ? "text-slate-100" : "text-slate-800"}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${dm ? "bg-slate-800 border-slate-700 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-400"}`}
                    >
                      esc
                    </span>
                    <button
                      onClick={() => setShowSearch(false)}
                      className={`p-1.5 rounded-full hover:bg-slate-200/50 transition-colors ${dm ? "text-slate-500" : "text-slate-400"}`}
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                  {/* Results Section */}
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    {searchResults.actions.length > 0 && (
                      <div className="space-y-2">
                        <h3
                          className={`px-2 text-[10px] font-bold uppercase tracking-[0.2em] ${dm ? "text-slate-500" : "text-slate-400"}`}
                        >
                          Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {searchResults.actions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() => {
                                action.onClick();
                                setShowSearch(false);
                              }}
                              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all hover:scale-[1.02] text-left group ${
                                dm
                                  ? "bg-slate-800/50 border-white/5 hover:bg-indigo-600/20 hover:border-indigo-500/50"
                                  : "bg-slate-50 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200"
                              }`}
                            >
                              <div
                                className={`p-2.5 rounded-xl transition-colors ${dm ? "bg-slate-700 text-indigo-400 group-hover:bg-indigo-500/30 group-hover:text-white" : "bg-white text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white shadow-sm"}`}
                              >
                                {action.icon}
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-bold ${dm ? "text-slate-200" : "text-slate-800"}`}
                                >
                                  {action.label}
                                </p>
                                <p className="text-[10px] opacity-60 font-medium">
                                  {action.details}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Transactions */}
                    {searchResults.transactions.length > 0 && (
                      <div className="space-y-2">
                        <h3
                          className={`px-2 text-[10px] font-bold uppercase tracking-[0.2em] ${dm ? "text-slate-500" : "text-slate-400"}`}
                        >
                          Transactions
                        </h3>
                        <div className="space-y-1">
                          {searchResults.transactions.map((t, idx) => (
                            <div
                              key={t.id || idx}
                              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-colors cursor-pointer group ${dm ? "hover:bg-slate-800" : "hover:bg-slate-50"}`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${t.amount < 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}
                                >
                                  {t.amount < 0 ? "-" : "+"}
                                </div>
                                <div>
                                  <p
                                    className={`text-sm font-bold ${textPrimary}`}
                                  >
                                    {t.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span
                                      className={`text-[10px] opacity-60 font-medium ${textSecondary}`}
                                    >
                                      {t.category}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-400 opacity-30" />
                                    <span
                                      className={`text-[10px] opacity-60 font-medium ${textSecondary}`}
                                    >
                                      {new Date(t.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`text-sm font-black ${t.amount < 0 ? "text-rose-500" : "text-emerald-500"}`}
                              >
                                {formatCurrency(Math.abs(t.amount))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coupons */}
                    {searchResults.coupons?.length > 0 && (
                      <div className="space-y-2">
                        <h3
                          className={`px-2 text-[10px] font-bold uppercase tracking-[0.2em] ${dm ? "text-slate-500" : "text-slate-400"}`}
                        >
                          Offers & Deals
                        </h3>
                        <div className="space-y-2">
                          {searchResults.coupons.map((coupon) => (
                            <div
                              key={coupon.id}
                              onClick={() => {
                                setShowRewards(true);
                                setShowSearch(false);
                              }}
                              className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed cursor-pointer hover:scale-[1.01] transition-all group ${
                                dm
                                  ? "bg-slate-800/20 border-purple-500/30 text-slate-300"
                                  : "bg-purple-50/50 border-purple-200 text-slate-700"
                              }`}
                            >
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                                <FiTag size={20} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-black text-purple-600">
                                  {coupon.title}
                                </p>
                                <p className="text-[11px] opacity-70 line-clamp-1">
                                  {coupon.description}
                                </p>
                              </div>
                              <div
                                className={`px-3 py-1 rounded-lg font-black text-xs ${dm ? "bg-slate-700 text-slate-300" : "bg-white text-slate-600 shadow-sm"}`}
                              >
                                VIEW
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.actions.length === 0 &&
                      searchResults.transactions.length === 0 && (
                        <div className="py-12 text-center">
                          <div
                            className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${dm ? "bg-slate-800" : "bg-slate-50"}`}
                          >
                            <FiSearch size={24} className="opacity-20" />
                          </div>
                          <p className={`font-bold ${textPrimary}`}>
                            No results found for "{searchQuery}"
                          </p>
                          <p className={`text-xs mt-1 ${textSecondary}`}>
                            Try searching for broad terms like 'money', 'gift'
                            or 'pay'
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                <div
                  className={`px-6 py-3 border-t flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${dm ? "bg-slate-800 border-white/5 text-slate-500" : "bg-slate-50 border-slate-100 text-slate-400"}`}
                >
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5">
                      <FiArrowDownLeft size={10} className="text-indigo-500" />{" "}
                      to select
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiPlus size={10} className="text-indigo-500" /> to open
                    </span>
                  </div>
                  <span>FacePay Global Search</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isEmbed && (
          <AddMoneyModal
            open={showAddMoney}
            onClose={() => setShowAddMoney(false)}
            onAdd={handleAddMoney}
          />
        )}

        {!isEmbed && (
          <WithdrawalModal
            open={showWithdraw}
            onClose={() => setShowWithdraw(false)}
            balance={wallet?.balance || 0}
            onWithdraw={(newBal) =>
              setWallet((prev) => ({ ...prev, balance: newBal }))
            }
            dm={dm}
            lang={localStorage.getItem("facepay_lang") || "English"}
          />
        )}

        {!isEmbed && (
          <NotificationSidebar
            isOpen={showNotifications}
            onClose={() => {
              setShowNotifications(false);
              apiFetch("/api/dashboard/notifications")
                .then((r) => r.json())
                .then((d) => {
                  if (d.success) setNotiCount(d.unread || 0);
                })
                .catch(() => {});
            }}
          />
        )}

        <div className="w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <QRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        darkMode={dm}
        onUserDetected={(scanned) => {
          // If it's a FacePay user, redirect to send money flow
          if (scanned.id) {
            navigate(
              `/dashboard/send?recipient=${scanned.id}&upi=${scanned.upi_id}&name=${encodeURIComponent(scanned.name)}`,
            );
          } else if (scanned.isExternal) {
            // Standard UPI QR
            navigate(
              `/dashboard/send?upi=${scanned.upi_id}&name=${encodeURIComponent(scanned.name)}`,
            );
          }
        }}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardInner />
    </DashboardProvider>
  );
}
