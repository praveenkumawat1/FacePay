import { useEffect, useState, useRef } from "react";
import {
  motion,
  animate,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from "recharts";
import {
  FiGrid,
  FiPocket,
  FiActivity,
  FiUsers,
  FiBell,
  FiShield,
  FiCpu,
  FiUserCheck,
  FiEye,
  FiLock,
  FiGlobe,
  FiZap,
  FiCheckCircle,
  FiPieChart,
  FiTerminal,
  FiDatabase,
  FiServer,
  FiCreditCard,
  FiAlertCircle,
  FiStar,
  FiArrowRight,
} from "react-icons/fi";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import UniqueFacePayFooter from "../components/Footer.jsx";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- ANIMATED NUMBER ---
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState("0");
  useEffect(() => {
    const numericValue = parseFloat(value.replace(/,/g, ""));
    const controls = animate(0, numericValue, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(
          new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          }).format(latest),
        );
      },
    });
    return () => controls.stop();
  }, [value]);
  return <span>{displayValue}</span>;
};

// --- CURSOR TRAIL WITH IMAGES ---
const CursorTrailImages = () => {
  const containerRef = useRef(null);
  const trailRefs = useRef([]);
  const [trails, setTrails] = useState([]);
  const trailIndex = useRef(0);

  const images = [
    {
      src: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      alt: "Face Recognition",
    },
    {
      src: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
      alt: "Secure Payment",
    },
    {
      src: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=300&fit=crop",
      alt: "Digital Security",
    },
    {
      src: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&h=300&fit=crop",
      alt: "UPI Payment",
    },
    {
      src: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop",
      alt: "Biometric Auth",
    },
    {
      src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
      alt: "Face Scan",
    },
    {
      src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
      alt: "Payment Gateway",
    },
    {
      src: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop",
      alt: "Technology",
    },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let throttleTimer = null;

    const handleMouseMove = (e) => {
      if (throttleTimer) return;

      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 100); // Show image every 100ms

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newTrail = {
        id: Date.now() + Math.random(),
        x,
        y,
        image: images[trailIndex.current % images.length],
        rotation: (Math.random() - 0.5) * 30, // Random rotation
      };

      trailIndex.current += 1;

      setTrails((prev) => {
        const updated = [...prev, newTrail];
        // Keep only last 12 images
        return updated.slice(-12);
      });
    };

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, []);

  // Auto fade out trails
  useEffect(() => {
    if (trails.length > 0) {
      const timer = setTimeout(() => {
        setTrails((prev) => prev.slice(1));
      }, 2000); // Each image stays for 2 seconds

      return () => clearTimeout(timer);
    }
  }, [trails]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <AnimatePresence>
        {trails.map((trail, index) => (
          <motion.div
            key={trail.id}
            initial={{
              opacity: 0,
              scale: 0,
              x: trail.x - 80,
              y: trail.y - 60,
              rotate: trail.rotation,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: trail.x - 80,
              y: trail.y - 60,
              rotate: trail.rotation,
            }}
            exit={{
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.5 },
            }}
            transition={{
              duration: 0.3,
              ease: [0.23, 1, 0.32, 1],
            }}
            className="absolute w-40 h-28 rounded-xl overflow-hidden shadow-2xl border-2 border-white pointer-events-auto"
            style={{
              zIndex: index,
            }}
          >
            <img
              src={trail.image.src}
              alt={trail.image.alt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3">
              <span className="text-white text-[10px] font-bold">
                {trail.image.alt}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// --- MODERN LAPTOP SHOWCASE ---
const ModernLaptopShowcase = () => {
  const triggerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const slides = gsap.utils.toArray(".feature-slide");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: `+=${slides.length * 1500}`,
          pin: true,
          scrub: 1,
        },
      });

      slides.forEach((slide, i) => {
        tl.fromTo(
          slide,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1 },
        ).to(
          slide.querySelector(".progress-line"),
          {
            width: "100%",
            duration: 1.2,
            ease: "power2.inOut",
          },
          "-=0.5",
        );

        if (i !== slides.length - 1) {
          tl.to(slide, { y: -50, opacity: 0, duration: 1, delay: 0.5 });
        }
      });
    }, triggerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      title: "Encrypted Face Template System",
      problem: "PINs and passwords can be observed, guessed, or shared easily.",
      solution:
        "DrishtiPay converts facial features into an encrypted face template. Actual face images are never stored, ensuring user privacy.",
      stats: ["AES-256 Encrypted", "No Image Storage"],
      icon: <FiLock className="text-indigo-600" size={20} />,
    },
    {
      title: "AI-Based Liveness Detection",
      problem:
        "Face systems can be fooled using photos, videos, or screen replay.",
      solution:
        "Our AI analyzes eye movement, face motion, and real-time camera response to confirm that a live person is present.",
      stats: ["99.9% Fraud Detection", "IR-Depth Sensing"],
      icon: <FiCpu className="text-indigo-600" size={20} />,
    },
    {
      title: "Instant Face-to-UPI Verification",
      problem: "OTP and PIN-based payments slow down the checkout process.",
      solution:
        "Face verification is completed within milliseconds using optimized on-device processing, enabling fast and seamless UPI payments.",
      stats: ["<0.5s Response", "Offline-Ready"],
      icon: <FiZap className="text-indigo-600" size={20} />,
    },
  ];

  return (
    <section
      ref={triggerRef}
      className="h-screen bg-[#F8FAFC] flex items-center justify-center overflow-hidden font-sans"
    >
      <div className="w-full max-w-7xl px-12 grid lg:grid-cols-[1fr_1.2fr] gap-20 items-center">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-indigo-600"></div>
              <span className="text-[10px] font-black tracking-[0.4em] text-indigo-600 uppercase">
                SYSTEM ARCHITECTURE
              </span>
            </div>
            <h2 className="text-7xl font-bold text-slate-900 tracking-tight leading-[0.95]">
              Seamless. <br /> Secure. <br />{" "}
              <span className="text-slate-300">Simplified.</span>
            </h2>
          </div>

          <p className="text-slate-500 text-lg max-w-md leading-relaxed">
            DrishtiPay replaces traditional PIN and OTP systems with AI-powered
            face authentication, creating a secure and contactless UPI payment
            experience.
          </p>

          <div className="flex gap-12 pt-4">
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">
                10s
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Face Verification
              </p>
            </div>
            <div className="border-l border-slate-200 pl-12">
              <p className="text-2xl font-black text-slate-900 leading-none">
                UPI-Grade
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Security
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative w-full aspect-[16/10] bg-[#111] rounded-[2.5rem] border-[12px] border-[#222] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-10 pointer-events-none" />

            <div className="absolute inset-0 bg-white p-10 flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-500 tracking-tighter uppercase">
                    Real-Time Face Verification
                  </span>
                </div>
              </div>

              <div className="flex-grow relative overflow-hidden">
                {features.map((item, index) => (
                  <div
                    key={index}
                    className="feature-slide absolute inset-0 flex flex-col opacity-0"
                  >
                    <div className="flex items-start gap-6 mb-8">
                      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                          {item.title}
                        </h4>
                        <div className="flex gap-3">
                          {item.stats.map((stat, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100 uppercase italic"
                            >
                              {stat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                          <FiLock size={10} /> The Legacy Problem
                        </p>
                        <p className="text-slate-400 text-sm italic font-medium">
                          &quot;{item.problem}&quot;
                        </p>
                      </div>

                      <div className="space-y-4 relative">
                        <div className="progress-line absolute top-0 left-0 h-[2px] bg-indigo-600 w-0" />
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest pt-4 flex items-center gap-2">
                          <FiCheckCircle size={10} /> FacePay Solution
                        </p>
                        <p className="text-slate-700 text-base leading-relaxed font-semibold">
                          {item.solution}
                        </p>
                      </div>
                    </div>

                    <button className="mt-auto w-fit flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                      View Technical Docs <FiArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[110%] h-6 bg-[#222] rounded-b-3xl shadow-2xl" />
          <div className="absolute -z-10 w-[140%] h-[140%] bg-indigo-100/30 rounded-full blur-[120px] -top-[20%] -right-[20%]" />
        </div>
      </div>
    </section>
  );
};

// --- STACKED DASHBOARD ---
const DashboardStack = ({ children, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-5%" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="sticky mb-6 w-full max-w-[1180px] mx-auto px-4"
      style={{
        zIndex: index,
        top: `${80 + index * 40}px`,
      }}
    >
      <div className="bg-white rounded-[3rem] border border-gray-200/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] flex overflow-hidden min-h-[700px] ring-1 ring-gray-200/50">
        {children}
      </div>
    </motion.div>
  );
};

// === HYPER PERFECT REVEAL ===
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

const steps = [
  {
    title: "One-Time Registration",
    desc: "User registers once by providing basic details and securely enrolling their face into the system.",
    icon: <FiEye />,
    color: "#6366f1",
    tag: "PHASE / 01",
    bgText: "01",
  },
  {
    title: "Live Face Scan",
    desc: "At the time of payment, the user looks at the camera and a live face scan is captured in real time.",
    icon: <FiLock />,
    color: "#10b981",
    tag: "PHASE / 02",
    bgText: "02",
  },
  {
    title: "AI-Based Verification",
    desc: "The system verifies liveness and matches the face with the stored encrypted template to prevent spoofing.",
    icon: <FiShield />,
    color: "#f59e0b",
    tag: "PHASE / 03",
    bgText: "03",
  },
  {
    title: "UPI Payment Completed",
    desc: "After successful face verification, the UPI payment is processed securely without using PIN or OTP.",
    icon: <FiZap />,
    color: "#ec4899",
    tag: "PHASE / 04",
    bgText: "04",
  },
];

// === HOW IT WORKS - AESTHETIC SPLIT REVEAL ===
const AestheticSplitReveal = () => {
  const [activeStep, setActiveStep] = useState(0);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <section
      ref={containerRef}
      className="relative bg-[#F8FAFC] font-sans selection:bg-indigo-100"
    >
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-[100] origin-left"
      />

      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-5/12 h-[60vh] lg:h-screen sticky top-0 overflow-hidden flex items-center justify-center bg-[#FCFCFC]">
          <div className="absolute inset-0 z-0">
            <motion.div
              animate={{
                backgroundColor: steps[activeStep].color,
                opacity: [0.05, 0.08, 0.05],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-[-10%] left-[-10%] w-full h-full rounded-full blur-[120px]"
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotateY: 20 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="relative z-10"
            >
              <div className="relative w-64 h-80 bg-white/80 backdrop-blur-xl rounded-[3rem] border border-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center group">
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ color: steps[activeStep].color }}
                  className="text-8xl drop-shadow-2xl"
                >
                  {steps[activeStep].icon}
                </motion.div>

                <div className="absolute bottom-10 px-6 py-1 rounded-full bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    Face to UPI Link
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-12 w-0.5 transition-all duration-700 ${
                  activeStep === i ? "bg-slate-800" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="lg:w-7/12 px-8 lg:px-24">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              onViewportEnter={() => setActiveStep(idx)}
              viewport={{ amount: 0.6 }}
              className="min-h-screen flex flex-col justify-center relative"
            >
              <span className="absolute left-[-20px] top-1/4 text-[20rem] font-black text-slate-50 select-none -z-10 leading-none">
                {step.bgText}
              </span>

              <div className="max-w-xl">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
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

// === INDUSTRIAL CLEAN SECURITY SECTION ===
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

// === STATS & CTA BRIDGE SECTION ===
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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-12 lg:p-20 text-center overflow-hidden"
        >
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

// === CLEAN HIGHLIGHT REVEAL SECTION ===
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

        <div className="relative w-full max-w-7xl px-10 h-full flex items-center">
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

// === FAQ SECTION ===
const FacePayLiteFAQ = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const faqs = [
    {
      label: "S",
      title: "Security",
      q: "Is the system secure?",
      a: "Yes. User authentication data is protected using standard encryption techniques during storage and transmission.",
      color: "#E0F2FE",
    },
    {
      label: "P",
      title: "Privacy",
      q: "Is my face photo stored?",
      a: "No. The system stores encrypted face templates instead of actual face images to protect user privacy.",
      color: "#F0FDF4",
    },
    {
      label: "V",
      title: "Velocity",
      q: "How fast is face verification?",
      a: "Face verification is designed to complete within a short time, making the payment process quick and smooth.",
      color: "#FAF5FF",
    },
    {
      label: "L",
      title: "Liveness",
      q: "Can photos or videos be used to fool the system?",
      a: "No. The system includes AI-based liveness checks to reduce the risk of photo or video spoofing.",
      color: "#FFF7ED",
    },
    {
      label: "A",
      title: "AI Core",
      q: "Does it work in different lighting conditions?",
      a: "The system is designed to handle normal variations in lighting while capturing live face data.",
      color: "#F1F5F9",
    },
  ];

  return (
    <section className="bg-white min-h-screen flex items-center justify-center py-20">
      <div className="w-[95%] max-w-[1400px] grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-10 lg:gap-16">
        <div className="flex flex-col justify-center px-4 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
              F
            </div>
            <span className="font-bold text-lg text-slate-900">FacePay</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black leading-[0.85] tracking-tight mb-6 text-slate-900">
            Pure. <br /> Secure. <br /> Simple.
          </h1>
          <p className="text-base text-slate-500 leading-relaxed max-w-sm mb-8">
            A secure and contactless Face-Based UPI payment system designed for
            fast and PIN-less transactions.
          </p>
          <button className="bg-slate-900 text-white px-8 py-4 rounded-lg font-bold w-fit hover:bg-slate-800 transition-colors">
            View Demo
          </button>
        </div>

        <div className="flex gap-3 h-[600px]">
          {faqs.map((faq, index) => (
            <div
              key={index}
              onMouseEnter={() => setActiveIndex(index)}
              style={{
                backgroundColor: faq.color,
                flex: activeIndex === index ? "10" : "1",
              }}
              className="rounded-3xl p-8 cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.2,1,0.3,1)] overflow-hidden flex flex-col border border-slate-100"
            >
              <div
                className={`h-full flex-col items-center justify-between ${
                  activeIndex === index ? "hidden" : "flex"
                }`}
              >
                <div className="w-8 h-8 border border-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">
                  {faq.label}
                </div>
                <span className="transform -rotate-90 whitespace-nowrap text-2xl font-black text-slate-900 tracking-tight">
                  {faq.title}
                </span>
              </div>

              <div
                className={`h-full flex-col justify-center ${
                  activeIndex === index ? "flex" : "hidden"
                }`}
              >
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-5">
                  Protocol 0{index + 1}
                </span>
                <h3 className="text-4xl font-black leading-none text-slate-900 mb-5 tracking-tight">
                  {faq.q}
                </h3>
                <p className="text-lg leading-relaxed text-slate-600 max-w-md">
                  {faq.a}
                </p>
                <div className="w-10 h-0.5 bg-slate-900 mt-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const chartData = [
    { name: "Jan", v: 30 },
    { name: "Feb", v: 45 },
    { name: "Mar", v: 38 },
    { name: "Apr", v: 65 },
    { name: "May", v: 48 },
    { name: "Jun", v: 80 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100 font-sans">
      {/* Hero Section with Cursor Trail Images */}
      <section className="relative pt-24 pb-12 text-center px-4 min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_#EEF2FF_0%,_transparent_70%)] -z-10 opacity-70" />

        {/* Cursor Trail Images Effect */}
        <CursorTrailImages />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-[12px] font-bold mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            INDIA'S FIRST FACE-BASED UPI PAYMENT SYSTEM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-[92px] font-bold tracking-tighter mb-8 text-slate-900 leading-[0.9]"
          >
            Pay with Your{" "}
            <span className="text-indigo-600 italic font-medium">Face.</span>.{" "}
            <br />
            Not with{" "}
            <span className="underline decoration-indigo-200 underline-offset-8">
              PINs or Passwords.
            </span>
          </motion.h1>

          <p className="text-slate-500 text-[22px] max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            DrishtiPay eliminates PINs and passwords. Experience India's first
            fully autonomous Face-to-Pay ecosystem.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-16 px-4">
            <HeroFeature
              icon={<FiCheckCircle />}
              title="99.9% Liveness Detection"
              desc="Blocks photos & video spoofing"
              color="text-green-500"
            />
            <HeroFeature
              icon={<FiShield />}
              title="On-Device AI Processing"
              desc="Face data never leaves device"
              color="text-indigo-600"
            />
            <HeroFeature
              icon={<FiZap />}
              title=" 0.5s Verification"
              desc="Faster than PIN entry"
              color="text-amber-500"
            />
            <HeroFeature
              icon={<FiLock />}
              title="Bank-Grade Security"
              desc="AES-256 Encrypted"
              color="text-blue-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-slate-900 text-white px-12 py-5 rounded-full font-bold text-[16px] shadow-2xl hover:bg-indigo-600 transition-all hover:scale-105">
              Get Started with FacePay
            </button>
            <button className="text-slate-600 font-bold hover:text-indigo-600 flex items-center gap-2 transition-colors">
              <FiEye /> View How FacePay Works
            </button>
          </div>
        </div>
      </section>

      <ModernLaptopShowcase />
      <div className="relative pt-12 pb-12">
        <DashboardStack index={1}>
          <Sidebar active="Intelligence" />
          <main className="flex-1 p-10 bg-white overflow-y-auto">
            <DashHeader title="Intelligence Hub" />
            <div className="grid grid-cols-3 gap-6 mb-10">
              <StatCard title="Security Score" value="95" suffix="% (Demo)" />
              <StatCard title="Active Modules" value="6" />
              <StatCard title="Face Verifications" value="Demo" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-50 rounded-[2.5rem] p-8 h-80">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiActivity className="text-indigo-600" /> Verification Trend
                </h4>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={chartData}>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#4F46E5"
                      fill="#4F46E520"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50 rounded-[2.5rem] p-8 h-80">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiAlertCircle className="text-amber-500" /> Live Monitoring
                </h4>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-slate-600">
                          Face Verification #{i + 1}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>

        <DashboardStack index={2}>
          <Sidebar active="Digital Vault" />
          <main className="flex-1 p-10 bg-slate-900 text-white overflow-y-auto">
            <DashHeader title="Digital Vault" isDark />
            <div className="grid grid-cols-2 gap-6 mt-6">
              <VaultCard
                icon={<FiLock />}
                title="Encrypted Face Templates"
                desc="Face data stored as encrypted templates, not images, ensuring privacy."
              />

              <VaultCard
                icon={<FiCpu />}
                title="Secure Processing Layer"
                desc="Face verification runs in a controlled and protected environment."
              />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                <h4 className="font-bold mb-6 flex items-center gap-2">
                  <FiCreditCard /> Recent Face Authentication
                </h4>
                <div className="space-y-4">
                  {["Mumbai Store", "Online Checkout", "Delhi Outlet"].map(
                    (loc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-white/5 pb-4"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                            <FiUserCheck />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{loc}</p>
                            <p className="text-xs text-slate-500">
                              Verified via Face Authentication
                            </p>
                          </div>
                        </div>
                        <p className="font-mono text-indigo-400">
                          ₹{450 * (i + 1)}.00
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="bg-indigo-600 rounded-[2.5rem] p-8 flex flex-col justify-between">
                <FiZap size={40} />
                <div>
                  <h4 className="text-2xl font-bold">Liveness Detection</h4>
                  <p className="text-indigo-200 text-xs mt-2">
                    AI-based liveness verification active
                  </p>
                </div>
                <div className="flex gap-1 h-12 items-end">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, 30, 10] }}
                      transition={{ repeat: Infinity, delay: i * 0.1 }}
                      className="flex-1 bg-white/40 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>

        <DashboardStack index={3}>
          <Sidebar active="Nodes" />
          <main className="flex-1 p-10 bg-white overflow-y-auto">
            <DashHeader title="System Architecture" />
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <FiServer className="text-indigo-600 mb-2" />
                <p className="text-2xl font-bold">Demo</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Environment
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <FiGlobe className="text-emerald-500 mb-2" />
                <p className="text-2xl font-bold">Fast</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Verification
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <FiDatabase className="text-amber-500 mb-2" />
                <p className="text-2xl font-bold">Local</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Deployment
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <FiTerminal className="text-blue-500 mb-2" />
                <p className="text-2xl font-bold">Stable</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  System State
                </p>
              </div>
            </div>
            <div className="h-80 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50 flex items-center justify-center relative">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(#4F46E5 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="w-64 h-64 border border-indigo-200 rounded-full flex items-center justify-center"
              >
                <div className="w-12 h-12 bg-white shadow-xl rounded-full absolute -top-6 flex items-center justify-center text-indigo-600">
                  <FiGlobe />
                </div>
                <div className="w-32 h-32 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white">
                  <FiZap size={40} />
                </div>
              </motion.div>
              <div className="absolute bottom-8 right-8 text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  System Status
                </p>
                <p className="text-xl font-bold text-slate-800">
                  Demo Environment Active
                </p>
              </div>
            </div>
          </main>
        </DashboardStack>

        <DashboardStack index={4}>
          <Sidebar active="Analytics" />
          <main className="flex-1 p-10 bg-white">
            <DashHeader title="System Analytics" />
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden h-[400px]">
                <p className="text-xs font-bold opacity-50 uppercase tracking-widest">
                  Face Verification
                </p>
                <h3 className="text-6xl font-bold mt-4 tracking-tighter">
                  High Accuracy
                </h3>
                <div className="mt-12 space-y-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <p>Template Matching</p>
                      <p>Fast</p>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[90%] h-full bg-indigo-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <p>Liveness Detection</p>
                      <p>Active</p>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[95%] h-full bg-emerald-500" />
                    </div>
                  </div>
                </div>
                <FiEye
                  size={220}
                  className="absolute bottom-[-40px] right-[-40px] opacity-10"
                />
              </div>
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-[2.5rem] p-8 h-48">
                  <p className="font-bold text-slate-800 mb-4">
                    Verification Trend
                  </p>
                  <ResponsiveContainer width="100%" height="70%">
                    <BarChart data={chartData}>
                      <Bar dataKey="v" fill="#4F46E5" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-emerald-50 rounded-[2.5rem] p-8 h-48 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-900">
                      Spoof Attempts (Simulated)
                    </p>
                    <p className="text-4xl font-black text-emerald-600 mt-2">
                      Demo
                    </p>
                    <p className="text-xs text-emerald-700 mt-1 font-medium">
                      AI-based liveness detection active
                    </p>
                  </div>
                  <FiShield size={60} className="text-emerald-200" />
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>

        <DashboardStack index={5}>
          <Sidebar active="Compliance" />
          <main className="flex-1 p-10 bg-[#0F172A] text-white overflow-y-auto">
            <DashHeader title="Security & Privacy" isDark />
            <div className="grid grid-cols-3 gap-6">
              <ComplianceCard title="Privacy-First Design" status="Active" />
              <ComplianceCard
                title="Encrypted Data Handling"
                status="Implemented"
              />
              <ComplianceCard title="UPI-Compatible Flow" status="Integrated" />
            </div>
            <div className="mt-10 bg-white/5 rounded-[3rem] p-12 border border-white/10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500" />
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle size={40} />
              </div>
              <h3 className="text-4xl font-bold tracking-tight">
                System Operating Securely
              </h3>
              <p className="text-slate-400 mt-4 max-w-md mx-auto leading-relaxed">
                System operates according to defined security and privacy
                principles. All authentication protocols follow
                industry-standard practices.
              </p>
              <div className="mt-10 flex gap-4 justify-center">
                <button className="bg-indigo-600 px-10 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-colors">
                  View System Flow
                </button>
                <button className="bg-white/10 px-10 py-4 rounded-2xl font-bold hover:bg-white/20 transition-colors">
                  Try Demo
                </button>
              </div>
            </div>
          </main>
        </DashboardStack>
      </div>

      <HyperPerfectReveal />
      <AestheticSplitReveal />
      <IndustrialCleanSecurity />
      <StatsBridge />
      <CleanHighlightReveal />
      <FacePayLiteFAQ />
      <UniqueFacePayFooter />
    </div>
  );
};

// --- SUB-COMPONENTS ---
const HeroFeature = ({ icon, title, desc, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-left hover:shadow-md transition-all hover:-translate-y-1">
    <div className={`${color} mb-3 text-2xl`}>{icon}</div>
    <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
    <p className="text-[12px] text-slate-400 mt-1 leading-tight">{desc}</p>
  </div>
);

const Sidebar = ({ active }) => (
  <aside className="w-72 bg-[#F9FAFB] border-r border-gray-100 p-10 hidden md:flex flex-col">
    <div className="flex items-center gap-2 mb-12">
      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
        <FiEye className="text-white" />
      </div>
      <span className="text-2xl font-bold tracking-tighter italic">
        Drishti<span className="not-italic text-indigo-600">Pay</span>
      </span>
    </div>
    <div className="space-y-2">
      <NavItem
        icon={<FiGrid />}
        label="Intelligence"
        active={active === "Intelligence"}
      />
      <NavItem
        icon={<FiPocket />}
        label="Digital Vault"
        active={active === "Digital Vault"}
      />
      <NavItem icon={<FiUsers />} label="Nodes" active={active === "Nodes"} />
      <NavItem
        icon={<FiPieChart />}
        label="Analytics"
        active={active === "Analytics"}
      />
      <NavItem
        icon={<FiShield />}
        label="Compliance"
        active={active === "Compliance"}
      />
    </div>
    <div className="mt-auto p-6 bg-white rounded-3xl border border-gray-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase">
        System Status
      </p>
      <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        Demo Active
      </p>
    </div>
  </aside>
);

const NavItem = ({ icon, label, active }) => (
  <div
    className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all cursor-pointer ${
      active
        ? "bg-white shadow-sm text-slate-900 ring-1 ring-slate-200"
        : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
    }`}
  >
    <span className="text-lg">{icon}</span> {label}
  </div>
);

const StatCard = ({ title, value, suffix = "" }) => (
  <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
      {title}
    </p>
    <div className="flex items-baseline gap-1">
      <p className="text-4xl font-extrabold text-slate-900 tracking-tighter">
        <AnimatedNumber value={value} />
      </p>
      <span className="text-lg font-bold text-slate-400">{suffix}</span>
    </div>
  </div>
);

const VaultCard = ({ icon, title, desc }) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-colors">
    <div className="text-indigo-400 mb-4 text-3xl">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const ComplianceCard = ({ title, status }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">
      Principle
    </p>
    <h4 className="font-bold">{title}</h4>
    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
      <FiCheckCircle /> {status}
    </div>
  </div>
);

const DashHeader = ({ title, isDark }) => (
  <div className="flex justify-between items-center mb-10">
    <div>
      <h2
        className={`text-3xl font-bold tracking-tight ${
          isDark ? "text-white" : "text-slate-800"
        }`}
      >
        {title}
      </h2>
      <p
        className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${
          isDark ? "text-indigo-400" : "text-slate-400"
        }`}
      >
        Simulated Monitoring Dashboard
      </p>
    </div>
    <div className="flex gap-3">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
          isDark
            ? "border-white/10 bg-white/5"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <FiBell className={isDark ? "text-white" : "text-slate-600"} />
      </div>
      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
        <FiUserCheck />
      </div>
    </div>
  </div>
);

export default Home;
