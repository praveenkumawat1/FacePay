/**
 * DRISHTIPAY DASHBOARD — Complete, No Header, Enhanced Profile & Receipts
 * Real‑time Firebase • Right‑side Navigation • Graphs • Invite Popup
 *
 * INSTALL:
 *   npm install firebase framer-motion react-icons jspdf jspdf-autotable
 *
 * FIREBASE SETUP:
 *   Replace the config below with your own Firebase project credentials.
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FiHome,
  FiPieChart,
  FiStar,
  FiUser,
  FiBell,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiActivity,
  FiAlertCircle,
  FiSearch,
  FiDownload,
  FiPlus,
  FiFile,
  FiEye,
  FiEyeOff,
  FiX,
  FiImage,
  FiFlag,
  FiCheckCircle,
  FiMessageCircle,
  FiSend,
  FiZap,
  FiCalendar,
  FiLoader,
  FiCopy,
  FiWifiOff,
  FiRefreshCw,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiGift,
  FiPercent,
  FiDollarSign,
  FiBarChart2,
  FiShare2,
  FiFacebook,
  FiTwitter,
  FiMail,
  FiLink,
  FiLogOut,
  FiSettings,
  FiChevronRight,
  FiFilter,
  FiSend as FiSendIcon,
} from "react-icons/fi";

// ============================================================
// FIREBASE CONFIG — REPLACE WITH YOUR CREDENTIALS
// ============================================================
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

let db = null;
let firebaseInitialized = false;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  firebaseInitialized = firebaseConfig.apiKey !== "YOUR_API_KEY";
} catch (e) {
  console.warn("Firebase not configured.");
}

// ============================================================
// UTILITIES
// ============================================================
function formatPrettyDate(iso) {
  const dt = new Date(iso);
  const now = new Date();
  const isToday = dt.toDateString() === now.toDateString();
  const isYesterday =
    dt.toDateString() === new Date(now - 864e5).toDateString();
  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name) {
  const colors = [
    ["#6366f1", "#4f46e5"],
    ["#8b5cf6", "#7c3aed"],
    ["#06b6d4", "#0891b2"],
    ["#10b981", "#059669"],
    ["#f59e0b", "#d97706"],
    ["#ef4444", "#dc2626"],
    ["#ec4899", "#db2777"],
    ["#14b8a6", "#0d9488"],
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function copyToClipboard(text, showToast) {
  navigator.clipboard
    .writeText(text)
    .then(() => showToast("Copied!", "success", "📋"));
}

// Professional PDF receipt generator
function generateReceiptPDF(txn) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header with logo and title
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("DRISHTIPAY", 20, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Payment Receipt", pageWidth - 20, 25, { align: "right" });

  // Transaction details card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 50, pageWidth - 40, 35, 3, 3, "F");
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, 50, pageWidth - 40, 35, 3, 3, "S");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`₹${txn.amount.toLocaleString("en-IN")}`, 30, 70);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(txn.type === "sent" ? "Amount Debited" : "Amount Credited", 30, 77);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(txn.status, pageWidth - 30, 70, { align: "right" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Status", pageWidth - 30, 77, { align: "right" });

  // Transaction details table
  const details = [
    ["Transaction ID", txn.id],
    ["Date & Time", `${txn.date} ${txn.time}`],
    ["From / To", txn.name],
    ["UPI ID", txn.upi || "—"],
    ["Note", txn.note || "—"],
    ["Category", txn.category || "—"],
  ];

  let y = 100;
  details.forEach(([label, value]) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(label, 25, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(String(value), 80, y);
    y += 8;
  });

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y + 10, pageWidth - 20, y + 10);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "This is a computer-generated receipt. No signature required.",
    pageWidth / 2,
    y + 20,
    { align: "center" },
  );
  doc.text(
    `Generated on ${new Date().toLocaleString("en-IN")}`,
    pageWidth / 2,
    y + 27,
    { align: "center" },
  );

  doc.save(`${txn.id}_receipt.pdf`);
}

// Statement PDF generator (professional)
function generateStatementPDF(transactions, user, fromMonth, toMonth) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("DRISHTIPAY", 20, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Account Statement", pageWidth - 20, 25, { align: "right" });

  // User info
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 50, pageWidth - 40, 30, 3, 3, "F");
  doc.setDrawColor(99, 102, 241);
  doc.roundedRect(20, 50, pageWidth - 40, 30, 3, 3, "S");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(user.name, 30, 65);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Account: ${user.accountNumber}`, 30, 72);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Period: ${fromMonth} to ${toMonth}`, pageWidth - 30, 65, {
    align: "right",
  });
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    pageWidth - 30,
    72,
    { align: "right" },
  );

  // Transaction table
  const tableData = transactions.map((txn) => [
    txn.date,
    txn.name,
    txn.category || "—",
    txn.type === "sent" ? "Debit" : "Credit",
    `₹${txn.amount.toLocaleString("en-IN")}`,
    txn.status,
  ]);

  autoTable(doc, {
    startY: 90,
    head: [["Date", "Description", "Category", "Type", "Amount", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 25 },
    },
    margin: { left: 20, right: 20 },
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalSent = transactions
    .filter((t) => t.type === "sent" && t.status === "Success")
    .reduce((a, c) => a + c.amount, 0);
  const totalReceived = transactions
    .filter((t) => t.type === "received" && t.status === "Success")
    .reduce((a, c) => a + c.amount, 0);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, finalY, pageWidth - 40, 25, 3, 3, "F");
  doc.setDrawColor(99, 102, 241);
  doc.roundedRect(20, finalY, pageWidth - 40, 25, 3, 3, "S");

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 30, finalY + 8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Total Sent: ₹${totalSent.toLocaleString("en-IN")}`,
    30,
    finalY + 16,
  );
  doc.text(
    `Total Received: ₹${totalReceived.toLocaleString("en-IN")}`,
    pageWidth - 30,
    finalY + 16,
    { align: "right" },
  );

  doc.save(
    `statement_${fromMonth.replace(" ", "_")}_to_${toMonth.replace(" ", "_")}.pdf`,
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function DrishtipayDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [privacy, setPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [expandedInvoice, setExpandedInvoice] = useState("");
  const [disputeTxn, setDisputeTxn] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [chatThread, setChatThread] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [newTxnForm, setNewTxnForm] = useState({
    name: "",
    amount: "",
    type: "sent",
    upi: "",
    note: "",
    status: "Success",
    category: "Other",
  });
  const [addingTxn, setAddingTxn] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [rewardsCopied, setRewardsCopied] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  // User profile data (from Firebase / API)
  const [user, setUser] = useState({
    name: "",
    accountNumber: "",
    upiId: "",
    ifsc: "",
    branch: "",
    balance: 0,
    rewards: 0,
    tier: "",
    phone: "",
    email: "",
    joined: "",
    avatar: "",
  });

  // Offers data
  const [offers, setOffers] = useState([]);

  // Notifications data
  const [notifList, setNotifList] = useState([]);

  // Statement filter in Profile tab
  const [stmtFromMonth, setStmtFromMonth] = useState("");
  const [stmtToMonth, setStmtToMonth] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);

  const chatEndRef = useRef(null);
  const profileRef = useRef(null);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("🟢 Back online", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("🔴 You are offline", "error");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Close profile popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfilePopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (!firebaseInitialized) {
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("userId", "==", "current_user_id")); // Replace with actual user ID
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  // Fetch offers
  useEffect(() => {
    if (!firebaseInitialized) return;
    const fetchOffers = async () => {
      try {
        const offersRef = collection(db, "offers");
        const snapshot = await getDocs(offersRef);
        const offersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOffers(offersData);
      } catch (error) {
        console.error("Error fetching offers:", error);
      }
    };
    fetchOffers();
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!firebaseInitialized) return;
    const fetchNotifs = async () => {
      try {
        const notifsRef = collection(db, "notifications");
        const q = query(
          notifsRef,
          orderBy("createdAt", "desc"),
          where("userId", "==", "current_user_id"),
        );
        const snapshot = await getDocs(q);
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifList(notifs);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifs();
  }, []);

  // Firebase real-time listener for transactions
  useEffect(() => {
    setLoading(true);
    if (firebaseInitialized) {
      const q = query(
        collection(db, "transactions"),
        orderBy("createdAt", "desc"),
      );
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const txns = snapshot.docs.map((doc) => {
            const data = doc.data();
            const ts = data.createdAt?.toDate?.() || new Date();
            return {
              id: doc.id,
              ...data,
              messages: data.messages || [],
              date: ts.toISOString().slice(0, 10),
              time: ts.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
          });
          setTransactions(txns);
          setLoading(false);
          if (snapshot.docChanges().some((c) => c.type === "added")) {
            showToast("🔔 New transaction", "info");
          }
        },
        (err) => {
          console.error("Firestore error:", err);
          setLoading(false);
          showToast("❌ Failed to load transactions", "error");
        },
      );
      return () => unsub();
    } else {
      // If Firebase not configured, set loading false after a short delay (no demo data)
      const t = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatThread]);

  function showToast(message, type = "info", icon = "") {
    setNotification({ message, type, icon });
    setTimeout(() => setNotification(null), 3500);
  }

  // Add Transaction
  async function handleAddTransaction(e) {
    e.preventDefault();
    if (!firebaseInitialized) {
      showToast("Firebase not configured", "error");
      return;
    }
    setAddingTxn(true);
    const txnData = {
      ...newTxnForm,
      amount: parseFloat(newTxnForm.amount),
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      avatar: "",
      messages: [],
      createdAt: serverTimestamp(),
      userId: "current_user_id", // Replace with actual user ID
    };
    try {
      await addDoc(collection(db, "transactions"), txnData);
      showToast("✅ Transaction added", "success");
      setShowAddTxn(false);
      setNewTxnForm({
        name: "",
        amount: "",
        type: "sent",
        upi: "",
        note: "",
        status: "Success",
        category: "Other",
      });
    } catch (error) {
      console.error("Add transaction error:", error);
      showToast("❌ Failed to add", "error");
    }
    setAddingTxn(false);
  }

  // Send Chat
  async function sendChatMsg() {
    if (!chatInput.trim() || !selectedTxn || !firebaseInitialized) return;
    const msg = {
      by: "me",
      text: chatInput.trim(),
      at: new Date().toISOString(),
    };
    const updated = [...chatThread, msg];
    setChatThread(updated);
    setChatInput("");
    try {
      await updateDoc(doc(db, "transactions", selectedTxn.id), {
        messages: updated,
      });
    } catch (error) {
      console.error("Send message error:", error);
    }
    // Simulate auto-reply
    setTimeout(() => {
      setChatThread((t) => [
        ...t,
        {
          by: "them",
          text: "We'll get back to you.",
          at: new Date().toISOString(),
        },
      ]);
    }, 1500);
  }

  // Submit Dispute
  async function submitDispute(e) {
    e.preventDefault();
    if (!firebaseInitialized || !disputeTxn) return;
    try {
      await updateDoc(doc(db, "transactions", disputeTxn.id), {
        dispute: {
          reason: disputeReason,
          submittedAt: serverTimestamp(),
          status: "open",
        },
      });
      setDisputeSuccess(true);
      setTimeout(() => {
        setDisputeTxn(null);
        setDisputeSuccess(false);
      }, 1800);
    } catch (error) {
      console.error("Dispute error:", error);
      showToast("❌ Failed to submit dispute", "error");
    }
  }

  // Filtering
  const filteredData = useMemo(() => {
    return transactions
      .filter((txn) => {
        const matchSearch =
          txn.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.amount?.toString().includes(searchTerm) ||
          txn.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          txn.upi?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = filterType === "all" || txn.type === filterType;
        const matchStatus =
          filterStatus === "all" || txn.status?.toLowerCase() === filterStatus;
        const matchCat = filterCat === "All" || txn.category === filterCat;
        let matchDate = true;
        if (fromDate) matchDate = matchDate && txn.date >= fromDate;
        if (toDate) matchDate = matchDate && txn.date <= toDate;
        return matchSearch && matchType && matchStatus && matchCat && matchDate;
      })
      .sort(
        (a, b) =>
          new Date(b.date + "T" + (b.time || "00:00")) -
          new Date(a.date + "T" + (a.time || "00:00")),
      );
  }, [
    transactions,
    searchTerm,
    filterType,
    filterStatus,
    filterCat,
    fromDate,
    toDate,
  ]);

  const stats = useMemo(() => {
    const sent = transactions
      .filter((t) => t.type === "sent" && t.status === "Success")
      .reduce((a, c) => a + (c.amount || 0), 0);
    const received = transactions
      .filter((t) => t.type === "received" && t.status === "Success")
      .reduce((a, c) => a + (c.amount || 0), 0);
    const pending = transactions.filter((t) => t.status === "Pending").length;
    const failed = transactions.filter((t) => t.status === "Failed").length;
    return { sent, received, net: received - sent, pending, failed };
  }, [transactions]);

  function fmtAmt(amt, isSent) {
    if (privacy) return <span className="blur-md select-none">₹●●●●</span>;
    const formatted = `₹${(amt || 0).toLocaleString("en-IN")}`;
    return (
      <span>
        {isSent ? "-" : "+"}
        {formatted}
      </span>
    );
  }

  function openTxn(txn) {
    setSelectedTxn(txn);
    setChatThread(txn.messages || []);
    setChatInput("");
  }

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filteredData.forEach((txn) => {
      const key = txn.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(txn);
    });
    return groups;
  }, [filteredData]);

  // CATEGORIES list (could also be fetched)
  const CATEGORIES = [
    "All",
    "Food",
    "Work",
    "Family",
    "Health",
    "Entertainment",
    "Shopping",
    "Housing",
    "Electronics",
    "Travel",
    "Other",
  ];

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      className="min-h-screen w-full bg-slate-50 text-slate-900 overflow-x-hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 99px; }
        .txn-row { transition: all 0.2s ease; cursor: pointer; }
        .txn-row:hover { background: #f1f5f9 !important; transform: translateX(2px); }
        .pill-btn { transition: all 0.2s; }
        .pill-btn:hover { transform: translateY(-1px); }
        .toast { animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .modal-backdrop { background: rgba(15,23,42,0.5); backdrop-filter: blur(8px); }
        .side-nav-item { transition: all 0.15s; cursor: pointer; border-radius: 12px; }
        .side-nav-item:hover { background: #f1f5f9; }
        .side-nav-item.active { background: #e0e7ff; color: #4f46e5; }
      `}</style>

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-5 left-1/2 z-[100] px-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold shadow-lg toast"
          >
            {notification.icon} {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout with right side nav (no top header) */}
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex gap-6">
        {/* Main content area */}
        <div className="flex-1">
          {activeTab === "Home" && (
            <HomeContent
              transactions={transactions}
              filteredData={filteredData}
              grouped={grouped}
              loading={loading}
              stats={stats}
              privacy={privacy}
              setPrivacy={setPrivacy}
              fmtAmt={fmtAmt}
              openTxn={openTxn}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterCat={filterCat}
              setFilterCat={setFilterCat}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              expandedInvoice={expandedInvoice}
              setExpandedInvoice={setExpandedInvoice}
              downloadReceiptPDF={generateReceiptPDF}
              setShowAddTxn={setShowAddTxn}
              setShowStatement={setShowStatement}
              isOnline={isOnline}
              firebaseInitialized={firebaseInitialized}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              notifList={notifList}
              setShowProfilePopup={setShowProfilePopup}
              showProfilePopup={showProfilePopup}
              profileRef={profileRef}
              user={user}
              copyToClipboard={copyToClipboard}
              showToast={showToast}
            />
          )}
          {activeTab === "Analytics" && (
            <AnalyticsContent transactions={transactions} privacy={privacy} />
          )}
          {activeTab === "Rewards" && (
            <RewardsContent
              user={user}
              showRewards={showRewards}
              setShowRewards={setShowRewards}
              rewardsCopied={rewardsCopied}
              setRewardsCopied={setRewardsCopied}
              setShowInvitePopup={setShowInvitePopup}
              offers={offers}
              copyToClipboard={copyToClipboard}
              showToast={showToast}
            />
          )}
          {activeTab === "Profile" && (
            <ProfileContent
              transactions={transactions}
              stats={stats}
              privacy={privacy}
              setShowStatement={setShowStatement}
              stmtFromMonth={stmtFromMonth}
              setStmtFromMonth={setStmtFromMonth}
              stmtToMonth={stmtToMonth}
              setStmtToMonth={setStmtToMonth}
              emailAddress={emailAddress}
              setEmailAddress={setEmailAddress}
              showEmailInput={showEmailInput}
              setShowEmailInput={setShowEmailInput}
              user={user}
              showToast={showToast}
            />
          )}
        </div>

        {/* Right Side Navigation */}
        <div className="w-20 flex-shrink-0">
          <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-2 flex flex-col items-center gap-2">
            <button
              onClick={() => setActiveTab("Home")}
              className={`side-nav-item w-full py-3 rounded-xl flex flex-col items-center justify-center text-xs font-medium ${
                activeTab === "Home"
                  ? "active bg-indigo-100 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <FiHome size={20} />
              <span className="mt-1">Home</span>
            </button>
            <button
              onClick={() => setActiveTab("Analytics")}
              className={`side-nav-item w-full py-3 rounded-xl flex flex-col items-center justify-center text-xs font-medium ${
                activeTab === "Analytics"
                  ? "active bg-indigo-100 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <FiPieChart size={20} />
              <span className="mt-1">Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab("Rewards")}
              className={`side-nav-item w-full py-3 rounded-xl flex flex-col items-center justify-center text-xs font-medium ${
                activeTab === "Rewards"
                  ? "active bg-indigo-100 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <FiStar size={20} />
              <span className="mt-1">Rewards</span>
            </button>
            <button
              onClick={() => setActiveTab("Profile")}
              className={`side-nav-item w-full py-3 rounded-xl flex flex-col items-center justify-center text-xs font-medium ${
                activeTab === "Profile"
                  ? "active bg-indigo-100 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <FiUser size={20} />
              <span className="mt-1">Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Popup */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-6 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifList.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No notifications
                </div>
              ) : (
                notifList.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 border-b border-slate-100 hover:bg-slate-50 ${!n.read ? "bg-indigo-50" : ""}`}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Popup */}
      <AnimatePresence>
        {showProfilePopup && (
          <motion.div
            ref={profileRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-16 right-6 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || "https://via.placeholder.com/40"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200"
                />
                <div>
                  <p className="font-semibold text-sm">{user.name || "User"}</p>
                  <p className="text-xs text-slate-500">{user.email || ""}</p>
                </div>
              </div>
            </div>
            <div className="py-2">
              <button
                onClick={() => {
                  setShowProfilePopup(false);
                  setActiveTab("Profile");
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <FiUser size={14} className="text-indigo-500" /> View Profile
              </button>
              <button
                onClick={() => {
                  setShowProfilePopup(false); /* open settings */
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <FiSettings size={14} className="text-indigo-500" /> Settings
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-rose-600"
              >
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Popup */}
      <AnimatePresence>
        {showInvitePopup && (
          <Modal onClose={() => setShowInvitePopup(false)}>
            <InvitePopup
              onClose={() => setShowInvitePopup(false)}
              showToast={showToast}
            />
          </Modal>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {selectedTxn && (
          <Modal onClose={() => setSelectedTxn(null)}>
            <TransactionDetailModal
              txn={selectedTxn}
              chatThread={chatThread}
              chatInput={chatInput}
              setChatInput={setChatInput}
              sendChatMsg={sendChatMsg}
              chatEndRef={chatEndRef}
              fmtAmt={fmtAmt}
              formatPrettyDate={formatPrettyDate}
              getAvatarColor={getAvatarColor}
              getInitials={getInitials}
              downloadReceiptPDF={generateReceiptPDF}
              setDisputeTxn={setDisputeTxn}
              setSelectedTxn={setSelectedTxn}
              copyToClipboard={copyToClipboard}
              showToast={showToast}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {disputeTxn && (
          <Modal onClose={() => setDisputeTxn(null)}>
            <DisputeModal
              disputeTxn={disputeTxn}
              disputeReason={disputeReason}
              setDisputeReason={setDisputeReason}
              submitDispute={submitDispute}
              disputeSuccess={disputeSuccess}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddTxn && (
          <Modal onClose={() => setShowAddTxn(false)}>
            <AddTransactionModal
              newTxnForm={newTxnForm}
              setNewTxnForm={setNewTxnForm}
              handleAddTransaction={handleAddTransaction}
              addingTxn={addingTxn}
              firebaseInitialized={firebaseInitialized}
              CATEGORIES={CATEGORIES}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRewards && (
          <Modal onClose={() => setShowRewards(false)}>
            <RewardsModal
              rewardsCopied={rewardsCopied}
              setRewardsCopied={setRewardsCopied}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// HOME CONTENT (with integrated header actions)
// ============================================================
function HomeContent({
  transactions,
  filteredData,
  grouped,
  loading,
  stats,
  privacy,
  setPrivacy,
  fmtAmt,
  openTxn,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterCat,
  setFilterCat,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  showDatePicker,
  setShowDatePicker,
  expandedInvoice,
  setExpandedInvoice,
  downloadReceiptPDF,
  setShowAddTxn,
  setShowStatement,
  isOnline,
  firebaseInitialized,
  showNotifications,
  setShowNotifications,
  notifList,
  setShowProfilePopup,
  showProfilePopup,
  profileRef,
  user,
  copyToClipboard,
  showToast,
}) {
  return (
    <>
      {/* Action bar (formerly header) now inside content */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
            <FiZap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">drishtipay</span>
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200">
              <FiWifiOff size={12} className="text-rose-500" />
              <span className="text-[11px] font-semibold text-rose-600">
                OFFLINE
              </span>
            </div>
          )}
          {!firebaseInitialized && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              <FiAlertCircle size={12} className="text-amber-500" />
              <span className="text-[11px] font-semibold text-amber-600">
                DEMO
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPrivacy((p) => !p)}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
            title={privacy ? "Show amounts" : "Hide amounts"}
          >
            {privacy ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
            >
              <FiBell size={16} />
            </button>
            {notifList.filter((n) => !n.read).length > 0 && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </div>
          <button
            onClick={() => setShowAddTxn(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition shadow-md"
          >
            <FiPlus size={14} /> Add
          </button>
          <button
            onClick={() => setShowStatement(true)}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition"
          >
            <FiDownload size={16} />
          </button>
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfilePopup(!showProfilePopup)}
              className="w-9 h-9 rounded-xl overflow-hidden border-2 border-indigo-200 focus:outline-none"
            >
              <img
                src={user.avatar || "https://via.placeholder.com/40"}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-200 animate-pulse"
            />
          ))
        ) : (
          <>
            <StatCard
              label="Received"
              value={
                privacy
                  ? "₹●●●●"
                  : `+₹${stats.received.toLocaleString("en-IN")}`
              }
              sub={`${transactions.filter((t) => t.type === "received").length} txns`}
              color="#10b981"
              icon={<FiArrowDownLeft />}
            />
            <StatCard
              label="Sent"
              value={
                privacy ? "₹●●●●" : `-₹${stats.sent.toLocaleString("en-IN")}`
              }
              sub={`${transactions.filter((t) => t.type === "sent").length} txns`}
              color="#f43f5e"
              icon={<FiArrowUpRight />}
            />
            <StatCard
              label="Net Balance"
              value={
                privacy ? "₹●●●●" : `₹${stats.net.toLocaleString("en-IN")}`
              }
              sub="After deductions"
              color={stats.net >= 0 ? "#6366f1" : "#f43f5e"}
              icon={<FiActivity />}
            />
            <StatCard
              label="Alerts"
              value={`${stats.failed + stats.pending}`}
              sub={`${stats.failed} failed • ${stats.pending} pending`}
              color="#f59e0b"
              icon={<FiAlertCircle />}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200">
            {["all", "sent", "received"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition pill-btn ${
                  filterType === f
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200">
            {["all", "success", "failed", "pending"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition pill-btn ${
                  filterStatus === s
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {[
              "All",
              "Food",
              "Work",
              "Family",
              "Health",
              "Entertainment",
              "Shopping",
              "Housing",
              "Electronics",
              "Travel",
              "Other",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* Date presets */}
          <div className="flex gap-2 items-center flex-wrap">
            {[
              {
                label: "Today",
                onClick: () => {
                  const t = new Date().toISOString().slice(0, 10);
                  setFromDate(t);
                  setToDate(t);
                },
              },
              {
                label: "7d",
                onClick: () => {
                  const t = new Date(),
                    l = new Date(t - 6 * 864e5);
                  setFromDate(l.toISOString().slice(0, 10));
                  setToDate(t.toISOString().slice(0, 10));
                },
              },
              {
                label: "Month",
                onClick: () => {
                  const n = new Date();
                  setFromDate(
                    new Date(n.getFullYear(), n.getMonth(), 1)
                      .toISOString()
                      .slice(0, 10),
                  );
                  setToDate(
                    new Date(n.getFullYear(), n.getMonth() + 1, 0)
                      .toISOString()
                      .slice(0, 10),
                  );
                },
              },
              {
                label: "All",
                onClick: () => {
                  setFromDate("");
                  setToDate("");
                },
              },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100 border border-slate-200 hover:border-indigo-300 transition"
              >
                {btn.label}
              </button>
            ))}
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition flex items-center gap-1"
            >
              <FiCalendar size={11} /> Custom
            </button>
          </div>
        </div>

        {/* Custom date range */}
        <AnimatePresence>
          {showDatePicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200 overflow-hidden"
            >
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-slate-400 text-sm">→</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-slate-500 text-xs">
                {filteredData.length} results
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction List */}
      <div className="space-y-1">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-slate-200 animate-pulse mb-2"
            />
          ))
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <FiSearch size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold text-lg">
              No transactions found
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, txns]) => (
            <div key={date} className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                  {formatPrettyDate(date)}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">
                  {txns.length} transactions
                </span>
              </div>
              <div className="space-y-2">
                {txns.map((txn, idx) => {
                  const isSent = txn.type === "sent";
                  const [c1, c2] = getAvatarColor(txn.name);
                  return (
                    <React.Fragment key={txn.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => openTxn(txn)}
                        className="txn-row flex items-center gap-4 px-5 py-4 rounded-2xl border border-slate-200 bg-white"
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {txn.avatar ? (
                            <img
                              src={txn.avatar}
                              alt={txn.name}
                              className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-200"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
                              style={{
                                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                              }}
                            >
                              {getInitials(txn.name)}
                            </div>
                          )}
                          <div
                            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${isSent ? "bg-rose-500" : "bg-emerald-500"} border-2 border-white`}
                          >
                            {isSent ? <FiArrowUpRight /> : <FiArrowDownLeft />}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-slate-900 text-sm truncate">
                              {txn.name}
                            </span>
                            {txn.status === "Failed" && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 border border-rose-200 text-rose-600 rounded-md font-semibold">
                                FAILED
                              </span>
                            )}
                            {txn.status === "Pending" && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 border border-amber-200 text-amber-600 rounded-md font-semibold">
                                PENDING
                              </span>
                            )}
                            {txn.invoiceImg && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-600 rounded-md font-semibold">
                                RECEIPT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 truncate">
                              {txn.note}
                            </span>
                            {txn.upi && (
                              <span className="text-[10px] text-slate-400 font-mono truncate hidden md:block">
                                • {txn.upi}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div
                              className={`font-bold text-base ${isSent ? "text-rose-500" : "text-emerald-500"}`}
                            >
                              {fmtAmt(txn.amount, isSent)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {txn.time}
                            </div>
                          </div>
                          <div
                            className="flex gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => downloadReceiptPDF(txn)}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition"
                              title="Download receipt"
                            >
                              <FiDownload size={13} />
                            </button>
                            {txn.invoiceImg && (
                              <button
                                onClick={() =>
                                  setExpandedInvoice(
                                    expandedInvoice === txn.id ? "" : txn.id,
                                  )
                                }
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition"
                                title="View invoice"
                              >
                                <FiFile size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                      {/* Expanded Invoice */}
                      {expandedInvoice === txn.id && txn.invoiceImg && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-16 px-4 py-3 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center gap-3"
                        >
                          <FiImage size={14} className="text-indigo-500" />
                          <img
                            src={txn.invoiceImg}
                            alt="Invoice"
                            className="h-24 rounded-xl border border-indigo-200 object-cover"
                          />
                          <div>
                            <p className="text-xs text-indigo-600 font-semibold">
                              Invoice / Attachment
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {txn.id}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ============================================================
// ANALYTICS CONTENT (with graphs)
// ============================================================
function AnalyticsContent({ transactions, privacy }) {
  // Monthly spending (for graph)
  const monthlyData = useMemo(() => {
    const months = {};
    transactions
      .filter((t) => t.type === "sent" && t.status === "Success")
      .forEach((t) => {
        const month = t.date.slice(0, 7); // YYYY-MM
        months[month] = (months[month] || 0) + t.amount;
      });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
  }, [transactions]);

  const maxMonthly = Math.max(...monthlyData.map(([, val]) => val), 1);

  // Additional insights
  const totalSpent = transactions
    .filter((t) => t.type === "sent" && t.status === "Success")
    .reduce((a, c) => a + c.amount, 0);
  const avgTransaction = transactions.length
    ? (
        transactions.reduce((a, c) => a + c.amount, 0) / transactions.length
      ).toFixed(2)
    : 0;
  const successRate = transactions.length
    ? (
        (transactions.filter((t) => t.status === "Success").length /
          transactions.length) *
        100
      ).toFixed(1)
    : 0;
  const topCategory = useMemo(() => {
    const catCount = {};
    transactions
      .filter((t) => t.type === "sent" && t.status === "Success")
      .forEach((t) => {
        const cat = t.category || "Other";
        catCount[cat] = (catCount[cat] || 0) + t.amount;
      });
    const sorted = Object.entries(catCount).sort((a, b) => b[1] - a[1]);
    return sorted.length ? sorted[0][0] : "N/A";
  }, [transactions]);

  const currentMonthSpent = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    return transactions
      .filter(
        (t) =>
          t.type === "sent" &&
          t.status === "Success" &&
          t.date.startsWith(currentMonth),
      )
      .reduce((a, c) => a + c.amount, 0);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500">Total Spent</p>
          <p className="text-xl font-bold text-rose-500">
            {privacy ? "₹●●●" : `₹${totalSpent.toLocaleString("en-IN")}`}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500">Avg Transaction</p>
          <p className="text-xl font-bold text-indigo-500">
            {privacy
              ? "₹●●●"
              : `₹${Number(avgTransaction).toLocaleString("en-IN")}`}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500">Success Rate</p>
          <p className="text-xl font-bold text-emerald-500">{successRate}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500">Top Category</p>
          <p className="text-xl font-bold text-purple-500">{topCategory}</p>
        </div>
      </div>

      {/* Monthly Spending Graph */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <FiBarChart2 className="text-indigo-500" /> Monthly Spending (Last 6
          Months)
        </h2>
        {monthlyData.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No monthly data.</p>
        ) : (
          <div className="flex items-end justify-around h-48 gap-2">
            {monthlyData.map(([month, amount]) => {
              const height = (amount / maxMonthly) * 100;
              return (
                <div key={month} className="flex flex-col items-center flex-1">
                  <div className="relative w-full flex justify-center mb-2">
                    <div
                      className="w-8 bg-indigo-400 rounded-t-lg transition-all duration-300"
                      style={{ height: `${height}%`, minHeight: 4 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {new Date(month + "-01").toLocaleDateString("en-IN", {
                      month: "short",
                    })}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {privacy ? "●●●" : `₹${amount.toLocaleString()}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Spending Insight */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center">
        <FiTrendingUp size={24} className="mx-auto text-indigo-500 mb-2" />
        <h3 className="font-bold text-lg mb-1">This Month's Spending</h3>
        <p className="text-3xl font-bold text-indigo-600">
          {privacy ? "₹●●●" : `₹${currentMonthSpent.toLocaleString("en-IN")}`}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Keep track of your monthly budget!
        </p>
      </div>
    </div>
  );
}

// ============================================================
// REWARDS CONTENT (enhanced)
// ============================================================
function RewardsContent({
  user,
  showRewards,
  setShowRewards,
  rewardsCopied,
  setRewardsCopied,
  setShowInvitePopup,
  offers,
  copyToClipboard,
  showToast,
}) {
  return (
    <div className="space-y-6">
      {/* Points Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Rewards & Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
              <FiStar className="text-indigo-600" size={20} />
            </div>
            <p className="font-bold text-lg">{user.rewards || 0} points</p>
            <p className="text-xs text-slate-500 mt-1">
              Equivalent to ₹{((user.rewards || 0) * 0.25).toFixed(2)} cashback
            </p>
            <button
              onClick={() => setShowRewards(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
            >
              Claim Reward
            </button>
          </div>
          <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <FiGift className="text-purple-600" size={20} />
            </div>
            <p className="font-bold text-lg">Refer & Earn</p>
            <p className="text-xs text-slate-500 mt-1">
              Get ₹50 for each friend who joins
            </p>
            <button
              onClick={() => setShowInvitePopup(true)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700"
            >
              Invite Friends
            </button>
          </div>
        </div>
      </div>

      {/* Available Offers */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4">Active Coupons</h3>
        <div className="space-y-3">
          {offers.length === 0 ? (
            <p className="text-slate-400 text-center py-4">
              No offers available
            </p>
          ) : (
            offers.map((offer) => (
              <div
                key={offer.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div>
                  <p className="font-semibold text-sm">{offer.brand}</p>
                  <p className="text-xs text-slate-500">{offer.discount}</p>
                  <p className="text-xs text-indigo-500 mt-1">
                    Code: {offer.code}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    Expires {offer.expiry}
                  </p>
                  <button
                    onClick={() => copyToClipboard(offer.code, showToast)}
                    className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROFILE CONTENT (with statement filter and email option)
// ============================================================
function ProfileContent({
  transactions,
  stats,
  privacy,
  setShowStatement,
  stmtFromMonth,
  setStmtFromMonth,
  stmtToMonth,
  setStmtToMonth,
  emailAddress,
  setEmailAddress,
  showEmailInput,
  setShowEmailInput,
  user,
  showToast,
}) {
  const totalTransactions = transactions.length;
  const successful = transactions.filter((t) => t.status === "Success").length;
  const failed = transactions.filter((t) => t.status === "Failed").length;
  const pending = transactions.filter((t) => t.status === "Pending").length;

  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
      options.push({ value, label });
    }
    return options;
  }, []);

  const handleDownloadPDF = () => {
    if (!stmtFromMonth || !stmtToMonth) {
      showToast("Please select both from and to months", "error");
      return;
    }
    if (stmtFromMonth > stmtToMonth) {
      showToast("From month cannot be after to month", "error");
      return;
    }
    const filtered = transactions.filter((txn) => {
      const txnMonth = txn.date.slice(0, 7);
      return txnMonth >= stmtFromMonth && txnMonth <= stmtToMonth;
    });
    const fromLabel =
      monthOptions.find((o) => o.value === stmtFromMonth)?.label ||
      stmtFromMonth;
    const toLabel =
      monthOptions.find((o) => o.value === stmtToMonth)?.label || stmtToMonth;
    generateStatementPDF(filtered, user, fromLabel, toLabel);
    showToast("Statement PDF downloaded!", "success");
  };

  const handleSendEmail = () => {
    if (!emailAddress || !emailAddress.includes("@")) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    // Simulate sending email
    showToast(`Statement sent to ${emailAddress}`, "success");
    setShowEmailInput(false);
    setEmailAddress("");
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Total Transactions</p>
          <p className="text-2xl font-bold text-indigo-600">
            {totalTransactions}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Successful</p>
          <p className="text-2xl font-bold text-emerald-600">{successful}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Failed</p>
          <p className="text-2xl font-bold text-rose-600">{failed}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4">Financial Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500">Total Received</span>
            <span className="font-semibold text-emerald-600">
              {privacy
                ? "₹●●●●"
                : `+₹${stats.received.toLocaleString("en-IN")}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Sent</span>
            <span className="font-semibold text-rose-600">
              {privacy ? "₹●●●●" : `-₹${stats.sent.toLocaleString("en-IN")}`}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span className="font-medium">Net Balance</span>
            <span
              className={`font-bold ${stats.net >= 0 ? "text-indigo-600" : "text-rose-600"}`}
            >
              {privacy ? "₹●●●●" : `₹${stats.net.toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>
      </div>

      {/* Statement Generator */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FiDownload className="text-indigo-500" /> Download Statement
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              From Month
            </label>
            <select
              value={stmtFromMonth}
              onChange={(e) => setStmtFromMonth(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              To Month
            </label>
            <select
              value={stmtToMonth}
              onChange={(e) => setStmtToMonth(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <FiDownload size={14} /> Download PDF
          </button>
          <button
            onClick={() => setShowEmailInput(!showEmailInput)}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            <FiSendIcon size={14} /> Send Email
          </button>
        </div>

        {showEmailInput && (
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
            />
            <button
              onClick={handleSendEmail}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// INVITE POPUP
// ============================================================
function InvitePopup({ onClose, showToast }) {
  const inviteLink = "https://drishtipay.app/invite/arjun123"; // Replace with dynamic link
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    showToast("Link copied!", "success", "📋");
  };

  const shareVia = (platform) => {
    let url = "";
    const text =
      "Join me on DrishtiPay and get ₹50 cashback! Use my invite link: " +
      inviteLink;
    if (platform === "whatsapp") {
      url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    } else if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`;
    } else if (platform === "twitter") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    } else if (platform === "email") {
      url = `mailto:?subject=Join me on DrishtiPay&body=${encodeURIComponent(text)}`;
    }
    window.open(url, "_blank");
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Invite Friends</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <FiX size={18} />
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Share your invite link and earn ₹50 for each friend who joins!
      </p>

      {/* Share via social media */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <button
          onClick={() => shareVia("whatsapp")}
          className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition flex flex-col items-center"
        >
          <FiShare2 size={18} />
          <span className="text-[10px] mt-1">WhatsApp</span>
        </button>
        <button
          onClick={() => shareVia("facebook")}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex flex-col items-center"
        >
          <FiFacebook size={18} />
          <span className="text-[10px] mt-1">Facebook</span>
        </button>
        <button
          onClick={() => shareVia("twitter")}
          className="p-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition flex flex-col items-center"
        >
          <FiTwitter size={18} />
          <span className="text-[10px] mt-1">Twitter</span>
        </button>
        <button
          onClick={() => shareVia("email")}
          className="p-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition flex flex-col items-center"
        >
          <FiMail size={18} />
          <span className="text-[10px] mt-1">Email</span>
        </button>
      </div>

      {/* Invite link */}
      <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="flex-1 bg-transparent text-sm px-2 outline-none"
        />
        <button
          onClick={handleCopyLink}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MODAL COMPONENTS
// ============================================================
function TransactionDetailModal({
  txn,
  chatThread,
  chatInput,
  setChatInput,
  sendChatMsg,
  chatEndRef,
  fmtAmt,
  formatPrettyDate,
  getAvatarColor,
  getInitials,
  downloadReceiptPDF,
  setDisputeTxn,
  setSelectedTxn,
  copyToClipboard,
  showToast,
}) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden">
      <div
        className={`px-6 pt-6 pb-5 border-b border-slate-200 ${txn.type === "sent" ? "bg-rose-50" : "bg-emerald-50"}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-2 ${
                txn.status === "Success"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : txn.status === "Failed"
                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
              }`}
            >
              {txn.status === "Success" ? (
                <FiCheckCircle size={10} />
              ) : (
                <FiAlertCircle size={10} />
              )}
              {txn.status}
            </div>
            <div
              className={`text-3xl font-bold ${txn.type === "sent" ? "text-rose-500" : "text-emerald-500"}`}
            >
              {fmtAmt(txn.amount, txn.type === "sent")}
            </div>
          </div>
          <button
            onClick={() => setSelectedTxn(null)}
            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <FiX size={16} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          {txn.avatar ? (
            <img
              src={txn.avatar}
              alt={txn.name}
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: `linear-gradient(135deg, ${getAvatarColor(txn.name)[0]}, ${getAvatarColor(txn.name)[1]})`,
              }}
            >
              {getInitials(txn.name)}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900 text-sm">{txn.name}</p>
            <p className="text-xs text-slate-500">{txn.upi || "—"}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-3">
        {[
          { label: "Transaction ID", value: txn.id, mono: true, copy: true },
          {
            label: "Date & Time",
            value: `${formatPrettyDate(txn.date)} • ${txn.time}`,
          },
          { label: "Category", value: txn.category || "—" },
          { label: "Note", value: txn.note || "—" },
        ].map((r) => (
          <div
            key={r.label}
            className="flex justify-between items-center py-2 border-b border-slate-100"
          >
            <span className="text-xs text-slate-500 font-medium">
              {r.label}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold text-slate-800 ${r.mono ? "font-mono bg-slate-100 px-2 py-1 rounded-lg" : ""}`}
              >
                {r.value}
              </span>
              {r.copy && (
                <button
                  onClick={() => copyToClipboard(r.value, showToast)}
                  className="text-slate-400 hover:text-indigo-600"
                >
                  <FiCopy size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
        {txn.invoiceImg && (
          <div className="pt-2">
            <p className="text-xs text-slate-500 mb-2">Attachment</p>
            <img
              src={txn.invoiceImg}
              alt="Invoice"
              className="w-full h-32 object-cover rounded-xl border border-slate-200"
            />
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-200 flex gap-2">
        <button
          onClick={() => downloadReceiptPDF(txn)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-100 text-indigo-700 rounded-2xl text-sm font-semibold border border-indigo-200 hover:bg-indigo-200 transition"
        >
          <FiDownload size={14} /> Receipt PDF
        </button>
        {(txn.status === "Failed" || txn.amount >= 10000) && (
          <button
            onClick={() => {
              setDisputeTxn(txn);
              setSelectedTxn(null);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-100 text-rose-700 rounded-2xl text-sm font-semibold border border-rose-200 hover:bg-rose-200 transition"
          >
            <FiFlag size={14} /> Dispute
          </button>
        )}
      </div>

      <div className="border-t border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <FiMessageCircle size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Message Thread
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
            {chatThread.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">
                No messages yet
              </p>
            ) : (
              chatThread.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.by === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`text-xs px-3 py-2 rounded-xl max-w-[75%] ${
                      msg.by === "me"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChatMsg()}
              placeholder="Type a message..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={sendChatMsg}
              className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-700 transition"
            >
              <FiSend size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DisputeModal({
  disputeTxn,
  disputeReason,
  setDisputeReason,
  submitDispute,
  disputeSuccess,
}) {
  return (
    <div className="p-6">
      {!disputeSuccess ? (
        <>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
              <FiFlag size={14} className="text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Raise Dispute
              </h3>
              <p className="text-xs text-slate-500">{disputeTxn.id}</p>
            </div>
          </div>
          <form onSubmit={submitDispute}>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              required
              rows={4}
              placeholder="Describe the issue in detail..."
              className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 resize-none mb-4"
            />
            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition"
            >
              Submit Dispute
            </button>
          </form>
        </>
      ) : (
        <div className="p-8 text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiCheckCircle size={22} className="text-emerald-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Dispute Submitted</h3>
          <p className="text-sm text-slate-500">
            We'll contact you within 48 hours.
          </p>
        </div>
      )}
    </div>
  );
}

function AddTransactionModal({
  newTxnForm,
  setNewTxnForm,
  handleAddTransaction,
  addingTxn,
  firebaseInitialized,
  CATEGORIES,
}) {
  return (
    <form onSubmit={handleAddTransaction} className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
          <FiPlus size={14} className="text-indigo-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Add Transaction</h3>
          <p className="text-xs text-slate-500">
            {firebaseInitialized
              ? "Saved to Firestore"
              : "Firebase not configured"}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <label className="text-xs text-slate-500 mb-1 block">Name *</label>
          <input
            required
            value={newTxnForm.name}
            onChange={(e) =>
              setNewTxnForm((f) => ({ ...f, name: e.target.value }))
            }
            placeholder="Recipient/Sender name"
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Amount *</label>
          <input
            required
            type="number"
            min="1"
            value={newTxnForm.amount}
            onChange={(e) =>
              setNewTxnForm((f) => ({ ...f, amount: e.target.value }))
            }
            placeholder="₹0.00"
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Type</label>
          <select
            value={newTxnForm.type}
            onChange={(e) =>
              setNewTxnForm((f) => ({ ...f, type: e.target.value }))
            }
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">UPI ID</label>
          <input
            value={newTxnForm.upi}
            onChange={(e) =>
              setNewTxnForm((f) => ({ ...f, upi: e.target.value }))
            }
            placeholder="user@bank"
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Status</label>
          <select
            value={newTxnForm.status}
            onChange={(e) =>
              setNewTxnForm((f) => ({ ...f, status: e.target.value }))
            }
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            <option>Success</option>
            <option>Failed</option>
            <option>Pending</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Category</label>
          <select
            value={newTxnForm.category}
            onChange={(e) =>
              setNewTxnForm((f) => ({ ...f, category: e.target.value }))
            }
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
          >
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-slate-500 mb-1 block">Note</label>
          <input
            value={newTxnForm.note}
            onChange={(e) =>
              setNewTxnForm((f) => ({ ...f, note: e.target.value }))
            }
            placeholder="What's this for?"
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={addingTxn || !firebaseInitialized}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
      >
        {addingTxn ? (
          <>
            <FiLoader size={14} className="animate-spin" /> Adding...
          </>
        ) : (
          "Add Transaction"
        )}
      </button>
    </form>
  );
}

function RewardsModal({ rewardsCopied, setRewardsCopied }) {
  return (
    <div className="p-6 text-center">
      <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <FiStar size={22} className="text-purple-600" />
      </div>
      <h3 className="font-bold text-slate-900 mb-2">Your Reward Code</h3>
      <div className="bg-slate-100 p-4 rounded-xl mb-4">
        <span className="text-2xl font-mono font-bold text-indigo-600 tracking-widest">
          FACEPAY50
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Use this code to get ₹50 cashback on your next transaction.
      </p>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText("FACEPAY50");
          setRewardsCopied(true);
          setTimeout(() => setRewardsCopied(false), 1500);
        }}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition"
      >
        {rewardsCopied ? "Copied!" : "Copy Code"}
      </button>
    </div>
  );
}

// ============================================================
// HELPER COMPONENTS
// ============================================================
function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 transition hover:scale-[1.02] hover:shadow-md">
      <div
        style={{
          background: `${color}15`,
          border: `1px solid ${color}25`,
          color,
        }}
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
      >
        {icon}
      </div>
      <div className="font-bold text-xl text-slate-900 mb-1">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Modal({ onClose, children }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
