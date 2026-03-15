/**
 * FacePayLiteFAQ
 * - A two‑column FAQ section with expanding cards.
 * - On hover, a card expands to show the question and answer.
 * - Uses a flexible flex‑box layout for the cards.
 */
import { useState } from "react";

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
        {/* Left column – intro */}
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

        {/* Right column – expandable FAQ cards */}
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
              {/* Collapsed state */}
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

              {/* Expanded state */}
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

export default FacePayLiteFAQ;
