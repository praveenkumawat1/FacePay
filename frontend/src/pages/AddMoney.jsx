import React, { useState, useEffect, useMemo } from "react";
import {
  FiCreditCard,
  FiSmartphone,
  FiGlobe,
  FiCheckCircle,
  FiShield,
  FiChevronRight,
  FiTag,
  FiAlertTriangle,
  FiInfo,
  FiTrash2,
  FiZap,
  FiLock,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";

// Config
const MAX_LIMIT = 50000;
const MIN_LIMIT = 10;
const QUICK_AMOUNTS = [100, 500, 1000, 2000];

// Payment Methods
const PAYMENT_METHODS = [
  {
    id: "upi",
    name: "UPI Apps",
    icon: <FiSmartphone />,
    desc: "Instant • Free",
    feePercent: 0,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: <FiCreditCard />,
    desc: "2% Fee • Secure",
    feePercent: 2,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    icon: <FiGlobe />,
    desc: "₹10 Flat Fee",
    feePercent: 0,
    flatFee: 10,
  },
];

export default function AddMoney() {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [showBillDetails, setShowBillDetails] = useState(true);

  // Mock User Data
  const currentBalance = 45.5;
  const isKycVerified = true;

  // --- DERIVED STATE ---
  const numAmount = Number(amount) || 0;

  // Fee Calculation
  const fee = selectedMethod.flatFee
    ? selectedMethod.flatFee
    : (numAmount * selectedMethod.feePercent) / 100;

  // Total
  const totalPayable = numAmount + fee;

  // Validation
  const error = useMemo(() => {
    if (numAmount > MAX_LIMIT)
      return `Max limit is ₹${MAX_LIMIT.toLocaleString()}`;
    if (amount && numAmount < MIN_LIMIT) return `Min amount is ₹${MIN_LIMIT}`;
    return null;
  }, [numAmount, amount]);

  // Smart Tip Logic
  const tip = useMemo(() => {
    if (numAmount >= 400 && numAmount < 500)
      return "Add ₹" + (500 - numAmount) + " more to unlock ₹50 Cashback!";
    return null;
  }, [numAmount]);

  // --- HANDLERS ---

  const handlePresetClick = (val) => {
    setAmount(val.toString());
    if (val >= 500 && !coupon)
      toast("Tip: Apply coupon to save money!", { icon: "💡" });
  };

  const handleApplyCoupon = () => {
    if (numAmount < 500) return toast.error("Add ₹500 or more to apply coupon");
    setCoupon({ code: "WALLET50", discount: "₹50 Cashback" });
    toast.success("Coupon Applied Successfully!");
  };

  const handlePay = () => {
    if (error || !amount) return toast.error(error || "Enter valid amount");

    setLoading(true);
    // Simulate API
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast.success("Payment Successful!");
    }, 2000);
  };

  // --- SUCCESS VIEW ---
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 animate-scale-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-50">
            <FiCheckCircle className="text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            ₹{numAmount.toLocaleString()} Added!
          </h2>
          <p className="text-gray-500 mt-2 mb-8 text-sm">
            Transaction ID:{" "}
            <span className="font-mono text-gray-900">
              TXN{Date.now().toString().slice(-6)}
            </span>
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payment Mode</span>
              <span className="font-bold">{selectedMethod.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>New Balance</span>
              <span className="font-bold text-green-600">
                ₹{(currentBalance + numAmount).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccess(false);
              setAmount("");
              setCoupon(null);
            }}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN VIEW ---
  return (
    <div className="bg-[#f8fafc] min-h-screen w-full p-4 md:p-8 font-sans flex justify-center items-start">
      <Toaster position="top-center" />

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* === LEFT COLUMN: Inputs (Span 8) === */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          {/* 1. Wallet Status Card */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex justify-between items-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                Current Balance
              </p>
              <h2 className="text-3xl font-bold">
                ₹{currentBalance.toLocaleString()}
              </h2>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-green-400 text-sm font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <FiShield /> {isKycVerified ? "KYC Verified" : "Pending"}
              </div>
            </div>
          </div>

          {/* 2. Amount Input Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Enter Amount
            </h2>

            {/* Error / Tip Bubble */}
            {(error || tip) && (
              <div
                className={`absolute top-6 right-8 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 animate-bounce-short
                        ${error ? "bg-red-50 text-red-600 border border-red-100" : "bg-indigo-50 text-indigo-600 border border-indigo-100"}`}
              >
                {error ? <FiAlertTriangle /> : <FiZap />}
                {error || tip}
              </div>
            )}

            <div className="mb-8 relative">
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 text-5xl font-bold transition-colors ${amount ? "text-gray-900" : "text-gray-300"}`}
              >
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`w-full text-6xl font-bold pl-12 outline-none border-b-2 bg-transparent pb-2 transition-colors placeholder-gray-200
                            ${error ? "border-red-500 text-red-500" : "border-gray-100 focus:border-indigo-500 text-gray-900"}`}
                autoFocus
              />
            </div>

            {/* Smart Chips */}
            <div className="flex gap-3 flex-wrap">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handlePresetClick(amt)}
                  className="px-6 py-3 rounded-2xl border border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all bg-gray-50/50"
                >
                  +₹{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Promo Code Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Available Offers
            </h3>

            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <FiTag />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 text-sm">
                      Coupon '{coupon.code}' Applied
                    </p>
                    <p className="text-xs text-green-600">{coupon.discount}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCoupon(null)}
                  className="text-gray-400 hover:text-red-500 p-2"
                >
                  <FiTrash2 />
                </button>
              </div>
            ) : (
              <div
                onClick={handleApplyCoupon}
                className="group cursor-pointer border border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-4 flex items-center justify-between hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-105 transition-transform">
                    <FiZap className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      Get ₹50 Cashback
                    </h4>
                    <p className="text-xs text-gray-500">
                      Add ₹500 or more to unlock
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                  APPLY
                </span>
              </div>
            )}
          </div>
        </div>

        {/* === RIGHT COLUMN: Payment & Summary (Span 4) === */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-6">
            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Payment Method
              </h3>
              <div className="flex flex-col gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all relative
                                    ${
                                      selectedMethod.id === method.id
                                        ? "border-indigo-600 bg-indigo-50/50 z-10"
                                        : "border-gray-100 hover:bg-gray-50"
                                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                                    ${selectedMethod.id === method.id ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-500"}`}
                    >
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4
                          className={`font-bold text-sm ${selectedMethod.id === method.id ? "text-indigo-900" : "text-gray-900"}`}
                        >
                          {method.name}
                        </h4>
                        {selectedMethod.id === "card" && (
                          <div className="flex gap-1">
                            <div className="w-4 h-3 bg-red-500 rounded-sm"></div>
                            <div className="w-4 h-3 bg-orange-400 rounded-sm"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                    {selectedMethod.id === method.id && (
                      <FiCheckCircle className="text-indigo-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Summary (Accordion Style) */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
              <button
                onClick={() => setShowBillDetails(!showBillDetails)}
                className="w-full flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
              >
                <span>Bill Details</span>
                {showBillDetails ? <FiChevronUp /> : <FiChevronDown />}
              </button>

              {showBillDetails && (
                <div className="space-y-2 mb-3 animate-fade-in">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Add Amount</span>
                    <span>₹{numAmount.toLocaleString()}</span>
                  </div>
                  {fee > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        Convenience Fee <FiInfo className="text-[10px]" />
                      </span>
                      <span>+ ₹{fee.toLocaleString()}</span>
                    </div>
                  )}
                  {coupon && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Coupon Benefit</span>
                      <span>{coupon.discount}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200 border-dashed">
                <span>To Pay</span>
                <span>₹{totalPayable.toLocaleString()}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={loading || !!error || !amount}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="flex items-center gap-2 animate-pulse">
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Pay Securely{" "}
                  <FiLock className="group-hover:text-green-400 transition-colors" />
                </span>
              )}
            </button>

            <div className="mt-4 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1">
              <FiShield className="text-green-500" />
              Encrypted by 256-bit SSL
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-fade-in { animation: fadeIn 0.3s ease-in; }
        .animate-bounce-short { animation: bounceShort 1s infinite; }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounceShort { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      `}</style>
    </div>
  );
}
