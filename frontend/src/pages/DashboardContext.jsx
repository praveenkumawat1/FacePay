import { createContext, useContext, useState, useEffect } from "react";

// ─── TRANSLATIONS ───────────────────────────────────────────────────────────
export const TRANSLATIONS = {
  English: {
    hello: "Hello",
    totalBalance: "Total Balance",
    walletId: "WALLET ID",
    addMoney: "Add Money",
    quickActions: "Quick Actions",
    send: "Send",
    request: "Request",
    withdraw: "Withdraw",
    scanQr: "Scan QR",
    recentActivity: "Recent Activity",
    viewAllHistory: "View All History",
    rewards: "Rewards",
    checkOffers: "Check exclusive offers",
    askAi: "Ask AI",
    analyzeSpending: "Analyze your spending",
    verified: "Verified",
    unverified: "Unverified",
    search: "Search...",
    all: "All",
    income: "Income",
    expense: "Expense",
    noTransactions: "No transactions yet. Add money to get started!",
    noFilter: "No transactions found for this filter.",
    loadingDashboard: "Loading dashboard...",
    logout: "Logout",
    viewProfile: "View Profile",
    dashboardSettings: "Dashboard Settings",
    settings: "Quick Settings",
    darkMode: "Dark Mode",
    notifications: "Notifications",
    language: "Language",
    currency: "Currency",
    saveSettings: "Save Settings",
    saved: "Saved!",
    on: "On",
    off: "Off",
    enabled: "Enabled",
    disabled: "Disabled",
  },
  Hindi: {
    hello: "नमस्ते",
    totalBalance: "कुल शेष राशि",
    walletId: "वॉलेट आईडी",
    addMoney: "पैसे जोड़ें",
    quickActions: "त्वरित क्रियाएं",
    send: "भेजें",
    request: "अनुरोध",
    withdraw: "निकालें",
    scanQr: "QR स्कैन",
    recentActivity: "हाल की गतिविधि",
    viewAllHistory: "सभी इतिहास देखें",
    rewards: "पुरस्कार",
    checkOffers: "विशेष ऑफर देखें",
    askAi: "AI से पूछें",
    analyzeSpending: "खर्च का विश्लेषण करें",
    verified: "सत्यापित",
    unverified: "असत्यापित",
    search: "खोजें...",
    all: "सभी",
    income: "आय",
    expense: "व्यय",
    noTransactions: "अभी तक कोई लेनदेन नहीं। शुरू करने के लिए पैसे जोड़ें!",
    noFilter: "इस फ़िल्टर के लिए कोई लेनदेन नहीं मिला।",
    loadingDashboard: "डैशबोर्ड लोड हो रहा है...",
    logout: "लॉग आउट",
    viewProfile: "प्रोफ़ाइल देखें",
    dashboardSettings: "डैशबोर्ड सेटिंग्स",
    settings: "त्वरित सेटिंग्स",
    darkMode: "डार्क मोड",
    notifications: "सूचनाएं",
    language: "भाषा",
    currency: "मुद्रा",
    saveSettings: "सेटिंग्स सहेजें",
    saved: "सहेजा गया!",
    on: "चालू",
    off: "बंद",
    enabled: "सक्षम",
    disabled: "अक्षम",
  },
  Gujarati: {
    hello: "નમસ્તે",
    totalBalance: "કુલ બેલેન્સ",
    walletId: "વૉલેટ આઈડી",
    addMoney: "પૈસા ઉમેરો",
    quickActions: "ઝડપી ક્રિયાઓ",
    send: "મોકલો",
    request: "વિનંતી",
    withdraw: "ઉપાડો",
    scanQr: "QR સ્કૅન",
    recentActivity: "તાજેતરની પ્રવૃત્તિ",
    viewAllHistory: "સંપૂર્ણ ઇતિહાસ જુઓ",
    rewards: "ઇનામ",
    checkOffers: "વિશેષ ઓફર જુઓ",
    askAi: "AI ને પૂછો",
    analyzeSpending: "ખર્ચનું વિશ્લેષણ",
    verified: "ચકાસાયેલ",
    unverified: "અચકાસાયેલ",
    search: "શોધો...",
    all: "બધા",
    income: "આવક",
    expense: "ખર્ચ",
    noTransactions: "હજી કોઈ વ્યવહાર નથી. શરૂ કરવા પૈસા ઉમેરો!",
    noFilter: "આ ફિલ્ટર માટે કોઈ વ્યવહાર મળ્યો નથી.",
    loadingDashboard: "ડૅશબોર્ડ લોડ થઈ રહ્યું છે...",
    logout: "લૉગ આઉટ",
    viewProfile: "પ્રોફાઇલ જુઓ",
    dashboardSettings: "ડૅશબોર્ડ સેટિંગ્સ",
    settings: "ઝડપી સેટિંગ્સ",
    darkMode: "ડાર્ક મોડ",
    notifications: "સૂચનાઓ",
    language: "ભાષા",
    currency: "ચલણ",
    saveSettings: "સેટિંગ્સ સાચવો",
    saved: "સાચવ્યું!",
    on: "ચાલુ",
    off: "બંધ",
    enabled: "સક્ષમ",
    disabled: "અક્ષમ",
  },
  Marathi: {
    hello: "नमस्कार",
    totalBalance: "एकूण शिल्लक",
    walletId: "वॉलेट आयडी",
    addMoney: "पैसे जोडा",
    quickActions: "जलद क्रिया",
    send: "पाठवा",
    request: "विनंती",
    withdraw: "काढा",
    scanQr: "QR स्कॅन",
    recentActivity: "अलीकडील क्रियाकलाप",
    viewAllHistory: "सर्व इतिहास पहा",
    rewards: "बक्षिसे",
    checkOffers: "विशेष ऑफर पहा",
    askAi: "AI ला विचारा",
    analyzeSpending: "खर्चाचे विश्लेषण",
    verified: "सत्यापित",
    unverified: "असत्यापित",
    search: "शोधा...",
    all: "सर्व",
    income: "उत्पन्न",
    expense: "खर्च",
    noTransactions: "अद्याप कोणताही व्यवहार नाही. सुरू करण्यासाठी पैसे जोडा!",
    noFilter: "या फिल्टरसाठी कोणताही व्यवहार आढळला नाही.",
    loadingDashboard: "डॅशबोर्ड लोड होत आहे...",
    logout: "लॉग आउट",
    viewProfile: "प्रोफाइल पहा",
    dashboardSettings: "डॅशबोर्ड सेटिंग्ज",
    settings: "जलद सेटिंग्ज",
    darkMode: "डार्क मोड",
    notifications: "सूचना",
    language: "भाषा",
    currency: "चलन",
    saveSettings: "सेटिंग्ज जतन करा",
    saved: "जतन केले!",
    on: "चालू",
    off: "बंद",
    enabled: "सक्षम",
    disabled: "अक्षम",
  },
  Tamil: {
    hello: "வணக்கம்",
    totalBalance: "மொத்த இருப்பு",
    walletId: "வாலெட் ஐடி",
    addMoney: "பணம் சேர்",
    quickActions: "விரைவு செயல்கள்",
    send: "அனுப்பு",
    request: "கோரு",
    withdraw: "எடு",
    scanQr: "QR ஸ்கேன்",
    recentActivity: "சமீபத்திய செயல்பாடு",
    viewAllHistory: "அனைத்து வரலாறும் காண்க",
    rewards: "வெகுமதிகள்",
    checkOffers: "சிறப்பு சலுகைகளை காண்க",
    askAi: "AI கேள்",
    analyzeSpending: "செலவை பகுப்பாய்வு செய்",
    verified: "சரிபார்க்கப்பட்டது",
    unverified: "சரிபார்க்கப்படவில்லை",
    search: "தேடு...",
    all: "அனைத்தும்",
    income: "வருமானம்",
    expense: "செலவு",
    noTransactions: "இன்னும் பரிவர்த்தனைகள் இல்லை. தொடங்க பணம் சேர்க்கவும்!",
    noFilter: "இந்த வடிகட்டிக்கு பரிவர்த்தனைகள் இல்லை.",
    loadingDashboard: "டாஷ்போர்டு ஏற்றுகிறது...",
    logout: "வெளியேறு",
    viewProfile: "சுயவிவரம் காண்க",
    dashboardSettings: "டாஷ்போர்டு அமைப்புகள்",
    settings: "விரைவு அமைப்புகள்",
    darkMode: "இருண்ட முறை",
    notifications: "அறிவிப்புகள்",
    language: "மொழி",
    currency: "நாணயம்",
    saveSettings: "அமைப்புகளை சேமி",
    saved: "சேமிக்கப்பட்டது!",
    on: "இயக்கு",
    off: "அணை",
    enabled: "இயக்கப்பட்டது",
    disabled: "முடக்கப்பட்டது",
  },
  Telugu: {
    hello: "నమస్కారం",
    totalBalance: "మొత్తం బ్యాలెన్స్",
    walletId: "వాలెట్ ఐడీ",
    addMoney: "డబ్బు జోడించు",
    quickActions: "త్వరిత చర్యలు",
    send: "పంపు",
    request: "అభ్యర్థన",
    withdraw: "తీసుకో",
    scanQr: "QR స్కాన్",
    recentActivity: "ఇటీవలి కార్యకలాపం",
    viewAllHistory: "మొత్తం చరిత్ర చూడు",
    rewards: "బహుమతులు",
    checkOffers: "ప్రత్యేక ఆఫర్లు చూడు",
    askAi: "AI అడుగు",
    analyzeSpending: "ఖర్చు విశ్లేషించు",
    verified: "ధృవీకరించబడింది",
    unverified: "ధృవీకరించబడలేదు",
    search: "వెతుకు...",
    all: "అన్నీ",
    income: "ఆదాయం",
    expense: "ఖర్చు",
    noTransactions: "ఇంకా లావాదేవీలు లేవు. ప్రారంభించడానికి డబ్బు జోడించు!",
    noFilter: "ఈ ఫిల్టర్‌కు లావాదేవీలు కనుగొనబడలేదు.",
    loadingDashboard: "డాష్‌బోర్డ్ లోడ్ అవుతోంది...",
    logout: "లాగ్ అవుట్",
    viewProfile: "ప్రొఫైల్ చూడు",
    dashboardSettings: "డాష్‌బోర్డ్ సెట్టింగ్‌లు",
    settings: "త్వరిత సెట్టింగ్‌లు",
    darkMode: "డార్క్ మోడ్",
    notifications: "నోటిఫికేషన్లు",
    language: "భాష",
    currency: "కరెన్సీ",
    saveSettings: "సెట్టింగ్‌లు సేవ్ చేయి",
    saved: "సేవ్ అయింది!",
    on: "ఆన్",
    off: "ఆఫ్",
    enabled: "ప్రారంభించబడింది",
    disabled: "నిలిపివేయబడింది",
  },
};

// ─── CURRENCY CONFIG ──────────────────────────────────────────────────────────
export const CURRENCY_CONFIG = {
  "INR (₹)": { symbol: "₹", code: "INR", locale: "en-IN" },
  "USD ($)": { symbol: "$", code: "USD", locale: "en-US" },
  "EUR (€)": { symbol: "€", code: "EUR", locale: "de-DE" },
  "GBP (£)": { symbol: "£", code: "GBP", locale: "en-GB" },
};

// ─── CONTEXT ──────────────────────────────────────────────────────────────────
const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(
    () => localStorage.getItem("fp_dark") === "true",
  );
  const [language, setLanguageState] = useState(
    () => localStorage.getItem("fp_lang") || "English",
  );
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem("fp_currency") || "INR (₹)",
  );
  const [notifications, setNotificationsState] = useState(
    () => localStorage.getItem("fp_notif") !== "false",
  );

  // Exchange rates state (base: INR)
  const [exchangeRates, setExchangeRates] = useState({});
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(null);

  // Apply dark mode to <html> element instantly
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Fetch exchange rates from INR to all currencies when needed
  const fetchExchangeRates = async () => {
    setRatesLoading(true);
    setRatesError(null);
    try {
      // Using free API from Frankfurter (no API key required)
      const response = await fetch(
        "https://api.frankfurter.app/latest?from=INR",
      );
      if (!response.ok) throw new Error("Failed to fetch exchange rates");
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (err) {
      setRatesError(err.message);
      console.error("Exchange rate fetch error:", err);
    } finally {
      setRatesLoading(false);
    }
  };

  // Trigger fetch when currency changes to a non-INR currency
  useEffect(() => {
    const currencyCode = CURRENCY_CONFIG[currency]?.code;
    if (currencyCode && currencyCode !== "INR") {
      fetchExchangeRates();
    }
  }, [currency]);

  // Also fetch rates on mount if the initial currency is not INR
  useEffect(() => {
    const currencyCode = CURRENCY_CONFIG[currency]?.code;
    if (currencyCode && currencyCode !== "INR") {
      fetchExchangeRates();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setDarkMode = (val) => {
    setDarkModeState(val);
    localStorage.setItem("fp_dark", val);
  };

  const setLanguage = (val) => {
    setLanguageState(val);
    localStorage.setItem("fp_lang", val);
  };

  const setCurrency = (val) => {
    setCurrencyState(val);
    localStorage.setItem("fp_currency", val);
  };

  const setNotifications = (val) => {
    setNotificationsState(val);
    localStorage.setItem("fp_notif", val);
  };

  // Helper: translate
  const t = (key) =>
    TRANSLATIONS[language]?.[key] || TRANSLATIONS.English[key] || key;

  // Convert an amount from INR to the currently selected currency
  const convertAmount = (amountInINR) => {
    const targetCode = CURRENCY_CONFIG[currency]?.code;
    if (!targetCode || targetCode === "INR") return amountInINR;
    const rate = exchangeRates[targetCode];
    // If rate not available (still loading or error), fallback to original amount
    if (!rate) return amountInINR;
    return amountInINR * rate;
  };

  // Helper: format currency (with real-time conversion)
  const formatCurrency = (amount) => {
    const converted = convertAmount(amount);
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG["INR (₹)"];
    return `${config.symbol}${Math.abs(converted).toLocaleString(config.locale)}`;
  };

  return (
    <DashboardContext.Provider
      value={{
        darkMode,
        setDarkMode,
        language,
        setLanguage,
        currency,
        setCurrency,
        notifications,
        setNotifications,
        t,
        formatCurrency,
        currencySymbol: CURRENCY_CONFIG[currency]?.symbol || "₹",
        // Optional: expose loading/error states if needed (not required by user)
        // ratesLoading,
        // ratesError,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx)
    throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
};
