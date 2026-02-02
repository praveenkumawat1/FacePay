import React, { useState } from "react";
import {
  FiTag,
  FiCopy,
  FiShoppingBag,
  FiGift,
  FiCheck,
  FiClock,
  FiUsers,
  FiLock,
  FiCreditCard,
  FiStar,
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";

// --- MOCK DATA ---

// 1. Marketplace Items (Redeem Coins)
const marketplaceItems = [
  {
    id: 1,
    brand: "Zomato",
    title: "Zomato Pro (1 Month)",
    price: 500, // Coins
    logo: "Z",
    color: "bg-red-50 text-red-600",
  },
  {
    id: 2,
    brand: "Amazon",
    title: "₹100 Amazon Pay Gift Card",
    price: 1000,
    logo: "A",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    id: 3,
    brand: "Spotify",
    title: "Spotify Premium Mini",
    price: 250,
    logo: "S",
    color: "bg-green-50 text-green-600",
  },
];

// 2. Active Coupons (Free)
const activeCoupons = [
  {
    id: 101,
    brand: "Uber",
    code: "UBER50",
    desc: "50% OFF on next 2 rides",
    expiry: "Expires in 4h",
    color: "bg-gray-100 text-gray-800",
    category: "Travel",
  },
  {
    id: 102,
    brand: "Myntra",
    code: "FASHION20",
    desc: "Flat 20% OFF on Casuals",
    expiry: "Valid till Sunday",
    color: "bg-pink-50 text-pink-600",
    category: "Shopping",
  },
  {
    id: 103,
    brand: "Swiggy",
    code: "YUMMY",
    desc: "Free delivery on orders > ₹199",
    expiry: "Expires Today",
    color: "bg-orange-50 text-orange-600",
    category: "Food",
  },
];

export default function CouponsOffers() {
  // State
  const [coins, setCoins] = useState(1250); // Initial User Coins
  const [streak, setStreak] = useState(4); // Current Day (e.g., Day 4)
  const [claimedToday, setClaimedToday] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState("All");

  // --- HANDLERS ---

  // 1. Claim Daily Reward
  const handleClaim = () => {
    if (claimedToday) return;
    setLoading(true);
    setTimeout(() => {
      setCoins((prev) => prev + 50); // Add 50 coins
      setClaimedToday(true);
      setLoading(false);
      toast.success("Received 50 Coins! 🎉");
    }, 800);
  };
  const [loading, setLoading] = useState(false);

  // 2. Redeem Marketplace Item
  const handleRedeem = (item) => {
    if (coins >= item.price) {
      toast((t) => (
        <span className="flex items-center gap-2">
          Processing redemption... ⏳
        </span>
      ));
      setTimeout(() => {
        setCoins((prev) => prev - item.price);
        toast.dismiss();
        toast.success(`Redeemed ${item.title} successfully!`);
      }, 1500);
    } else {
      toast.error(`You need ${item.price - coins} more coins!`, { icon: "🔒" });
    }
  };

  // 3. Copy Code
  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter Logic
  const filteredCoupons =
    filter === "All"
      ? activeCoupons
      : activeCoupons.filter((c) => c.category === filter);

  return (
    <div className="bg-gray-50 min-h-screen w-full p-4 md:p-8 font-sans">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* ================= HEADER ================= */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-extrabold flex items-center justify-center md:justify-start gap-3">
              <FiGift className="text-yellow-400" /> Rewards Club
            </h2>
            <p className="text-gray-300 mt-2">
              Earn coins, maintain streaks, and redeem exclusive vouchers.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center min-w-[120px]">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                My Coins
              </span>
              <div className="text-3xl font-bold text-yellow-400 flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-600"></div>
                {coins}
              </div>
            </div>
          </div>
        </div>

        {/* ================= 1. DAILY CHECK-IN STREAK ================= */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                📅 Daily Check-in
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Login 7 days in a row to win a <b>Super Box</b> (500 Coins)!
              </p>
            </div>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              🔥 {streak} Day Streak
            </span>
          </div>

          {/* Streak Grid */}
          <div className="flex justify-between gap-2 md:gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              // Logic for status
              let status = "locked";
              if (day < streak) status = "claimed";
              if (day === streak) status = claimedToday ? "claimed" : "active";
              if (day === 7) status = "grand"; // Last day

              return (
                <div
                  key={day}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div
                    className={`w-full aspect-square max-w-[60px] rounded-xl flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 relative
                                ${
                                  status === "claimed"
                                    ? "bg-green-50 border-green-200 text-green-600"
                                    : status === "active"
                                      ? "bg-orange-50 border-orange-400 text-orange-600 ring-4 ring-orange-100 cursor-pointer"
                                      : status === "grand"
                                        ? "bg-purple-50 border-purple-200 text-purple-600"
                                        : "bg-gray-50 border-gray-100 text-gray-300"
                                }`}
                  >
                    {status === "claimed" && <FiCheck />}
                    {status === "active" && (
                      <span className="animate-pulse">{day}</span>
                    )}
                    {status === "locked" && day !== 7 && (
                      <FiLock className="text-xs" />
                    )}
                    {day === 7 && (
                      <FiGift
                        className={
                          status === "grand"
                            ? "text-purple-500 text-xl"
                            : "text-gray-300"
                        }
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 hidden sm:block">
                    Day {day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={claimedToday || loading}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                    ${
                      claimedToday
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-200"
                    }`}
          >
            {loading
              ? "Claiming..."
              : claimedToday
                ? "Come Back Tomorrow"
                : "Claim Today's 50 Coins"}
          </button>
        </div>

        {/* ================= 2. REFERRAL BANNER ================= */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white shadow-lg shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Background shapes */}
          <div className="absolute left-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-10 -mt-10 blur-2xl"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm border border-white/20 shadow-inner">
              🚀
            </div>
            <div>
              <h3 className="text-xl font-bold">Refer & Earn ₹100</h3>
              <p className="text-indigo-100 text-sm mt-1 max-w-md">
                Invite your friends to join. When they sign up, you both get a{" "}
                <b>₹100 Scratch Card</b> instantly!
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative z-10">
            <button
              onClick={() => {
                navigator.clipboard.writeText("PRAVEEN123");
                toast.success("Referral Code Copied!");
              }}
              className="px-6 py-3 bg-black/20 border border-white/20 rounded-xl font-mono font-bold text-sm hover:bg-black/30 transition-colors flex items-center justify-center gap-2"
            >
              <FiCopy /> PRAVEEN123
            </button>
            <button className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center gap-2">
              <FiUsers /> Invite Friends
            </button>
          </div>
        </div>

        {/* ================= 3. COIN MARKETPLACE (NEW) ================= */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiStar className="text-yellow-500 fill-yellow-500" />
            <h3 className="text-xl font-bold text-gray-900">Redeem Coins</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {marketplaceItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${item.color}`}
                  >
                    {item.logo}
                  </div>
                  <div className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    🟡 {item.price}
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 mb-4">
                  {item.brand} Voucher
                </p>

                <button
                  onClick={() => handleRedeem(item)}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                >
                  Redeem Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= 4. ACTIVE COUPONS LIST ================= */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-4 border-t border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiTag className="text-indigo-500" /> Active Coupons
            </h3>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {["All", "Food", "Travel", "Shopping"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors
                           ${filter === cat ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:border-indigo-200 transition-colors"
              >
                {/* Visual Side Strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${coupon.color.split(" ")[0].replace("bg-", "bg-opacity-100 bg-")}`}
                ></div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-bold text-gray-800">
                      {coupon.brand}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase ml-auto sm:ml-2">
                      {coupon.category}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                    {coupon.desc}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiClock /> {coupon.expiry}
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center sm:items-end gap-3 min-w-[140px] border-t sm:border-t-0 sm:border-l border-dashed border-gray-200 pt-4 sm:pt-0 sm:pl-6">
                  <div
                    onClick={() => handleCopy(coupon.code, coupon.id)}
                    className="w-full group-hover:scale-105 transition-transform cursor-pointer text-center"
                  >
                    <div className="bg-indigo-50 border border-indigo-200 border-dashed text-indigo-700 font-mono font-bold text-lg py-2 px-4 rounded-lg tracking-widest mb-2">
                      {coupon.code}
                    </div>
                    {copiedId === coupon.id ? (
                      <span className="text-xs font-bold text-green-600 flex items-center justify-center gap-1">
                        <FiCheck /> COPIED
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-indigo-400 flex items-center justify-center gap-1 group-hover:text-indigo-600">
                        TAP TO COPY
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Utility Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
