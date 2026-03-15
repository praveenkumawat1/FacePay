import React, { useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiGift,
  FiAlertTriangle,
  FiDownload,
  FiUserCheck,
  FiX,
  FiSettings,
  FiVolumeX,
  FiVolume2,
  FiRepeat,
  FiCheck,
  FiCreditCard,
  FiShield,
  FiTrendingUp,
  FiInbox,
  FiFilter,
  FiTrash2,
  FiEye,
  FiCheckCircle,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

// --- DEMO Data & Util ---
const SOUND_URL =
  "https://cdn.pixabay.com/audio/2022/07/26/audio_123cfa4cf8.mp3";

function randomNotification(id = Date.now()) {
  const seed = Math.floor(Math.random() * 5);
  const notifs = [
    {
      id,
      type: "offer",
      icon: <FiGift />,
      iconBg: "from-amber-400 to-orange-500",
      iconColor: "text-white",
      title: "Limited Time 7% Cashback",
      desc: "Recharge before midnight for 7% cashback.",
      tag: "offers",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    },
    {
      id,
      type: "reminder",
      icon: <FiAlertTriangle />,
      iconBg: "from-red-400 to-pink-500",
      iconColor: "text-white",
      title: "Billing Alert",
      desc: "Electricity bill is due in 2 days.",
      tag: "billing",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    },
    {
      id,
      type: "txn",
      icon: <FiDownload />,
      iconBg: "from-indigo-400 to-purple-500",
      iconColor: "text-white",
      title: "UPI Success",
      desc: "₹1,220 received from Ankit Sharma.",
      tag: "transaction",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    },
    {
      id,
      type: "important",
      icon: <FiUserCheck />,
      iconBg: "from-green-400 to-emerald-500",
      iconColor: "text-white",
      title: "Face Verified",
      desc: "Payment authenticated by FaceID.",
      tag: "important",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    },
    {
      id,
      type: "txn",
      icon: <FiCreditCard />,
      iconBg: "from-blue-400 to-cyan-500",
      iconColor: "text-white",
      title: "Wallet Topup",
      desc: "₹5,000 added using UPI.",
      tag: "transaction",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
    },
  ];
  return notifs[seed];
}

const FILTERS = [
  { key: "all", label: "All", icon: <FiInbox /> },
  { key: "unread", label: "Unread", icon: <FiBell /> },
  { key: "offers", label: "Offers", icon: <FiGift /> },
  { key: "transaction", label: "Transactions", icon: <FiCreditCard /> },
  { key: "important", label: "Important", icon: <FiShield /> },
];

// --- MAIN SYSTEM ---
export default function NotificationsSystem() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "offer",
      tag: "offers",
      icon: <FiGift />,
      iconBg: "from-indigo-400 to-purple-500",
      iconColor: "text-white",
      title: "Welcome to Facepay 👋",
      desc: "Enjoy secure payments & instant offers.",
      time: "09:00 AM",
      read: true,
    },
  ]);
  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);

  // Settings state
  const [muteOffers, setMuteOffers] = useState(false);
  const [muteBilling, setMuteBilling] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const audioRef = useRef();

  // ========== Simulate REAL-TIME notifications ==========
  useEffect(() => {
    const interval = setInterval(() => {
      let n = randomNotification();
      if (
        (n.tag === "offers" && muteOffers) ||
        (n.tag === "billing" && muteBilling)
      )
        return;
      setNotifications((prev) => [n, ...prev]);
      if (soundsEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [muteOffers, muteBilling, soundsEnabled]);

  // ========== Smart Filtering ==========
  const shown = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    if (filter === "offers") return n.tag === "offers";
    if (filter === "transaction") return n.tag === "transaction";
    if (filter === "important") return n.tag === "important";
    return true;
  });

  // ========== Actions ==========
  function markAllRead() {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    setNotifications([]);
  }

  function dismiss(id) {
    setNotifications((ns) => ns.filter((n) => n.id !== id));
    if (selectedNotif?.id === id) setSelectedNotif(null);
  }

  function markAsRead(id) {
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  function toggleRead(id) {
    setNotifications((ns) =>
      ns.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 pb-16">
      {/* Audio */}
      <audio ref={audioRef} src={SOUND_URL} preload="auto" />

      <div className="max-w-4xl w-full mx-auto px-4">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between pt-10 pb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <FiBell className="text-2xl text-white" />
              </div>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full font-bold bg-red-500 text-white text-xs flex items-center justify-center border-2 border-white shadow-md"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.span>
              )}
            </div>
            <div>
              <h1 className="font-bold text-2xl text-gray-900">
                Notifications
              </h1>
              <p className="text-sm text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "You're all caught up!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl transition ${showSettings ? "bg-indigo-100 text-indigo-600" : "bg-white text-gray-600 hover:bg-gray-100"} shadow-sm border border-gray-100`}
              title="Notification preferences"
              onClick={() => setShowSettings((s) => !s)}
            >
              <FiSettings className="text-lg" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl bg-white shadow-sm border border-gray-100 transition ${soundsEnabled ? "text-indigo-600" : "text-gray-400"}`}
              title="Toggle sound"
              onClick={() => setSoundsEnabled((s) => !s)}
            >
              {soundsEnabled ? (
                <FiVolume2 className="text-lg" />
              ) : (
                <FiVolumeX className="text-lg" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-100 transition"
              title="Refresh"
            >
              <FiRepeat className="text-lg" />
            </motion.button>
          </div>
        </div>

        {/* --- Settings Panel --- */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FiFilter className="text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">
                    Notification Preferences
                  </h3>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                        <FiGift className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Offer Notifications
                        </p>
                        <p className="text-xs text-gray-500">
                          Deals, cashback & promotions
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!muteOffers}
                      onChange={(e) => setMuteOffers(!e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                        <FiAlertTriangle className="text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Billing Reminders
                        </p>
                        <p className="text-xs text-gray-500">
                          Due dates & payment alerts
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={!muteBilling}
                      onChange={(e) => setMuteBilling(!e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs text-blue-800">
                    <FiShield className="inline mr-1" />
                    Your notification preferences are saved locally and applied
                    immediately.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- FILTER TABS --- */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {FILTERS.map((f) => (
            <motion.button
              key={f.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border transition whitespace-nowrap ${
                filter === f.key
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-200"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
              }`}
              onClick={() => setFilter(f.key)}
            >
              {f.icon}
              {f.label}
            </motion.button>
          ))}
        </div>

        {/* --- STATS BAR --- */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {notifications.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold mb-1">Unread</p>
            <p className="text-2xl font-bold text-indigo-600">{unreadCount}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold mb-1">Read</p>
            <p className="text-2xl font-bold text-green-600">
              {notifications.length - unreadCount}
            </p>
          </div>
        </div>

        {/* --- NOTIFICATION LIST --- */}
        <motion.div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {shown.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiInbox className="text-4xl text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-semibold">
                No notifications found
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Check back later for updates
              </p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-100">
              {shown.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-start gap-4 p-5 relative group cursor-pointer transition ${
                    n.read
                      ? "bg-white hover:bg-gray-50"
                      : "bg-indigo-50/30 hover:bg-indigo-50/50"
                  }`}
                  onClick={() => {
                    setSelectedNotif(n);
                    if (!n.read) markAsRead(n.id);
                  }}
                >
                  {/* Unread Indicator */}
                  {!n.read && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute left-2 top-8 w-2.5 h-2.5 rounded-full bg-indigo-600"
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${n.iconBg} flex items-center justify-center ${n.iconColor} shadow-md group-hover:scale-110 transition flex-shrink-0`}
                  >
                    {React.cloneElement(n.icon, { size: 20 })}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-bold text-sm ${n.read ? "text-gray-700" : "text-gray-900"}`}
                      >
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded-full">
                          NEW
                        </span>
                      )}
                      {n.tag === "important" && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {n.desc}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <FiCheck size={12} /> {n.time}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRead(n.id);
                      }}
                      className="p-2 hover:bg-indigo-100 rounded-lg text-gray-500 hover:text-indigo-600 transition"
                      title={n.read ? "Mark as unread" : "Mark as read"}
                    >
                      {n.read ? (
                        <FiEye size={16} />
                      ) : (
                        <FiCheckCircle size={16} />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        dismiss(n.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg text-gray-500 hover:text-red-600 transition"
                      title="Remove"
                    >
                      <FiX size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* --- BOTTOM ACTIONS --- */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mt-6"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              <FiCheckCircle /> Mark All Read
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearAll}
              className="flex-1 py-4 rounded-xl bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              <FiTrash2 /> Clear All
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* --- NOTIFICATION DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedNotif && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNotif(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`p-6 bg-gradient-to-br ${selectedNotif.iconBg} text-white`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    {React.cloneElement(selectedNotif.icon, { size: 24 })}
                  </div>
                  <button
                    onClick={() => setSelectedNotif(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <h2 className="text-2xl font-bold">{selectedNotif.title}</h2>
                <p className="text-white/80 text-sm mt-2">
                  {selectedNotif.time}
                </p>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">
                  {selectedNotif.desc}
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      dismiss(selectedNotif.id);
                      setSelectedNotif(null);
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => setSelectedNotif(null)}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
