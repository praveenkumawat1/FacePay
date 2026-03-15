import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";

// Replace with your step images:
const steps = [
  {
    title: "One-Time Registration",
    desc: "User registers once by providing basic details and securely enrolling their face into the system.",
    img: "https://img.freepik.com/premium-vector/two-factor-authentication-mobile-phone_1313054-11290.jpg?semt=ais_hybrid&w=740&q=80",
    color: "#6366f1",
    tag: "PHASE / 01",
    bgText: "01",
  },
  {
    title: "Live Face Scan",
    desc: "At the time of payment, the user looks at the camera and a live face scan is captured in real time.",
    img: "https://www.metamap.com/ychochat/2024/01/liveness22.png",
    color: "#10b981",
    tag: "PHASE / 02",
    bgText: "02",
  },
  {
    title: "AI-Based Verification",
    desc: "The system verifies liveness and matches the face with the stored encrypted template to prevent spoofing.",
    img: "https://amani.ai/wp-content/uploads/2023/06/av.png",
    color: "#f59e0b",
    tag: "PHASE / 03",
    bgText: "03",
  },
  {
    title: "UPI Payment Completed",
    desc: "After successful face verification, the UPI payment is processed securely without using PIN or OTP.",
    img: "https://cf-img-a-in.tosshub.com/sites/visualstory/wp/2023/07/cropped-image-971.png",
    color: "#ec4899",
    tag: "PHASE / 04",
    bgText: "04",
  },
];

const AestheticSplitReveal = () => {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  }); // still used for viewport triggers if needed

  return (
    <section
      ref={containerRef}
      className="relative bg-[#F8FAFC] font-sans selection:bg-indigo-100"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left sticky image (fully uncropped, not rounded, not shadowed) */}
        <div className="lg:w-5/12 h-[45vh] lg:h-screen sticky top-0 flex items-center justify-center bg-[#FCFCFC] z-10">
          <div className="relative w-full flex justify-center items-center">
            {/* Pure image panel, no border radius/shadow */}
            <div className="h-[49vw] aspect-[16/9] w-[85vw] max-w-[610px] bg-gradient-to-br from-white via-slate-100 to-[#e8eafe] border-[2px] border-[#f1f1fa] overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeStep}
                  src={steps[activeStep].img}
                  alt={steps[activeStep].title}
                  initial={{ opacity: 0, scale: 0.98, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.04, y: -24 }}
                  transition={{ duration: 0.7, ease: [0.25, 1, 0.4, 1] }}
                  className="w-full h-full object-contain"
                  draggable="false"
                  style={{
                    userSelect: "none",
                    background: "transparent",
                    borderRadius: "0",
                  }}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right scrollable steps */}
        <div className="lg:w-7/12 px-8 lg:px-24">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              onViewportEnter={() => setActiveStep(idx)}
              viewport={{ amount: 0.7 }}
              className="min-h-screen flex flex-col justify-center relative"
            >
              <span className="absolute left-[-20px] top-1/4 text-[12rem] sm:text-[15rem] md:text-[19rem] font-black text-slate-50 select-none -z-10 leading-none pointer-events-none">
                {step.bgText}
              </span>
              <div className="max-w-xl pt-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center gap-4 mb-6"
                >
                  <span className="h-[1px] w-12 bg-slate-300" />
                  <span className="text-xs font-bold tracking-[0.4em] text-slate-400 uppercase">
                    {step.tag}
                  </span>
                </motion.div>
                <h3
                  className={`text-6xl lg:text-8xl font-bold tracking-tight mb-8 transition-colors duration-700 ${
                    activeStep === idx ? "text-slate-900" : "text-slate-200"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-xl lg:text-2xl font-normal leading-relaxed transition-all duration-700 ${
                    activeStep === idx
                      ? "text-slate-500"
                      : "text-slate-200 opacity-50"
                  }`}
                >
                  {step.desc}
                </p>
                <motion.div
                  animate={{ opacity: activeStep === idx ? 1 : 0 }}
                  className="mt-12 flex items-center gap-6"
                >
                  <button
                    style={{ backgroundColor: step.color }}
                    className="px-8 py-4 rounded-2xl text-white font-medium shadow-lg hover:brightness-110 transition-all"
                  >
                    Learn More
                  </button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AestheticSplitReveal;
