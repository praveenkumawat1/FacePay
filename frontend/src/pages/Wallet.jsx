import React, { useState, useEffect, useMemo } from "react";
import AddMoneyModal from "./AddMoneyModal";
import ReferStatsModal from "./ReferStatsModal";
import { saveAs } from "file-saver";
import { generateWalletStatementPDF } from "../services/pdfUtils";
import { sendWalletStatementEmail } from "../services/emailUtils";
import {
  FiCreditCard,
  FiSend,
  FiDownload,
  FiCamera,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiX,
  FiGift,
  FiSmartphone,
  FiShield,
  FiPocket,
  FiTrash2,
  FiChevronRight,
  FiBarChart2,
  FiFileText,
  FiExternalLink,
  FiArrowUpRight,
  FiArrowDownLeft,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../pages/DashboardContext";

// Per-language strings for Wallet page
const WT = {
  English: {
    totalBalance: "Total Balance",
    walletId: "Wallet ID",
    addMoney: "Add Money",
    weeklySpending: "Weekly Spending",
    last7: "Last 7 days activity",
    quickActions: "Quick Actions",
    send: "Send",
    request: "Request",
    withdraw: "Withdraw",
    scanQr: "Scan QR",
    analytics: "Analytics",
    exportCsv: "Export CSV",
    security: "Security",
    recentActivity: "Recent Activity",
    allDays: "All Days",
    today: "Today",
    yesterday: "Yesterday",
    noTxn: "No transactions yet",
    viewAll: "View All",
    linkedAccounts: "Linked Accounts",
    verified: "KYC Verified",
    secure: "Secure",
    verifiedDesc: "Account verified and protected",
    secureDesc: "Complete KYC for full access",
    referEarn: "Refer & Earn",
    referDesc: "Get ₹500 for each friend",
    exportPdf: "Export PDF",
    email: "Email",
    sending: "Sending...",
    all: "All",
    success: "Success",
    failed: "Failed",
    primary: "Primary",
    linkAccount: "Link Account",
    selectType: "Select Account Type",
  },
  Hindi: {
    totalBalance: "कुल बैलेंस",
    walletId: "वॉलेट आईडी",
    addMoney: "पैसे जोड़ें",
    weeklySpending: "साप्ताहिक खर्च",
    last7: "पिछले 7 दिनों की गतिविधि",
    quickActions: "त्वरित क्रियाएं",
    send: "भेजें",
    request: "अनुरोध",
    withdraw: "निकालें",
    scanQr: "QR स्कैन",
    analytics: "विश्लेषण",
    exportCsv: "CSV निर्यात",
    security: "सुरक्षा",
    recentActivity: "हाल की गतिविधि",
    allDays: "सभी दिन",
    today: "आज",
    yesterday: "कल",
    noTxn: "अभी कोई लेनदेन नहीं",
    viewAll: "सभी देखें",
    linkedAccounts: "लिंक खाते",
    verified: "KYC सत्यापित",
    secure: "सुरक्षित",
    verifiedDesc: "खाता सत्यापित और सुरक्षित",
    secureDesc: "पूर्ण पहुंच के लिए KYC पूरा करें",
    referEarn: "रेफर करें और कमाएं",
    referDesc: "हर दोस्त के लिए ₹500 पाएं",
    exportPdf: "PDF निर्यात",
    email: "ईमेल",
    sending: "भेज रहे हैं...",
    all: "सभी",
    success: "सफल",
    failed: "विफल",
    primary: "प्राथमिक",
    linkAccount: "खाता जोड़ें",
    selectType: "खाता प्रकार चुनें",
  },
  Gujarati: {
    totalBalance: "કુલ બેલેન્સ",
    walletId: "વૉલેટ આઈડી",
    addMoney: "પૈસા ઉમેરો",
    weeklySpending: "સાપ્તાહિક ખર્ચ",
    last7: "છેલ્લા 7 દિવસ",
    quickActions: "ઝડપી ક્રિયાઓ",
    send: "મોકલો",
    request: "વિનંતી",
    withdraw: "ઉપાડો",
    scanQr: "QR સ્કૅન",
    analytics: "વિશ્લેષણ",
    exportCsv: "CSV નિકાસ",
    security: "સુરક્ષા",
    recentActivity: "તાજેતરની પ્રવૃત્તિ",
    allDays: "બધા દિવસ",
    today: "આજ",
    yesterday: "ગઈકાલ",
    noTxn: "હજી કોઈ વ્યવહાર નથી",
    viewAll: "બધા જુઓ",
    linkedAccounts: "લિંક ખાતા",
    verified: "KYC ચકાસાયેલ",
    secure: "સુરક્ષિત",
    verifiedDesc: "ખાતું ચકાસાયેલ અને સુરક્ષિત",
    secureDesc: "સંપૂર્ણ ઍક્સેસ માટે KYC",
    referEarn: "રેફર કરો અને કમાઓ",
    referDesc: "દરેક મિત્ર માટે ₹500",
    exportPdf: "PDF નિકાસ",
    email: "ઈમેઈલ",
    sending: "મોકલી રહ્યા...",
    all: "બધા",
    success: "સફળ",
    failed: "નિષ્ફળ",
    primary: "પ્રાથમિક",
    linkAccount: "ખાતું ઉમેરો",
    selectType: "ખાતા પ્રકાર પસંદ કરો",
  },
  Marathi: {
    totalBalance: "एकूण शिल्लक",
    walletId: "वॉलेट आयडी",
    addMoney: "पैसे जोडा",
    weeklySpending: "साप्ताहिक खर्च",
    last7: "गेल्या ७ दिवस",
    quickActions: "जलद क्रिया",
    send: "पाठवा",
    request: "विनंती",
    withdraw: "काढा",
    scanQr: "QR स्कॅन",
    analytics: "विश्लेषण",
    exportCsv: "CSV निर्यात",
    security: "सुरक्षा",
    recentActivity: "अलीकडील क्रिया",
    allDays: "सर्व दिवस",
    today: "आज",
    yesterday: "काल",
    noTxn: "अद्याप व्यवहार नाही",
    viewAll: "सर्व पहा",
    linkedAccounts: "लिंक खाती",
    verified: "KYC सत्यापित",
    secure: "सुरक्षित",
    verifiedDesc: "खाते सत्यापित",
    secureDesc: "KYC पूर्ण करा",
    referEarn: "रेफर करा आणि कमवा",
    referDesc: "प्रत्येक मित्रासाठी ₹500",
    exportPdf: "PDF निर्यात",
    email: "ईमेल",
    sending: "पाठवत...",
    all: "सर्व",
    success: "यशस्वी",
    failed: "अयशस्वी",
    primary: "प्राथमिक",
    linkAccount: "खाते जोडा",
    selectType: "खाते प्रकार निवडा",
  },
  Tamil: {
    totalBalance: "மொத்த இருப்பு",
    walletId: "வாலட் ஐடி",
    addMoney: "பணம் சேர்",
    weeklySpending: "வாராந்திர செலவு",
    last7: "கடந்த 7 நாட்கள்",
    quickActions: "விரைவு செயல்கள்",
    send: "அனுப்பு",
    request: "கோரு",
    withdraw: "எடு",
    scanQr: "QR ஸ்கேன்",
    analytics: "பகுப்பாய்வு",
    exportCsv: "CSV",
    security: "பாதுகாப்பு",
    recentActivity: "சமீபத்திய செயல்பாடு",
    allDays: "அனைத்து நாட்கள்",
    today: "இன்று",
    yesterday: "நேற்று",
    noTxn: "பரிவர்த்தனை இல்லை",
    viewAll: "அனைத்தும் காண்க",
    linkedAccounts: "கணக்குகள்",
    verified: "KYC சரிபார்க்கப்பட்டது",
    secure: "பாதுகாப்பான",
    verifiedDesc: "கணக்கு சரிபார்க்கப்பட்டது",
    secureDesc: "KYC பூர்த்தி செய்யவும்",
    referEarn: "பரிந்துரை செய்து சம்பாதி",
    referDesc: "₹500 சம்பாதிக்கவும்",
    exportPdf: "PDF",
    email: "மின்னஞ்சல்",
    sending: "அனுப்புகிறோம்...",
    all: "அனைத்தும்",
    success: "வெற்றி",
    failed: "தோல்வி",
    primary: "முதன்மை",
    linkAccount: "கணக்கு இணை",
    selectType: "கணக்கு வகை தேர்வு",
  },
  Telugu: {
    totalBalance: "మొత్తం బ్యాలెన్స్",
    walletId: "వాలెట్ ఐడి",
    addMoney: "డబ్బు జోడించు",
    weeklySpending: "వారపు ఖర్చు",
    last7: "గత 7 రోజులు",
    quickActions: "త్వరిత చర్యలు",
    send: "పంపు",
    request: "అభ్యర్థన",
    withdraw: "తీసుకో",
    scanQr: "QR స్కాన్",
    analytics: "విశ్లేషణ",
    exportCsv: "CSV",
    security: "భద్రత",
    recentActivity: "ఇటీవలి కార్యకలాపం",
    allDays: "అన్ని రోజులు",
    today: "నేడు",
    yesterday: "నిన్న",
    noTxn: "లావాదేవీలు లేవు",
    viewAll: "అన్నీ చూడు",
    linkedAccounts: "లింక్ ఖాతాలు",
    verified: "KYC ధృవీకరించబడింది",
    secure: "భద్రమైన",
    verifiedDesc: "ఖాతా ధృవీకరించబడింది",
    secureDesc: "KYC పూర్తి చేయండి",
    referEarn: "రెఫర్ చేసి సంపాదించు",
    referDesc: "ప్రతి స్నేహితుడికి ₹500",
    exportPdf: "PDF",
    email: "ఇమెయిల్",
    sending: "పంపుతున్నాం...",
    all: "అన్నీ",
    success: "విజయం",
    failed: "విఫలం",
    primary: "ప్రాథమిక",
    linkAccount: "ఖాతా జోడించు",
    selectType: "ఖాతా రకం ఎంచుకో",
  },
};

// Analytics Modal
function AnalyticsModal({ open, onClose, transactions, dm }) {
  if (!open) return null;
  const totalSpent = transactions
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalReceived = transactions
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCounts = Array(7).fill(0);
  transactions.forEach((t) => {
    dayCounts[new Date(t.created_at).getDay()]++;
  });
  const mostActiveDay = days[dayCounts.indexOf(Math.max(...dayCounts))];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`rounded-3xl shadow-2xl p-8 w-full max-w-md border relative ${dm ? "bg-slate-900 border-slate-700" : "bg-white border-slate-100"}`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition"
        >
          <FiX size={20} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <FiBarChart2 className="text-indigo-600" />
          </div>
          <h2
            className={`text-xl font-bold ${dm ? "text-white" : "text-slate-900"}`}
          >
            Wallet Analytics
          </h2>
        </div>
        <div className="space-y-4">
          {[
            {
              label: "Total Spent",
              value: `₹${totalSpent.toLocaleString("en-IN")}`,
              color: "text-red-500",
            },
            {
              label: "Total Received",
              value: `₹${totalReceived.toLocaleString("en-IN")}`,
              color: "text-green-500",
            },
            {
              label: "Most Active Day",
              value: mostActiveDay,
              color: "text-indigo-500",
            },
            {
              label: "Total Transactions",
              value: transactions.length,
              color: dm ? "text-slate-200" : "text-slate-800",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex justify-between items-center p-3 rounded-xl ${dm ? "bg-slate-800" : "bg-slate-50"}`}
            >
              <span
                className={`text-sm ${dm ? "text-slate-400" : "text-slate-500"}`}
              >
                {item.label}
              </span>
              <span className={`font-bold ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Export CSV helper
function exportTransactionsCSV(transactions) {
  if (!transactions.length) return;
  const header = "Date,Type,Amount,Status,Description";
  const rows = transactions.map((t) =>
    [
      new Date(t.created_at).toLocaleString(),
      t.type,
      t.amount,
      t.status,
      t.description?.replace(/,/g, " ") || "",
    ].join(","),
  );
  saveAs(
    new Blob([[header, ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    }),
    "wallet_transactions.csv",
  );
}

// Reusable Input
const DInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
  dm,
}) => (
  <div>
    <label
      className={`block text-sm font-semibold mb-1.5 ${dm ? "text-slate-300" : "text-slate-700"}`}
    >
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm ${dm ? "bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"}`}
    />
  </div>
);

// Add Account Modal
function AddAccountModal({ open, onClose, onAdd, dm, lang }) {
  const wt = WT[lang] || WT.English;
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState("");
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
    cardNumber: "",
    cardExpiry: "",
    cvv: "",
    nickname: "",
  });
  const accountTypes = [
    {
      type: "bank",
      icon: FiCreditCard,
      title: "Bank Account",
      desc: "Link savings/current account",
    },
    {
      type: "upi",
      icon: FiSmartphone,
      title: "UPI ID",
      desc: "Add UPI for quick payments",
    },
    {
      type: "card",
      icon: FiCreditCard,
      title: "Card",
      desc: "Add debit/credit card",
    },
  ];
  const reset = () => {
    setStep(1);
    setAccountType("");
    setFormData({
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
      cardNumber: "",
      cardExpiry: "",
      cvv: "",
      nickname: "",
    });
  };
  const handleSubmit = () => {
    let valid = false;
    if (accountType === "bank")
      valid =
        formData.bankName.trim().length >= 3 &&
        /^\d{9,}$/.test(formData.accountNumber) &&
        /^[A-Z]{4}0[A-Z0-9]{6,7}$/.test(formData.ifscCode);
    if (accountType === "upi")
      valid = /^[\w.-]+@[\w.-]+$/.test(formData.upiId.trim());
    if (accountType === "card")
      valid =
        /^\d{16}$/.test(formData.cardNumber.replace(/\s/g, "")) &&
        /^\d{2}\/\d{2}$/.test(formData.cardExpiry) &&
        /^\d{3}$/.test(formData.cvv);
    if (!valid) {
      toast.error("Please fill valid details");
      return;
    }
    onAdd({ type: accountType, ...formData });
    toast.success("Account linked!");
    reset();
    onClose();
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border relative ${dm ? "bg-slate-900 border-slate-700" : "bg-white border-slate-100"}`}
          >
            <button
              onClick={() => {
                reset();
                onClose();
              }}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-red-500 z-10 rounded-full"
            >
              <FiX size={20} />
            </button>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold">{wt.linkAccount}</h2>
              <p className="text-sm text-indigo-200 mt-1">Step {step} of 2</p>
            </div>
            <div className="p-6">
              {step === 1 ? (
                <div className="space-y-3">
                  <p
                    className={`text-sm font-semibold mb-4 ${dm ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {wt.selectType}
                  </p>
                  {accountTypes.map((t) => (
                    <motion.button
                      key={t.type}
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        setAccountType(t.type);
                        setStep(2);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${dm ? "border-slate-700 hover:border-indigo-500 hover:bg-indigo-900/20" : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50"}`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${dm ? "bg-indigo-900" : "bg-indigo-100"}`}
                      >
                        <t.icon size={18} className="text-indigo-500" />
                      </div>
                      <div className="flex-1 text-left">
                        <p
                          className={`font-semibold text-sm ${dm ? "text-slate-200" : "text-slate-800"}`}
                        >
                          {t.title}
                        </p>
                        <p
                          className={`text-xs ${dm ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {t.desc}
                        </p>
                      </div>
                      <FiChevronRight className="text-slate-400" />
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setStep(1);
                      setAccountType("");
                    }}
                    className="text-sm text-indigo-500 hover:text-indigo-700 flex items-center gap-1 mb-2"
                  >
                    ← Back
                  </button>
                  {accountType === "bank" && (
                    <>
                      <DInput
                        dm={dm}
                        label="Bank Name"
                        value={formData.bankName}
                        onChange={(v) =>
                          setFormData({ ...formData, bankName: v })
                        }
                        placeholder="e.g. HDFC Bank"
                      />
                      <DInput
                        dm={dm}
                        label="Account Number"
                        type="tel"
                        value={formData.accountNumber}
                        onChange={(v) =>
                          setFormData({
                            ...formData,
                            accountNumber: v.replace(/\D/g, ""),
                          })
                        }
                        placeholder="Enter account number"
                      />
                      <DInput
                        dm={dm}
                        label="IFSC Code"
                        value={formData.ifscCode}
                        onChange={(v) =>
                          setFormData({
                            ...formData,
                            ifscCode: v.toUpperCase(),
                          })
                        }
                        placeholder="HDFC0001234"
                        maxLength={11}
                      />
                    </>
                  )}
                  {accountType === "upi" && (
                    <DInput
                      dm={dm}
                      label="UPI ID"
                      value={formData.upiId}
                      onChange={(v) => setFormData({ ...formData, upiId: v })}
                      placeholder="yourname@paytm"
                    />
                  )}
                  {accountType === "card" && (
                    <>
                      <DInput
                        dm={dm}
                        label="Card Number"
                        type="tel"
                        value={formData.cardNumber}
                        onChange={(v) =>
                          setFormData({
                            ...formData,
                            cardNumber: v
                              .replace(/\D/g, "")
                              .replace(/(.{4})/g, "$1 ")
                              .trim(),
                          })
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <DInput
                          dm={dm}
                          label="Expiry"
                          type="tel"
                          value={formData.cardExpiry}
                          onChange={(v) =>
                            setFormData({
                              ...formData,
                              cardExpiry: v
                                .replace(/\D/g, "")
                                .slice(0, 4)
                                .replace(/(\d{2})(\d{0,2})/, "$1/$2"),
                            })
                          }
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                        <DInput
                          dm={dm}
                          label="CVV"
                          type="password"
                          value={formData.cvv}
                          onChange={(v) =>
                            setFormData({
                              ...formData,
                              cvv: v.replace(/\D/g, "").slice(0, 3),
                            })
                          }
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                    </>
                  )}
                  <DInput
                    dm={dm}
                    label="Nickname (Optional)"
                    value={formData.nickname}
                    onChange={(v) => setFormData({ ...formData, nickname: v })}
                    placeholder="e.g. Salary Account"
                  />
                  <button
                    onClick={handleSubmit}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition shadow-md"
                  >
                    {wt.linkAccount}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Action Button
function ActionButton({ icon, label, onClick, dm }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-4 rounded-2xl w-full transition-all duration-200 border ${dm ? "bg-slate-800/60 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/40"}`}
      style={{ boxShadow: dm ? "none" : "0 2px 12px rgba(0,0,0,0.04)" }}
    >
      <div
        className={`p-2.5 rounded-xl mb-2 transition-all duration-200 ${dm ? "bg-indigo-900/60 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"}`}
      >
        <span className="text-lg">{icon}</span>
      </div>
      <span
        className={`text-[11px] font-bold tracking-wide uppercase ${dm ? "text-slate-400" : "text-slate-500"}`}
      >
        {label}
      </span>
    </motion.button>
  );
}

// Skeleton
function SkeletonLoader({ dm }) {
  return (
    <div
      className={`min-h-screen p-8 ${dm ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20"}`}
    >
      <div className="max-w-7xl mx-auto animate-pulse space-y-6">
        <div
          className={`h-52 rounded-3xl ${dm ? "bg-slate-800" : "bg-slate-200"}`}
        />
        <div
          className={`h-44 rounded-3xl ${dm ? "bg-slate-800" : "bg-white"}`}
        />
        <div
          className={`h-24 rounded-2xl ${dm ? "bg-slate-800" : "bg-white"}`}
        />
      </div>
    </div>
  );
}

// ─── MAIN WALLET COMPONENT ────────────────────────────────────────────────────
export default function Wallet() {
  const navigate = useNavigate();
  const {
    darkMode: dm,
    language,
    formatCurrency,
    currencySymbol,
  } = useDashboard();
  const wt = WT[language] || WT.English;

  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(0);
  const [wallet, setWallet] = useState(null);
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filterDay, setFilterDay] = useState("all");
  const [emailLoading, setEmailLoading] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [rewardCode, setRewardCode] = useState(null);
  const [rewardExpiry, setRewardExpiry] = useState(null);
  const [rewardCountdown, setRewardCountdown] = useState("");
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showReferStats, setShowReferStats] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [weeklySpending, setWeeklySpending] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    fetchWalletData();
    updateRewardCode();
    const iv = setInterval(() => {
      fetchWalletData();
      updateRewardCode();
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!rewardExpiry) return;
    const iv = setInterval(() => {
      const diff = rewardExpiry - Date.now();
      if (diff <= 0) {
        setRewardCountdown("Expired");
        setRewardCode(null);
        localStorage.removeItem("facepay_reward_code");
        localStorage.removeItem("facepay_reward_expiry");
        clearInterval(iv);
      } else {
        const h = Math.floor(diff / 3600000),
          m = Math.floor((diff % 3600000) / 60000),
          s = Math.floor((diff % 60000) / 1000);
        setRewardCountdown(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [rewardExpiry]);

  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setShowSkeleton(true), 400);
      return () => clearTimeout(t);
    }
    setShowSkeleton(false);
  }, [loading]);

  const updateRewardCode = () => {
    let code = localStorage.getItem("facepay_reward_code");
    let expiry = localStorage.getItem("facepay_reward_expiry");
    if (!code || !expiry || Date.now() > Number(expiry)) {
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      expiry = Date.now() + 86400000;
      localStorage.setItem("facepay_reward_code", code);
      localStorage.setItem("facepay_reward_expiry", expiry);
    }
    setRewardCode(code);
    setRewardExpiry(Number(expiry));
  };

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("facepay_token");
      if (!token) {
        navigate("/login");
        return;
      }
      const dashRes = await fetch("http://localhost:5000/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dashData = await dashRes.json();
      if (dashData.success) {
        setProfile(dashData.user);
        setWallet(dashData.wallet);
        setBalance(dashData.wallet.balance || 0);
        setLinkedAccounts([
          {
            type: "wallet",
            name: "FacePay Wallet",
            key: dashData.wallet.wallet_key,
            isPrimary: true,
          },
        ]);
      }
      const txnRes = await fetch(
        "http://localhost:5000/api/wallet/transactions",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const txnData = await txnRes.json();
      if (txnData.success) {
        setTransactions(txnData.transactions || []);
        calcWeekly(txnData.transactions || []);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const calcWeekly = (txns) => {
    const w = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    txns.forEach((t) => {
      const d = Math.floor((today - new Date(t.created_at)) / 86400000);
      if (d < 7 && t.type === "debit") w[6 - d] += Math.abs(t.amount);
    });
    const mx = Math.max(...w, 1);
    setWeeklySpending(w.map((v) => (v / mx) * 100));
  };

  const filteredTxns = useMemo(() => {
    let txns =
      statusFilter === "all"
        ? transactions
        : transactions.filter((t) => t.status === statusFilter);
    if (filterDay !== "all")
      txns = txns.filter(
        (t) =>
          Math.floor((new Date() - new Date(t.created_at)) / 86400000) ===
          Number(filterDay),
      );
    return txns;
  }, [transactions, statusFilter, filterDay]);

  const handleMoneyAdded = (amount) => {
    setBalance((p) => p + amount);
    fetchWalletData();
  };
  const handleAccountAdded = (acc) => setLinkedAccounts((p) => [...p, acc]);
  const handleRemoveAccount = (idx) => {
    if (linkedAccounts[idx].isPrimary) {
      toast.error("Cannot remove primary wallet");
      return;
    }
    setLinkedAccounts((p) => p.filter((_, i) => i !== idx));
    toast.success("Account removed");
  };

  const getAccountIcon = (type) => {
    const map = {
      wallet: <FiCreditCard className="text-indigo-500" />,
      bank: <FiCreditCard className="text-blue-500" />,
      upi: <FiSmartphone className="text-purple-500" />,
      card: <FiCreditCard className="text-orange-500" />,
    };
    return map[type] || <FiCreditCard className="text-slate-500" />;
  };

  if (showSkeleton) return <SkeletonLoader dm={dm} />;

  // Theming shortcuts
  const bg = dm
    ? "bg-slate-950"
    : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20";
  const card = dm
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-100";
  const textPri = dm ? "text-slate-100" : "text-slate-900";
  const textSec = dm ? "text-slate-400" : "text-slate-500";
  const divider = dm ? "divide-slate-800" : "divide-slate-100";
  const inputBg = dm
    ? "bg-slate-800 border-slate-700 text-slate-200"
    : "bg-slate-50 border-slate-200 text-slate-700";
  const filterBtn = (active) =>
    active
      ? dm
        ? "bg-indigo-600 text-white"
        : "bg-white text-indigo-600 shadow"
      : dm
        ? "text-slate-400 hover:text-slate-200"
        : "text-slate-500 hover:text-slate-700";

  const dayOptions = [
    { v: "all", label: wt.allDays },
    { v: "0", label: wt.today },
    { v: "1", label: wt.yesterday },
    ...["2", "3", "4", "5", "6"].map((n) => ({ v: n, label: `${n} days ago` })),
  ];

  return (
    <div
      className={`min-h-screen ${bg} p-6 md:p-8 transition-colors duration-300`}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: dm
            ? {
                background: "#1e293b",
                color: "#e2e8f0",
                border: "1px solid #334155",
              }
            : {},
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* WALLET HERO CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl overflow-hidden shadow-xl"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10 p-7 md:p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-2">
                      {wt.totalBalance}
                    </p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        {showBalance ? formatCurrency(balance) : "••••••"}
                      </h2>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition text-white"
                      >
                        {showBalance ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                    <FiShield size={13} className="text-green-400" />
                    <span className="text-xs font-semibold text-white">
                      {profile?.kyc_verified ? wt.verified : wt.secure}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-indigo-300 text-sm font-mono">
                    {wt.walletId}: {wallet?.wallet_key || "W-XXXX"}
                  </p>
                  <button
                    onClick={() => setShowAddMoney(true)}
                    className="flex items-center gap-2 bg-white text-indigo-900 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-indigo-50 transition"
                  >
                    <FiPlus /> {wt.addMoney}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* WEEKLY SPENDING CHART */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-3xl p-7 border shadow-sm ${card}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-base font-bold ${textPri}`}>
                    {wt.weeklySpending}
                  </h3>
                  <p className={`text-xs mt-0.5 ${textSec}`}>{wt.last7}</p>
                </div>
                <div
                  className={`p-2.5 rounded-xl ${dm ? "bg-indigo-900/50" : "bg-indigo-50"}`}
                >
                  <FiBarChart2 className="text-indigo-500" />
                </div>
              </div>
              <div className="flex items-end gap-2 h-28">
                {weeklySpending.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col justify-end group cursor-pointer"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(h, 4)}%` }}
                      transition={{
                        delay: i * 0.07,
                        type: "spring",
                        stiffness: 100,
                      }}
                      className="rounded-t-lg transition-all"
                      style={{
                        background:
                          h > 60
                            ? "linear-gradient(to top, #4f46e5, #7c3aed)"
                            : h > 30
                              ? "linear-gradient(to top, #6366f1, #818cf8)"
                              : dm
                                ? "#1e293b"
                                : "#e0e7ff",
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2.5 text-[11px] font-medium">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className={textSec}>
                    {d}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* QUICK ACTIONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`rounded-3xl p-7 border shadow-sm ${card}`}
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-widest mb-4 ${textSec}`}
              >
                {wt.quickActions}
              </p>
              <div className="grid grid-cols-4 gap-3 mb-5">
                <ActionButton
                  dm={dm}
                  icon={<FiSend />}
                  label={wt.send}
                  onClick={() => navigate("/dashboard/send-money")}
                />
                <ActionButton
                  dm={dm}
                  icon={<FiPocket />}
                  label={wt.request}
                  onClick={() => toast("Coming soon")}
                />
                <ActionButton
                  dm={dm}
                  icon={<FiDownload />}
                  label={wt.withdraw}
                  onClick={() => toast("Coming soon")}
                />
                <ActionButton
                  dm={dm}
                  icon={<FiCamera />}
                  label={wt.scanQr}
                  onClick={() => toast("Coming soon")}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: wt.analytics,
                    icon: <FiBarChart2 size={14} />,
                    color: "indigo",
                    onClick: () => setShowAnalytics(true),
                  },
                  {
                    label: wt.exportCsv,
                    icon: <FiDownload size={14} />,
                    color: "emerald",
                    onClick: () => exportTransactionsCSV(transactions),
                  },
                  {
                    label: wt.security,
                    icon: <FiShield size={14} />,
                    color: "violet",
                    onClick: () => navigate("/dashboard/security"),
                  },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.onClick}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      dm
                        ? `bg-${btn.color}-900/40 text-${btn.color}-400 hover:bg-${btn.color}-900/60`
                        : `bg-${btn.color}-50 text-${btn.color}-700 hover:bg-${btn.color}-100`
                    }`}
                  >
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* TRANSACTIONS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-3xl border shadow-sm overflow-hidden ${card}`}
            >
              {/* Header */}
              <div
                className={`p-6 border-b ${dm ? "border-slate-800" : "border-slate-100"}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-base font-bold ${textPri}`}>
                      {wt.recentActivity}
                    </h3>
                    <select
                      value={filterDay}
                      onChange={(e) => setFilterDay(e.target.value)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none ${inputBg}`}
                    >
                      {dayOptions.map((o) => (
                        <option key={o.v} value={o.v}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      className={`flex p-1 rounded-xl ${dm ? "bg-slate-800" : "bg-slate-100"}`}
                    >
                      {["all", "success", "failed"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setStatusFilter(f)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${filterBtn(statusFilter === f)}`}
                        >
                          {wt[f] || f}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        generateWalletStatementPDF(
                          filteredTxns,
                          profile,
                          filterDay === "all"
                            ? "All Time"
                            : `${filterDay} day(s) ago`,
                        )
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                      {wt.exportPdf}
                    </button>
                    <button
                      disabled={emailLoading}
                      onClick={async () => {
                        setEmailLoading(true);
                        const res = await sendWalletStatementEmail(
                          profile?.email,
                          filteredTxns,
                          profile,
                          filterDay === "all"
                            ? "All Time"
                            : `${filterDay} day(s) ago`,
                        );
                        setEmailLoading(false);
                        res.success
                          ? toast.success("Statement sent!")
                          : toast.error(res.message || "Failed");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${dm ? "bg-emerald-700 hover:bg-emerald-600 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"} disabled:opacity-50`}
                    >
                      {emailLoading ? wt.sending : wt.email}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction list */}
              <div className={`divide-y ${divider}`}>
                {filteredTxns.length > 0 ? (
                  filteredTxns.slice(0, 6).map((txn, idx) => (
                    <motion.div
                      key={txn._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`flex items-center justify-between px-6 py-4 transition cursor-pointer ${dm ? "hover:bg-slate-800/50" : "hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${txn.type === "credit" ? (dm ? "bg-green-900/50" : "bg-green-50") : dm ? "bg-red-900/50" : "bg-red-50"}`}
                        >
                          {txn.type === "credit" ? (
                            <FiArrowDownLeft className="text-green-500" />
                          ) : (
                            <FiArrowUpRight className="text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${textPri}`}>
                            {txn.description || txn.type}
                          </p>
                          <p className={`text-xs mt-0.5 ${textSec}`}>
                            {new Date(txn.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-sm ${txn.type === "credit" ? "text-green-500" : textPri}`}
                        >
                          {txn.type === "credit" ? "+" : "-"}
                          {formatCurrency(Math.abs(txn.amount))}
                        </p>
                        <p
                          className={`text-[10px] font-bold uppercase mt-0.5 ${txn.status === "success" ? "text-green-500" : "text-red-500"}`}
                        >
                          {txn.status}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-14 text-center">
                    <FiFileText
                      size={36}
                      className={`mx-auto mb-3 ${dm ? "text-slate-700" : "text-slate-300"}`}
                    />
                    <p className={`text-sm ${textSec}`}>{wt.noTxn}</p>
                  </div>
                )}
              </div>
              {transactions.length > 0 && (
                <button
                  className={`w-full py-3.5 text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition border-t ${dm ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50"}`}
                >
                  {wt.viewAll}
                </button>
              )}
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">
            {/* LINKED ACCOUNTS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-3xl p-6 border shadow-sm ${card}`}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className={`font-bold text-base ${textPri}`}>
                  {wt.linkedAccounts}
                </h3>
                <button
                  onClick={() => setShowAddAccount(true)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${dm ? "bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                >
                  <FiPlus size={16} />
                </button>
              </div>
              <div className="space-y-2.5">
                {linkedAccounts.map((acc, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border ${dm ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${dm ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"}`}
                    >
                      {getAccountIcon(acc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm truncate ${textPri}`}
                      >
                        {acc.name || acc.nickname || "Account"}
                      </p>
                      <p className={`text-xs font-mono ${textSec}`}>
                        {acc.key || "****"}
                      </p>
                    </div>
                    {acc.isPrimary ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                        {wt.primary}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRemoveAccount(idx)}
                        className={`p-1.5 rounded-lg transition ${dm ? "hover:bg-red-900/40" : "hover:bg-red-50"}`}
                      >
                        <FiTrash2 size={13} className="text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* SECURITY STATUS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.07 }}
              className={`rounded-3xl p-6 border ${dm ? "bg-emerald-900/20 border-emerald-800/40" : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100"}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <FiShield size={20} />
                </div>
                <div>
                  <p
                    className={`font-bold text-sm ${dm ? "text-emerald-400" : "text-emerald-800"}`}
                  >
                    {profile?.kyc_verified ? wt.verified : wt.secure}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${dm ? "text-emerald-600" : "text-emerald-700"}`}
                  >
                    {profile?.kyc_verified ? wt.verifiedDesc : wt.secureDesc}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* REFER & EARN */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              onClick={() => setShowReferStats(true)}
              className="rounded-3xl p-6 text-white cursor-pointer hover:scale-[1.02] transition-transform"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                boxShadow: "0 8px 32px rgba(79,70,229,0.35)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <FiGift size={20} />
                </div>
                <FiExternalLink size={16} className="opacity-60" />
              </div>
              <h3 className="text-lg font-bold mb-1">{wt.referEarn}</h3>
              {rewardCode ? (
                <>
                  <p className="text-sm text-purple-200 mb-1">
                    Code:{" "}
                    <span className="font-mono font-bold text-white bg-white/15 px-2 py-0.5 rounded-lg">
                      {rewardCode}
                    </span>
                  </p>
                  <p className="text-xs text-purple-300">{rewardCountdown}</p>
                </>
              ) : (
                <p className="text-sm text-purple-200">{wt.referDesc}</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AddMoneyModal
        open={showAddMoney}
        onClose={() => setShowAddMoney(false)}
        onAdd={handleMoneyAdded}
      />
      <AddAccountModal
        open={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        onAdd={handleAccountAdded}
        dm={dm}
        lang={language}
      />
      <AnalyticsModal
        open={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        transactions={transactions}
        dm={dm}
      />
      <ReferStatsModal
        open={showReferStats}
        onClose={() => setShowReferStats(false)}
        code={rewardCode}
      />
    </div>
  );
}
