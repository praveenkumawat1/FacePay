import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiCopy,
  FiRefreshCw,
  FiBell,
  FiX,
  FiUserPlus,
  FiCheckCircle,
  FiPhoneOutgoing,
  FiDollarSign,
  FiXCircle,
  FiCreditCard,
  FiTrendingUp,
  FiBriefcase,
  FiAirplay,
  FiShield,
  FiFilm,
  FiShoppingBag,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiSearch,
  FiMoon,
  FiHelpCircle,
  FiZap,
  FiLink2,
  FiLock,
  FiAlertCircle,
  FiWifi,
  FiLoader,
} from "react-icons/fi";
import { MdQrCode } from "react-icons/md";
import { QRCodeSVG } from "qrcode.react";
import { toast, Toaster } from "react-hot-toast";
import SendMoneyFlow from "./Sendmoneyflow";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// ✅ FIX: Backend ka direct URL use karo — CORS problem solve hogi
const API_BASE = "http://localhost:5000";

function getToken() {
  return (
    localStorage.getItem("facepay_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    null
  );
}

function saveToken(token) {
  if (token) localStorage.setItem("facepay_token", token);
}

function clearToken() {
  ["facepay_token", "token", "authToken", "jwt", "accessToken"].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

// Axios instance — token auto inject
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearToken();
      toast.error("Session expired. Please login again.");
      setTimeout(() => (window.location.href = "/login"), 1500);
    }
    return Promise.reject(err);
  },
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATS = ["Food", "Rent", "Shopping", "Gift", "Travel", "Bills", "Others"];
const FUTURE_FEATURES = [
  { icon: FiLink2, label: "Refer & Earn" },
  { icon: FiLock, label: "App Lock" },
  { icon: FiMoon, label: "Dark Mode (Coming)" },
  { icon: FiHelpCircle, label: "Support & Help" },
  { icon: FiZap, label: "AI Smart Insights" },
];
const MORE_SERVICES = [
  [FiPhoneOutgoing, "Recharge"],
  [FiDollarSign, "Pay Bills"],
  [FiXCircle, "Electricity"],
  [FiCreditCard, "Card Payment"],
  [FiTrendingUp, "Invest"],
  [FiBriefcase, "Loan EMI"],
  [FiAirplay, "Travel"],
  [FiShield, "Insurance"],
  [FiFilm, "Movies"],
  [FiShoppingBag, "Offers"],
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
function getAvatar(name, bg = "4f46e5") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=${bg}&color=fff`;
}

// ─── SKELETON CSS ─────────────────────────────────────────────────────────────
const skeletonCSS = `
  .sk{background:linear-gradient(110deg,#eef2ff 8%,#f5f7ff 18%,#eef2ff 33%);border-radius:1rem;position:relative;overflow:hidden}
  .sk::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent);animation:sk-shine 1.6s infinite}
  @keyframes sk-shine{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
`;
if (typeof window !== "undefined" && !document.getElementById("sk-st")) {
  const s = document.createElement("style");
  s.id = "sk-st";
  s.innerHTML = skeletonCSS;
  document.head.appendChild(s);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SendMoneyPremium() {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [user, setUser] = useState(null);
  const [bankOptions, setBankOptions] = useState([]);
  const [bankIdx, setBankIdx] = useState(0);
  const [balance, setBalance] = useState(0);
  const [walletId, setWalletId] = useState("");
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [transactionModal, setTransactionModal] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterSort, setFilterSort] = useState("latest");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterMin, setFilterMin] = useState("");
  const [filterMax, setFilterMax] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [sendAmt, setSendAmt] = useState("");
  const [sendNote, setSendNote] = useState("");
  const [sendCat, setSendCat] = useState("Others");
  const [moreServices, setMoreServices] = useState([
    { icon: FiPhoneOutgoing, label: "Recharge", detail: "Instant Topup" },
    { icon: FiDollarSign, label: "Pay Bills", detail: "Fast Payments" },
    { icon: FiBriefcase, label: "Insurance", detail: "Stay Protected" },
    { icon: FiAirplay, label: "Broadband", detail: "High Speed" },
    { icon: FiFilm, label: "Movies", detail: "Entertainment" },
  ]);

  // URL token save
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    if (urlToken) {
      saveToken(urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await api.get("/api/user/stats");
      if (res.data) {
        const stats = res.data;
        setMoreServices([
          {
            icon: FiZap,
            label: `${stats.coins || 0} Coins`,
            detail: "Rewards Balance",
          },
          {
            icon: FiTrendingUp,
            label: stats.hasShield ? "Shield Active" : "Get Shield",
            detail: stats.hasShield ? "Protection On" : "Safe Payments",
          },
          {
            icon: FiCheckCircle,
            label: stats.upiStreak
              ? `${stats.upiStreak} Day Streak`
              : "Start Streak",
            detail: "Daily Progress",
          },
          {
            icon: FiShoppingBag,
            label: "Marketplace",
            detail: stats.scratchAvail ? "Scratch Card!" : "View Deals",
          },
          {
            icon: FiPhoneOutgoing,
            label: "Recharge",
            detail: "Instant Topup",
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching real-time services:", err);
    }
  }, []);

  const fetchAllData = useCallback(
    async (isPolling = false) => {
      const token = getToken();

      if (!token) {
        console.error("❌ TOKEN NOT FOUND");
        console.log("📦 localStorage keys:", Object.keys(localStorage));
        setFetchError("No login token found. Please login first.");
        setLoading(false);
        return;
      }

      if (!isPolling) setLoading(true);
      setFetchError(null);

      try {
        // Fetch stats for real-time services section
        fetchStats();

        // ✅ FIX: Notifications ke liye sahi route — /api/dashboard/notifications ya ignore karo
        const [profileRes, activityRes, notifRes] = await Promise.allSettled([
          api.get("/api/auth/profile"),
          api.get("/api/wallet/history"),
          // ✅ FIX: Pehle dashboard notifications try karo, fail ho to auth try karo
          api.get("/api/dashboard/notifications").catch(() =>
            api.get("/api/notifications").catch(() =>
              // ✅ Agar koi bhi nahi hai to empty return karo — error mat throw karo
              ({ data: { notifications: [] } }),
            ),
          ),
        ]);

        if (profileRes.status === "fulfilled") {
          const u = profileRes.value.data.user;
          setUser(u);
          setBalance(u.balance ?? 0);
          setWalletId(u.wallet_key || u.walletId || "");
          if (u.bank_name) {
            setBankOptions([
              {
                bank: u.bank_name,
                account: u.account_number || "XXXX",
                ifsc: u.ifsc || "XXXX",
                branch: u.branch || "Main",
              },
            ]);
          }
        } else {
          console.error(
            "❌ Profile:",
            profileRes.reason?.response?.data || profileRes.reason?.message,
          );
          if (!isPolling) toast.error("Failed to load profile.");
        }

        if (activityRes.status === "fulfilled") {
          const txns =
            activityRes.value.data.transactions ||
            activityRes.value.data.history ||
            activityRes.value.data ||
            [];
          setActivity(Array.isArray(txns) ? txns : []);
        } else {
          console.error(
            "❌ History:",
            activityRes.reason?.response?.data || activityRes.reason?.message,
          );
          if (!isPolling) toast.error("Failed to load transactions.");
        }

        // ✅ FIX: Notifications — error pe empty array set karo, crash mat karo
        if (notifRes.status === "fulfilled") {
          const notifs =
            notifRes.value.data?.notifications || notifRes.value.data || [];
          setNotifications(Array.isArray(notifs) ? notifs : []);
        } else {
          // ✅ Notifications fail hone pe sirf empty set karo — toast error mat dikhao
          console.log("ℹ️ Notifications endpoint not found — showing empty");
          setNotifications([]);
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        if (!isPolling) setFetchError(err.message || "Network error.");
      } finally {
        if (!isPolling) setLoading(false);
      }
    },
    [fetchStats],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      fetchAllData(false);
    }, 150);
    const poll = setInterval(() => fetchAllData(true), 10000);
    return () => {
      clearTimeout(t);
      clearInterval(poll);
    };
  }, [fetchAllData]);

  // Filtering
  const filteredActivity = [...activity]
    .filter((a) => filterType === "all" || a.type === filterType)
    .filter((a) => filterCat === "all" || a.category === filterCat)
    .filter((a) =>
      filterSearch.trim()
        ? a.name?.toLowerCase().includes(filterSearch.toLowerCase()) ||
          a.details?.toLowerCase().includes(filterSearch.toLowerCase())
        : true,
    )
    .filter((a) => (filterDate ? a.time?.slice(0, 10) === filterDate : true))
    .filter((a) => (filterMin ? a.amount >= Number(filterMin) : true))
    .filter((a) => (filterMax ? a.amount <= Number(filterMax) : true))
    .sort((a, b) =>
      filterSort === "latest"
        ? new Date(b.time) - new Date(a.time)
        : new Date(a.time) - new Date(b.time),
    );

  async function handleSendMoney() {
    if (!sendTo.trim()) return toast.error("Recipient is required.");
    const amount = Number(sendAmt);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount.");
    if (amount > balance) return toast.error("Insufficient balance.");
    setSendLoading(true);
    try {
      const res = await api.post("/api/wallet/send", {
        recipient: sendTo.trim(),
        amount,
        note: sendNote.trim(),
        category: sendCat,
      });
      toast.success(`₹${amount.toLocaleString()} sent to ${sendTo}`, {
        duration: 4000,
      });
      setBalance((prev) => prev - amount);
      if (res.data?.transaction)
        setActivity((prev) => [res.data.transaction, ...prev]);
      else fetchAllData(true);
      setShowSend(false);
      setSendTo("");
      setSendAmt("");
      setSendNote("");
      setSendCat("Others");
    } catch (err) {
      toast.error(err.response?.data?.message || "Transaction failed.");
      console.error("❌ Send error:", err);
    } finally {
      setSendLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    toast.success("Logged out.");
    setTimeout(() => (window.location.href = "/login"), 1000);
  }

  // ── SKELETON ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="max-w-6xl mx-auto px-4 pt-16 space-y-10">
          <div className="flex gap-8">
            <div className="sk h-28 w-28 rounded-full" />
            <div className="flex-1 space-y-4">
              <div className="sk h-9 w-56 rounded" />
              <div className="sk h-7 w-36 rounded" />
              <div className="sk h-6 w-40 rounded" />
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="sk h-12 w-44 rounded" />
              <div className="sk h-7 w-24 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="sk h-24 rounded-3xl" />
            ))}
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="sk h-16 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="sk h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR SCREEN ─────────────────────────────────────────────────────────
  if (fetchError) {
    const isAuthError =
      fetchError.toLowerCase().includes("token") ||
      fetchError.toLowerCase().includes("login");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-rose-100">
          <FiAlertCircle className="text-5xl text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {isAuthError
              ? "Session Expired / Not Logged In"
              : "Something went wrong"}
          </h2>
          <p className="text-slate-500 text-sm mb-6">{fetchError}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition mb-3"
          >
            Go to Login
          </button>
          {!isAuthError && (
            <button
              onClick={() => {
                setFetchError(null);
                fetchAllData(false);
              }}
              className="w-full py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              <FiRefreshCw size={16} /> Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-white font-sans">
      <Toaster position="top-center" />

      {/* Floating Buttons */}
      <div className="fixed z-50 bottom-6 right-6 flex flex-col gap-3">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3.5 bg-white/90 backdrop-blur-xl border border-indigo-200/60 rounded-2xl shadow-xl hover:bg-indigo-50 transition"
            onClick={() => setProfileMenuOpen((v) => !v)}
          >
            <img
              src={
                user?.profile_picture ||
                user?.avatar ||
                getAvatar(user?.full_name)
              }
              className="w-6 h-6 rounded-full border-2 border-indigo-300 object-cover"
              alt="profile"
            />
            <FiChevronDown className="absolute bottom-1 right-2 text-xs text-indigo-400" />
          </motion.button>
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-full mr-3 bottom-0 bg-white/98 backdrop-blur-xl p-4 w-60 rounded-2xl shadow-2xl border border-indigo-100 space-y-2"
              >
                <p className="font-bold text-indigo-900">{user?.full_name}</p>
                <p className="text-xs text-indigo-400 break-all">
                  {user?.email}
                </p>
                <div className="border-t border-indigo-100 my-2" />
                <button className="flex items-center gap-2 text-sm text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg w-full transition">
                  <FiSettings size={16} /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-rose-600 hover:bg-rose-50 p-2 rounded-lg w-full transition"
                >
                  <FiLogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          className="p-3.5 bg-white/90 backdrop-blur-xl border border-indigo-200/60 rounded-2xl shadow-xl hover:bg-indigo-50 transition"
          onClick={() => {
            fetchAllData(false);
            toast.success("Refreshed!");
          }}
        >
          <FiRefreshCw />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3.5 bg-white/90 backdrop-blur-xl border border-indigo-200/60 rounded-2xl shadow-xl hover:bg-indigo-50 transition relative"
          onClick={() => setNotificationsOpen(true)}
        >
          <FiBell />
          {notifications.some((n) => !n.read) && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </motion.button>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* PROFILE CARD */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-indigo-100/60 rounded-3xl shadow-2xl p-8 md:p-10"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <img
              src={
                user?.profile_picture ||
                user?.avatar ||
                getAvatar(user?.full_name)
              }
              alt={user?.full_name}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-indigo-200 shadow-xl mx-auto md:mx-0 object-cover"
            />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-slate-900">
                {user?.full_name}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-600 mt-2 text-sm">
                <span>
                  <span className="font-semibold">Email:</span> {user?.email}
                </span>
                <span>
                  <span className="font-semibold">Mobile:</span> {user?.mobile}
                </span>
              </div>
              <div className="font-mono text-indigo-600 text-sm mt-2">
                UPI: {user?.upi_id || "Not Linked"}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${user?.kyc_verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                >
                  <FiCheckCircle />{" "}
                  {user?.kyc_verified ? "KYC Verified" : "KYC Pending"}
                </span>
                {bankOptions[bankIdx]?.branch && (
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Branch: {bankOptions[bankIdx].branch}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <span className="text-4xl font-black bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                ₹{balance.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-slate-500">Available Balance</span>
              <button
                onClick={() => setShowQRCode(true)}
                className="p-2 mt-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition shadow"
              >
                <MdQrCode size={28} />
              </button>
              {walletId && (
                <div
                  className="flex items-center gap-1 bg-indigo-50 px-4 py-1.5 rounded-xl text-xs font-mono cursor-pointer hover:bg-indigo-100 transition"
                  onClick={() => {
                    navigator.clipboard.writeText(walletId);
                    toast.success("Wallet ID copied!");
                  }}
                >
                  <FiCopy size={14} /> {walletId}
                </div>
              )}
            </div>
          </div>

          {bankOptions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-indigo-100/60">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 text-sm">
                    Bank:
                  </span>
                  <span className="bg-indigo-50 text-indigo-900 px-3 py-1 rounded-lg text-sm font-bold">
                    {bankOptions[bankIdx]?.bank}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 text-sm">
                    Account:
                  </span>
                  <span className="font-mono text-sm">
                    {bankOptions[bankIdx]?.account}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 text-sm">
                    IFSC:
                  </span>
                  <span className="font-mono text-sm">
                    {bankOptions[bankIdx]?.ifsc}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* ACTION BUTTONS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <SendMoneyFlow
            walletBalance={balance}
            onPaymentComplete={() => fetchAllData(true)}
            initialMode="send"
            label="Send"
            icon={FiArrowUpRight}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          />

          <SendMoneyFlow
            walletBalance={balance}
            onPaymentComplete={() => fetchAllData(true)}
            initialMode="request"
            label="Request"
            icon={FiUserPlus}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          />

          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReceive(true)}
            className="py-6 font-bold text-xl rounded-2xl shadow-lg flex items-center justify-center gap-3 transition bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <FiArrowDownLeft size={28} /> Receive
          </motion.button>
        </section>

        {/* MORE SERVICES */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">More Services</h3>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {moreServices.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.button
                  key={service.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowComingSoon(true)}
                  className="group flex flex-col items-center gap-3 p-5 bg-white/80 backdrop-blur-sm border border-indigo-100/60 rounded-2xl shadow-sm hover:shadow-xl hover:bg-white hover:border-indigo-300 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm shadow-indigo-100">
                    <Icon size={24} />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-slate-800 tracking-tight">
                      {service.label}
                    </span>
                    <span className="block text-[10px] font-medium text-slate-400 group-hover:text-indigo-400 transition-colors">
                      {service.detail}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* UPCOMING FEATURES */}
        <section>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            Upcoming Features
          </h3>
          <div className="flex flex-wrap gap-3">
            {FUTURE_FEATURES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/80 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200 shadow-sm"
              >
                <Icon size={16} /> {label}
              </span>
            ))}
          </div>
        </section>

        {/* TRANSACTION HISTORY */}
        <section className="bg-white/70 backdrop-blur-lg border border-indigo-100/60 rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h3 className="text-2xl font-bold text-slate-800">
              Transaction History
            </h3>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                />
                <input
                  placeholder="Search..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-white border border-indigo-100 rounded-xl text-sm focus:border-indigo-400 outline-none"
                />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 bg-white border border-indigo-100 rounded-xl text-sm"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-white border border-indigo-100 rounded-xl text-sm font-medium"
              >
                <option value="all">All</option>
                <option value="send">Sent</option>
                <option value="receive">Received</option>
              </select>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="px-3 py-2 bg-white border border-indigo-100 rounded-xl text-sm font-medium"
              >
                <option value="all">All Categories</option>
                {CATS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                placeholder="Min ₹"
                type="number"
                value={filterMin}
                onChange={(e) => setFilterMin(e.target.value)}
                className="w-20 px-2 py-2 bg-white border border-indigo-100 rounded-xl text-sm"
              />
              <input
                placeholder="Max ₹"
                type="number"
                value={filterMax}
                onChange={(e) => setFilterMax(e.target.value)}
                className="w-20 px-2 py-2 bg-white border border-indigo-100 rounded-xl text-sm"
              />
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="px-3 py-2 bg-white border border-indigo-100 rounded-xl text-sm font-medium"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredActivity.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <FiWifi className="mx-auto mb-3 text-3xl opacity-40" />
                <p>No transactions found</p>
              </div>
            ) : (
              filteredActivity.map((txn) => (
                <motion.div
                  key={txn.id || txn._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    scale: 1.01,
                    boxShadow: "0 10px 30px -10px rgba(79,70,229,0.15)",
                  }}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-indigo-100/60 cursor-pointer transition"
                  onClick={() => setTransactionModal(txn)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={txn.avatar || getAvatar(txn.name)}
                      alt={txn.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{txn.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(txn.time)} • {txn.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${txn.type === "send" ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      {txn.type === "send" ? "−" : "+"}₹
                      {Number(txn.amount).toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-indigo-400 font-mono">
                      {txn.transactionId || txn._id}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {showQRCode && (
          <Modal onClose={() => setShowQRCode(false)}>
            <div className="p-8 text-center">
              <MdQrCode size={48} className="mx-auto text-indigo-600 mb-4" />
              <QRCodeSVG
                value={walletId || user?.upi_id || "no-id"}
                size={200}
                fgColor="#4f46e5"
                className="mx-auto p-3 bg-white rounded-xl shadow-inner border-4 border-indigo-50"
              />
              <p className="mt-4 text-slate-600 font-mono text-sm">
                {walletId}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Scan to pay or receive
              </p>
            </div>
          </Modal>
        )}

        {showSend && (
          <Modal onClose={() => setShowSend(false)}>
            <div className="p-8">
              <h3 className="text-xl font-bold text-indigo-800 flex items-center gap-2 mb-4">
                <FiArrowUpRight /> Send Money
              </h3>
              <div className="text-right mb-4 text-xs text-slate-500">
                Balance:{" "}
                <span className="font-bold text-indigo-700">
                  ₹{balance.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-3 focus:border-indigo-400 outline-none"
                placeholder="Recipient (UPI ID / Phone / Email)"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
              />
              <input
                type="number"
                className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-3 focus:border-indigo-400 outline-none"
                placeholder="Amount (₹)"
                value={sendAmt}
                onChange={(e) => setSendAmt(e.target.value)}
              />
              <input
                className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-3 focus:border-indigo-400 outline-none"
                placeholder="Note (optional)"
                value={sendNote}
                onChange={(e) => setSendNote(e.target.value)}
              />
              <select
                className="w-full p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-5 focus:border-indigo-400 outline-none"
                value={sendCat}
                onChange={(e) => setSendCat(e.target.value)}
              >
                {CATS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={handleSendMoney}
                disabled={sendLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {sendLoading ? (
                  <>
                    <FiLoader className="animate-spin" /> Sending...
                  </>
                ) : (
                  "Send Now"
                )}
              </button>
            </div>
          </Modal>
        )}

        {showReceive && (
          <Modal onClose={() => setShowReceive(false)}>
            <div className="p-8 text-center">
              <h3 className="text-xl font-bold text-indigo-800 flex items-center gap-2 justify-center mb-4">
                <FiArrowDownLeft /> Receive Money
              </h3>
              <QRCodeSVG
                value={user?.upi_id || walletId || "no-upi"}
                size={160}
                fgColor="#4f46e5"
                className="mx-auto p-3 bg-white rounded-xl shadow-inner border-4 border-indigo-50"
              />
              <p className="mt-4 text-sm font-mono text-indigo-600">
                {user?.upi_id || "UPI not linked"}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user?.upi_id || "");
                  toast.success("UPI ID copied!");
                }}
                className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
              >
                Copy UPI ID
              </button>
            </div>
          </Modal>
        )}

        {showRequest && (
          <Modal onClose={() => setShowRequest(false)}>
            <div className="p-8">
              <h3 className="text-xl font-bold text-emerald-800 flex items-center gap-2 mb-6">
                <FiUserPlus /> Request Money
              </h3>
              <input
                className="w-full p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-3 outline-none"
                placeholder="From (Name / UPI / Phone)"
              />
              <input
                type="number"
                className="w-full p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-5 outline-none"
                placeholder="Amount (₹)"
              />
              <button
                onClick={() => {
                  toast.success("Request sent!");
                  setShowRequest(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition"
              >
                Send Request
              </button>
            </div>
          </Modal>
        )}

        {transactionModal && (
          <Modal onClose={() => setTransactionModal(null)}>
            <div className="p-8 max-w-md mx-auto">
              <div className="text-center mb-6">
                <img
                  src={
                    transactionModal.avatar || getAvatar(transactionModal.name)
                  }
                  alt={transactionModal.name}
                  className="w-20 h-20 rounded-full mx-auto border-4 border-indigo-200 object-cover"
                />
                <p className="font-bold text-2xl text-slate-800 mt-3">
                  {transactionModal.name}
                </p>
                <p
                  className={`text-4xl font-extrabold mt-1 ${transactionModal.type === "send" ? "text-rose-600" : "text-emerald-600"}`}
                >
                  {transactionModal.type === "send" ? "−" : "+"}₹
                  {Number(transactionModal.amount).toLocaleString("en-IN")}
                </p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${transactionModal.type === "send" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
                >
                  {transactionModal.type === "send" ? "Sent" : "Received"}
                </span>
              </div>
              <div className="space-y-3 text-sm border-t border-indigo-100 pt-4">
                {[
                  ["Date", formatDate(transactionModal.time)],
                  ["Category", transactionModal.category],
                  ["Note", transactionModal.details || "—"],
                  [
                    "Txn ID",
                    transactionModal.transactionId ||
                      transactionModal._id ||
                      "—",
                  ],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-right max-w-[60%] break-all">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}

        {showComingSoon && (
          <Modal onClose={() => setShowComingSoon(false)}>
            <div className="p-8 text-center">
              <FiZap className="text-5xl text-indigo-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Coming Soon!
              </h3>
              <p className="text-slate-500 text-sm">
                This feature is under development. Stay tuned!
              </p>
            </div>
          </Modal>
        )}

        {notificationsOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl border-l border-indigo-100 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-indigo-100">
              <h3 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
                <FiBell /> Notifications
              </h3>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-2 rounded-full hover:bg-indigo-50 transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FiBell className="mx-auto text-3xl mb-2 opacity-30" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={n.id || n._id || i}
                    className={`p-4 rounded-xl border transition ${!n.read ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-100"}`}
                  >
                    <p className="font-medium text-slate-800 text-sm">
                      {n.message || n.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(n.time || n.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ onClose, children }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-indigo-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          onClick={onClose}
        >
          <FiX size={16} />
        </button>
      </motion.div>
    </motion.div>
  );
}
