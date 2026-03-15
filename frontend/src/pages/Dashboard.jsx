import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NotificationSidebar from "../components/NotificationSidebar";
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
  FiTag,
  FiClock,
  FiCheck,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiMoon,
  FiSun,
  FiGlobe,
} from "react-icons/fi";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddMoneyModal from "../pages/AddMoneyModal";
import { activeCoupons } from "./CouponsOffers";
import { saveAs } from "file-saver";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import SendMoneyFlow from "../pages/SendMoneyFlow"; // ✅ Import

// ─── ACTION BUTTON (Generic) ──────────────────────────────────────────────────
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

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────
const ToggleSwitch = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0 ${
      value ? "bg-indigo-600" : "bg-slate-300"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${
        value ? "translate-x-5" : "translate-x-0"
      }`}
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
      className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border z-50 overflow-hidden ${
        dm ? "bg-slate-800/95 border-slate-700" : "bg-white/90 border-slate-100"
      }`}
      style={{
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 40px rgba(80,80,180,0.15)",
      }}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3.5 border-b ${
          dm
            ? "border-slate-700 bg-slate-900/50"
            : "border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50"
        }`}
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
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dm ? "bg-slate-700 group-hover:bg-indigo-900" : "bg-slate-100 group-hover:bg-indigo-100"}`}
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
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dm ? "bg-slate-700 group-hover:bg-indigo-900" : "bg-slate-100 group-hover:bg-indigo-100"}`}
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
          className={`px-3 py-2.5 rounded-xl transition-colors group ${dm ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dm ? "bg-slate-700 group-hover:bg-indigo-900" : "bg-slate-100 group-hover:bg-indigo-100"}`}
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
            className={`w-full text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer border-0 ${dm ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"}`}
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
          className={`px-3 py-2.5 rounded-xl transition-colors group ${dm ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${dm ? "bg-slate-700 group-hover:bg-indigo-900" : "bg-slate-100 group-hover:bg-indigo-100"}`}
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
            className={`w-full text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer border-0 ${dm ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"}`}
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
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200/50"
          }`}
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
  const isRoot = location.pathname === "/dashboard";

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [notiCount, setNotiCount] = useState(0);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false); // ✅ NEW
  const [popupView, setPopupView] = useState(null);
  const profileRef = useRef(null);
  const [rewardCode, setRewardCode] = useState(null);
  const [rewardExpiry, setRewardExpiry] = useState(null);
  const [rewardCountdown, setRewardCountdown] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const dm = darkMode;
  const bgMain = dm
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
    : "bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f5f3ff]";
  const cardBg = dm
    ? "bg-slate-800/80 border-slate-700"
    : "bg-white border-slate-100";
  const textPrimary = dm ? "text-slate-100" : "text-slate-900";
  const textSecondary = dm ? "text-slate-400" : "text-slate-500";

  // ─── OUTSIDE CLICK FOR PROFILE POPUP ────────────────────────────────────────
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setPopupView(null);
      }
    };
    if (popupView) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [popupView]);

  // ─── REWARD CODE ─────────────────────────────────────────────────────────────
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

  // ─── REWARD COUNTDOWN ────────────────────────────────────────────────────────
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

  // ─── DASHBOARD DATA LOAD ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      let timeout = setTimeout(() => setLoading(false), 1000);
      try {
        const token = localStorage.getItem("facepay_token");
        if (!token) {
          navigate("/login");
          clearTimeout(timeout);
          return;
        }
        const res = await fetch("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        if (result.success) {
          setUser(result.user);
          setWallet(result.wallet);
          setTransactions(result.transactions || []);
          setStats(result.stats);
          setNotiCount(result.notifications?.unread || 0);
        } else throw new Error(result.message);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setUser({ name: "User" });
        setWallet({ balance: 0, wallet_key: "----" });
        setTransactions([]);
      } finally {
        setTimeout(() => setLoading(false), 100);
        clearTimeout(timeout);
      }
    };
    load();
  }, []);

  // ─── PROFILE UPDATE LISTENER ─────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "facepay_profile_updated") {
        const loadUser = async () => {
          const token = localStorage.getItem("facepay_token");
          const res = await fetch("http://localhost:5000/api/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await res.json();
          if (result.success) setUser(result.user);
        };
        loadUser();
      }
    };
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);

  useEffect(() => {
    const fn = () => {
      const last = localStorage.getItem("facepay_profile_last_update");
      if (last && user?.updatedAt && last !== user.updatedAt)
        window.location.reload();
    };
    window.addEventListener("focus", fn);
    return () => window.removeEventListener("focus", fn);
  }, [user]);

  // ─── ADD MONEY ───────────────────────────────────────────────────────────────
  const handleAddMoney = async (amount) => {
    try {
      const token = localStorage.getItem("facepay_token");
      if (!token) {
        alert("Session expired");
        navigate("/login");
        return;
      }
      const res = await fetch("http://localhost:5000/api/dashboard/add-money", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  // ─── AUTO REFRESH TRANSACTIONS ────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem("facepay_token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const result = await res.json();
        if (result.success) {
          setTransactions(result.transactions || []);
          setWallet(result.wallet); // ✅ Wallet bhi refresh hoga
        }
      } catch {
        /* ignore */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ─── ✅ PAYMENT COMPLETE HANDLER (SendMoneyFlow ke baad) ─────────────────────
  const handlePaymentComplete = (txn) => {
    // Wallet balance update
    setWallet((prev) => ({
      ...prev,
      balance: (
        parseFloat(prev?.balance || 0) - parseFloat(txn.amount)
      ).toFixed(2),
    }));

    // Transaction list mein naya txn add karo
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

    // Notification count badhao
    setNotiCount((prev) => prev + 1);
  };

  // ─── FILTERS ─────────────────────────────────────────────────────────────────
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

  // ─── DOWNLOAD STATEMENT ───────────────────────────────────────────────────────
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

  // ─── AI SUBMIT ────────────────────────────────────────────────────────────────
  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    setAiMode(null);
    const q = aiQuery.toLowerCase();
    let resp =
      "I'm not sure about that. Try asking about your balance, coupons, investment, or statement.";
    try {
      const token = localStorage.getItem("facepay_token");
      if (q.includes("spend") || q.includes("expense")) {
        const res = await fetch("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        resp = `You spent ${formatCurrency(data?.stats?.monthlySpending || 0)} this month.`;
      } else if (q.includes("balance")) {
        const res = await fetch("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        resp = `Your current balance is ${formatCurrency(data?.wallet?.balance || 0)}.`;
      } else if (q.includes("save") || q.includes("tip")) {
        resp =
          "Try setting a monthly budget and track your spending in different categories!";
      } else if (q.includes("coupon") || q.includes("offer")) {
        setAiMode("coupon");
        resp = "Here are your available coupons:";
      } else if (q.includes("invest")) {
        setAiMode("invest");
        resp = `You have invested a total of ${formatCurrency(getTotalInvested())}.`;
      } else if (q.includes("statement") || q.includes("download")) {
        setAiMode("statement");
        resp = "You can download your transaction statement below.";
      }
    } catch {
      resp = "Sorry, could not fetch real-time info.";
    }
    setAiResponse(resp);
    setAiLoading(false);
  };

  // ─── HELPERS ──────────────────────────────────────────────────────────────────
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

  // ─── LOADING ──────────────────────────────────────────────────────────────────
  if (loading) {
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

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen ${bgMain} font-sans transition-colors duration-300 ${dm ? "text-slate-100" : "text-slate-800"}`}
    >
      <Sidebar onLogout={handleLogout} />

      <main className="md:ml-72 flex flex-col px-4 sm:px-6 lg:px-8 py-6 min-h-screen transition-all duration-300 -mt-[45rem]">
        {/* ─── TOP BAR ──────────────────────────────────────────────────────── */}
        {isRoot && (
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
              {/* Search */}
              <div
                className={`hidden md:flex items-center px-3 py-2 rounded-full border shadow-sm ${dm ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
              >
                <FiSearch className={`mr-2 ${textSecondary}`} />
                <input
                  type="text"
                  placeholder={t("search")}
                  className={`bg-transparent text-sm outline-none w-32 ${dm ? "text-slate-200 placeholder-slate-500" : "placeholder-slate-400"}`}
                />
              </div>

              {/* Bell */}
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

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white cursor-pointer hover:scale-105 transition-transform overflow-hidden"
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
                      style={{
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 8px 32px rgba(80,80,180,0.12)",
                      }}
                    >
                      <div className="flex flex-col items-center gap-2 mb-2">
                        {user?.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={user?.name}
                            className="w-16 h-16 rounded-full border-4 border-indigo-200 object-cover shadow"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full border-4 border-indigo-200 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow">
                            {getInitial()}
                          </div>
                        )}
                        <div className="text-center">
                          <div className={`font-bold text-base ${textPrimary}`}>
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
                        <FiSettings className="text-indigo-400" />
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

                  {popupView === "settings" && (
                    <SettingsPopup
                      onBack={() => setPopupView("profile")}
                      onClose={() => setPopupView(null)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
        {isRoot && (
          <div className="space-y-6 max-w-7xl mx-auto w-full">
            {/* Wallet Card + Rewards/AI */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Wallet Card */}
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
                      <FiCheckCircle
                        className={
                          user?.kyc_verified
                            ? "text-green-400"
                            : "text-yellow-400"
                        }
                      />
                      <span className="text-xs font-semibold">
                        {user?.kyc_verified ? t("verified") : t("unverified")}
                      </span>
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

              {/* Rewards + AI */}
              <div className="grid grid-rows-2 gap-4">
                <motion.div
                  whileHover={{ y: -2 }}
                  onClick={() => setShowRewards(true)}
                  className={`rounded-3xl p-5 cursor-pointer flex flex-col justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-all border ${cardBg}`}
                >
                  <div className="absolute right-0 top-0 w-24 h-24 bg-purple-100 rounded-full -mr-4 -mt-4 opacity-20" />
                  <div className="flex items-center gap-3 relative z-10">
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
                  <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-50 rounded-full -mr-4 -mb-4 opacity-20" />
                  <div className="flex items-center gap-3 relative z-10">
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

            {/* ─── QUICK ACTIONS ─────────────────────────────────────────────── */}
            <section>
              <h3
                className={`text-sm font-bold uppercase tracking-wider mb-4 ml-1 ${textSecondary}`}
              >
                {t("quickActions")}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* ✅ SEND — SendMoneyFlow connected */}
                <SendMoneyFlow
                  darkMode={darkMode}
                  walletBalance={parseFloat(wallet?.balance || 0)}
                  onPaymentComplete={handlePaymentComplete}
                  delay={0.1}
                />

                {/* Request */}
                <ActionButton
                  icon={<FiPocket />}
                  label={t("request")}
                  delay={0.2}
                  onClick={() => {}} // aap apna request handler laga sakte ho
                />

                {/* Withdraw */}
                <ActionButton
                  icon={<FiDownload />}
                  label={t("withdraw")}
                  delay={0.3}
                  onClick={() => {}} // aap apna withdraw handler laga sakte ho
                />

                {/* Scan QR */}
                <ActionButton
                  icon={<FiCamera />}
                  label={t("scanQr")}
                  delay={0.4}
                  onClick={() => {}} // aap apna QR handler laga sakte ho
                />
              </div>
            </section>

            {/* ─── RECENT ACTIVITY ───────────────────────────────────────────── */}
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
                      className={`group flex items-center justify-between p-4 rounded-xl transition-colors border border-transparent cursor-pointer ${
                        dm
                          ? "hover:bg-slate-700/50 hover:border-slate-600"
                          : "hover:bg-indigo-50/50 hover:border-indigo-100"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            txn.amount > 0
                              ? dm
                                ? "bg-green-900/40 text-green-400"
                                : "bg-green-100 text-green-600"
                              : dm
                                ? "bg-slate-700 text-slate-400"
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
                          <h4
                            className={`font-bold text-sm transition-colors ${dm ? "text-slate-200 group-hover:text-indigo-400" : "text-slate-900 group-hover:text-indigo-700"}`}
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

        {/* ─── AI ASSIST MODAL ───────────────────────────────────────────────── */}
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
                className={`w-full max-w-md rounded-3xl shadow-2xl p-6 relative overflow-hidden ${dm ? "bg-slate-800" : "bg-white"}`}
              >
                <button
                  onClick={() => setShowAIAssist(false)}
                  className={`absolute right-5 top-5 ${dm ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-800"}`}
                >
                  <FiX size={20} />
                </button>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <h2 className={`text-xl font-bold ${textPrimary}`}>
                    AI Financial Assistant
                  </h2>
                  <p className={`text-sm mt-1 ${textSecondary}`}>
                    Ask about expenses, savings, or tips!
                  </p>
                </div>

                <div
                  className={`rounded-2xl p-4 min-h-[100px] flex flex-col items-center justify-center text-center text-sm border mb-4 ${dm ? "bg-slate-700/50 border-slate-600" : "bg-slate-50 border-slate-100"}`}
                >
                  {aiLoading ? (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                  ) : aiResponse ? (
                    <>
                      <span className="font-medium text-indigo-400 leading-relaxed mb-2 block">
                        {aiResponse}
                      </span>
                      {aiMode === "coupon" && (
                        <div className="w-full flex flex-col gap-2 mt-2">
                          {activeCoupons.map((c) => (
                            <div
                              key={c.id}
                              className={`flex items-center justify-between rounded-lg px-3 py-2 border ${dm ? "bg-indigo-900/30 border-indigo-800" : "bg-indigo-50 border-indigo-200"}`}
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-bold text-indigo-400 text-xs flex items-center gap-1">
                                  <FiTag /> {c.brand}{" "}
                                  <span className="ml-2 font-mono">
                                    {c.code}
                                  </span>
                                </span>
                                <span className={`text-xs ${textSecondary}`}>
                                  {c.desc}
                                </span>
                              </div>
                              <span
                                className={`text-xs flex items-center gap-1 ${textSecondary}`}
                              >
                                <FiClock /> {c.expiry}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {aiMode === "invest" && (
                        <div className={`mt-2 text-xs ${textSecondary}`}>
                          (Includes all money added to wallet)
                        </div>
                      )}
                      {aiMode === "statement" && (
                        <button
                          onClick={downloadStatement}
                          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 flex items-center gap-2"
                        >
                          <FiDownload /> Download CSV
                        </button>
                      )}
                    </>
                  ) : (
                    <span className={`italic ${textSecondary}`}>
                      "How much did I spend this month?"
                    </span>
                  )}
                </div>

                <form onSubmit={handleAISubmit} className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    className={`w-full rounded-xl px-4 py-3.5 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all border ${dm ? "bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500" : "bg-slate-100 border-slate-200"}`}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!aiQuery.trim() || aiLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <FiArrowUpRight />
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {[
                    { label: "Show my coupons", q: "Show my coupons" },
                    {
                      label: "How much did I invest?",
                      q: "How much did I invest?",
                    },
                    { label: "Download statement", q: "Download my statement" },
                    {
                      label: "This month's spending",
                      q: "How much did I spend this month?",
                    },
                    { label: "Show my balance", q: "Show my balance" },
                  ].map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${dm ? "bg-slate-700 border-slate-600 text-slate-400 hover:text-indigo-400" : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"}`}
                      onClick={() => setAiQuery(s.q)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── REWARDS MODAL ─────────────────────────────────────────────────── */}
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
                className={`w-full max-w-sm rounded-3xl p-6 text-center relative ${dm ? "bg-slate-800" : "bg-white"}`}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowRewards(false)}
                  className={`absolute right-4 top-4 ${dm ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-800"}`}
                >
                  <FiX size={20} />
                </button>
                <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  🎁
                </div>
                <h2 className={`text-xl font-bold mb-2 ${textPrimary}`}>
                  {rewardCode ? "Your Welcome Reward Code" : "Welcome Offer!"}
                </h2>
                {rewardCode ? (
                  <>
                    <div className="text-2xl font-mono font-bold text-purple-500 mb-2 tracking-widest select-all">
                      {rewardCode}
                    </div>
                    <div className={`text-xs mb-4 ${textSecondary}`}>
                      Expires in:{" "}
                      <span className="font-semibold text-indigo-500">
                        {rewardCountdown}
                      </span>
                    </div>
                    <p className={`text-sm mb-6 ${textSecondary}`}>
                      Use this code within 24 hours to get your new user bonus!
                    </p>
                  </>
                ) : (
                  <p className={`text-sm mb-6 ${textSecondary}`}>
                    {rewardCountdown === "Expired"
                      ? "This reward code has expired."
                      : "Complete your first transaction to unlock exclusive rewards and cashback offers."}
                  </p>
                )}
                <button
                  onClick={async () => {
                    if (rewardCode) {
                      await navigator.clipboard.writeText(rewardCode);
                      setRewardCopied(true);
                      setTimeout(() => setRewardCopied(false), 1500);
                    } else setShowRewards(false);
                  }}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${rewardCopied ? "bg-green-500 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}`}
                  disabled={!rewardCode}
                >
                  {rewardCopied
                    ? "Copied!"
                    : rewardCode
                      ? "Copy Code"
                      : "Explore Offers"}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── ADD MONEY MODAL ───────────────────────────────────────────────── */}
        <AddMoneyModal
          open={showAddMoney}
          onClose={() => setShowAddMoney(false)}
          onAdd={handleAddMoney}
        />

        {/* ─── NOTIFICATIONS SIDEBAR ─────────────────────────────────────────── */}
        <NotificationSidebar
          isOpen={showNotifications}
          onClose={() => {
            setShowNotifications(false);
            const token = localStorage.getItem("facepay_token");
            fetch("http://localhost:5000/api/dashboard/notifications", {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.success) setNotiCount(d.unread || 0);
              })
              .catch(() => {});
          }}
        />

        {/* Outlet for nested routes */}
        <div className="w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardInner />
    </DashboardProvider>
  );
}
