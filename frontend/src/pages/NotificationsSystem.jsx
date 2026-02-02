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
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

// --- DEMO Data & Util ---
const SOUND_URL =
  "https://cdn.pixabay.com/audio/2022/07/26/audio_123cfa4cf8.mp3"; // Free notification ding

function randomNotification(id = Date.now()) {
  const seed = Math.floor(Math.random() * 5);
  if (seed === 0)
    return {
      id,
      type: "offer",
      icon: <FiGift className="text-yellow-500" />,
      title: "Limited Time 7% Cashback",
      desc: "Recharge before midnight for 7% cashback.",
      tag: "offers",
      time: new Date().toLocaleTimeString(),
      read: false,
    };
  if (seed === 1)
    return {
      id,
      type: "reminder",
      icon: <FiAlertTriangle className="text-red-500" />,
      title: "Billing Alert",
      desc: "Electricity bill is due in 2 days.",
      tag: "billing",
      time: new Date().toLocaleTimeString(),
      read: false,
    };
  if (seed === 2)
    return {
      id,
      type: "txn",
      icon: <FiDownload className="text-indigo-600" />,
      title: "UPI Success",
      desc: "₹1,220 received from Ankit Sharma.",
      tag: "transaction",
      time: new Date().toLocaleTimeString(),
      read: false,
    };
  if (seed === 3)
    return {
      id,
      type: "important",
      icon: <FiUserCheck className="text-green-600" />,
      title: "Face Verified",
      desc: "Payment authenticated by FaceID.",
      tag: "important",
      time: new Date().toLocaleTimeString(),
      read: false,
    };
  return {
    id,
    type: "txn",
    icon: <FiDownload className="text-indigo-600" />,
    title: "Wallet Topup",
    desc: "₹5,000 added using UPI.",
    tag: "transaction",
    time: new Date().toLocaleTimeString(),
    read: false,
  };
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "offers", label: "Offers" },
  { key: "transaction", label: "Txn" },
  { key: "important", label: "Important" },
];

// --- MAIN SYSTEM ---
export default function NotificationsSystem() {
  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "offer",
      tag: "offers",
      icon: <FiGift className="text-yellow-500" />,
      title: "Welcome to Facepay 👋",
      desc: "Enjoy secure payments & instant offers.",
      time: "09:00",
      read: true,
    },
  ]);
  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  // Settings state ("Notification" preferences)
  const [muteOffers, setMuteOffers] = useState(false);
  const [muteBilling, setMuteBilling] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  // Notification badge/counter
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Notification sound
  const audioRef = useRef();

  // ========== Simulate REAL-TIME new notifications (poll, WebSocket, FCM) ==========
  useEffect(() => {
    // For PWA/FCM: Ask notification permission
    // if(window.Notification && Notification.permission !== "granted") {
    //   Notification.requestPermission();
    // }
    // Polling: every 16 sec, randomly add a notification
    const interval = setInterval(() => {
      // randomly block unwanted types based on settings
      let n = randomNotification();
      if (
        (n.tag === "offers" && muteOffers) ||
        (n.tag === "billing" && muteBilling)
      )
        return;
      setNotifications((prev) => [n, ...prev]);
      if (soundsEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      // In real world: Use WebSocket or push event here (FCM/SignalR/Pusher etc)
    }, 16000);
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

  // ========== Mark/Clear/Dismiss actions ==========
  function markAllRead() {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }
  function clearAll() {
    setNotifications([]);
  }
  function dismiss(id) {
    setNotifications((ns) => ns.filter((n) => n.id !== id));
  }

  // ========== In-app Push Notification on arrival (for demo) ==========
  // For production: Use service worker registration for push (PWA), and show OS or in-app toast as preferred.

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/65 pb-10">
      {/* Notification sound reference (hidden) */}
      <audio ref={audioRef} src={SOUND_URL} preload="auto" />

      {/* --- HEADER --- */}
      <div className="max-w-xl w-full mx-auto">
        <div className="flex items-center justify-between pt-8 pb-5 px-2 sm:px-0">
          <div className="flex items-center gap-2">
            <span className="relative">
              <FiBell className="text-2xl text-indigo-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 px-2.5 py-px text-xs rounded-full font-bold bg-red-500 text-white border-2 border-white animate-pulse select-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span className="font-bold text-xl text-indigo-900">
              Notifications
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className={`p-2 rounded-full hover:bg-indigo-50 ${showSettings ? "bg-indigo-50" : ""}`}
              title="Notification preferences"
              onClick={() => setShowSettings((s) => !s)}
            >
              <FiSettings className="text-lg" />
            </button>
            <button
              className={`p-2 rounded-full hover:bg-indigo-50`}
              title="Mute / Unmute sounds"
              onClick={() => setSoundsEnabled((s) => !s)}
            >
              {soundsEnabled ? (
                <FiVolume2 className="text-lg" />
              ) : (
                <FiVolumeX className="text-lg" />
              )}
            </button>
            <button
              className="p-2 rounded-full hover:bg-indigo-50"
              title="Refresh (Poll)"
            >
              <FiRepeat />
            </button>
          </div>
        </div>

        {/* --- Notification Settings --- */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="rounded-xl border px-6 py-6 mb-5 bg-white/90 shadow flex flex-col gap-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
            >
              <div className="font-bold text-indigo-900 mb-2">
                Notification Filters
              </div>
              <label className="flex gap-3 font-medium items-center text-indigo-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={muteOffers}
                  onChange={(e) => setMuteOffers(e.target.checked)}
                  className="rounded border-indigo-400"
                />{" "}
                Mute offer notifications
              </label>
              <label className="flex gap-3 font-medium items-center text-indigo-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={muteBilling}
                  onChange={(e) => setMuteBilling(e.target.checked)}
                  className="rounded border-indigo-400"
                />{" "}
                Mute billing reminders
              </label>
              <div className="text-xs text-gray-500">
                You will not receive push or in-app notifications for muted
                categories.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- FILTER TABS --- */}
        <div className="flex gap-1 pb-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition
              ${
                filter === f.key
                  ? "bg-indigo-100 text-indigo-900 border-indigo-200"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* --- NOTIFICATION LIST --- */}
        <motion.div className="bg-white/90 rounded-2xl shadow-sm border border-indigo-100 divide-y transition">
          {shown.length === 0 ? (
            <div className="py-16 text-gray-400 text-center text-lg select-none">
              📭 No notifications found
            </div>
          ) : (
            shown.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.035,
                  type: "spring",
                  stiffness: 260,
                }}
                className={`flex px-6 py-5 items-start gap-4 relative ${n.read ? "bg-white/80" : "bg-amber-50/20"}`}
              >
                {!n.read && (
                  <span className="absolute left-2 top-7 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                )}
                <div
                  className="p-2 rounded-full"
                  style={{
                    background:
                      n.type === "offer"
                        ? "rgba(253,230,138,0.39)"
                        : n.type === "reminder"
                          ? "rgba(254,202,202,0.48)"
                          : n.type === "txn"
                            ? "rgba(199,210,254,0.18)"
                            : "rgba(209,250,229,0.19)",
                  }}
                >
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-[15px] ${n.read ? "text-gray-700" : "text-indigo-800"}`}
                    >
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 ml-1">
                        NEW
                      </span>
                    )}
                    {n.tag === "important" && (
                      <span className="text-[10px] ml-1 font-semibold bg-red-100 text-red-700 rounded-full px-2 py-0.5">
                        Important
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{n.desc}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{n.time}</div>
                </div>
                <button
                  onClick={() => dismiss(n.id)}
                  className="ml-3 p-2 -mr-3 text-gray-400 hover:text-indigo-600 rounded-full transition"
                  title="Remove"
                >
                  <FiX />
                </button>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* --- BOTTOM ACTIONS --- */}
        <div className="flex items-center justify-between gap-2 mt-6">
          <button
            onClick={markAllRead}
            className="w-1/2 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-800 transition disabled:bg-indigo-300"
            disabled={notifications.length === 0 || unreadCount === 0}
          >
            Mark All Read
          </button>
          <button
            onClick={clearAll}
            className="w-1/2 py-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold transition disabled:opacity-50"
            disabled={notifications.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
