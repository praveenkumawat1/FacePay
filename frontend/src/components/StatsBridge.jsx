/**
 * StatsBridge
 * - Displays key statistics in a grid, followed by a large call‑to‑action card.
 * - The CTA card has animated background elements and a hover effect.
 */
import { motion } from "framer-motion";
import {
  FiZap,
  FiCheckCircle,
  FiActivity,
  FiGlobe,
  FiStar,
  FiArrowRight,
} from "react-icons/fi";

const StatsBridge = () => {
  const stats = [
    { value: "4", label: "Core Modules", icon: <FiZap /> },
    { value: "99%", label: "Face Match Accuracy", icon: <FiCheckCircle /> },
    { value: "< 1s", label: "Verification Time", icon: <FiActivity /> },
    { value: "UPI", label: "Payment Integration", icon: <FiGlobe /> },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl text-indigo-600 mb-4 flex justify-center">
                {stat.icon}
              </div>
              <h4 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">
                {stat.value}
              </h4>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-12 lg:p-20 text-center overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "30px 30px",
              }}
            />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold mb-6"
            >
              <FiStar
                className="animate-spin"
                style={{ animationDuration: "3s" }}
              />
              FACE-BASED UPI PAYMENTS
            </motion.div>

            <h2 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Experience Face-Based <br />
              <span className="italic font-light">UPI Payments</span>
              <br />
            </h2>

            <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10 font-medium">
              A secure and contactless payment system that replaces PINs and
              OTPs with real-time face verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-indigo-600 px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
                Get Started Free
                <FiArrowRight />
              </button>
              <button className="text-white font-bold border-2 border-white/30 px-10 py-5 rounded-full hover:bg-white/10 transition-all">
                Watch Demo
              </button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 items-center">
              <div className="text-white/60 text-xs font-bold tracking-widest uppercase">
                Trusted by
              </div>
              {[
                "UPI-Compatible Design",
                "Privacy-First Architecture",
                "AI-Based Verification",
              ].map((badge) => (
                <div
                  key={badge}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs font-bold"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Animated floating shapes */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-sm hidden lg:block"
          />
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute bottom-10 left-10 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm hidden lg:block"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default StatsBridge;
