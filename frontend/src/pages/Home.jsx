import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, Area, AreaChart, ResponsiveContainer } from "recharts";
import {
  FiGrid,
  FiPocket,
  FiActivity,
  FiUsers,
  FiBell,
  FiShield,
  FiCpu,
  FiUserCheck,
  FiEye,
  FiLock,
  FiGlobe,
  FiZap,
  FiCheckCircle,
  FiPieChart,
  FiTerminal,
  FiDatabase,
  FiServer,
  FiCreditCard,
  FiAlertCircle,
  FiStar,
  FiArrowRight,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiSend,
  FiDownload,
  FiCamera,
  FiUser,
  FiMail,
  FiPhone,
  FiEdit2,
  FiEyeOff,
  FiKey,
  FiLoader,
  FiSave,
  FiX,
  FiPlus,
  FiGift,
  FiMessageCircle,
  FiSmartphone,
  FiRefreshCw,
  FiTrash2,
  FiChevronRight,
  FiBarChart2,
  FiFileText,
  FiExternalLink,
  FiLink2,
  FiMoon,
  FiHelpCircle,
} from "react-icons/fi";

// Import all section components
import CursorTrailImages from "../components/CursorTrailImages";
import ModernLaptopShowcase from "../components/ModernLaptopShowcase";
import DashboardStack from "../components/DashboardStack";
import HyperPerfectReveal from "../components/HyperPerfectReveal";
import AestheticSplitReveal from "../components/AestheticSplitReveal";
import IndustrialCleanSecurity from "../components/IndustrialCleanSecurity";
import StatsBridge from "../components/StatsBridge";
import CleanHighlightReveal from "../components/CleanHighlightReveal";
import FacePayLiteFAQ from "../components/FacePayLiteFAQ";
import HeroFeature from "../components/HeroFeature";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import VaultCard from "../components/VaultCard";
import ComplianceCard from "../components/ComplianceCard";
import DashHeader from "../components/DashHeader";

// Other imports (Footer, Testimonials)
import UniqueFacePayFooter from "../components/Footer.jsx";
import Testimonials from "./Testimonials";

// --- Reusable Action Button (glass style) ---
const ActionButton = ({ icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group flex flex-col items-center justify-center p-4 rounded-2xl w-full transition-all duration-200"
    style={{
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.4)",
      boxShadow: "0 4px 30px rgba(0,0,0,0.05)",
    }}
  >
    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mb-2 group-hover:bg-indigo-600 group-hover:text-white transition">
      <span className="text-xl">{icon}</span>
    </div>
    <span className="text-xs font-bold text-slate-600 tracking-wide uppercase group-hover:text-slate-900">
      {label}
    </span>
  </motion.button>
);

const Home = () => {
  // State for popup (unchanged)
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);
  const popupRef = useRef(null);

  // Sample data for charts
  const chartData = [
    { name: "Jan", v: 30 },
    { name: "Feb", v: 45 },
    { name: "Mar", v: 38 },
    { name: "Apr", v: 65 },
    { name: "May", v: 48 },
    { name: "Jun", v: 80 },
  ];

  // Sample wallet balance
  const [balance] = useState(15450);

  // Update popup position
  useEffect(() => {
    if (showPopup && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.bottom + window.scrollY + 12,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, [showPopup]);

  const handleMouseEnterTarget = () => setShowPopup(true);
  const handleMouseLeaveTarget = (e) => {
    if (!popupRef.current || !popupRef.current.contains(e.relatedTarget)) {
      setShowPopup(false);
    }
  };
  const handleMouseLeavePopup = () => setShowPopup(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100 font-sans">
      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-24 pb-12 text-center px-4 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_#EEF2FF_0%,_transparent_70%)] -z-10 opacity-70" />
        <CursorTrailImages />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-[12px] font-bold mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            INDIA'S FIRST FACE-BASED UPI PAYMENT SYSTEM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-[92px] font-bold tracking-tighter mb-8 text-slate-900 leading-[0.9]"
          >
            Pay with Your{" "}
            <span className="text-indigo-600 italic font-medium">Face.</span>.{" "}
            <br />
            Not with{" "}
            <span
              ref={targetRef}
              onMouseEnter={handleMouseEnterTarget}
              onMouseLeave={handleMouseLeaveTarget}
              className="underline decoration-indigo-200 underline-offset-8 cursor-pointer relative"
            >
              PINs or Passwords.
            </span>
          </motion.h1>

          {/* Split Text Popup */}
          {showPopup &&
            ReactDOM.createPortal(
              <motion.div
                ref={popupRef}
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onMouseLeave={handleMouseLeavePopup}
                className="fixed z-[100] w-[26rem] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden"
                style={{
                  top: popupPosition.top,
                  left: popupPosition.left,
                  transform: "translateX(-50%)",
                }}
                whileHover={{ y: 5, transition: { duration: 0.2 } }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm" />
                <div className="absolute inset-[2px] rounded-3xl bg-white" />
                <div className="relative p-8 text-center">
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.2,
                          delayChildren: 0.1,
                        },
                      },
                    }}
                  >
                    <div className="flex justify-center gap-2 text-4xl font-black text-slate-800">
                      {["NO", "MORE", "PASSWORDS"].map((word, i) => (
                        <motion.span
                          key={i}
                          variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: { y: 0, opacity: 1 },
                          }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="inline-block"
                        >
                          {word}
                        </motion.span>
                      ))}
                    </div>
                    <motion.div
                      variants={{
                        hidden: { scaleX: 0 },
                        visible: {
                          scaleX: 1,
                          transition: { delay: 0.6, duration: 0.5 },
                        },
                      }}
                      className="h-0.5 w-16 bg-indigo-400 mx-auto my-4"
                    />
                    <motion.p
                      variants={{
                        hidden: { y: 10, opacity: 0 },
                        visible: {
                          y: 0,
                          opacity: 1,
                          transition: { delay: 0.8 },
                        },
                      }}
                      className="text-slate-500 text-sm"
                    >
                      Your face is the key
                    </motion.p>
                  </motion.div>
                </div>
              </motion.div>,
              document.body,
            )}

          <p className="text-slate-500 text-[22px] max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            DrishtiPay eliminates PINs and passwords. Experience India's first
            fully autonomous Face-to-Pay ecosystem.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-16 px-4">
            <HeroFeature
              icon={<FiCheckCircle />}
              title="99.9% Liveness Detection"
              desc="Blocks photos & video spoofing"
              color="text-green-500"
            />
            <HeroFeature
              icon={<FiShield />}
              title="On-Device AI Processing"
              desc="Face data never leaves device"
              color="text-indigo-600"
            />
            <HeroFeature
              icon={<FiZap />}
              title=" 0.5s Verification"
              desc="Faster than PIN entry"
              color="text-amber-500"
            />
            <HeroFeature
              icon={<FiLock />}
              title="Bank-Grade Security"
              desc="AES-256 Encrypted"
              color="text-blue-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-slate-900 text-white px-12 py-5 rounded-full font-bold text-[16px] shadow-2xl hover:bg-indigo-600 transition-all hover:scale-105">
              Get Started with FacePay
            </button>
            <button
              className="text-slate-600 font-bold hover:text-indigo-600 flex items-center gap-2 transition-colors"
              onClick={() => navigate("/facepay-demo")}
            >
              <FiEye /> View How FacePay Works
            </button>
          </div>
        </div>
      </section>

      {/* ========== MODERN LAPTOP SHOWCASE ========== */}
      <ModernLaptopShowcase />

      {/* ========== STACKED DASHBOARD SECTIONS (REDESIGNED) ========== */}
      <div className="relative pt-12 pb-12">
        {/* Dashboard 1: Wallet Overview (Intelligence Hub replacement) */}
        <DashboardStack index={1}>
          <Sidebar active="Intelligence" />
          <main className="flex-1 p-10 bg-white/90 backdrop-blur-xl overflow-y-auto">
            <DashHeader title="Wallet Overview" />
            <div className="space-y-8">
              {/* Wallet Card */}
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-indigo-100 text-sm mb-2">
                      Total Balance
                    </p>
                    <h2 className="text-5xl font-bold">
                      ₹{balance.toLocaleString()}
                    </h2>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                    Active
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="flex items-center gap-2 text-indigo-100">
                      <FiKey size={14} /> Wallet ID
                    </span>
                    <span className="font-mono font-semibold">
                      WALLET-21ABC
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="flex items-center gap-2 text-indigo-100">
                      <FiUser size={14} /> Account Holder
                    </span>
                    <span className="font-semibold">Sohan Kumar</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 ml-1">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <ActionButton icon={<FiSend />} label="Send" />
                  <ActionButton icon={<FiArrowDownLeft />} label="Request" />
                  <ActionButton icon={<FiDownload />} label="Withdraw" />
                  <ActionButton icon={<FiCamera />} label="Scan QR" />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
                <h4 className="font-bold text-slate-800 mb-4">
                  Recent Activity
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      name: "Priya Singh",
                      amount: 500,
                      type: "send",
                      time: "2 hours ago",
                    },
                    {
                      name: "Rahul Meena",
                      amount: 1200,
                      type: "receive",
                      time: "Yesterday",
                    },
                    {
                      name: "Flipkart",
                      amount: 700,
                      type: "send",
                      time: "Yesterday",
                    },
                  ].map((tx, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${tx.type === "send" ? "bg-red-100" : "bg-green-100"}`}
                        >
                          {tx.type === "send" ? (
                            <FiArrowUpRight className="text-red-600" />
                          ) : (
                            <FiArrowDownLeft className="text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {tx.name}
                          </p>
                          <p className="text-xs text-slate-400">{tx.time}</p>
                        </div>
                      </div>
                      <span
                        className={`font-bold ${tx.type === "send" ? "text-red-600" : "text-green-600"}`}
                      >
                        {tx.type === "send" ? "-" : "+"}₹{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>

        {/* Dashboard 2: Security & Vault (Digital Vault replacement) */}
        <DashboardStack index={2}>
          <Sidebar active="Digital Vault" />
          <main className="flex-1 p-10 bg-slate-900 text-white overflow-y-auto">
            <DashHeader title="Security & Vault" isDark />
            <div className="space-y-6">
              {/* Linked Accounts */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <FiLock /> Linked Accounts
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      type: "wallet",
                      name: "FacePay Wallet",
                      key: "WALLET-21ABC",
                      primary: true,
                    },
                    { type: "bank", name: "HDFC Bank", key: "XXXX9876" },
                    { type: "upi", name: "UPI ID", key: "sohan@okhdfcbank" },
                  ].map((acc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/5"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        {acc.type === "wallet" && (
                          <FiCreditCard className="text-indigo-400" />
                        )}
                        {acc.type === "bank" && (
                          <FiCreditCard className="text-blue-400" />
                        )}
                        {acc.type === "upi" && (
                          <FiSmartphone className="text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-white text-sm">
                          {acc.name}
                        </h5>
                        <p className="text-xs text-slate-400 font-mono">
                          {acc.key}
                        </p>
                      </div>
                      {acc.primary && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs font-semibold rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full py-2 border border-white/20 text-white rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2">
                  <FiPlus /> Link New Account
                </button>
              </div>

              {/* Security Settings */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h4 className="font-bold text-white mb-4">Security Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiLock className="text-indigo-400" />
                      <div>
                        <p className="font-semibold text-white">Password</p>
                        <p className="text-xs text-slate-400">
                          Last changed 30 days ago
                        </p>
                      </div>
                    </div>
                    <button className="text-indigo-400 text-sm font-semibold">
                      Change
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiShield className="text-indigo-400" />
                      <div>
                        <p className="font-semibold text-white">
                          Two-Factor Auth
                        </p>
                        <p className="text-xs text-slate-400">Enabled</p>
                      </div>
                    </div>
                    <button className="text-indigo-400 text-sm font-semibold">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>

        {/* Dashboard 3: Send Money (Nodes replacement) */}
        <DashboardStack index={3}>
          <Sidebar active="Nodes" />
          <main className="flex-1 p-10 bg-white/90 backdrop-blur-xl overflow-y-auto">
            <DashHeader title="Send Money" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Transfer Form */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
                <h4 className="font-bold text-slate-800 mb-4">New Transfer</h4>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Recipient (UPI/Phone)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>Food</option>
                    <option>Rent</option>
                    <option>Shopping</option>
                    <option>Others</option>
                  </select>
                  <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg">
                    Send Now
                  </button>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
                <h4 className="font-bold text-slate-800 mb-4">
                  Recent Transactions
                </h4>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-slate-100 pb-3"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">
                          User {i + 1}
                        </p>
                        <p className="text-xs text-slate-400">
                          Today, {10 + i}:30 AM
                        </p>
                      </div>
                      <span className="font-bold text-red-600">
                        -₹{200 + i * 100}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>

        {/* Dashboard 4: Analytics (unchanged but with new glass styling) */}
        <DashboardStack index={4}>
          <Sidebar active="Analytics" />
          <main className="flex-1 p-10 bg-white/90 backdrop-blur-xl">
            <DashHeader title="Analytics" />
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden h-[400px] shadow-xl">
                <p className="text-xs font-bold opacity-50 uppercase tracking-widest">
                  Face Verification
                </p>
                <h3 className="text-6xl font-bold mt-4 tracking-tighter">
                  High Accuracy
                </h3>
                <div className="mt-12 space-y-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <p>Template Matching</p>
                      <p>Fast</p>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[90%] h-full bg-indigo-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <p>Liveness Detection</p>
                      <p>Active</p>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[95%] h-full bg-emerald-500" />
                    </div>
                  </div>
                </div>
                <FiEye
                  size={220}
                  className="absolute bottom-[-40px] right-[-40px] opacity-10"
                />
              </div>
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-3xl p-8 h-48 shadow-lg">
                  <p className="font-bold text-slate-800 mb-4">
                    Verification Trend
                  </p>
                  <ResponsiveContainer width="100%" height="70%">
                    <BarChart data={chartData}>
                      <Bar dataKey="v" fill="#4F46E5" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-emerald-50 rounded-3xl p-8 h-48 flex items-center justify-between shadow-lg">
                  <div>
                    <p className="font-bold text-emerald-900">
                      Spoof Attempts (Simulated)
                    </p>
                    <p className="text-4xl font-black text-emerald-600 mt-2">
                      Demo
                    </p>
                    <p className="text-xs text-emerald-700 mt-1 font-medium">
                      AI-based liveness detection active
                    </p>
                  </div>
                  <FiShield size={60} className="text-emerald-200" />
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>

        {/* Dashboard 5: Profile & Settings (Compliance replacement) */}
        <DashboardStack index={5}>
          <Sidebar active="Compliance" />
          <main className="flex-1 p-10 bg-white/90 backdrop-blur-xl overflow-y-auto">
            <DashHeader title="Profile & Settings" />
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Card */}
              <div className="md:w-1/3 bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg text-center">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto border-4 border-indigo-200 mb-4"
                />
                <h3 className="text-xl font-bold text-slate-900">
                  Sohan Kumar
                </h3>
                <p className="text-sm text-slate-500">sohan@email.com</p>
                <p className="text-sm text-slate-500">+91-9876543210</p>
                <div className="mt-6">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Profile Completion</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>
                <button className="mt-6 w-full py-2 border border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition">
                  Edit Profile
                </button>
              </div>

              {/* Settings */}
              <div className="md:w-2/3 bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
                <h4 className="font-bold text-slate-800 mb-4">
                  Account Settings
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiLock className="text-indigo-600" />
                      <div>
                        <p className="font-semibold text-slate-900">Password</p>
                        <p className="text-xs text-slate-400">
                          Last changed 30 days ago
                        </p>
                      </div>
                    </div>
                    <button className="text-indigo-600 text-sm font-semibold">
                      Change
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiShield className="text-indigo-600" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          Two-Factor Auth
                        </p>
                        <p className="text-xs text-slate-400">Enabled</p>
                      </div>
                    </div>
                    <button className="text-indigo-600 text-sm font-semibold">
                      Manage
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiBell className="text-indigo-600" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          Notifications
                        </p>
                        <p className="text-xs text-slate-400">Push, Email</p>
                      </div>
                    </div>
                    <button className="text-indigo-600 text-sm font-semibold">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>
      </div>

      {/* ========== HYPER PERFECT REVEAL ========== */}
      <HyperPerfectReveal />

      {/* ========== AESTHETIC SPLIT REVEAL (HOW IT WORKS) ========== */}
      <AestheticSplitReveal />

      {/* ========== INDUSTRIAL CLEAN SECURITY ========== */}
      <IndustrialCleanSecurity />

      {/* ========== STATS & CTA BRIDGE ========== */}
      <StatsBridge />

      {/* ========== CLEAN HIGHLIGHT REVEAL ========== */}
      <CleanHighlightReveal />

      {/* ========== FAQ SECTION ========== */}
      <FacePayLiteFAQ />

      {/* ========== TESTIMONIALS ========== */}
      <Testimonials />

      {/* ========== FOOTER ========== */}
      <UniqueFacePayFooter />
    </div>
  );
};

export default Home;
