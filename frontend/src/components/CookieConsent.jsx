import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setShow(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      <div
        className="mb-8 px-6 sm:px-8 py-5 bg-white/80 dark:bg-gray-900/80 
                   rounded-2xl shadow-2xl border border-lime-400
                   max-w-md w-full flex flex-col sm:flex-row items-center gap-4 backdrop-blur-lg animate-cookie-slide
                   pointer-events-auto"
        style={{
          animation: "cookie-pop 0.5s cubic-bezier(.51,1.53,.58,1) forwards",
        }}
      >
        <div className="flex-1 text-center sm:text-left">
          <div className="text-lg font-semibold text-gray-900 dark:text-lime-200 mb-2">
            🍪 We Value Your Privacy
          </div>
          <div className="text-gray-700 dark:text-gray-200 text-sm">
            This website uses cookies to enhance your experience, analyze site
            usage, and show personalized content. By clicking "Accept", you
            consent to our use of cookies.
          </div>
        </div>
        <button
          onClick={handleAccept}
          className="bg-lime-500 hover:bg-lime-600 text-black font-bold py-2 px-6 rounded-lg shadow transform hover:scale-105 transition-all duration-150 mt-2 sm:mt-0"
        >
          Accept
        </button>
      </div>
      <style>
        {`
          @keyframes cookie-pop {
            0% { opacity: 0; transform: translateY(60px) scale(0.95);}
            100% { opacity: 1; transform: translateY(0) scale(1);}
          }
        `}
      </style>
    </div>
  );
}
