import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiStar } from "react-icons/fi";

// Testimonials data (duplicates for infinite loop)
const testimonials = [
  {
    name: "Anjali Sharma",
    title: "Bank Relationship Manager",
    rating: 5,
    review:
      "FacePay is a game changer! Customers feel safe and are amazed at the speed of payment. Integration was seamless and user adoption exceeded expectations. Highly recommend for future-ready UPI payments.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Rahul Verma",
    title: "Merchant Partner",
    rating: 4,
    review:
      "We switched to DrishtiPay for our retail stores and saw genuine reduction in failed transactions. No more OTP/PIN confusion for our customers. Support is also excellent.",
    avatar: "https://randomuser.me/api/portraits/men/31.jpg",
  },
  {
    name: "Sonal Kapoor",
    title: "Fintech Influencer",
    rating: 5,
    review:
      "Face-based UPI is the future. I’m truly impressed by the security and speed. The live liveness test works flawlessly. Love the transparent privacy approach!",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
  },
  {
    name: "Ritesh Gupta",
    title: "UPI Product Lead",
    rating: 5,
    review:
      "The implementation of local device-only face templates is amazing. UPI compliance, privacy, and transaction speed all get a thumbs up. Stellar work by the DrishtiPay team.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  // Repeat for seamless loop:
  {
    name: "Anjali Sharma",
    title: "Bank Relationship Manager",
    rating: 5,
    review:
      "FacePay is a game changer! Customers feel safe and are amazed at the speed of payment. Integration was seamless and user adoption exceeded expectations. Highly recommend for future-ready UPI payments.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Rahul Verma",
    title: "Merchant Partner",
    rating: 4,
    review:
      "We switched to DrishtiPay for our retail stores and saw genuine reduction in failed transactions. No more OTP/PIN confusion for our customers. Support is also excellent.",
    avatar: "https://randomuser.me/api/portraits/men/31.jpg",
  },
];

export default function Testimonials() {
  const sliderRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const wrapper = wrapperRef.current;
    const cards = wrapper.children;
    const cardWidth = cards[0].offsetWidth + 24; // width + gap (gap-6 = 24px)
    const totalWidth = cardWidth * testimonials.length;

    // Set the wrapper width to accommodate all cards
    gsap.set(wrapper, { width: totalWidth });

    // Infinite scroll animation
    const anim = gsap.to(wrapper, {
      x: -totalWidth / 2,
      duration: 22,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => {
          const wrapX = parseFloat(x) % (totalWidth / 2);
          return wrapX + "px";
        },
      },
    });

    // Pause/resume on hover
    const slider = sliderRef.current;
    function pause() {
      anim.pause();
    }
    function resume() {
      anim.resume();
    }
    slider.addEventListener("mouseenter", pause);
    slider.addEventListener("mouseleave", resume);

    // Cleanup
    return () => {
      anim.kill();
      slider.removeEventListener("mouseenter", pause);
      slider.removeEventListener("mouseleave", resume);
    };
  }, []);

  return (
    <section className="w-full bg-gradient-to-b from-white via-indigo-50 to-white py-24 overflow-hidden">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-sm font-bold mb-5">
          <FiStar className="animate-pulse" />
          TRUSTED BY REAL USERS
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-4">
          Testimonials
        </h2>
        <p className="text-xl text-slate-500 font-medium">
          Secure, instant face-based UPI.
          <br />
          Here’s what our partners and early adopters say.
        </p>
      </div>

      {/* Infinite scroll container */}
      <div
        ref={sliderRef}
        className="relative z-10 w-full overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ userSelect: "none" }}
      >
        <div
          ref={wrapperRef}
          className="flex gap-6 px-6 md:px-12"
          style={{ willChange: "transform" }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 bg-white/95 border border-indigo-100 rounded-3xl max-w-xs w-[90vw] md:w-96 p-8 transition-transform hover:scale-105 hover:border-indigo-300 duration-200"
              style={{
                minHeight: "316px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                  />
                  <div>
                    <div className="font-bold text-lg text-indigo-900">
                      {t.name}
                    </div>
                    <div className="text-xs font-semibold text-indigo-400">
                      {t.title}
                    </div>
                  </div>
                </div>
                <div className="mb-6 text-lg text-slate-700 leading-snug line-clamp-4">
                  “{t.review}”
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, idx) => (
                  <FiStar
                    key={idx}
                    className={
                      idx < t.rating ? "text-amber-400" : "text-slate-200"
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
