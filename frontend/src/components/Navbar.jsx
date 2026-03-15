import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  FiArrowRight,
  FiEye,
  FiLock,
  FiZap,
  FiLayers,
  FiHelpCircle,
} from "react-icons/fi";

const navLinks = [
  { label: "How it works", to: "/" },
  { label: "Security", to: "/", icon: <FiLock /> },
  { label: "Features", to: "/", icon: <FiZap /> },
  { label: "Solutions", to: "/", icon: <FiLayers /> },
  { label: "Support", to: "/", icon: <FiHelpCircle /> },
];

const Navbar = ({ openLogin, openGetStarted }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex justify-center items-center pt-7 pb-5 px-2 bg-transparent  top-0 z-[100]"
    >
      <nav className="w-full max-w-7xl relative flex items-center h-[72px] select-none">
        {/* LOGO LEFT */}
        <Link to="/" className="absolute left-0 top-1/2 -translate-y-1/2 group">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center justify-center w-11 h-11 bg-slate-950 rounded-2xl relative overflow-hidden shadow-xl group-hover:shadow-indigo-500/20 transition-all duration-500">
              <FiEye className="text-white text-xl relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className="text-[23px] font-semibold tracking-tight text-slate-900">
              Drishti
              <span className="text-indigo-600 font-bold group-hover:text-indigo-500 transition-colors">
                Pay
              </span>
            </span>
          </motion.div>
        </Link>

        {/* NAVLIST - Magnetic Center Dock */}
        <div
          className="mx-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-10"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-2 py-2 relative">
            {navLinks.map((item, i) => (
              <Link
                key={item.label}
                to={item.to}
                onMouseEnter={() => setHoveredIdx(i)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors duration-300 group outline-none"
              >
                {/* Background Magnetic Pill */}
                <AnimatePresence>
                  {hoveredIdx === i && (
                    <motion.span
                      layoutId="nav-hover-bg"
                      className="absolute inset-0 bg-slate-100/80 rounded-xl -z-10"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </AnimatePresence>

                {item.icon && (
                  <span
                    className={`text-[17px] transition-all duration-300 ${hoveredIdx === i ? "text-indigo-600 scale-110" : "text-slate-400 opacity-70"}`}
                  >
                    {item.icon}
                  </span>
                )}
                <span
                  className={`text-[15px] font-medium transition-colors duration-300 ${hoveredIdx === i ? "text-indigo-600" : "text-slate-600"}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA RIGHT */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3 md:gap-5 min-w-[180px] justify-end">
          <motion.button
            whileHover={{ x: -2, color: "#4f46e5" }}
            whileTap={{ scale: 0.96 }}
            onClick={openLogin}
            className="text-[14.5px] font-bold text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl transition-all"
          >
            Log in
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openGetStarted}
            className="group relative flex items-center gap-2 px-7 py-3 rounded-full bg-slate-950 text-white font-bold text-[14px] shadow-2xl shadow-slate-900/20 overflow-hidden"
          >
            <span className="relative z-10">Get Started</span>
            <FiArrowRight className="text-lg relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />

            {/* Animated Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </motion.button>
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;
