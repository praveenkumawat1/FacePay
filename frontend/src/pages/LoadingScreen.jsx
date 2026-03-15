import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const COLS = 8; // More columns = more "Fragmented" premium look
const COUNTER_DURATION = 3;

export default function AgencyPremiumLoader({ onFinish }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const loaderRef = useRef(null);
  const bandsRef = useRef([]);
  const contentRef = useRef(null);
  const textRef = useRef(null);
  const secondaryBandsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsVisible(false);
          if (onFinish) onFinish();
        },
      });

      // 1. Initial State
      gsap.set(bandsRef.current, { yPercent: 0 });
      gsap.set(secondaryBandsRef.current, { yPercent: 0 });
      gsap.set(".char", { y: 100, opacity: 0 });

      // 2. Text Intro (Letters popping up)
      tl.to(".char", {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 1,
        ease: "expo.out",
      });

      // 3. Counter Logic
      const counterValue = { val: 0 };
      gsap.to(counterValue, {
        val: 100,
        duration: COUNTER_DURATION,
        ease: "none",
        onUpdate: () => setCount(Math.round(counterValue.val)),
      });

      // 4. THE REVEAL (The "Agency" Move)
      // Layer 1: Main Black Bands
      tl.to(
        bandsRef.current,
        {
          yPercent: -100,
          duration: 1.4,
          ease: "expo.inOut",
          stagger: { amount: 0.5, from: "center" },
        },
        `+=${COUNTER_DURATION - 1.2}`,
      );

      // Layer 2: Subtle Grey/Accent Bands (Depth create karta hai)
      tl.to(
        secondaryBandsRef.current,
        {
          yPercent: -100,
          duration: 1.4,
          ease: "expo.inOut",
          stagger: { amount: 0.5, from: "center" },
        },
        "-=1.1",
      );

      // Text Out
      tl.to(
        contentRef.current,
        {
          y: -100,
          opacity: 0,
          duration: 1,
          ease: "expo.inOut",
        },
        "-=1.4",
      );
    }, loaderRef);

    return () => ctx.revert();
  }, [onFinish]);

  if (!isVisible) return null;

  const loadingText = "LOADING".split("");

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[999999] overflow-hidden select-none bg-white"
    >
      {/* Secondary Depth Layer (Deep Grey) */}
      <div className="absolute inset-0 flex pointer-events-none">
        {Array.from({ length: COLS }).map((_, i) => (
          <div
            key={`sec-${i}`}
            ref={(el) => (secondaryBandsRef.current[i] = el)}
            className="h-full flex-1 bg-neutral-800"
          />
        ))}
      </div>

      {/* Main Layer (True Black) */}
      <div className="absolute inset-0 flex pointer-events-none">
        {Array.from({ length: COLS }).map((_, i) => (
          <div
            key={`main-${i}`}
            ref={(el) => (bandsRef.current[i] = el)}
            className="h-full flex-1 bg-[#0a0a0a] border-r border-white/[0.03]"
          />
        ))}
      </div>

      {/* UI Content */}
      <div
        ref={contentRef}
        className="relative z-10 h-full w-full flex flex-col items-center justify-center"
      >
        {/* Large Aesthetic Background Number */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <h1 className="text-[40vw] font-black text-white leading-none">
            {count}
          </h1>
        </div>

        {/* Center Text Wrapper */}
        <div className="flex flex-col items-center">
          <div className="flex overflow-hidden mb-2">
            {loadingText.map((char, i) => (
              <span
                key={i}
                className="char text-white text-xs md:text-sm font-light tracking-[0.8em]"
              >
                {char}
              </span>
            ))}
          </div>

          <div className="h-[1px] w-12 bg-white/20 my-6" />

          <div className="overflow-hidden h-20 md:h-32">
            <span className="block text-white text-6xl md:text-8xl font-medium italic tracking-tighter leading-none">
              {count < 10 ? `0${count}` : count}
              <span className="text-xl md:text-2xl not-italic ml-2 text-white/40">
                %
              </span>
            </span>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="absolute bottom-12 w-full px-12 flex justify-between items-end">
          <div className="text-white/30 text-[10px] tracking-widest uppercase">
            <br />
          </div>
          <div className="text-white/30 text-[10px] tracking-widest uppercase text-right">
            Scroll to <br /> Explore
          </div>
        </div>
      </div>
    </div>
  );
}
