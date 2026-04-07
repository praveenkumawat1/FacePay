import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import {
  FiX,
  FiCamera,
  FiUser,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiDollarSign,
  FiZap,
  FiInfo,
  FiRefreshCw,
  FiSend,
  FiLock,
  FiClock,
  FiDownload,
  FiArrowLeft,
  FiTarget,
  FiGift,
  FiUserPlus,
} from "react-icons/fi";

// ─── STEP CONSTANTS ─────────────────────────────────────────────────────────
const STEPS = {
  INTRO: "intro",
  SELECTION: "selection",
  FACE_SCAN: "face_scan",
  AMOUNT: "amount",
  CONFIRM: "confirm",
  SUCCESS: "success",
};

// ─── OVERLAY BACKDROP ────────────────────────────────────────────────────────
const Backdrop = ({ onClick }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
  />
);

// ─── SELECTION POPUP (NEW) ───────────────────────────────────────────────────
const SelectionPopup = ({ onSelect, darkMode }) => {
  const dm = darkMode;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`relative w-full max-w-sm rounded-[2.5rem] p-8 overflow-hidden shadow-2xl z-50 ${
        dm
          ? "bg-slate-900 border border-slate-800"
          : "bg-white border border-slate-100"
      }`}
    >
      <div className="text-center mb-8">
        <h3
          className={`text-2xl font-black mb-2 ${dm ? "text-white" : "text-slate-900"}`}
        >
          Recipient Mode
        </h3>
        <p
          className={`text-sm font-medium ${dm ? "text-slate-400" : "text-slate-500"}`}
        >
          Scan the face of the person you want to send money to
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("send")}
          className={`group flex items-center gap-4 p-5 rounded-[1.75rem] transition-all border-2 ${
            dm
              ? "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40"
              : "bg-indigo-50 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <FiCamera size={24} />
          </div>
          <div className="text-left">
            <h4
              className={`font-bold text-lg ${dm ? "text-white" : "text-slate-900"}`}
            >
              Scan Face (Pay)
            </h4>
            <p className="text-xs font-semibold opacity-60">
              Identity verification via AWS
            </p>
          </div>
          <FiArrowRight className="ml-auto opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("request")}
          className={`group flex items-center gap-4 p-5 rounded-[1.75rem] transition-all border-2 ${
            dm
              ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-200/40"
              : "bg-emerald-50 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <FiUserPlus size={24} />
          </div>
          <div className="text-left">
            <h4
              className={`font-bold text-lg ${dm ? "text-white" : "text-slate-900"}`}
            >
              Scan Face (Request)
            </h4>
            <p className="text-xs font-semibold opacity-60">
              Request money via biometrics
            </p>
          </div>
          <FiArrowRight className="ml-auto opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── PARTICLES BACKGROUND (subtle, aesthetic) ───────────────────────────────
const ParticlesBackground = ({ count = 20, color = "rgb(59,130,246)" }) => {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const generated = Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      speed: 0.01 + Math.random() * 0.04,
      delay: Math.random() * 5,
    }));
    setParticles(generated);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            filter: "blur(1px)",
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 4 + p.speed * 10,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// ─── INTRO POPUP (Clean & Minimal Design) ───────────────────────────────────
const IntroPopup = ({ onNext, onClose, darkMode }) => {
  const dm = darkMode;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`relative w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl z-50 ${
        dm
          ? "bg-slate-900 border border-slate-800"
          : "bg-white border border-slate-100"
      }`}
    >
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dm ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}
          >
            <FiZap size={24} />
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${dm ? "hover:bg-white/5 text-slate-500" : "hover:bg-slate-50 text-slate-400"}`}
          >
            <FiX size={20} />
          </button>
        </div>

        <h3
          className={`text-2xl font-bold mb-2 ${dm ? "text-white" : "text-slate-900"}`}
        >
          Scan to Pay
        </h3>
        <p
          className={`text-sm leading-relaxed mb-8 ${dm ? "text-slate-400" : "text-slate-500"}`}
        >
          Identify recipient by scanning their face. Funds are transferred
          instantly to their wallet once verified.
        </p>

        <div className="space-y-4 mb-8">
          {[
            { icon: <FiTarget />, text: "Direct P2P Transfers" },
            { icon: <FiShield />, text: "AWS Face Security" },
            { icon: <FiClock />, text: "Instant Settlements" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`text-lg ${dm ? "text-indigo-400" : "text-indigo-500"}`}
              >
                {item.icon}
              </div>
              <span
                className={`text-xs font-semibold ${dm ? "text-slate-300" : "text-slate-600"}`}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
        >
          Get Started <FiArrowRight />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── FACE SCAN POPUP (refined visuals) ───────────────────────────────────────
const FaceScanPopup = ({ onSuccess, onClose, darkMode }) => {
  const dm = darkMode;
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("ready");
  const [countdown, setCountdown] = useState(3);
  const [scanProgress, setScanProgress] = useState(0);
  const [challengeStep, setChallengeStep] = useState(0);
  const particlesRef = useRef([]);
  const scanAnimationRef = useRef(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.001 + Math.random() * 0.002,
      size: 1 + Math.random() * 2,
    }));
  }, []);

  // Auto-start countdown
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === "ready") {
        handleStartScan();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Countdown logic
  useEffect(() => {
    if (step === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === "countdown" && countdown === 0) {
      captureMultipleFrames();
    }
  }, [step, countdown]);

  // Scanning animation
  useEffect(() => {
    if (step === "scanning") {
      scanAnimationRef.current = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(scanAnimationRef.current);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      const animateCanvas = () => {
        if (canvasRef.current && step === "scanning") {
          const ctx = canvasRef.current.getContext("2d");
          const canvas = canvasRef.current;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          drawParticles(ctx, canvas.width, canvas.height);
          drawScanLine(ctx, canvas.width, canvas.height, scanProgress);

          requestAnimationFrame(animateCanvas);
        }
      };

      animateCanvas();
    }

    return () => {
      if (scanAnimationRef.current) {
        clearInterval(scanAnimationRef.current);
      }
    };
  }, [step, scanProgress]);

  const drawParticles = (ctx, width, height) => {
    particlesRef.current.forEach((particle) => {
      particle.y = (particle.y + particle.speed) % 1;
      const x = particle.x * width;
      const y = particle.y * height;
      ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawScanLine = (ctx, width, height, progress) => {
    const scanY = (height * progress) / 100;

    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#3b82f6";
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(width, scanY);
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, 0, scanY);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, scanY);

    ctx.shadowBlur = 0;
  };

  const handleStartScan = () => {
    setError("");
    setStep("countdown");
    setCountdown(3);
  };

  const captureMultipleFrames = async () => {
    try {
      setStep("scanning");
      setLoading(true);

      const frames = [];

      for (let i = 0; i < 3; i++) {
        setChallengeStep(i + 1);

        const frame = webcamRef.current?.getScreenshot();
        if (!frame) {
          throw new Error("Failed to capture frame " + (i + 1));
        }

        frames.push(frame);

        if (i < 2) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      const token = localStorage.getItem("facepay_token");
      const res = await fetch("http://localhost:5000/api/aws-face/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: frames[1], // Send full data URL (Backend now handles stripping)
          frames: frames,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setStep("success");
        setTimeout(() => {
          onSuccess({
            ...data.user,
            name: data.user.full_name || data.user.name,
            id: data.user._id || data.user.id,
          });
        }, 1500);
      } else {
        setError(data.message || "Face not recognized. Please try again.");
        setStep("error");
      }
    } catch (err) {
      console.error("Face search error:", err);
      setError("Network error. Please try again.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError("");
    setStep("ready");
    setChallengeStep(0);
    setScanProgress(0);
    handleStartScan();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 30 }}
      className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl z-50 ${
        dm
          ? "bg-slate-900/90 backdrop-blur-xl border border-slate-700/50"
          : "bg-white border border-slate-200"
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500">
              <FiCamera size={18} />
            </div>
            <h3 className={`font-bold ${dm ? "text-white" : "text-slate-900"}`}>
              Scan Recipient's Face
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${dm ? "hover:bg-white/5 text-slate-500" : "hover:bg-slate-50 text-slate-400"}`}
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-6">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            width={640}
            height={480}
          />

          {/* Overlays based on step */}
          {step === "countdown" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl font-black text-white"
              >
                {countdown}
              </motion.div>
            </div>
          )}

          {step === "scanning" && (
            <div className="absolute top-4 left-4 bg-indigo-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              ANALYZING BIOMETRICS
            </div>
          )}

          {step === "success" && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl"
              >
                <FiCheckCircle size={40} className="text-green-500" />
              </motion.div>
            </div>
          )}
        </div>

        {error ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-red-500 mb-4">
              <FiAlertCircle />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p
              className={`text-sm font-medium mb-2 ${dm ? "text-slate-400" : "text-slate-500"}`}
            >
              {step === "ready"
                ? "Preparing scanner..."
                : step === "countdown"
                  ? "Hold steady..."
                  : step === "scanning"
                    ? `Scanning: Frame ${challengeStep}/3`
                    : "Verified Successfully!"}
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── AMOUNT POPUP (refined) ──────────────────────────────────────────────────
const AmountPopup = ({
  recipient,
  walletBalance,
  onConfirm,
  onClose,
  darkMode,
  mode, // "send" or "receive"
}) => {
  const dm = darkMode;
  const isSend = mode === "send";
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [checking, setChecking] = useState(false);
  const [balanceOk, setBalanceOk] = useState(null);
  const [liveBalance, setLiveBalance] = useState(walletBalance);
  const [error, setError] = useState("");

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("facepay_token");
        const res = await fetch("http://localhost:5000/api/wallet/balance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.balance !== undefined) {
          setLiveBalance(data.balance);
        }
      } catch (err) {
        console.error("Balance fetch error:", err);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setError("");
    setBalanceOk(null);
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    const num = Number(amount);

    // For "receive", we check the OTHER person's balance (simulated or via prompt if possible)
    // But logically, for "send", we check OUR balance.
    if (isSend) {
      if (num > liveBalance) {
        setBalanceOk(false);
        setError(
          `Insufficient balance! You have only ₹${liveBalance.toFixed(2)}.`,
        );
      } else if (num < 1) {
        setBalanceOk(false);
        setError("Minimum ₹1 is required.");
      } else {
        setBalanceOk(true);
      }
    } else {
      // For receive, we don't strictly check OUR balance, but maybe a limit
      if (num < 1) {
        setBalanceOk(false);
        setError("Minimum ₹1 is required.");
      } else {
        setBalanceOk(true);
      }
    }
  }, [amount, liveBalance, isSend]);

  const handlePay = async () => {
    if (!balanceOk && isSend) return;
    if (!amount || Number(amount) <= 0) return;

    setChecking(true);
    try {
      if (isSend) {
        const token = localStorage.getItem("facepay_token");
        const res = await fetch("http://localhost:5000/api/wallet/balance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.success || data.balance < Number(amount)) {
          setError("Balance check failed or insufficient funds.");
          setChecking(false);
          return;
        }
      }

      setChecking(false);
      onConfirm({ amount: Number(amount), note, recipient, mode });
    } catch (err) {
      console.error("Pay confirm error:", err);
      setError("Network error. Please try again.");
      setChecking(false);
    }
  };

  const remaining = isSend ? liveBalance - (Number(amount) || 0) : liveBalance;

  const balanceOkStatus = isSend
    ? Number(amount) > 0 && Number(amount) <= liveBalance
    : Number(amount) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 30 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`relative w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl z-50 ${
        dm
          ? "bg-slate-950 border border-slate-800"
          : "bg-white border border-slate-200"
      }`}
    >
      <div
        className={`p-6 border-b ${dm ? "border-white/5" : "border-slate-100"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500">
              {isSend ? <FiSend size={24} /> : <FiDownload size={24} />}
            </div>
            <div>
              <h3
                className={`font-black text-lg ${dm ? "text-white" : "text-slate-900"}`}
              >
                {isSend ? "Send Money" : "Receive Money"}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                Wallet Transaction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <FiX size={20} className="opacity-40" />
          </button>
        </div>

        <div
          className={`flex items-center gap-4 p-5 rounded-3xl ${dm ? "bg-white/5" : "bg-slate-50"}`}
        >
          <img
            src={
              recipient?.imageUrl ||
              recipient?.profile_picture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient?.name || "User")}&background=4f46e5&color=fff`
            }
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20"
            alt="Profile"
          />
          <div>
            <p
              className={`font-black text-xl ${dm ? "text-white" : "text-slate-900"}`}
            >
              {recipient?.name}
            </p>
            <div className="flex flex-col gap-0.5 mt-0.5">
              <p
                className={`text-[10px] font-bold tracking-wider uppercase ${dm ? "text-slate-500" : "text-slate-400"}`}
              >
                UPI ID / WALLET
              </p>
              <p
                className={`text-xs font-mono font-bold ${dm ? "text-indigo-400" : "text-indigo-600"}`}
              >
                {recipient?.upi_id ||
                  (recipient?.wallet_id
                    ? `WID-${recipient.wallet_id.toString().slice(-6).toUpperCase()}`
                    : "NOT-FOUND")}
              </p>
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-tighter opacity-30">
              Identity
            </span>
            <div
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${dm ? "bg-green-500/10 text-green-400" : "bg-green-50 text-green-600"}`}
            >
              <FiCheckCircle size={10} />{" "}
              {recipient?.is_verified ? "RECOGNIZED" : "VERIFIED"}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-6 relative">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block ml-2">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-indigo-500">
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full bg-transparent border-0 pl-14 pr-4 py-4 text-4xl font-black focus:ring-0 focus:outline-none ${dm ? "text-white placeholder-white/10" : "text-slate-900 placeholder-slate-200"}`}
              autoFocus
            />
          </div>
        </div>

        <div className="mb-6 relative">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block ml-2">
            Add a Note (Optional)
          </label>
          <div
            className={`relative flex items-center p-4 rounded-2xl ${dm ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-100"}`}
          >
            <FiZap className="text-indigo-500 mr-3" />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this for?"
              className={`w-full bg-transparent border-0 p-0 text-sm font-bold focus:ring-0 focus:outline-none ${dm ? "text-white placeholder-white/10" : "text-slate-900 placeholder-slate-400"}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8">
          {quickAmounts.slice(0, 3).map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt.toString())}
              className={`py-3 rounded-2xl font-black text-xs transition-all ${
                amount === amt.toString()
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : dm
                    ? "bg-white/5 text-slate-400 hover:bg-white/10"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              +₹{amt}
            </button>
          ))}
        </div>

        <div
          className={`p-4 rounded-[1.75rem] mb-8 border-2 border-dashed ${dm ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span
              className={`text-xs font-bold ${dm ? "text-slate-500" : "text-slate-400"}`}
            >
              Current Balance
            </span>
            <span
              className={`text-xs font-black ${dm ? "text-white" : "text-slate-900"}`}
            >
              ₹{liveBalance.toFixed(2)}
            </span>
          </div>
          {isSend && (
            <div className="flex justify-between items-center">
              <span
                className={`text-xs font-bold ${dm ? "text-slate-500" : "text-slate-400"}`}
              >
                Est. Remaining
              </span>
              <span
                className={`text-xs font-black ${remaining < 0 ? "text-red-500" : "text-indigo-500"}`}
              >
                ₹{remaining.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold flex items-center gap-2"
          >
            <FiAlertCircle className="shrink-0" /> {error}
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onClose}
            className={`py-5 rounded-[1.5rem] font-black text-sm border-2 ${dm ? "border-white/5 text-slate-500 hover:bg-white/5" : "border-slate-100 text-slate-400 hover:bg-slate-50"}`}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: balanceOkStatus ? 1.02 : 1 }}
            whileTap={{ scale: balanceOkStatus ? 0.98 : 1 }}
            disabled={!balanceOkStatus || checking}
            onClick={handlePay}
            className={`py-5 rounded-[1.5rem] font-black text-sm shadow-2xl transition-all ${
              balanceOkStatus
                ? "bg-indigo-600 text-white shadow-indigo-600/30"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            {checking ? (
              <FiRefreshCw className="animate-spin mx-auto" />
            ) : (
              "Confirm & Continue"
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── CONFIRM POPUP (elegant) ─────────────────────────────────────────────────
const ConfirmPopup = ({
  paymentData,
  onConfirm,
  onClose,
  darkMode,
  paymentMode,
}) => {
  const dm = darkMode;
  const isRequest = paymentMode === "request";
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("facepay_token");
      const url = isRequest
        ? "http://localhost:5000/api/request/create"
        : "http://localhost:5000/api/payment/face-pay";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient_id: paymentData.recipient.id,
          amount: paymentData.amount,
          note: paymentData.note,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onConfirm(isRequest ? { isRequest: true } : data.transaction);
      } else {
        alert(
          data.message || (isRequest ? "Request failed!" : "Payment failed!"),
        );
        setLoading(false);
      }
    } catch (err) {
      console.error("Action error:", err);
      alert("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 30 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl z-50 ${
        dm
          ? "bg-slate-900/80 backdrop-blur-xl border border-slate-700/50"
          : "bg-white/80 backdrop-blur-xl border border-slate-200/50"
      }`}
    >
      <ParticlesBackground
        color={isRequest ? "#10b981" : dm ? "#60a5fa" : "#2563eb"}
        count={8}
      />

      <div
        className={`p-5 text-white text-center border-b border-white/10 ${isRequest ? "bg-gradient-to-br from-emerald-600 to-teal-700" : "bg-gradient-to-br from-indigo-600 to-purple-700"}`}
      >
        {isRequest ? (
          <FiUserPlus size={28} className="mx-auto mb-2" />
        ) : (
          <FiLock size={28} className="mx-auto mb-2" />
        )}
        <h2 className="text-lg font-semibold">
          {isRequest ? "Confirm Request" : "Confirm Payment"}
        </h2>
        <p className="text-white/70 text-[10px] mt-1">
          {isRequest ? "Requesting from" : "Please verify the details"}
        </p>
      </div>

      <div className="p-4">
        <div
          className={`rounded-xl border divide-y backdrop-blur-sm ${
            dm
              ? "border-slate-700 divide-slate-700 bg-slate-800/30"
              : "border-slate-200 divide-slate-200 bg-slate-50/30"
          }`}
        >
          {[
            { label: "Recipient", value: paymentData.recipient.name },
            {
              label: "Amount",
              value: `₹${paymentData.amount}`,
              highlight: true,
            },
            { label: "Note", value: paymentData.note || "—" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex justify-between items-center px-3 py-2"
            >
              <span
                className={`text-[9px] font-medium ${dm ? "text-slate-400" : "text-slate-500"}`}
              >
                {row.label}
              </span>
              <span
                className={`font-semibold text-xs ${row.highlight ? "text-indigo-400 text-sm" : dm ? "text-white" : "text-slate-900"}`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={onClose}
            className={`py-2.5 rounded-xl font-medium text-xs border transition-colors backdrop-blur-sm ${
              dm
                ? "border-slate-700 text-slate-400 hover:bg-white/10"
                : "border-slate-200 text-slate-600 hover:bg-black/5"
            }`}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            disabled={loading}
            className="py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-1"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <FiZap size={12} /> Pay Now
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── SUCCESS POPUP (Enhanced with Coupons & Flash History) ───────────────
const SuccessPopup = ({
  transaction,
  recipient,
  amount,
  onClose,
  darkMode,
}) => {
  const dm = darkMode;
  const [count, setCount] = useState(0);
  const [showCoupon, setShowCoupon] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [shaking, setShaking] = useState(true);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    setConfetti(
      [...Array(12)].map(() => ({
        x: Math.random() * 300,
        duration: 1 + Math.random(),
        delay: Math.random() * 0.5,
      })),
    );
    const step = amount / 40;
    const t = setInterval(() => {
      setCount((c) => {
        if (c + step >= amount) {
          clearInterval(t);
          return amount;
        }
        return c + step;
      });
    }, 30);

    // Auto show coupon after delay
    const timer = setTimeout(() => setShowCoupon(true), 1500);
    return () => {
      clearInterval(t);
      clearTimeout(timer);
    };
  }, [amount]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", damping: 20, stiffness: 250 }}
      className={`relative w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl z-50 ${
        dm
          ? "bg-slate-900 border border-slate-700/50"
          : "bg-white border border-slate-200/50"
      }`}
    >
      <ParticlesBackground color="#10b981" count={15} />

      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-8 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {confetti.map((c, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-3 rounded-full bg-white"
              initial={{ y: -20, x: c.x, opacity: 1 }}
              animate={{ y: 200, opacity: 0 }}
              transition={{
                duration: c.duration,
                delay: c.delay,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="relative z-10 mb-3"
        >
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
            <FiCheckCircle size={40} className="text-white" />
          </div>
        </motion.div>

        <h2 className="text-2xl font-bold relative z-10 tracking-tight">
          Success!
        </h2>
        <p className="text-green-100/80 text-[10px] mt-1 relative z-10 font-medium">
          Verified & Transferred Instantly
        </p>
      </div>

      <div className="p-6 text-center">
        <div className="mb-6">
          <motion.div
            className={`text-5xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r ${
              dm ? "from-white to-slate-400" : "from-slate-900 to-slate-600"
            }`}
          >
            ₹{count.toFixed(0)}
          </motion.div>
          <p
            className={`text-xs font-medium ${dm ? "text-slate-400" : "text-slate-500"}`}
          >
            Paid to{" "}
            <span className={dm ? "text-emerald-400" : "text-emerald-600"}>
              {recipient?.full_name || recipient?.name}
            </span>
          </p>
        </div>

        {/* SCRATCH CARD AREA */}
        <AnimatePresence>
          {showCoupon && !scratched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                x: shaking ? [0, -5, 5, -5, 5, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                x: { repeat: Infinity, duration: 2 },
              }}
              className={`mb-6 p-8 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white cursor-pointer relative overflow-hidden shadow-xl group`}
              onClick={() => {
                setShaking(false);
                setScratched(true);
              }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-3">
                  <FiGift size={24} />
                </div>
                <h4 className="text-lg font-black tracking-tight">
                  You Won a Reward!
                </h4>
                <p className="text-[10px] font-bold opacity-70 mt-1">
                  TAP TO SCRATCH & REVEAL
                </p>
              </div>
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-1/2 bg-white/20 skew-x-[-20deg]"
              />
            </motion.div>
          )}

          {scratched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`mb-6 p-5 rounded-[2rem] border-2 border-dashed ${
                dm
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-emerald-50 border-emerald-200 shadow-sm"
              } relative overflow-hidden`}
            >
              <div className="absolute top-2 right-2 p-1 opacity-20">
                <FiZap size={30} className="text-emerald-500" />
              </div>
              <p
                className={`text-[9px] font-black uppercase tracking-widest ${dm ? "text-emerald-400" : "text-emerald-600"}`}
              >
                Reward Unlocked
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <FiGift className="text-emerald-500" size={20} />
                <span
                  className={`text-2xl font-black ${dm ? "text-white" : "text-slate-900"}`}
                >
                  {transaction?.coupon?.code || "FLASHPAY21"}
                </span>
              </div>
              <p
                className={`text-[10px] mt-2 font-bold ${dm ? "text-slate-500" : "text-slate-500"}`}
              >
                {transaction?.coupon?.message ||
                  "Cashback applied on next txn!"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={`space-y-3 mb-6 ${dm ? "text-slate-300" : "text-slate-600"}`}
        >
          <div className="flex justify-between items-center text-[10px] pb-2 border-b border-slate-100/10">
            <span className="opacity-60">Flash ID</span>
            <span className="font-mono font-bold">
              {transaction?.id?.slice(-12).toUpperCase() || "FL-VERIFIED"}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="opacity-60">Status</span>
            <span className="flex items-center gap-1 text-emerald-500 font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> PAID
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2"
        >
          Done <FiArrowRight />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SendMoneyFlow({
  darkMode,
  walletBalance = 0,
  onPaymentComplete,
  delay = 0.1,
  initialStep = STEPS.INTRO,
  initialRecipient = null,
  forceOpen = false,
  onClose = () => {},
}) {
  const [step, setStep] = useState(initialStep);
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [recipient, setRecipient] = useState(initialRecipient);
  const [paymentMode, setPaymentMode] = useState("send"); // "send" or "receive"
  const [paymentData, setPaymentData] = useState(null);
  const [completedTxn, setCompletedTxn] = useState(null);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setStep(initialStep);
      setRecipient(initialRecipient);
    }
  }, [forceOpen, initialStep, initialRecipient]);

  const openFlow = () => {
    setStep(STEPS.INTRO);
    setIsOpen(true);
  };
  const closeFlow = () => {
    setIsOpen(false);
    onClose();
    setTimeout(() => {
      setStep(STEPS.INTRO);
      setRecipient(null);
      setPaymentData(null);
      setPaymentMode("send");
    }, 300);
  };

  const handleFaceScanSuccess = (user) => {
    setRecipient(user);
    setStep(STEPS.AMOUNT);
  };

  const handleAmountConfirm = (data) => {
    setPaymentData(data);
    setStep(STEPS.CONFIRM);
  };

  const handlePaymentSuccess = (txn) => {
    setCompletedTxn(txn);
    setStep(STEPS.SUCCESS);
    if (onPaymentComplete) onPaymentComplete(txn);
  };

  const navigateToSelection = () => setStep(STEPS.SELECTION);
  const handleSelection = (mode) => {
    setPaymentMode(mode);
    setStep(STEPS.FACE_SCAN);
  };

  return (
    <>
      {/* Trigger Button - refined */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={openFlow}
        className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl w-full transition-all duration-200 ${
          darkMode
            ? "bg-white/5 border border-white/10 hover:bg-white/10"
            : "bg-white/65 border border-white/50"
        }`}
        style={{
          backdropFilter: "blur(16px)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className={`p-3 rounded-full mb-2 transition-colors duration-300 ${
            darkMode
              ? "bg-indigo-900/50 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white"
              : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
          }`}
        >
          <FiSend className="text-xl" />
        </div>
        <span
          className={`text-xs font-bold tracking-wide uppercase ${
            darkMode
              ? "text-slate-400 group-hover:text-slate-200"
              : "text-slate-600 group-hover:text-slate-900"
          }`}
        >
          Send
        </span>
      </motion.button>

      {/* Popup Flow */}
      <AnimatePresence>
        {isOpen && (
          <>
            <Backdrop
              onClick={step !== STEPS.FACE_SCAN ? closeFlow : undefined}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <AnimatePresence mode="wait">
                {step === STEPS.INTRO && (
                  <IntroPopup
                    key="intro"
                    darkMode={darkMode}
                    onNext={navigateToSelection}
                    onClose={closeFlow}
                  />
                )}
                {step === STEPS.SELECTION && (
                  <SelectionPopup
                    key="selection"
                    darkMode={darkMode}
                    onSelect={handleSelection}
                  />
                )}
                {step === STEPS.FACE_SCAN && (
                  <FaceScanPopup
                    key="scan"
                    darkMode={darkMode}
                    onSuccess={handleFaceScanSuccess}
                    onClose={closeFlow}
                  />
                )}
                {step === STEPS.AMOUNT && (
                  <AmountPopup
                    key="amount"
                    darkMode={darkMode}
                    recipient={recipient}
                    walletBalance={walletBalance}
                    onConfirm={handleAmountConfirm}
                    onClose={closeFlow}
                  />
                )}
                {step === STEPS.CONFIRM && (
                  <ConfirmPopup
                    key="confirm"
                    darkMode={darkMode}
                    paymentData={paymentData}
                    paymentMode={paymentMode}
                    onConfirm={handlePaymentSuccess}
                    onClose={closeFlow}
                  />
                )}
                {step === STEPS.SUCCESS && (
                  <SuccessPopup
                    key="success"
                    darkMode={darkMode}
                    transaction={completedTxn}
                    recipient={recipient}
                    amount={paymentData?.amount}
                    onClose={closeFlow}
                  />
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
