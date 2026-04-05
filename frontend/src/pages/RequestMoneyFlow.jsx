import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiUser,
  FiDollarSign,
  FiSend,
  FiSearch,
  FiAlertCircle,
  FiCheckCircle,
  FiMessageCircle,
} from "react-icons/fi";

const API = "http://localhost:5000";

// ─── Backdrop ───────────────────────────────────────────────────────────────
const Backdrop = ({ onClick }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
    className="fixed inset-0 z-[120] bg-slate-950/40 backdrop-blur-[2px]"
  />
);

// ─── RequestMoneyFlow Component ──────────────────────────────────────────────
const RequestMoneyFlow = ({ darkMode, delay, onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState("SEARCH"); // SEARCH, AMOUNT, SUCCESS
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dm = darkMode;

  // Search users API
  useEffect(() => {
    if (searchQuery.length < 2) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("facepay_token");
        const res = await fetch(
          `${API}/api/dashboard/users?query=${searchQuery}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSendRequest = async () => {
    if (!amount || amount <= 0) return setError("Please enter a valid amount");
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("facepay_token");
      const res = await fetch(`${API}/api/dashboard/request-money`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          amount: parseFloat(amount),
          note,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("SUCCESS");
      } else {
        setError(data.message || "Request failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeFlow = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep("SEARCH");
      setSearchQuery("");
      setSelectedUser(null);
      setAmount("");
      setNote("");
      setError("");
    }, 300);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl w-full transition-all duration-200 ${
          dm
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
            dm
              ? "bg-purple-900/50 text-purple-400 group-hover:bg-purple-600 group-hover:text-white"
              : "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
          }`}
        >
          <FiDollarSign className="text-xl" />
        </div>
        <span
          className={`text-xs font-bold tracking-wide uppercase ${
            dm
              ? "text-slate-400 group-hover:text-slate-200"
              : "text-slate-600 group-hover:text-slate-900"
          }`}
        >
          Request
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <Backdrop onClick={closeFlow} />

            <motion.div
              layoutId="request-flow-modal"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className={`relative z-[140] w-full max-w-md overflow-hidden rounded-3xl shadow-2xl border ${
                dm
                  ? "bg-slate-900 border-white/10"
                  : "bg-white border-slate-200"
              }`}
            >
              {/* Header */}
              <div
                className={`p-6 border-b flex items-center justify-between ${dm ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50/50"}`}
              >
                <h2
                  className={`text-xl font-bold flex items-center gap-3 ${dm ? "text-white" : "text-slate-900"}`}
                >
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-500">
                    <FiDollarSign size={18} />
                  </div>
                  Request Money
                </h2>
                <button
                  onClick={closeFlow}
                  className={`p-2 rounded-full transition-colors ${dm ? "hover:bg-white/10 text-slate-400" : "hover:bg-black/5 text-slate-500"}`}
                >
                  <FiX />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === "SEARCH" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border transition-all ${
                          dm
                            ? "bg-white/5 border-white/10 text-white focus:border-purple-500"
                            : "bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500"
                        }`}
                      />
                    </div>

                    <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {users.length > 0 ? (
                        users.map((user) => (
                          <motion.button
                            key={user.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => {
                              setSelectedUser(user);
                              setStep("AMOUNT");
                            }}
                            className={`flex items-center gap-4 w-full p-3 rounded-2xl transition-colors ${
                              dm ? "hover:bg-white/5" : "hover:bg-slate-100"
                            }`}
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-lg border-2 border-white/10">
                              {user.profile_picture ? (
                                <img
                                  src={user.profile_picture}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                user.name.charAt(0)
                              )}
                            </div>
                            <div className="text-left">
                              <p
                                className={`font-bold ${dm ? "text-white" : "text-slate-900"}`}
                              >
                                {user.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {user.upi_id}
                              </p>
                            </div>
                            <div
                              className={`ml-auto p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${dm ? "bg-white/10" : "bg-slate-200"}`}
                            >
                              <FiSend className="text-purple-500" />
                            </div>
                          </motion.button>
                        ))
                      ) : searchQuery.length >= 2 ? (
                        <div className="text-center py-10">
                          <p className="text-slate-500">
                            No users found matching "{searchQuery}"
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-10 opacity-50">
                          <FiUser
                            size={40}
                            className="mx-auto mb-3 text-slate-400"
                          />
                          <p className="text-sm text-slate-500 italic px-8">
                            Find someone from the FacePay network to request
                            money
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === "AMOUNT" && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* User Profile Header */}
                    <div
                      className={`flex items-center gap-4 p-4 rounded-2xl ${dm ? "bg-white/5" : "bg-slate-50"}`}
                    >
                      <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {selectedUser.name.charAt(0)}
                      </div>
                      <div>
                        <p
                          className={`font-bold ${dm ? "text-white" : "text-slate-900 text-lg"}`}
                        >
                          {selectedUser.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {selectedUser.upi_id}
                        </p>
                      </div>
                      <button
                        onClick={() => setStep("SEARCH")}
                        className="ml-auto text-xs font-bold text-purple-500 underline uppercase tracking-tight"
                      >
                        Change
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-xs font-bold uppercase tracking-widest mb-2 ml-1 ${dm ? "text-slate-400" : "text-slate-500"}`}
                        >
                          Amount (₹)
                        </label>
                        <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-purple-500">
                            ₹
                          </div>
                          <input
                            autoFocus
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={`w-full pl-10 pr-4 py-6 text-4xl font-black rounded-3xl border-2 transition-all text-center focus:ring-0 ${
                              dm
                                ? "bg-black/20 border-white/10 text-white focus:border-purple-500"
                                : "bg-white border-slate-200 text-slate-900 focus:border-purple-500"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <FiMessageCircle className="absolute left-4 top-4 text-slate-400" />
                        <textarea
                          placeholder="What's this for? (optional)"
                          rows={2}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className={`w-full pl-11 pr-4 py-3 rounded-2xl border transition-all resize-none ${
                            dm
                              ? "bg-white/5 border-white/10 text-white focus:border-purple-500"
                              : "bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500"
                          }`}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 text-red-500 text-sm font-medium">
                        <FiAlertCircle className="shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendRequest}
                      disabled={loading || !amount}
                      className="w-full py-4 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 text-white font-black text-lg shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiSend /> Send Request
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}

                {step === "SUCCESS" && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-10 text-center space-y-6"
                  >
                    <div className="relative mx-auto w-24 h-24">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          damping: 12,
                          stiffness: 200,
                        }}
                        className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
                      >
                        <FiCheckCircle size={48} className="text-white" />
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-green-500 rounded-full"
                      />
                    </div>

                    <div>
                      <h3
                        className={`text-2xl font-black mb-2 ${dm ? "text-white" : "text-slate-900"}`}
                      >
                        Request Sent!
                      </h3>
                      <p className="text-slate-500">
                        We've notified {selectedUser.name} about your request
                        for ₹{amount}.
                      </p>
                    </div>

                    <button
                      onClick={closeFlow}
                      className="w-full py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                    >
                      Done
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RequestMoneyFlow;
