import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // Framer Motion added
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
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex justify-center pt-8 pb-4 px-4 bg-transparent sticky top-0 z-50"
    >
      <nav
        className="
        flex items-center justify-between 
        w-full max-w-6xl
        px-10 py-3
        rounded-full 
        bg-white/75 backdrop-blur-xl
        border border-gray-100/60
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
      "
      >
        {/* --- LOGO: Smooth Hover Animation --- */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-slate-900 rounded-lg group-hover:bg-indigo-600 transition-all duration-500 shadow-sm">
            <FiEye className="text-white text-sm" />
          </div>
          <span className="text-[19px] tracking-tight text-slate-800 font-medium italic">
            Drishti
            <span className="text-indigo-600 font-semibold not-italic">
              Pay
            </span>
          </span>
        </motion.div>

        {/* --- CENTER LINKS: Staggered Entrance --- */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink label="How it works" to="/" delay={0.1} />
          <NavLink label="Security" to="/" icon={<FiLock />} delay={0.2} />
          <NavLink label="Features" to="/" icon={<FiZap />} delay={0.3} />
          <NavLink label="Solutions" to="/" icon={<FiLayers />} delay={0.4} />
          <NavLink label="Support" to="/" icon={<FiHelpCircle />} delay={0.5} />
        </div>

        {/* --- ACTIONS --- */}
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => openLogin?.()}
            className="text-[13px] font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Login
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
              backgroundColor: "#4f46e5", // Indigo-600
              boxShadow: "0 10px 20px -5px rgba(79, 70, 229, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => openGetStarted?.()}
            className="
              group
              flex items-center gap-2
              px-6 py-2.5 
              rounded-full
              bg-slate-900 
              text-white font-semibold text-[13px]
              transition-all duration-300
              shadow-lg shadow-slate-200/50
            "
          >
            Get Started
            <FiArrowRight className="text-[14px] group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </nav>
    </motion.div>
  );
};

// Helper with Motion
const NavLink = ({ label, to, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Link
      to={to}
      className="
        group
        flex items-center gap-2
        px-4 py-2
        rounded-full
        text-[13px] font-medium text-slate-500
        hover:text-slate-900 hover:bg-gray-50/50
        transition-all duration-300
      "
    >
      {icon && (
        <span className="text-[12px] text-slate-400 group-hover:text-indigo-600 transition-colors">
          {icon}
        </span>
      )}
      {label}
    </Link>
  </motion.div>
);

export default Navbar;
