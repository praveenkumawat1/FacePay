import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiGrid,
  FiCreditCard,
  FiSend,
  FiDownload,
  FiUserCheck,
  FiClock,
  FiGift,
  FiLogOut,
  FiShield,
  FiCamera,
} from "react-icons/fi";

const sidebarItems = [
  { label: "Dashboard", icon: <FiGrid />, route: "/dashboard" },
  { label: "Wallet", icon: <FiCreditCard />, route: "/dashboard/wallet" },
  { label: "Send Money", icon: <FiSend />, route: "/dashboard/send-money" },
  { label: "Add Money", icon: <FiDownload />, route: "/dashboard/add-money" },
  { label: "Profile", icon: <FiUserCheck />, route: "/dashboard/profile" },
  { label: "History", icon: <FiClock />, route: "/dashboard/history" },
  { label: "Security", icon: <FiShield />, route: "/dashboard/security" },
  { label: "Coupons & Offers", icon: <FiGift />, route: "/dashboard/coupons" },
];

export default function Sidebar({ onLogout }) {
  const location = useLocation();

  return (
    <aside
      className="
        hidden md:flex flex-col w-72 h-screen 
        bg-white/70 backdrop-blur-2xl border-r border-white/40 
        py-8 px-5 lg:px-6 shadow-xl sticky top-0 z-30 overflow-y-auto
        transition-all duration-300
      "
      style={{
        boxShadow:
          "0 12px 40px -8px rgba(0,0,0,0.08), 0 4px 20px -4px rgba(0,0,0,0.04)",
        borderImage:
          "linear-gradient(to bottom, rgba(99,102,241,0.2), transparent) 1",
      }}
    >
      {/* Logo / Brand – premium glassmorphic look */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3.5 mb-12 px-3 group"
      >
        <div className="relative p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl text-white shadow-lg group-hover:shadow-indigo-500/40 transition-all duration-500">
          <FiCamera className="text-2xl relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
        </div>

        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Face<span className="text-indigo-600 font-extrabold">Pay</span>
          </span>
          <span className="text-xs font-medium text-slate-500 -mt-1 tracking-wide">
            Digital Wallet
          </span>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {sidebarItems.map(({ label, icon, route }) => {
          const isActive = location.pathname === route;

          return (
            <motion.div
              key={label}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={route}
                className={`
                  group flex items-center gap-3.5 px-5 py-3.5 rounded-2xl font-medium text-base
                  transition-all duration-300 cursor-pointer select-none
                  ${
                    isActive
                      ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm backdrop-blur-sm"
                      : "text-slate-700 hover:bg-white/60 hover:text-indigo-700 hover:shadow-sm"
                  }
                `}
                style={{
                  border: isActive
                    ? "1px solid rgba(79,70,229,0.3)"
                    : "1px solid transparent",
                }}
              >
                <span
                  className={`
                    text-xl transition-all duration-300
                    ${isActive ? "text-indigo-600 scale-110" : "text-slate-500 group-hover:text-indigo-600 group-hover:scale-110"}
                  `}
                >
                  {icon}
                </span>
                <span>{label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout Button – premium red accent */}
      <motion.button
        whileHover={{ scale: 1.03, backgroundColor: "rgba(239,68,68,0.15)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onLogout}
        className="
          mt-10 flex items-center gap-3.5 px-5 py-3.5 w-full
          bg-red-50/70 hover:bg-red-50/90 text-red-700 hover:text-red-800
          font-semibold rounded-2xl transition-all duration-300
          border border-red-100/60 hover:border-red-200/80 backdrop-blur-sm
          shadow-sm hover:shadow-md
        "
      >
        <FiLogOut className="text-xl" />
        Logout
      </motion.button>
    </aside>
  );
}
