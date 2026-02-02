import React, { useState, useEffect } from "react";
import {
  FiSend,
  FiUserCheck,
  FiMic,
  FiMicOff,
  FiCheckCircle,
  FiX,
  FiArrowLeft,
  FiSmartphone,
  FiShield,
  FiCamera,
  FiSearch,
  FiClock,
  FiChevronRight,
  FiMoreHorizontal,
  FiTrendingUp,
  FiPlus,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK DATA ---
const SAVED_BENEFICIARIES = [
  {
    id: 1,
    name: "Rahul Kumar",
    upi: "rahul@okicici",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Priya Singh",
    upi: "priya@ybl",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Amit Verma",
    upi: "amit@paytm",
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
  },
  {
    id: 4,
    name: "Mom",
    upi: "mom@sbi",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: 5,
    name: "Vikram M",
    upi: "vikram@axis",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    id: 6,
    name: "Anjali D",
    upi: "anjali@hdfc",
    avatar: "https://randomuser.me/api/portraits/women/23.jpg",
  },
  {
    id: 7,
    name: "Rohan K",
    upi: "rohan@ibl",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
];

const RECENT_TXNS = [
  {
    id: 101,
    name: "Swiggy",
    date: "Today, 12:30 PM",
    amount: -240,
    icon: "🍔",
    status: "Sent",
  },
  {
    id: 102,
    name: "Uber",
    date: "Yesterday, 6:00 PM",
    amount: -190,
    icon: "🚖",
    status: "Sent",
  },
  {
    id: 103,
    name: "Netflix",
    date: "24 Jan, 9:00 AM",
    amount: -649,
    icon: "🎬",
    status: "Sent",
  },
  {
    id: 104,
    name: "Priya Singh",
    date: "22 Jan, 4:30 PM",
    amount: -2000,
    icon: "👤",
    status: "Sent",
  },
];

// --- MODAL COMPONENTS (Same Logic, Adjusted UI for Desktop) ---

function RecipientScannerModal({ open, onIdentified, onClose }) {
  const [status, setStatus] = useState("scanning");

  useEffect(() => {
    if (open) {
      setStatus("scanning");
      const timer = setTimeout(() => {
        setStatus("found");
        setTimeout(() => {
          onIdentified(SAVED_BENEFICIARIES[0]);
        }, 1200);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onIdentified]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
        >
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white p-3 bg-white/10 rounded-full backdrop-blur-md z-20 hover:bg-white/20 transition-all"
          >
            <FiX size={24} />
          </button>

          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-900">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
              alt="Camera Feed"
            />

            <div className="relative z-10 w-80 h-80 lg:w-96 lg:h-96 rounded-[2rem] border-[3px] border-white/20 overflow-hidden flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl"></div>

              {status === "scanning" && (
                <motion.div
                  className="absolute w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_25px_rgba(99,102,241,1)]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
              {status === "found" && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-sm"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                    <FiCheckCircle className="text-4xl text-white" />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="relative z-10 mt-10 text-center space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-wide">
                {status === "scanning" ? "Scanning..." : "Target Locked"}
              </h3>
              <p className="text-white/60 text-sm font-medium">
                Align face within frame
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SelfVerificationModal({ open, onVerified, onClose }) {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (open && status === "idle") {
      setStatus("scanning");
      setTimeout(() => {
        setStatus("success");
        setTimeout(() => {
          onVerified();
          setTimeout(() => setStatus("idle"), 500);
        }, 800);
      }, 2000);
    }
  }, [open, status, onVerified]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white w-full max-w-sm rounded-3xl p-8 text-center relative shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-800"
            >
              <FiX size={20} />
            </button>
            <div className="w-24 h-24 mx-auto mb-6 relative">
              {status === "scanning" && (
                <div className="absolute inset-0 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              )}
              <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center text-4xl text-indigo-300">
                {status === "success" ? (
                  <FiUserCheck className="text-green-500" />
                ) : (
                  <FiUserCheck />
                )}
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Confirm Identity
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Security verification required
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VoiceAmountModal({ open, onAmount, onClose }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manual, setManual] = useState("");
  const [mode, setMode] = useState("voice");

  const startListening = () => {
    setListening(true);
    setTranscript("Listening...");
    setTimeout(() => {
      setTranscript("500 Rupees");
      setTimeout(() => {
        setListening(false);
        onAmount(500);
      }, 1000);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 relative shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 z-10"
            >
              <FiX size={24} />
            </button>
            {mode === "voice" ? (
              <div className="flex flex-col items-center pt-4 relative z-10">
                <button
                  onClick={startListening}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-6 transition-all shadow-xl shadow-indigo-200 ${listening ? "bg-indigo-600 text-white animate-pulse" : "bg-white text-indigo-600 border border-indigo-100"}`}
                >
                  {listening ? <FiMicOff /> : <FiMic />}
                </button>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {listening ? "Say Amount..." : "Tap & Speak"}
                </h2>
                <p className="text-sm font-medium text-gray-400 mb-8 bg-gray-50 px-4 py-2 rounded-lg">
                  {transcript || 'e.g. "Five Hundred Rupees"'}
                </p>
                <button
                  onClick={() => setMode("manual")}
                  className="w-full py-3 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Switch to Keyboard
                </button>
              </div>
            ) : (
              <div className="pt-4 relative z-10">
                <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">
                  Enter Amount
                </h2>
                <div className="relative mb-8">
                  <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    autoFocus
                    value={manual}
                    onChange={(e) => setManual(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-5 pl-12 pr-6 text-4xl font-bold text-gray-900 outline-none text-center transition-all shadow-inner"
                    placeholder="0"
                  />
                </div>
                <button
                  onClick={() => manual && onAmount(manual)}
                  disabled={!manual}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-300 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  Confirm Amount
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessScreen({ amount, recipient, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-green-500 flex flex-col items-center justify-center text-white p-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-green-500 text-5xl mb-8 shadow-2xl"
      >
        <FiCheckCircle />
      </motion.div>
      <h1 className="text-3xl font-bold mb-2">Payment Sent!</h1>
      <p className="text-green-100 mb-8">Transaction ID: TXN882910</p>
      <div className="bg-white text-gray-900 rounded-3xl p-1 w-full max-w-sm shadow-2xl">
        <div className="border-2 border-dashed border-gray-100 rounded-[1.3rem] p-6 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Total Amount
          </p>
          <div className="text-4xl font-bold mb-6 text-gray-900">₹{amount}</div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl text-left">
            <img
              src={recipient?.avatar}
              className="w-10 h-10 rounded-full"
              alt=""
            />
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">To</p>
              <p className="font-bold text-sm">{recipient?.name}</p>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="mt-12 bg-white/20 border border-white/40 text-white px-10 py-3 rounded-full font-bold hover:bg-white hover:text-green-600 transition-all"
      >
        Done
      </button>
    </motion.div>
  );
}

// --- MAIN PAGE LAYOUT ---

export default function SendMoney() {
  const navigate = useNavigate();
  const [flow, setFlow] = useState("initial");
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState(0);

  const startScan = () => setFlow("scanning");

  const handleRecipientFound = (u) => {
    setRecipient(u);
    setFlow("verifying");
  };

  const handleSelfVerified = () => setFlow("amount");

  const handleAmountSet = (val) => {
    setAmount(val);
    setFlow("sending");
    setTimeout(() => setFlow("success"), 2000);
  };

  const reset = () => {
    setFlow("initial");
    setRecipient(null);
    setAmount(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER - Wide & Stretched */}
      <header className="bg-white sticky top-0 z-20 px-6 py-4 shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
            >
              <FiArrowLeft size={22} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Send Money</h1>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center bg-gray-100 px-4 py-2.5 rounded-xl w-96">
            <FiSearch className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search name, UPI ID or mobile..."
              className="bg-transparent w-full outline-none text-sm font-medium text-gray-700"
            />
          </div>

          <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-700">
            <FiMoreHorizontal size={22} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT - Grid Layout for Stretching */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Actions & Beneficiaries (Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* HERO CARD - Stretched Wide */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={startScan}
              className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[2rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-500/20 cursor-pointer group w-full"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl border border-white/20 shadow-inner group-hover:rotate-12 transition-transform duration-300">
                    <FiCamera />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      Scan Face to Pay
                    </h2>
                    <p className="text-indigo-100 text-sm md:text-base font-medium opacity-90 max-w-md">
                      The fastest, most secure way to send money. Point camera
                      at recipient to identify & pay instantly.
                    </p>
                  </div>
                </div>

                <div className="bg-white text-indigo-700 px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg group-hover:scale-105 transition-transform">
                  Start Scan <FiChevronRight />
                </div>
              </div>
            </motion.div>

            {/* QUICK CONTACTS - Wide Grid */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">People</h3>
                <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer hover:bg-indigo-100">
                  View All
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-6">
                {/* Add New */}
                <div className="flex flex-col items-center gap-3 cursor-pointer group">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 group-hover:border-indigo-500 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                    <FiPlus size={24} />
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    New ID
                  </span>
                </div>

                {/* Beneficiaries */}
                {SAVED_BENEFICIARIES.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleRecipientFound(u)}
                    className="flex flex-col items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative">
                      <img
                        src={u.avatar}
                        className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500 transition-all shadow-sm"
                        alt={u.name}
                      />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="text-xs font-bold text-gray-700 truncate w-full text-center group-hover:text-indigo-600">
                      {u.name.split(" ")[0]}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Recent Transactions (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Recent Activity
                </h3>
                <FiTrendingUp className="text-gray-400" />
              </div>

              <div className="space-y-1">
                {RECENT_TXNS.map((txn) => (
                  <div
                    key={txn.id}
                    className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl group-hover:bg-white group-hover:shadow-md transition-all">
                        {txn.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{txn.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">
                          {txn.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ₹{Math.abs(txn.amount)}
                      </div>
                      <div className="text-[10px] font-bold text-green-500 uppercase">
                        {txn.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Show Full History
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Bar (Sticky Bottom for Active Flow) */}
      <AnimatePresence>
        {recipient && flow !== "success" && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40"
          >
            <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-gray-800">
              <div className="flex items-center gap-4">
                <img
                  src={recipient.avatar}
                  className="w-12 h-12 rounded-full border-2 border-indigo-500"
                  alt=""
                />
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Sending Money To
                  </p>
                  <p className="font-bold text-lg">{recipient.name}</p>
                </div>
              </div>

              {/* Flow Progress Steps */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${flow === "verifying" ? "bg-white text-indigo-900" : "text-gray-500"}`}
                >
                  {flow === "verifying" && (
                    <FiShield className="animate-pulse" />
                  )}{" "}
                  1. Verify
                </div>
                <FiChevronRight className="text-gray-700" size={14} />
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${flow === "amount" ? "bg-white text-indigo-900" : "text-gray-500"}`}
                >
                  {flow === "amount" && <FiMic className="animate-pulse" />} 2.
                  Amount
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <RecipientScannerModal
        open={flow === "scanning"}
        onIdentified={handleRecipientFound}
        onClose={reset}
      />
      <SelfVerificationModal
        open={flow === "verifying"}
        onVerified={handleSelfVerified}
        onClose={reset}
      />
      <VoiceAmountModal
        open={flow === "amount"}
        onAmount={handleAmountSet}
        onClose={reset}
      />
      {flow === "success" && (
        <SuccessScreen amount={amount} recipient={recipient} onClose={reset} />
      )}
    </div>
  );
}
