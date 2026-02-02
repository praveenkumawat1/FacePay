import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiFilter,
  FiPieChart,
  FiList,
  FiX,
  FiShare2,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiChevronDown,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK DATA ---
const TRANSACTIONS = [
  {
    id: "TXN_88291",
    name: "Rahul Sharma",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    amount: 500,
    type: "sent",
    date: "Today",
    time: "10:23 AM",
    upi: "rahul@ybl",
    status: "Success",
    note: "Dinner Bill Split",
  },
  {
    id: "TXN_77321",
    name: "Priya Singh",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    amount: 2000,
    type: "received",
    date: "Today",
    time: "09:15 AM",
    upi: "priya@okicici",
    status: "Success",
    note: "Freelance Work",
  },
  {
    id: "TXN_33211",
    name: "Mom",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    amount: 5000,
    type: "received",
    date: "Yesterday",
    time: "06:45 PM",
    upi: "mom@sbi",
    status: "Success",
    note: "Pocket Money",
  },
  {
    id: "TXN_11029",
    name: "Amit Verma",
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    amount: 150,
    type: "sent",
    date: "Yesterday",
    time: "02:30 PM",
    upi: "amit.v@paytm",
    status: "Failed",
    note: "Recharge",
  },
  {
    id: "TXN_99213",
    name: "Vikram Malhotra",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    amount: 1200,
    type: "sent",
    date: "25 Jan 2024",
    time: "08:00 PM",
    upi: "vikram@axis",
    status: "Success",
    note: "Gym Fees",
  },
  {
    id: "TXN_44512",
    name: "Zomato",
    avatar: "",
    amount: 450,
    type: "sent",
    date: "25 Jan 2024",
    time: "01:15 PM",
    upi: "zomato@upi",
    status: "Success",
    note: "Lunch Order",
  },
];

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [viewMode, setViewMode] = useState("list"); // list | insights
  const [selectedTxn, setSelectedTxn] = useState(null);

  // --- LOGIC ---
  const filteredData = useMemo(() => {
    return TRANSACTIONS.filter((txn) => {
      const matchesSearch =
        txn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.amount.toString().includes(searchTerm);
      const matchesType =
        filterType === "All"
          ? true
          : filterType === "Sent"
            ? txn.type === "sent"
            : txn.type === "received";
      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType]);

  const stats = useMemo(() => {
    const sent = TRANSACTIONS.filter(
      (t) => t.type === "sent" && t.status === "Success",
    ).reduce((acc, curr) => acc + curr.amount, 0);
    const received = TRANSACTIONS.filter(
      (t) => t.type === "received" && t.status === "Success",
    ).reduce((acc, curr) => acc + curr.amount, 0);
    return { sent, received, net: received - sent };
  }, []);

  return (
    <div className="bg-[#f8fafc] min-h-screen w-full p-4 md:p-8 font-sans flex flex-col items-center">
      {/* --- MAIN CONTAINER --- */}
      <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col min-h-[700px]">
        {/* --- HEADER --- */}
        <div className="px-6 py-6 border-b border-gray-100 bg-white sticky top-0 z-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                History
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Track your income & expenses
              </p>
            </div>

            {/* View Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <FiList /> List
              </button>
              <button
                onClick={() => setViewMode("insights")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === "insights" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <FiPieChart /> Insights
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          {viewMode === "list" && (
            <div className="flex flex-wrap gap-3 animate-fade-in">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="appearance-none h-full bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl pl-4 pr-10 hover:border-gray-300 focus:border-indigo-500 outline-none cursor-pointer shadow-sm"
                  >
                    <option value="All">All Transactions</option>
                    <option value="Sent">Money Sent</option>
                    <option value="Received">Money Received</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 rounded-xl hover:bg-gray-50 shadow-sm">
                  <FiCalendar />{" "}
                  <span className="hidden sm:inline">Select Date</span>
                </button>

                <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs px-4 rounded-xl hover:bg-gray-50 shadow-sm">
                  <FiDownload />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 bg-gray-50/50 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {viewMode === "insights" ? (
              /* VIEW 1: INSIGHTS */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 md:p-8 max-w-4xl mx-auto"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FiArrowDownLeft /> Total Received
                    </p>
                    <h3 className="text-3xl font-bold text-green-600">
                      ₹{stats.received.toLocaleString()}
                    </h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FiArrowUpRight /> Total Spent
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      ₹{stats.sent.toLocaleString()}
                    </h3>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-2">
                      Net Balance
                    </p>
                    <h3 className="text-3xl font-bold">
                      ₹{stats.net.toLocaleString()}
                    </h3>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiTrendingUp className="text-indigo-600" /> Spending Trend
                </h3>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-64 flex items-end justify-between px-10 pb-4">
                  {[40, 70, 30, 85, 50, 60, 90].map((h, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 group cursor-pointer w-full"
                    >
                      <div
                        className="w-full max-w-[40px] bg-indigo-50 rounded-t-xl relative group-hover:bg-indigo-600 transition-all duration-500"
                        style={{ height: `${h * 2}px` }}
                      >
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{h * 100}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Day {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* VIEW 2: LIST */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col pb-10"
              >
                {filteredData.length > 0 ? (
                  filteredData.map((txn, index) => {
                    const isSent = txn.type === "sent";
                    const showDateHeader =
                      index === 0 || TRANSACTIONS[index - 1].date !== txn.date;

                    return (
                      <React.Fragment key={txn.id}>
                        {showDateHeader && (
                          <div className="bg-gray-100/80 backdrop-blur-sm px-6 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wide border-y border-gray-200 sticky top-0 z-10">
                            {txn.date}
                          </div>
                        )}

                        <div
                          onClick={() => setSelectedTxn(txn)}
                          className="group flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              {txn.avatar ? (
                                <img
                                  src={txn.avatar}
                                  alt={txn.name}
                                  className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-200">
                                  {txn.name[0]}
                                </div>
                              )}
                              <div
                                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${isSent ? "bg-gray-200 text-gray-600" : "bg-green-100 text-green-600"}`}
                              >
                                {isSent ? (
                                  <FiArrowUpRight />
                                ) : (
                                  <FiArrowDownLeft />
                                )}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-sm md:text-base">
                                {txn.name}
                              </h3>
                              <p className="text-xs text-gray-400 font-medium mt-0.5">
                                {txn.time} • {txn.status}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`font-bold text-sm md:text-base ${isSent ? "text-gray-900" : "text-green-600"}`}
                            >
                              {isSent ? "-" : "+"} ₹
                              {txn.amount.toLocaleString()}
                            </div>
                            {txn.status === "Failed" && (
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                Failed
                              </span>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-2xl mb-4">
                      <FiSearch />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No transactions found
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- TRANSACTION DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedTxn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTxn(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative"
            >
              {/* Receipt Header Pattern */}
              <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

              <button
                onClick={() => setSelectedTxn(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              >
                <FiX />
              </button>

              <div className="p-8 flex flex-col items-center text-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm ${selectedTxn.status === "Success" ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}
                >
                  {selectedTxn.status === "Success" ? (
                    <FiCheckCircle />
                  ) : (
                    <FiAlertCircle />
                  )}
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                  {selectedTxn.type === "sent" ? "-" : "+"}₹
                  {selectedTxn.amount.toLocaleString()}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${selectedTxn.status === "Success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  Payment {selectedTxn.status}
                </span>

                <div className="w-full mt-8 space-y-4">
                  <div className="flex justify-between text-sm py-3 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">To / From</span>
                    <div className="flex items-center gap-2">
                      {selectedTxn.avatar && (
                        <img
                          src={selectedTxn.avatar}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className="font-bold text-gray-900">
                        {selectedTxn.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm py-3 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">
                      Date & Time
                    </span>
                    <span className="font-bold text-gray-900">
                      {selectedTxn.date}, {selectedTxn.time}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-3 border-b border-gray-50">
                    <span className="text-gray-500 font-medium">
                      Transaction ID
                    </span>
                    <span className="font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {selectedTxn.id}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-left">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                      Note
                    </p>
                    <p className="text-sm font-medium text-gray-700 italic">
                      "{selectedTxn.note}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full mt-8">
                  <button className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors">
                    <FiShare2 /> Share
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                    <FiDownload /> Receipt
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
