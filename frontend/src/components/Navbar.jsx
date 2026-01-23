import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiEye,
  FiLock,
  FiZap,
  FiLayers,
  FiHelpCircle,
} from "react-icons/fi";

const Navbar = ({ openLogin, openGetStarted }) => {
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex justify-center pt-8 pb-5 px-5 md:px-6 bg-transparent sticky top-0 z-50"
    >
      <nav
        className={`
          flex items-center justify-between
          w-full max-w-7xl
          px-8 sm:px-10 lg:px-12 py-4
          rounded-full
          bg-white/70 backdrop-blur-2xl
          border border-white/60
          shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08),0_4px_20px_-4px_rgba(0,0,0,0.04)]
          transition-all duration-500
        `}
      >
        {/* LOGO – more premium feel */}
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3.5 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-9 h-9 bg-gradient-to-br from-slate-950 to-slate-800 rounded-xl overflow-hidden shadow-md group-hover:shadow-indigo-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <FiEye className="text-white text-base relative z-10" />
            </div>
            <span className="text-[22px] tracking-tight font-semibold text-slate-900">
              Drishti
              <span className="text-indigo-600 font-bold">Pay</span>
            </span>
          </motion.div>
        </Link>

        {/* Center links – more elegant spacing & hover */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
          <PremiumNavLink label="How it works" to="/" delay={0.12} />
          <PremiumNavLink
            label="Security"
            to="/"
            icon={<FiLock />}
            delay={0.18}
          />
          <PremiumNavLink
            label="Features"
            to="/"
            icon={<FiZap />}
            delay={0.24}
          />
          <PremiumNavLink
            label="Solutions"
            to="/"
            icon={<FiLayers />}
            delay={0.3}
          />
          <PremiumNavLink
            label="Support"
            to="/"
            icon={<FiHelpCircle />}
            delay={0.36}
          />
        </div>

        {/* Actions – bigger, more premium buttons */}
        <div className="flex items-center gap-5 sm:gap-6">
          <motion.button
            whileHover={{ scale: 1.04, color: "#4f46e5" }}
            whileTap={{ scale: 0.97 }}
            onClick={openLogin}
            className={`
              text-sm font-medium tracking-wide
              text-slate-700 hover:text-indigo-600
              px-5 py-2.5 rounded-full
              transition-all duration-300
              hover:bg-indigo-50/60
            `}
          >
            Log in
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.06,
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              boxShadow: "0 14px 30px -8px rgba(79, 70, 229, 0.45)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={openGetStarted}
            className={`
              group relative
              flex items-center gap-2.5
              px-7 py-3
              rounded-full
              bg-gradient-to-r from-slate-950 to-slate-900
              text-white font-semibold text-sm tracking-wide
              shadow-xl shadow-slate-200/40
              transition-all duration-400
              overflow-hidden
            `}
          >
            <span className="relative z-10">Get Started</span>
            <FiArrowRight className="text-base relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />

            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          </motion.button>
        </div>
      </nav>
    </motion.div>
  );
};

// More premium NavLink variant
const PremiumNavLink = ({ label, to, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
  >
    <Link
      to={to}
      className={`
        group relative
        flex items-center gap-2
        px-5 py-2.5
        rounded-full
        text-sm font-medium text-slate-600
        hover:text-slate-900
        transition-all duration-300
        hover:bg-white/60
        active:scale-97
      `}
    >
      {icon && (
        <span className="text-[13px] text-slate-400 group-hover:text-indigo-500 transition-colors duration-300">
          {icon}
        </span>
      )}
      {label}

      {/* Underline glow effect */}
      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-indigo-500/60 rounded-full group-hover:w-5/12 group-hover:opacity-70 transition-all duration-400 ease-out" />
    </Link>
  </motion.div>
);

export default Navbar;
