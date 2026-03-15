import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiSmartphone,
  FiCreditCard,
  FiGlobe,
  FiCamera,
  FiCheckCircle,
  FiLock,
  FiShield,
  FiTag,
  FiZap,
  FiAlertTriangle,
  FiChevronRight,
  FiChevronLeft,
  FiCopy,
  FiRefreshCw,
  FiClock,
} from "react-icons/fi";

// ─── Constants ────────────────────────────────────────────
const MAX_LIMIT = 50000;
const MIN_LIMIT = 10;
const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000];
const API_BASE =
  (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) ||
  "http://localhost:5000/api";

const PAYMENT_METHODS = [
  {
    id: "upi",
    name: "UPI Apps",
    icon: <FiSmartphone size={18} />,
    desc: "Instant • Free",
    feePercent: 0,
    flatFee: 0,
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    icon: <FiCreditCard size={18} />,
    desc: "2% convenience fee",
    feePercent: 2,
    flatFee: 0,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    icon: <FiGlobe size={18} />,
    desc: "₹10 flat fee",
    feePercent: 0,
    flatFee: 10,
  },
  {
    id: "qr",
    name: "Scan & Pay (QR)",
    icon: <FiCamera size={18} />,
    desc: "Instant • Free",
    feePercent: 0,
    flatFee: 0,
    badge: "New",
  },
];

const OFFERS = [
  {
    code: "WALLET50",
    title: "₹50 Cashback",
    desc: "Add ₹500+ via any method",
    minAmount: 500,
    validPayment: ["upi", "card", "netbanking", "qr"],
  },
  {
    code: "FOODFEST",
    title: "₹100 Food Cashback",
    desc: "Add ₹800+ via Card only",
    minAmount: 800,
    validPayment: ["card"],
  },
];

// ─── Helpers ───────────────────────────────────────────────
const calcFee = (method, amount) => {
  if (!method || !amount) return 0;
  if (method.flatFee) return method.flatFee;
  return parseFloat(((amount * method.feePercent) / 100).toFixed(2));
};

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// ─── QR Display ────────────────────────────────────────────
function QRDisplay({ amount, walletId }) {
  const [timeLeft, setTimeLeft] = useState(300);
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const expired = timeLeft === 0;
  const CELLS = 19,
    CELL = 160 / CELLS;
  const seed = (walletId || "W1234") + String(amount);
  const hashAt = (r, c) => {
    let h = 0,
      s = seed + r * 97 + c;
    for (let i = 0; i < s.length; i++)
      h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
    return h;
  };
  const isCorner = (r, c) =>
    (r < 6 && c < 6) || (r < 6 && c >= CELLS - 6) || (r >= CELLS - 6 && c < 6);
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="relative bg-white rounded-2xl p-4 shadow-md border-2 border-indigo-100">
        <svg width={160} height={160}>
          {Array.from({ length: CELLS }, (_, r) =>
            Array.from({ length: CELLS }, (_, c) => {
              const filled = isCorner(r, c) ? true : hashAt(r, c) % 3 !== 0;
              return filled ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * CELL + 0.5}
                  y={r * CELL + 0.5}
                  width={CELL - 1}
                  height={CELL - 1}
                  fill={isCorner(r, c) ? "#312e81" : "#4f46e5"}
                  rx="1"
                />
              ) : null;
            }),
          )}
        </svg>
        {expired && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl gap-2">
            <FiRefreshCw className="text-red-400 text-2xl" />
            <span className="text-xs font-bold text-red-500">
              QR Expired — go back and retry
            </span>
          </div>
        )}
      </div>
      <div
        className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timeLeft < 60 ? "text-red-500" : "text-emerald-600"}`}
      >
        <FiClock size={13} /> {expired ? "Expired" : `${mm}:${ss} remaining`}
      </div>
      <div className="text-center">
        <div className="text-2xl font-extrabold text-slate-800">
          {fmt(amount)}
        </div>
        <div className="text-xs text-slate-400 font-mono mt-0.5">
          UPI ID: facepay@upi
        </div>
      </div>
      <p className="text-xs text-slate-500 text-center px-4 leading-relaxed">
        Open any UPI app → Scan QR → Enter amount → Pay
      </p>
    </div>
  );
}

// ─── Progress Ring ─────────────────────────────────────────
function ProgressRing({ percent }) {
  const r = 34,
    circ = 2 * Math.PI * r;
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width={88} height={88} className="-rotate-90">
        <circle
          cx={44}
          cy={44}
          r={r}
          stroke="#e0e7ff"
          strokeWidth={7}
          fill="none"
        />
        <circle
          cx={44}
          cy={44}
          r={r}
          stroke="url(#prg)"
          strokeWidth={7}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ - (Math.min(percent, 100) / 100) * circ}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.25s ease" }}
        />
        <defs>
          <linearGradient id="prg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-indigo-700 font-extrabold text-xl select-none">
        {Math.min(percent, 100)}%
      </span>
    </div>
  );
}

// ─── MAIN MODAL ────────────────────────────────────────────
/**
 * Props:
 *  open       {boolean}   — show/hide modal
 *  onClose    {function}  — close callback
 *  onAdd      {function}  — (amount, apiData|null) => void — called on success ONLY
 *  walletId   {string}    — optional, shown on QR screen
 *  darkMode   {boolean}   — enable dark theme
 */
export default function AddMoneyModal({
  open,
  onClose,
  onAdd,
  walletId,
  darkMode,
}) {
  const [step, setStep] = useState("amount");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponErr, setCouponErr] = useState("");
  const [progress, setProgress] = useState(0);
  const [txnId, setTxnId] = useState("");
  const [copied, setCopied] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const inputRef = useRef(null);
  const timerRef = useRef(null); // progress interval ref

  const numAmount = parseFloat(amount) || 0;
  const fee = calcFee(method, numAmount);
  const total = parseFloat((numAmount + fee).toFixed(2));

  const amountError = useMemo(() => {
    if (!amount) return null;
    if (numAmount < MIN_LIMIT) return `Minimum is ${fmt(MIN_LIMIT)}`;
    if (numAmount > MAX_LIMIT) return `Maximum is ${fmt(MAX_LIMIT)}`;
    return null;
  }, [numAmount, amount]);

  const upsellTip = useMemo(() => {
    if (numAmount >= 400 && numAmount < 500)
      return `Add ${fmt(500 - numAmount)} more → unlock ₹50 cashback!`;
    if (numAmount >= 700 && numAmount < 800 && method.id === "card")
      return `Add ${fmt(800 - numAmount)} more → ₹100 food cashback!`;
    return null;
  }, [numAmount, method]);

  // Reset when modal opens
  useEffect(() => {
    if (!open) return;
    setStep("amount");
    setAmount("");
    setMethod(PAYMENT_METHODS[0]);
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponErr("");
    setProgress(0);
    setTxnId("");
    setApiErr("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Cleanup timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Coupon ────────────────────────────────────────────────
  const applyCoupon = () => {
    setCouponErr("");
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponErr("Enter a coupon code.");
      return;
    }
    const offer = OFFERS.find((o) => o.code === code);
    if (!offer) {
      setCouponErr("Invalid coupon code.");
      return;
    }
    if (!offer.validPayment.includes(method.id)) {
      setCouponErr(`"${code}" not valid for ${method.name}.`);
      return;
    }
    if (numAmount < offer.minAmount) {
      setCouponErr(`Need ${fmt(offer.minAmount)}+ to apply "${code}".`);
      return;
    }
    setAppliedCoupon(offer);
    setCouponInput("");
  };

  // ── Pay ───────────────────────────────────────────────────
  const handlePay = async () => {
    setStep("processing");
    setProgress(0);
    setApiErr("");

    // Animate to 90%
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.round(Math.random() * 9 + 6);
      if (p >= 90) {
        p = 90;
        clearInterval(timerRef.current);
      }
      setProgress(p);
    }, 100);

    try {
      const token = localStorage.getItem("facepay_token");
      const res = await fetch(`${API_BASE}/dashboard/add-money`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: numAmount,
          payment_method: method.id,
          coupon: appliedCoupon?.code || null,
        }),
      });
      clearInterval(timerRef.current);
      setProgress(100);
      const data = await res.json().catch(() => ({}));
      await new Promise((r) => setTimeout(r, 380));

      if (res.ok && data.success) {
        setTxnId(data.transaction?.id || "TXN" + String(Date.now()).slice(-8));
        // Call parent BEFORE changing step
        if (typeof onAdd === "function") {
          try {
            onAdd(numAmount, data);
          } catch {}
        }
        setStep("success");
        try {
          const mod = await import("canvas-confetti");
          (mod.default || mod)({
            particleCount: 130,
            spread: 75,
            origin: { y: 0.55 },
          });
        } catch {}
      } else {
        setApiErr(data.message || "Payment was declined.");
        setStep("fail");
      }
    } catch {
      // Network error / no server → demo mode
      clearInterval(timerRef.current);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 380));
      if (Math.random() > 0.1) {
        setTxnId("TXN" + String(Date.now()).slice(-8));
        if (typeof onAdd === "function") {
          try {
            onAdd(numAmount, null);
          } catch {}
        }
        setStep("success");
        try {
          const mod = await import("canvas-confetti");
          (mod.default || mod)({
            particleCount: 130,
            spread: 75,
            origin: { y: 0.55 },
          });
        } catch {}
      } else {
        setApiErr("Network error. Please try again.");
        setStep("fail");
      }
    }
  };

  // ── Copy txn ──────────────────────────────────────────────
  const copyTxn = () => {
    navigator.clipboard.writeText(txnId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  // ── Theme ─────────────────────────────────────────────────
  const dm = darkMode;
  const bg = dm ? "bg-slate-900" : "bg-white";
  const surface = dm
    ? "bg-slate-800 border-slate-700"
    : "bg-slate-50 border-slate-200";
  const txtMain = dm ? "text-slate-100" : "text-slate-900";
  const txtSub = dm ? "text-slate-400" : "text-slate-500";
  const inp = `w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none transition ${
    dm
      ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 focus:border-indigo-500"
      : "bg-white border-slate-200 text-slate-900 focus:border-indigo-400"
  }`;

  // ── Don't render if closed ─────────────────────────────────
  if (!open) return null;

  const TITLES = {
    amount: ["Add Money", "How much do you want to add?"],
    method: ["Payment Method", "Choose how you want to pay"],
    confirm: ["Confirm Payment", "Review before you pay"],
    processing: ["Processing…", "Please wait, do not close"],
    success: ["Money Added! 🎉", "Your wallet has been credited"],
    fail: ["Payment Failed", "Something went wrong"],
  };
  const canBack = step === "method" || step === "confirm";
  const goBack = () =>
    step === "method" ? setStep("amount") : setStep("method");

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(5px)",
      }}
      onClick={step !== "processing" ? onClose : undefined}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col ${bg}`}
        style={{
          maxHeight: "95vh",
          boxShadow: "0 30px 80px rgba(79,70,229,0.22)",
        }}
      >
        {/* Header */}
        <div
          className={`px-6 pt-5 pb-4 border-b flex-shrink-0 ${dm ? "border-slate-800" : "border-slate-100"}`}
        >
          <div className="flex items-center gap-2">
            {canBack && (
              <button
                onClick={goBack}
                className={`p-1.5 rounded-xl flex-shrink-0 transition ${dm ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <FiChevronLeft size={18} />
              </button>
            )}
            <div className="flex-1 min-w-0">
              <h2 className={`font-bold text-lg leading-tight ${txtMain}`}>
                {TITLES[step][0]}
              </h2>
              <p className={`text-xs mt-0.5 ${txtSub}`}>{TITLES[step][1]}</p>
            </div>
            {step !== "processing" && (
              <button
                onClick={onClose}
                className={`flex-shrink-0 p-2 rounded-xl transition ${dm ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-400"}`}
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          {["amount", "method", "confirm"].includes(step) && (
            <div className="flex gap-1.5 mt-4">
              {["amount", "method", "confirm"].map((s, i) => {
                const cur = ["amount", "method", "confirm"].indexOf(step);
                return (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === cur
                        ? "bg-indigo-500 flex-[2.5]"
                        : i < cur
                          ? "bg-indigo-300 flex-1"
                          : dm
                            ? "bg-slate-700 flex-1"
                            : "bg-slate-200 flex-1"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-6 py-5">
            {/* ── AMOUNT ── */}
            {step === "amount" && (
              <div>
                <div className="mb-6">
                  <div
                    className={`flex items-end gap-2 pb-2 border-b-2 transition ${amountError ? "border-red-400" : "border-indigo-200 focus-within:border-indigo-500"}`}
                  >
                    <span
                      className={`text-4xl font-bold pb-1 ${amount ? txtMain : "text-slate-300"}`}
                    >
                      ₹
                    </span>
                    <input
                      ref={inputRef}
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      min={MIN_LIMIT}
                      max={MAX_LIMIT}
                      className={`flex-1 text-5xl font-extrabold bg-transparent outline-none pb-1 placeholder-slate-200 ${amountError ? "text-red-500" : txtMain}`}
                    />
                  </div>
                  {amountError && (
                    <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1">
                      <FiAlertTriangle size={12} />
                      {amountError}
                    </p>
                  )}
                  {upsellTip && !amountError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <FiZap size={12} />
                      {upsellTip}
                    </motion.p>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-2 mb-5">
                  {QUICK_AMOUNTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAmount(String(a))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        amount === String(a)
                          ? "bg-indigo-600 text-white border-indigo-600 scale-105 shadow-md"
                          : dm
                            ? "border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-300"
                            : "border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50"
                      }`}
                    >
                      {a >= 1000 ? `₹${a / 1000}k` : `₹${a}`}
                    </button>
                  ))}
                </div>
                <div className={`flex justify-between text-xs mb-6 ${txtSub}`}>
                  <span>Min: ₹{MIN_LIMIT}</span>
                  <span>Max: ₹{MAX_LIMIT.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={() => setStep("method")}
                  disabled={!amount || !!amountError || numAmount <= 0}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-bold
                    disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all
                    flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  Continue <FiChevronRight size={18} />
                </button>
              </div>
            )}

            {/* ── METHOD ── */}
            {step === "method" && (
              <div>
                <div
                  className={`text-center mb-5 py-3 rounded-2xl font-extrabold text-2xl text-indigo-600 ${dm ? "bg-slate-800" : "bg-indigo-50"}`}
                >
                  {fmt(numAmount)}
                </div>
                <div className="flex flex-col gap-3 mb-5">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMethod(m);
                        if (
                          appliedCoupon &&
                          !appliedCoupon.validPayment.includes(m.id)
                        )
                          setAppliedCoupon(null);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        method.id === m.id
                          ? "border-indigo-500 bg-indigo-50/80"
                          : dm
                            ? "border-slate-700 bg-slate-800/40 hover:border-slate-500"
                            : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                          method.id === m.id
                            ? "bg-indigo-600 text-white"
                            : dm
                              ? "bg-slate-700 text-slate-400"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-bold text-sm flex items-center gap-2 ${method.id === m.id ? "text-indigo-700" : txtMain}`}
                        >
                          {m.name}
                          {m.badge && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <div className={`text-xs mt-0.5 ${txtSub}`}>
                          {m.desc}
                        </div>
                      </div>
                      {method.id === m.id && (
                        <FiCheckCircle
                          className="text-indigo-500 flex-shrink-0"
                          size={18}
                        />
                      )}
                    </button>
                  ))}
                </div>
                {/* Coupon */}
                {!appliedCoupon ? (
                  <div className={`rounded-2xl p-4 border mb-5 ${surface}`}>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1 ${txtSub}`}
                    >
                      <FiTag size={11} /> Apply Coupon
                    </p>
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setCouponErr("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        placeholder="e.g. WALLET50"
                        className={inp}
                      />
                      <button
                        onClick={applyCoupon}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition flex-shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    {couponErr && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <FiAlertTriangle size={11} />
                        {couponErr}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {OFFERS.map((o) => (
                        <button
                          key={o.code}
                          onClick={() => {
                            setCouponInput(o.code);
                            setCouponErr("");
                          }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                            dm
                              ? "border-indigo-700 text-indigo-400"
                              : "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                          }`}
                        >
                          {o.code}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5"
                  >
                    <div>
                      <p className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                        <FiCheckCircle size={14} />
                        {appliedCoupon.code} Applied
                      </p>
                      <p className="text-emerald-600 text-xs mt-0.5">
                        {appliedCoupon.title}
                      </p>
                    </div>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition"
                    >
                      <FiX size={15} />
                    </button>
                  </motion.div>
                )}
                <button
                  onClick={() => setStep("confirm")}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-bold
                    hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  Review Payment <FiChevronRight size={18} />
                </button>
              </div>
            )}

            {/* ── CONFIRM ── */}
            {step === "confirm" && (
              <div>
                {method.id === "qr" ? (
                  <div>
                    <QRDisplay amount={numAmount} walletId={walletId} />
                    <div className="mt-5 space-y-3">
                      <button
                        onClick={handlePay}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-bold
                          hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                      >
                        <FiCheckCircle size={18} /> I've Paid {fmt(numAmount)}
                      </button>
                      <p className={`text-xs text-center ${txtSub}`}>
                        Tap only after completing payment in your UPI app
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className={`rounded-2xl p-5 border mb-5 ${surface}`}>
                      <p
                        className={`text-xs font-bold uppercase tracking-wider mb-3 ${txtSub}`}
                      >
                        Bill Summary
                      </p>
                      <div className="space-y-3">
                        <div
                          className={`flex justify-between text-sm ${txtMain}`}
                        >
                          <span className={txtSub}>Amount</span>
                          <span className="font-bold">{fmt(numAmount)}</span>
                        </div>
                        {fee > 0 && (
                          <div
                            className={`flex justify-between text-sm ${txtMain}`}
                          >
                            <span className={txtSub}>
                              {method.flatFee
                                ? "Flat Fee"
                                : `Fee (${method.feePercent}%)`}
                            </span>
                            <span>+ {fmt(fee)}</span>
                          </div>
                        )}
                        {appliedCoupon && (
                          <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                            <span>Coupon ({appliedCoupon.code})</span>
                            <span>{appliedCoupon.title}</span>
                          </div>
                        )}
                        <div
                          className={`flex justify-between font-extrabold text-lg pt-3 border-t ${dm ? "border-slate-700" : "border-slate-200"} ${txtMain}`}
                        >
                          <span>Total Payable</span>
                          <span className="text-indigo-600">{fmt(total)}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-4 rounded-2xl mb-6 ${dm ? "bg-slate-800" : "bg-indigo-50/60"}`}
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                        {method.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${txtMain}`}>
                          {method.name}
                        </p>
                        <p className={`text-xs ${txtSub}`}>{method.desc}</p>
                      </div>
                      <button
                        onClick={() => setStep("method")}
                        className={`text-xs font-bold flex-shrink-0 ${dm ? "text-indigo-400" : "text-indigo-600"}`}
                      >
                        Change
                      </button>
                    </div>
                    <button
                      onClick={handlePay}
                      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-bold
                        hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-200/60"
                    >
                      <FiLock size={16} /> Pay Securely {fmt(total)}
                    </button>
                    <p
                      className={`flex items-center justify-center gap-1.5 mt-3 text-xs ${txtSub}`}
                    >
                      <FiShield className="text-emerald-500" size={12} />{" "}
                      256-bit SSL Encrypted
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── PROCESSING ── */}
            {step === "processing" && (
              <div className="flex flex-col items-center py-10 gap-6">
                <ProgressRing percent={progress} />
                <div className="text-center space-y-1">
                  <p className={`font-bold text-base ${txtMain}`}>
                    {progress < 35
                      ? "Initiating payment…"
                      : progress < 65
                        ? "Verifying transaction…"
                        : progress < 88
                          ? "Crediting your wallet…"
                          : "Almost done…"}
                  </p>
                  <p className={`text-sm ${txtSub}`}>
                    Do not close this window
                  </p>
                </div>
                <div
                  className={`w-full rounded-full h-2 overflow-hidden ${dm ? "bg-slate-700" : "bg-slate-100"}`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* ── SUCCESS ── */}
            {step === "success" && (
              <div className="flex flex-col items-center py-6 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 18,
                    delay: 0.05,
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full
                    flex items-center justify-center mb-6 shadow-2xl shadow-emerald-200"
                >
                  <FiCheckCircle className="text-white" size={44} />
                </motion.div>
                <h3 className={`text-2xl font-extrabold mb-1 ${txtMain}`}>
                  {fmt(numAmount)} Added!
                </h3>
                <p className={`text-sm mb-6 ${txtSub}`}>
                  Your wallet has been credited successfully.
                </p>
                <div
                  className={`w-full rounded-2xl p-5 border text-left space-y-3 text-sm mb-6 ${surface}`}
                >
                  <div className={`flex justify-between ${txtMain}`}>
                    <span className={txtSub}>Amount Credited</span>
                    <span className="font-bold text-emerald-600">
                      {fmt(numAmount)}
                    </span>
                  </div>
                  {fee > 0 && (
                    <div className={`flex justify-between ${txtMain}`}>
                      <span className={txtSub}>Fee Paid</span>
                      <span className="font-semibold">{fmt(fee)}</span>
                    </div>
                  )}
                  <div className={`flex justify-between ${txtMain}`}>
                    <span className={txtSub}>Payment Method</span>
                    <span className="font-bold">{method.name}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon</span>
                      <span>{appliedCoupon.code}</span>
                    </div>
                  )}
                  {txnId && (
                    <div
                      className={`flex justify-between items-center pt-2 border-t ${dm ? "border-slate-700" : "border-slate-200"}`}
                    >
                      <span className={txtSub}>Transaction ID</span>
                      <button
                        onClick={copyTxn}
                        className={`flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                          copied
                            ? "bg-emerald-100 text-emerald-700"
                            : dm
                              ? "bg-slate-700 text-indigo-400"
                              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        }`}
                      >
                        #{txnId}{" "}
                        {copied ? (
                          <FiCheckCircle size={12} />
                        ) : (
                          <FiCopy size={12} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all"
                >
                  Done
                </button>
              </div>
            )}

            {/* ── FAIL ── */}
            {step === "fail" && (
              <div className="flex flex-col items-center py-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 18,
                    delay: 0.05,
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-red-400 to-rose-500 rounded-full
                    flex items-center justify-center mb-6 shadow-2xl shadow-red-100"
                >
                  <FiAlertTriangle className="text-white" size={40} />
                </motion.div>
                <h3 className={`text-xl font-extrabold mb-2 ${txtMain}`}>
                  Payment Failed
                </h3>
                {apiErr && (
                  <p className="text-sm text-red-500 mb-2 font-medium">
                    {apiErr}
                  </p>
                )}
                <p className={`text-sm mb-8 ${txtSub}`}>
                  Your wallet is safe. Debited amount will be refunded in 2–5
                  working days.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setProgress(0);
                      setApiErr("");
                      setStep("confirm");
                    }}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition-all"
                  >
                    Retry
                  </button>
                  <button
                    onClick={onClose}
                    className={`flex-1 py-3.5 rounded-2xl font-bold border transition-all ${
                      dm
                        ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
