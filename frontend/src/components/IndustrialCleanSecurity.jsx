/**
 * IndustrialCleanSecurity
 * - A clean, two‑column grid section highlighting security features.
 * - Each card has a hover effect and a hidden CTA that appears on hover.
 */
import { motion } from "framer-motion";
import { FiCpu, FiLock, FiEye, FiShield, FiArrowRight } from "react-icons/fi";

const IndustrialCleanSecurity = () => {
  const features = [
    {
      title: "On-Device Face Processing",
      desc: "Face recognition and verification are performed locally on the user's device to minimize data exposure.",
      icon: <FiCpu />,
    },
    {
      title: "Encrypted Face Templates",
      desc: "Instead of storing face images, the system stores encrypted face templates to protect user privacy.",
      icon: <FiLock />,
    },
    {
      title: "AI-Based Liveness Detection",
      desc: "The system detects real human presence by analyzing live facial movements and camera responses.",
      icon: <FiEye />,
    },
    {
      title: "Secure Authentication Layer",
      desc: "Authentication data is protected using encrypted storage and controlled access mechanisms.",
      icon: <FiShield />,
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Section header */}
        <div className="mb-20 max-w-2xl">
          <h2 className="text-sm font-bold tracking-[0.2em] text-indigo-600 uppercase mb-4">
            Security & Privacy
          </h2>
          <h3 className="text-5xl font-bold text-slate-900 tracking-tighter mb-6">
            Privacy you can trust. <br /> Built for everyone.
          </h3>
          <p className="text-lg text-slate-500 font-medium">
            DrishtiPay is designed with a privacy-first architecture that
            ensures user identity and UPI transactions remain secure at every
            stage.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 border border-slate-100 bg-white hover:border-indigo-600 transition-colors duration-300 group"
            >
              <div className="text-2xl text-slate-400 group-hover:text-indigo-600 transition-colors mb-6">
                {feat.icon}
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                {feat.title}
              </h4>
              <p className="text-slate-500 leading-relaxed font-medium mb-8">
                {feat.desc}
              </p>

              <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                Explore Security Flow
                <FiArrowRight />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer tags */}
        <div className="mt-16 pt-10 border-t border-slate-50 flex flex-wrap gap-x-12 gap-y-6">
          {[
            "Encrypted Data Storage",
            "Privacy-First Design",
            "AI-Based Security",
            "UPI-Compatible Architecture",
          ].map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-black text-slate-300 tracking-widest uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustrialCleanSecurity;
