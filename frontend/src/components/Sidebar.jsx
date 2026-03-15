import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGrid,
  FiCreditCard,
  FiSend,
  FiDownload,
  FiUserCheck,
  FiClock,
  FiGift,
  FiLogOut,
  FiShield,
  FiZap,
  FiEye,
} from "react-icons/fi";
import { useDashboard } from "../pages/DashboardContext";

const NAV_ITEMS = [
  { key: "Dashboard", icon: FiGrid, route: "/dashboard" },
  { key: "Wallet", icon: FiCreditCard, route: "/dashboard/wallet" },
  { key: "Send Money", icon: FiSend, route: "/dashboard/send-money" },
  { key: "Add Money", icon: FiDownload, route: null }, // ← null = modal trigger
  { key: "Profile", icon: FiUserCheck, route: "/dashboard/profile" },
  { key: "History", icon: FiClock, route: "/dashboard/history" },
  { key: "Security", icon: FiShield, route: "/dashboard/security" },
  { key: "Coupons & Offers", icon: FiGift, route: "/dashboard/coupons" },
];

const NAV_TRANSLATIONS = {
  English: {
    Dashboard: "Dashboard",
    Wallet: "Wallet",
    "Send Money": "Send Money",
    "Add Money": "Add Money",
    Profile: "Profile",
    History: "History",
    Security: "Security",
    "Coupons & Offers": "Coupons & Offers",
  },
  Hindi: {
    Dashboard: "डैशबोर्ड",
    Wallet: "वॉलेट",
    "Send Money": "पैसे भेजें",
    "Add Money": "पैसे जोड़ें",
    Profile: "प्रोफ़ाइल",
    History: "इतिहास",
    Security: "सुरक्षा",
    "Coupons & Offers": "कूपन और ऑफर",
  },
  Gujarati: {
    Dashboard: "ડૅશબોર્ડ",
    Wallet: "વૉલેટ",
    "Send Money": "પૈસા મોકલો",
    "Add Money": "પૈસા ઉમેરો",
    Profile: "પ્રોફાઇલ",
    History: "ઇતિહાસ",
    Security: "સુરક્ષા",
    "Coupons & Offers": "કૂપન અને ઑફર",
  },
  Marathi: {
    Dashboard: "डॅशबोर्ड",
    Wallet: "वॉलेट",
    "Send Money": "पैसे पाठवा",
    "Add Money": "पैसे जोडा",
    Profile: "प्रोफाइल",
    History: "इतिहास",
    Security: "सुरक्षा",
    "Coupons & Offers": "कूपन आणि ऑफर",
  },
  Tamil: {
    Dashboard: "டாஷ்போர்டு",
    Wallet: "வாலட்",
    "Send Money": "பணம் அனுப்பு",
    "Add Money": "பணம் சேர்",
    Profile: "சுயவிவரம்",
    History: "வரலாறு",
    Security: "பாதுகாப்பு",
    "Coupons & Offers": "கூப்பன்கள்",
  },
  Telugu: {
    Dashboard: "డాష్‌బోర్డ్",
    Wallet: "వాలెట్",
    "Send Money": "డబ్బు పంపు",
    "Add Money": "డబ్బు జోడించు",
    Profile: "ప్రొఫైల్",
    History: "చరిత్ర",
    Security: "భద్రత",
    "Coupons & Offers": "కూపన్లు",
  },
};

// onAddMoneyClick prop — Dashboard se aata hai, modal open karta hai
export default function Sidebar({ onLogout, onAddMoneyClick }) {
  const location = useLocation();
  const { darkMode, language } = useDashboard();
  const dm = darkMode;

  const getLabel = (key) => NAV_TRANSLATIONS[language]?.[key] || key;

  const logoutLabel = {
    English: "Logout",
    Hindi: "लॉग आउट",
    Gujarati: "લૉગ આઉટ",
    Marathi: "लॉग आउट",
    Tamil: "வெளியேறு",
    Telugu: "లాగ్ అవుట్",
  };
  const tagline = {
    English: "Smart Payments",
    Hindi: "स्मार्ट भुगतान",
    Gujarati: "સ્માર્ટ ચૂકવણી",
    Marathi: "स्मार्ट पेमेंट",
    Tamil: "புத்திசாலி கொடுப்பனவு",
    Telugu: "స్మార్ట్ చెల్లింపు",
  };

  return (
    <aside
      className={`hidden md:flex flex-col w-72 h-screen sticky top-0 z-30 overflow-hidden transition-colors duration-500 ${
        dm ? "bg-[#0d0f1a]" : "bg-white"
      }`}
      style={{
        borderRight: dm
          ? "1px solid rgba(99,102,241,0.15)"
          : "1px solid rgba(226,232,240,0.8)",
        boxShadow: dm
          ? "4px 0 40px rgba(0,0,0,0.4)"
          : "4px 0 30px rgba(99,102,241,0.06)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-0 w-full h-64 pointer-events-none"
        style={{
          background: dm
            ? "radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)"
            : "radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.07) 0%, transparent 70%)",
        }}
      />
      {/* Vertical line */}
      <div
        className="absolute right-0 top-0 w-px h-full pointer-events-none"
        style={{
          background: dm
            ? "linear-gradient(to bottom, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0.1) 40%, transparent 100%)"
            : "linear-gradient(to bottom, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 40%, transparent 100%)",
        }}
      />

      <div className="relative flex flex-col h-full px-5 py-7">
        {/* LOGO */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-3 mb-10 px-1"
        >
          <div className="relative">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: "0 4px 20px rgba(79,70,229,0.4)",
              }}
            >
              <FiEye className="text-white text-xl" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <p
              className={`text-[22px] font-black tracking-tight leading-none ${dm ? "text-white" : "text-slate-900"}`}
            >
              Drishti<span className="text-indigo-500">Pay</span>
            </p>
            <p
              className={`text-[11px] font-semibold tracking-widest uppercase mt-0.5 ${dm ? "text-indigo-400/70" : "text-indigo-400"}`}
            >
              {tagline[language] || tagline.English}
            </p>
          </div>
        </motion.div>

        {/* Menu label */}
        <p
          className={`text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-3 ${dm ? "text-slate-600" : "text-slate-400"}`}
        >
          Menu
        </p>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ key, icon: Icon, route }, index) => {
            // Add Money → modal trigger, baki sab → Link
            const isAddMoney = key === "Add Money";
            const isActive = route ? location.pathname === route : false;

            const itemContent = (
              <div
                className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? dm
                      ? "bg-indigo-500/10 text-indigo-400"
                      : "bg-indigo-50 text-indigo-700"
                    : isAddMoney
                      ? dm
                        ? "text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 cursor-pointer"
                        : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 cursor-pointer"
                      : dm
                        ? "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {/* Active left bar */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeBar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-indigo-500"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                      : isAddMoney
                        ? dm
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-indigo-100 text-indigo-600"
                        : dm
                          ? "bg-white/5 group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
                          : "bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                  }`}
                >
                  <Icon />
                </div>

                <span className="text-sm font-semibold tracking-wide">
                  {getLabel(key)}
                </span>

                {/* Active dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeDot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}

                {/* Add Money badge */}
                {isAddMoney && (
                  <span
                    className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dm
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    Quick
                  </span>
                )}
              </div>
            );

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.04,
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="group"
              >
                {isAddMoney ? (
                  // Add Money → button, modal open karo
                  <button
                    className="w-full text-left"
                    onClick={onAddMoneyClick}
                  >
                    {itemContent}
                  </button>
                ) : (
                  // Baki sab → normal Link
                  <Link to={route} className="block">
                    {itemContent}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="mt-6 space-y-3">
          {/* Quick tip card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-2xl p-4 relative overflow-hidden ${
              dm
                ? "bg-indigo-500/8 border border-indigo-500/15"
                : "bg-indigo-50/80 border border-indigo-100"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl ${dm ? "bg-indigo-500/20" : "bg-indigo-100"}`}
              >
                <FiZap
                  className={`text-sm ${dm ? "text-indigo-400" : "text-indigo-600"}`}
                />
              </div>
              <div>
                <p
                  className={`text-xs font-bold mb-0.5 ${dm ? "text-indigo-300" : "text-indigo-700"}`}
                >
                  {language === "Hindi"
                    ? "त्वरित भुगतान"
                    : language === "Gujarati"
                      ? "ઝડપી ચૂકવણી"
                      : language === "Marathi"
                        ? "जलद पेमेंट"
                        : language === "Tamil"
                          ? "விரைவு கொடுப்பனவு"
                          : language === "Telugu"
                            ? "త్వరిత చెల్లింపు"
                            : "Quick Pay Ready"}
                </p>
                <p
                  className={`text-[11px] leading-tight ${dm ? "text-slate-500" : "text-slate-500"}`}
                >
                  {language === "Hindi"
                    ? "QR स्कैन करके भेजें"
                    : language === "Gujarati"
                      ? "QR સ્કૅન કરો"
                      : language === "Marathi"
                        ? "QR स्कॅन करा"
                        : language === "Tamil"
                          ? "QR ஸ்கேன் செய்யவும்"
                          : language === "Telugu"
                            ? "QR స్కాన్ చేయండి"
                            : "Scan QR to pay instantly"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Divider */}
          <div className={`h-px mx-2 ${dm ? "bg-white/5" : "bg-slate-100"}`} />

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogout}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 group ${
              dm
                ? "text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                : "text-slate-500 hover:text-red-600 hover:bg-red-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                dm
                  ? "bg-white/5 group-hover:bg-red-500/15"
                  : "bg-slate-100 group-hover:bg-red-100"
              }`}
            >
              <FiLogOut className="text-base" />
            </div>
            {logoutLabel[language] || "Logout"}
          </motion.button>
        </div>
      </div>
    </aside>
  );
}
