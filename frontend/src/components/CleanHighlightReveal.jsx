/**
 * CleanHighlightReveal
 * - A long‑scrolling (1200vh) section that reveals features as the user scrolls.
 * - Features are split into two columns: left shows numbers (01,02,…), right shows titles and descriptions.
 * - The "EXPLORE" text splits in half and moves apart during the initial scroll.
 */
import { useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const CleanHighlightReveal = () => {
  const containerRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const features = [
    {
      id: "01",
      title: "BIOMETRIC",
      desc: "Face recognition based authentication using AI-driven facial feature analysis.",
    },
    {
      id: "02",
      title: "SECURE",
      desc: "Encrypted authentication flow designed to protect user identity and UPI transactions.",
    },
    {
      id: "03",
      title: "INSTANT",
      desc: "Fast face verification designed to complete authentication within seconds.",
    },
    {
      id: "04",
      title: "PRIVACY",
      desc: "Face data is processed securely using encrypted templates instead of storing raw images.",
    },
    {
      id: "05",
      title: "ADAPTIVE",
      desc: "The system handles common variations such as lighting changes and camera angles.",
    },
    {
      id: "06",
      title: "UPI-READY",
      desc: "Designed to integrate with UPI-based payment workflows.",
    },
    {
      id: "07",
      title: "FUTURE-READY",
      desc: "Designed to integrate with UPI-based payment workflows.",
    },
  ];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 20,
  });

  const topMove = useTransform(smoothProgress, [0, 0.12], ["0%", "-100%"]);
  const bottomMove = useTransform(smoothProgress, [0, 0.12], ["0%", "100%"]);
  const introOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);

  const letters = "EXPLORE".split("");

  return (
    <div
      ref={containerRef}
      className="relative h-[1200vh] bg-white text-slate-900 font-sans selection:bg-indigo-100"
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Split "EXPLORE" letters that move apart */}
        <div className="absolute inset-0 z-50 flex flex-col">
          <motion.div
            style={{ y: topMove }}
            className="w-full h-1/2 bg-white flex items-end justify-center overflow-hidden border-b border-slate-100 z-20"
          >
            <div className="flex translate-y-1/2">
              {letters.map((l, i) => (
                <motion.div
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative px-2 py-4 cursor-default"
                >
                  <motion.div
                    animate={{ height: hoveredIndex === i ? "100%" : "0%" }}
                    className="absolute bottom-0 left-0 w-full bg-indigo-600 -z-10"
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  />
                  <motion.span
                    style={{ opacity: introOpacity }}
                    animate={{
                      color: hoveredIndex === i ? "#fff" : "#0f172a",
                    }}
                    className="text-[18vw] font-black italic tracking-tighter leading-none select-none uppercase"
                    transition={{ duration: 0.2 }}
                  >
                    {l}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{ y: bottomMove }}
            className="w-full h-1/2 bg-white flex items-start justify-center overflow-hidden z-20"
          >
            <div className="flex -translate-y-1/2">
              {letters.map((l, i) => (
                <motion.div
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative px-2 py-4 cursor-default"
                >
                  <motion.div
                    animate={{ height: hoveredIndex === i ? "100%" : "0%" }}
                    className="absolute top-0 left-0 w-full bg-indigo-600 -z-10"
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  />
                  <motion.span
                    style={{ opacity: introOpacity }}
                    animate={{
                      color: hoveredIndex === i ? "#fff" : "#0f172a",
                    }}
                    className="text-[18vw] font-black italic tracking-tighter leading-none select-none uppercase"
                    transition={{ duration: 0.2 }}
                  >
                    {l}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Feature numbers and descriptions that fade in/out */}
        <div className="relative w-full max-w-7xl px-10 h-full flex items-center">
          {/* Left column – numbers */}
          <div className="w-1/3 relative h-full flex items-center">
            {features.map((item, index) => {
              const step = 0.85 / features.length;
              const start = 0.15 + index * step;
              const end = start + step;

              const opacity = useTransform(
                smoothProgress,
                [start, start + 0.05, end - 0.05, end],
                [0, 1, 1, 0],
              );
              const y = useTransform(smoothProgress, [start, end], [100, -100]);

              return (
                <motion.div
                  key={item.id}
                  style={{ opacity, y }}
                  className="absolute text-[15vw] font-black text-slate-100 italic select-none"
                >
                  {item.id}
                </motion.div>
              );
            })}
          </div>

          {/* Right column – titles & descriptions */}
          <div className="w-2/3 relative h-full flex flex-col justify-center pl-20 border-l border-slate-100">
            {features.map((item, index) => {
              const step = 0.85 / features.length;
              const start = 0.15 + index * step;
              const end = start + step;

              const opacity = useTransform(
                smoothProgress,
                [start, start + 0.05, end - 0.05, end],
                [0, 1, 1, 0],
              );
              const x = useTransform(
                smoothProgress,
                [start, start + 0.08],
                [50, 0],
              );

              return (
                <motion.div
                  key={item.id}
                  style={{ opacity, x }}
                  className="absolute space-y-4"
                >
                  <h2 className="text-8xl font-black italic tracking-tighter leading-none text-slate-900">
                    {item.title}
                  </h2>
                  <p className="text-xl text-slate-500 max-w-sm font-medium leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="pt-4">
                    <button className="text-xs font-bold tracking-[0.3em] uppercase border-b-2 border-indigo-600 text-indigo-600 pb-1 hover:border-indigo-400 hover:text-indigo-400 transition-all">
                      Discover Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanHighlightReveal;
