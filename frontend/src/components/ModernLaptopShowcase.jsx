/**
 * ModernLaptopShowcase
 * - Displays a laptop mockup with scroll‑triggered feature slides using GSAP.
 * - Each slide explains a key technology (Encryption, Liveness, Speed).
 * - Includes animated progress bars and a sticky pinning effect.
 */
import { useEffect, useRef } from "react";
import {
  FiLock,
  FiCpu,
  FiZap,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugin (only on client)
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

    return () => ctx.revert(); // Cleanup on unmount
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
        {/* Left column: text */}
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

        {/* Right column: laptop mockup with feature slides */}
        <div className="relative">
          <div className="relative w-full aspect-[16/10] bg-[#111] rounded-[2.5rem] border-[12px] border-[#222] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-10 pointer-events-none" />

            <div className="absolute inset-0 bg-white p-10 flex flex-col">
              {/* Top bar with mock window controls and status badge */}
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

              {/* Feature slides container */}
              <div className="flex-grow relative overflow-hidden">
                {features.map((item, index) => (
                  <div
                    key={index}
                    className="feature-slide absolute inset-0 flex flex-col opacity-0"
                  >
                    {/* Title and stats */}
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

                    {/* Problem & solution */}
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
                        {/* Animated progress line */}
                        <div className="progress-line absolute top-0 left-0 h-[2px] bg-indigo-600 w-0" />
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest pt-4 flex items-center gap-2">
                          <FiCheckCircle size={10} /> FacePay Solution
                        </p>
                        <p className="text-slate-700 text-base leading-relaxed font-semibold">
                          {item.solution}
                        </p>
                      </div>
                    </div>

                    {/* CTA button */}
                    <button className="mt-auto w-fit flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                      View Technical Docs <FiArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Laptop stand shadow effect */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[110%] h-6 bg-[#222] rounded-b-3xl shadow-2xl" />
          {/* Background glow */}
          <div className="absolute -z-10 w-[140%] h-[140%] bg-indigo-100/30 rounded-full blur-[120px] -top-[20%] -right-[20%]" />
        </div>
      </div>
    </section>
  );
};

export default ModernLaptopShowcase;
