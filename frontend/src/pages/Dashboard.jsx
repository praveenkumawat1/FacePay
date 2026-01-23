import { useState, useEffect } from "react";
import {
  FiGrid,
  FiPocket,
  FiPieChart,
  FiUsers,
  FiShield,
  FiLogOut,
  FiUserCheck,
  FiCreditCard,
  FiSend,
  FiDownload,
  FiCamera,
  FiKey,
  FiEye,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { getUserProfile } from "../services/api";

// ---- SIDEBAR -----
const sidebarItems = [
  {
    label: "Dashboard",
    icon: <FiGrid />,
  },
  {
    label: "Wallet",
    icon: <FiCreditCard />,
  },
  {
    label: "Send Money",
    icon: <FiSend />,
  },
  {
    label: "Add Money",
    icon: <FiDownload />,
  },
  {
    label: "Profile",
    icon: <FiUserCheck />,
  },
];

const Sidebar = ({ onLogout, active = 0 }) => (
  <aside className="hidden md:flex flex-col w-72 h-screen bg-white border-r border-gray-100 py-10 px-6 shadow-lg z-20 sticky top-0">
    <div className="flex items-center gap-3 mb-14 px-2">
      <FiCamera className="text-indigo-600 text-3xl" />
      <span className="text-2xl font-black tracking-tight italic">
        Face<span className="not-italic text-indigo-600">Pay</span>
      </span>
    </div>
    <nav className="flex-1 space-y-1">
      {sidebarItems.map((item, i) => (
        <a
          key={item.label}
          href="#"
          className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold transition-all cursor-pointer ${
            active === i
              ? "bg-indigo-50 text-indigo-600 shadow"
              : "text-gray-700 hover:bg-gray-100 hover:text-indigo-700"
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </a>
      ))}
    </nav>
    <button
      onClick={onLogout}
      className="mt-12 flex items-center gap-3 px-5 py-3 w-full bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 hover:text-red-700 transition-all"
    >
      <FiLogOut />
      Logout
    </button>
  </aside>
);

// ---- MAIN DASHBOARD PAGE -----
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // FIX: same key jo login/OTP me use ho rahi hai
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/";
          return;
        }
        const result = await getUserProfile(token);
        setUser(result.user);
        setWallet(result.wallet);
      } catch (error) {
        localStorage.clear();
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-lg font-semibold text-indigo-700">Loading...</p>
        </div>
      </div>
    );
  }

  // ---- ANIMATION VARIANTS ----
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12 },
    }),
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* --- SIDEBAR ---- */}
      <Sidebar onLogout={handleLogout} />

      {/* ---- MAIN CONTENT ---- */}
      <main className="flex-1 px-0 md:px-12 py-12">
        <div className="max-w-5xl mx-auto">
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 leading-tight">
                Welcome, {user?.full_name}!
              </h1>
              <p className="text-gray-500 mb-4 md:mb-0">
                <span className="hidden md:inline">
                  Manage all your payments, wallet and details at one place.
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
                <FiEye className="text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900">
                  FACE VERIFIED
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="col-span-2 flex flex-col justify-between bg-gradient-to-tr from-lime-200 via-teal-100 to-white rounded-2xl p-8 shadow-lg"
            >
              <div>
                <p className="text-sm font-bold text-gray-500 mb-2">
                  <FiCreditCard className="inline-block mr-2 text-indigo-600" />
                  Wallet Balance
                </p>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                    ₹{wallet?.balance?.toFixed(2) ?? "0.00"}
                  </span>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex gap-8 mt-6 justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                    Wallet Key (ID)
                  </p>
                  <div className="flex items-center gap-2 ">
                    <code className="px-3 py-1 rounded-lg font-mono bg-gray-100 tracking-tight text-gray-800 select-all text-xs">
                      {wallet?.wallet_key}
                    </code>
                    <FiKey className="text-slate-400" />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400">
                    Created:
                  </span>
                  <div className="text-xs text-gray-700 font-mono">
                    {wallet?.createdAt
                      ? new Date(wallet.createdAt).toLocaleDateString() +
                        " " +
                        new Date(wallet.createdAt).toLocaleTimeString()
                      : "--"}
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center items-center"
            >
              <FiUserCheck className="text-indigo-600 text-4xl mb-2" />
              <div className="font-bold text-lg mb-1">Face Status</div>
              <span className="text-xs font-bold text-green-600 bg-green-50 rounded-full px-3 py-1 mt-2">
                Verified
              </span>
              <div className="mt-4 text-[10px] text-gray-400 uppercase tracking-widest">
                Real-Time Face Auth
              </div>
            </motion.div>
          </div>

          {/* ---- QUICK ACTIONS ---- */}
          <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <ActionButton icon={<FiSend />} label="Send Money" />
            <ActionButton icon={<FiCreditCard />} label="Check Wallet" />
            <ActionButton icon={<FiDownload />} label="Add Money" />
            <ActionButton icon={<FiPieChart />} label="Transaction History" />
          </div>

          {/* ---- USER/BANK INFORMATION ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-xl font-extrabold mb-6 text-indigo-600 flex items-center gap-2">
                <FiUserCheck /> Personal Info
              </h3>
              <InfoRow label="Name" value={user?.full_name} />
              <InfoRow label="Email" value={user?.email} />
              <InfoRow label="Mobile" value={user?.mobile} />
              <InfoRow
                label="Date of Birth"
                value={
                  user?.dob
                    ? new Date(user.dob).toLocaleDateString()
                    : "Not available"
                }
              />
            </motion.div>
            <motion.div
              custom={3}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h3 className="text-xl font-extrabold mb-6 text-indigo-600 flex items-center gap-2">
                <FiShield /> Bank Details
              </h3>
              <InfoRow label="Bank Name" value={user?.bank_name} />
              <InfoRow
                label="Account Holder"
                value={user?.account_holder_name}
              />
              <InfoRow
                label="Account Number"
                value={"****" + String(user?.account_number).slice(-4)}
              />
              <InfoRow label="IFSC" value={user?.ifsc} />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ---- UTILITY COMPONENTS -----
const InfoRow = ({ label, value }) => (
  <div className="mb-3 flex">
    <div className="font-semibold text-gray-600 w-40 text-sm">{label}:</div>
    <span className="text-gray-900 font-mono text-sm">{value}</span>
  </div>
);

const ActionButton = ({ icon, label }) => (
  <button className="flex flex-col items-center bg-white shadow-md hover:bg-indigo-50 text-gray-800 py-6 rounded-2xl transition-all border border-transparent hover:border-indigo-200 focus:outline-none">
    <span className="text-2xl text-indigo-600 mb-1">{icon}</span>
    <span className="font-bold text-sm">{label}</span>
  </button>
);

export default Dashboard;
