/**
 * HyperPerfectReveal
 * - A full-screen sticky section with two layers of scrolling text.
 * - Uses Framer Motion's useScroll and useTransform to create parallax and skew effects.
 * - The text "Drishti is Future — Pay Secure" moves horizontally as the user scrolls.
 */
import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { FiStar } from "react-icons/fi";

const HyperPerfectReveal = () => {
  const targetRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const xTransform = useTransform(scrollYProgress, [0, 1], ["30%", "-70%"]);
  const x = useSpring(xTransform, { stiffness: 60, damping: 25 });

  const scrollVelocity = useVelocity(scrollYProgress);
  const skewXTransform = useTransform(scrollVelocity, [-0.5, 0.5], [-20, 20]);
  const skewX = useSpring(skewXTransform, { stiffness: 400, damping: 30 });

  return (
    <section ref={targetRef} className="relative h-[200vh] bg-[#F8FAFC]">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        {/* Background layer (faint) */}
        <div className="absolute inset-0 flex items-center">
          <motion.div
            style={{ x, skewX }}
            className="flex items-center gap-12 whitespace-nowrap text-[22vw] font-black uppercase tracking-tighter text-slate-100/80 select-none"
          >
            <span>Drishti</span>
            <FiStar className="text-[12vw] text-slate-200" />
            <span>is</span>
            <span className="italic font-light">Future</span>
            <span>—</span>
            <span>Pay</span>
            <FiStar className="text-[12vw] text-slate-200" />
            <span>Secure</span>
          </motion.div>
        </div>

        {/* Foreground layer (colored) */}
        <div className="relative w-full h-[50vh] flex items-center overflow-hidden border-y border-slate-100 bg-white/10 backdrop-blur-[2px] z-10">
          <motion.div
            style={{ x, skewX }}
            className="flex items-center gap-12 whitespace-nowrap text-[22vw] font-black uppercase tracking-tighter text-slate-900 select-none"
          >
            <span className="drop-shadow-2xl">Drishti</span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <FiStar className="text-[12vw] text-indigo-600" />
            </motion.div>
            <span>is</span>
            <span className="italic font-medium text-indigo-500">Future</span>
            <span>—</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Pay
            </span>
            <FiStar className="text-[12vw] text-indigo-600" />
            <span>Secure</span>
          </motion.div>
        </div>

        {/* Floating badge */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="px-4 py-1 rounded-full border border-slate-200 bg-white shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Real-Time Face Verification
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HyperPerfectReveal;
