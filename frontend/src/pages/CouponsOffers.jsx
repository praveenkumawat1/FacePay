import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FiTag,
  FiCopy,
  FiGift,
  FiCheck,
  FiClock,
  FiUsers,
  FiLock,
  FiStar,
  FiTrendingUp,
  FiRepeat,
  FiZap,
  FiAward,
  FiTarget,
  FiBarChart2,
  FiX,
  FiVolume2,
  FiVolumeX,
  FiShield,
  FiCheckCircle,
  FiDollarSign,
  FiActivity,
  FiRefreshCw,
  FiChevronRight,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiPackage,
  FiScissors,
  FiBell,
  FiRotateCcw,
  FiPieChart,
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
// ─── DashboardContext fallback — safe if not in your project ────────────────
// If you have DashboardContext, replace this block with:
//   import { useDashboard } from "./DashboardContext";
const _DashboardCtx = React.createContext({ darkMode: false });
const useDashboard = () =>
  React.useContext(_DashboardCtx) ?? { darkMode: false };

// ─── Exported for other components that may import it ───────
export const activeCoupons = [];

// ─── WHEEL SEGMENTS ─────────────────────────────────────────
const SEGMENTS = [
  {
    label: "₹50 Cash",
    value: 50,
    type: "cash",
    Icon: FiDollarSign,
    color: "#f59e0b",
    dark: "#92400e",
  },
  {
    label: "10 Coins",
    value: 10,
    type: "coins",
    Icon: FiStar,
    color: "#4f46e5",
    dark: "#312e81",
  },
  {
    label: "Free Coupon",
    value: "coupon",
    type: "coupon",
    Icon: FiTag,
    color: "#10b981",
    dark: "#065f46",
  },
  {
    label: "₹100 Cash",
    value: 100,
    type: "cash",
    Icon: FiTrendingUp,
    color: "#ef4444",
    dark: "#7f1d1d",
  },
  {
    label: "5 Coins",
    value: 5,
    type: "coins",
    Icon: FiStar,
    color: "#8b5cf6",
    dark: "#4c1d95",
  },
  {
    label: "Mystery",
    value: "mystery",
    type: "mystery",
    Icon: FiPackage,
    color: "#ec4899",
    dark: "#831843",
  },
  {
    label: "20 Coins",
    value: 20,
    type: "coins",
    Icon: FiStar,
    color: "#0ea5e9",
    dark: "#0c4a6e",
  },
  {
    label: "Try Again",
    value: 0,
    type: "none",
    Icon: FiRotateCcw,
    color: "#64748b",
    dark: "#1e293b",
  },
];

const N = SEGMENTS.length;
const ARC = (2 * Math.PI) / N;
const R = 155;
const PAD = 14;
const SZ = (R + PAD) * 2;
const CX = R + PAD;
const CY = R + PAD;

// ─────────────────────────────────────────────────────────────
//  SPIN WHEEL
// ─────────────────────────────────────────────────────────────
const SpinWheel = ({ onSpinEnd, onClose, coins }) => {
  const canvasRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const spinningRef = useRef(false);
  const audioCtx = useRef(null);

  const [uiSpinning, setUiSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [muted, setMuted] = useState(false);

  const draw = useCallback((angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, SZ, SZ);

    // Outer chrome ring
    const ring = ctx.createRadialGradient(
      CX - 20,
      CY - 20,
      R - 4,
      CX,
      CY,
      R + PAD,
    );
    ring.addColorStop(0, "#f1f5f9");
    ring.addColorStop(0.5, "#cbd5e1");
    ring.addColorStop(1, "#94a3b8");
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;
    ctx.beginPath();
    ctx.arc(CX, CY, R + PAD, 0, 2 * Math.PI);
    ctx.fillStyle = ring;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    SEGMENTS.forEach((seg, i) => {
      const start = angle + i * ARC;
      const end = start + ARC;
      const mid = start + ARC / 2;
      const gx = CX + Math.cos(mid) * R * 0.38;
      const gy = CY + Math.sin(mid) * R * 0.38;
      const grad = ctx.createRadialGradient(gx, gy, 0, CX, CY, R);
      grad.addColorStop(0, seg.color + "ff");
      grad.addColorStop(0.65, seg.color + "dd");
      grad.addColorStop(1, seg.dark + "ff");

      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, R, start, end);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(start);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(R, 0);
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(CX, CY);
      ctx.rotate(mid);
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 3;
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${seg.label.length > 8 ? 9 : 10}px 'Plus Jakarta Sans',sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(seg.label, R * 0.6, 0);
      ctx.restore();
    });

    // Centre hub
    const hub = ctx.createRadialGradient(CX - 6, CY - 6, 2, CX, CY, 22);
    hub.addColorStop(0, "#f8fafc");
    hub.addColorStop(0.5, "#cbd5e1");
    hub.addColorStop(1, "#475569");
    ctx.beginPath();
    ctx.arc(CX, CY, 22, 0, 2 * Math.PI);
    ctx.fillStyle = hub;
    ctx.fill();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let b = 0; b < 6; b++) {
      const ba = (b / 6) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(
        CX + Math.cos(ba) * 13,
        CY + Math.sin(ba) * 13,
        2.2,
        0,
        2 * Math.PI,
      );
      ctx.fillStyle = "#64748b";
      ctx.fill();
    }

    // Gloss
    const gloss = ctx.createRadialGradient(CX - 35, CY - 50, 5, CX, CY, R);
    gloss.addColorStop(0, "rgba(255,255,255,0.20)");
    gloss.addColorStop(0.45, "rgba(255,255,255,0.05)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, 2 * Math.PI);
    ctx.fillStyle = gloss;
    ctx.fill();
  }, []);

  useEffect(() => {
    draw(0);
  }, [draw]);
  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const playTick = () => {
    if (muted) return;
    try {
      if (!audioCtx.current)
        audioCtx.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(480 + Math.random() * 280, ctx.currentTime);
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);
      osc.start();
      osc.stop(ctx.currentTime + 0.055);
    } catch (_) {}
  };

  const spin = () => {
    if (spinningRef.current) return;
    if (coins < 10) {
      toast.error("Need 10 coins to spin!");
      return;
    }

    spinningRef.current = true;
    setUiSpinning(true);
    setResult(null);
    setShowResult(false);

    const targetIdx = Math.floor(Math.random() * N);
    const extraSpins = 8 + Math.floor(Math.random() * 5);
    const targetMid = targetIdx * ARC + ARC / 2;
    const stopAngle = -Math.PI / 2 - targetMid - angleRef.current;
    const totalRot =
      extraSpins * 2 * Math.PI +
      (((stopAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));

    const startAngle = angleRef.current;
    const duration = 5200;
    const startTime = performance.now();
    let lastSeg = -1;

    const easeOut = (t) => 1 - Math.pow(1 - t, 4);

    const step = (now) => {
      const elapsed = Math.min(now - startTime, duration);
      const progress = easeOut(elapsed / duration);
      const current = startAngle + totalRot * progress;
      draw(current);

      const segIdx =
        Math.floor(
          ((((-current - Math.PI / 2) % (2 * Math.PI)) + 2 * Math.PI) %
            (2 * Math.PI)) /
            ARC,
        ) % N;
      if (segIdx !== lastSeg) {
        playTick();
        lastSeg = segIdx;
      }

      if (elapsed < duration) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        angleRef.current = (startAngle + totalRot) % (2 * Math.PI);
        draw(angleRef.current);
        spinningRef.current = false;
        setUiSpinning(false);
        const won = SEGMENTS[targetIdx];
        setResult(won);
        setTimeout(() => setShowResult(true), 150);
        onSpinEnd(won);
      }
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const canSpin = !uiSpinning && coins >= 10;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.78)", backdropFilter: "blur(10px)" }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-[430px] rounded-[28px] p-7"
        style={{
          background: "linear-gradient(145deg,#1e1b4b,#0f172a)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <button
          onClick={() => setMuted((m) => !m)}
          className="absolute top-[14px] right-[52px] flex items-center justify-center w-8 h-8 rounded-[10px] text-slate-400 cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          {muted ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
        </button>
        <button
          onClick={onClose}
          className="absolute top-[14px] right-[14px] flex items-center justify-center w-8 h-8 rounded-[10px] text-slate-400 cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <FiX size={15} />
        </button>

        <p className="text-center text-[10px] font-bold tracking-[3px] text-indigo-400 uppercase mb-1">
          Daily Fortune
        </p>
        <div className="flex items-center justify-center gap-2 mb-5">
          <FiActivity size={17} color="#818cf8" />
          <h2 className="text-[22px] font-extrabold text-white">
            Spin &amp; Win
          </h2>
        </div>

        <div className="relative flex justify-center mb-5">
          <div
            className="absolute inset-0 rounded-full pointer-events-none transition-all duration-500"
            style={{
              background: uiSpinning
                ? "radial-gradient(circle,rgba(79,70,229,0.18) 0%,transparent 70%)"
                : "transparent",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              width: SZ,
              height: SZ,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              borderRadius: "50%",
            }}
          >
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: i % 4 === 0 ? 10 : 5,
                  height: 2,
                  background:
                    i % 4 === 0
                      ? "rgba(255,255,255,0.22)"
                      : "rgba(255,255,255,0.09)",
                  transformOrigin: "left center",
                  transform: `rotate(${i * (360 / 32)}deg) translateX(${R + PAD - 2}px) translateY(-50%)`,
                }}
              />
            ))}
          </div>
          <canvas
            ref={canvasRef}
            width={SZ}
            height={SZ}
            style={{
              display: "block",
              borderRadius: "50%",
              filter: uiSpinning
                ? "drop-shadow(0 0 20px rgba(79,70,229,0.55))"
                : "drop-shadow(0 8px 24px rgba(0,0,0,0.55))",
              transition: "filter 0.4s",
            }}
          />
          {/* FIX: Pointer positioned correctly with pointer-events none */}
          <div
            className="absolute z-10 pointer-events-none"
            style={{ top: -10, left: "50%", transform: "translateX(-50%)" }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "11px solid transparent",
                borderRight: "11px solid transparent",
                borderTop: "28px solid #ef4444",
                filter: "drop-shadow(0 4px 8px rgba(239,68,68,0.65))",
              }}
            />
          </div>
        </div>

        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
              className="mb-4 flex items-center justify-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: `linear-gradient(135deg,${result.color}22,${result.dark}33)`,
                border: `1px solid ${result.color}44`,
              }}
            >
              <result.Icon size={18} color={result.color} />
              <span className="font-extrabold text-[15px] text-white">
                You won: {result.label}!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-x-3 gap-y-[5px] mb-5">
          {SEGMENTS.map((s, i) => (
            <div key={i} className="flex items-center gap-[6px]">
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: s.color,
                  flexShrink: 0,
                }}
              />
              <s.Icon size={10} color="#94a3b8" />
              <span className="text-[10px] text-slate-400 font-medium">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mb-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <FiStar size={11} color="#f59e0b" /> Coins:{" "}
            <strong className="text-amber-400">{coins}</strong>
          </span>
          <span>•</span>
          <span>
            Cost: <strong className="text-red-400">10 coins</strong>
          </span>
        </div>

        <button
          onClick={spin}
          disabled={!canSpin}
          className="w-full flex items-center justify-center gap-2 rounded-[14px] py-[13px] font-extrabold text-[14px] transition-all duration-200"
          style={{
            cursor: canSpin ? "pointer" : "not-allowed",
            background: canSpin
              ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
              : "rgba(255,255,255,0.05)",
            color: canSpin ? "#fff" : "#475569",
            boxShadow: canSpin
              ? "0 8px 24px rgba(79,70,229,0.45), inset 0 1px 0 rgba(255,255,255,0.18)"
              : "none",
            border: canSpin ? "none" : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {uiSpinning ? (
            <>
              <FiRefreshCw
                size={14}
                style={{ animation: "spinIcon 0.7s linear infinite" }}
              />{" "}
              Spinning...
            </>
          ) : coins < 10 ? (
            <>
              <FiLock size={14} /> Need 10 Coins
            </>
          ) : (
            <>
              <FiActivity size={14} /> Spin Now{" "}
              <span
                style={{
                  background: "rgba(0,0,0,0.22)",
                  borderRadius: 8,
                  padding: "2px 9px",
                  fontSize: 12,
                }}
              >
                −10
              </span>
            </>
          )}
        </button>
      </motion.div>
      <style>{`@keyframes spinIcon{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  SCRATCH CARD
// ─────────────────────────────────────────────────────────────
// FIX: PRIZES defined outside component to avoid recreating on every render
const SCRATCH_PRIZES = [
  "₹10 Cash",
  "₹50 Cash",
  "Free Coupon",
  "₹100 Cash",
  "Better Luck Next Time",
];

const ScratchCard = ({ onClose, onReveal }) => {
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  // FIX: Prize initialized once with useState initializer function
  const [prize] = useState(
    () => SCRATCH_PRIZES[Math.floor(Math.random() * SCRATCH_PRIZES.length)],
  );
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0, "#b0b0b0");
    g.addColorStop(0.4, "#e0e0e0");
    g.addColorStop(1, "#a0a0a0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * c.width,
        Math.random() * c.height,
        Math.random() * 1.5,
        0,
        2 * Math.PI,
      );
      ctx.fill();
    }
    ctx.fillStyle = "rgba(70,70,70,0.55)";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH TO REVEAL", c.width / 2, c.height / 2);
  }, []); // FIX: Empty deps — runs once only

  const doScratch = (e) => {
    // FIX: Guard against null canvas ref
    if (!drawing.current || revealed || !canvasRef.current) return;
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    const r = c.getBoundingClientRect();
    const sx = c.width / r.width;
    const sy = c.height / r.height;
    const cx = (e.touches?.[0]?.clientX ?? e.clientX) - r.left;
    const cy = (e.touches?.[0]?.clientY ?? e.clientY) - r.top;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx * sx, cy * sy, 26, 0, 2 * Math.PI);
    ctx.fill();

    const px = ctx.getImageData(0, 0, c.width, c.height).data;
    let t = 0;
    for (let i = 3; i < px.length; i += 4) if (px[i] < 128) t++;
    const pct = Math.round((t / (c.width * c.height)) * 100);
    setProgress(pct);

    if (pct > 55) {
      setRevealed(true);
      onReveal(prize);
    }
  };

  const isWin = prize && !prize.toLowerCase().includes("luck");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.78)", backdropFilter: "blur(10px)" }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-[380px] rounded-[28px] p-7"
        style={{
          background: "linear-gradient(145deg,#1e1b4b,#0f172a)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.65)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-[14px] right-[14px] flex items-center justify-center w-8 h-8 rounded-[10px] text-slate-400"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.10)",
            cursor: "pointer",
          }}
        >
          <FiX size={15} />
        </button>
        <p className="text-center text-[10px] font-bold tracking-[3px] text-indigo-400 uppercase mb-1">
          Your Reward
        </p>
        <div className="flex items-center justify-center gap-2 mb-5">
          <FiGift size={17} color="#818cf8" />
          <h2 className="text-[20px] font-extrabold text-white">
            Scratch Card
          </h2>
        </div>
        <div className="relative rounded-2xl overflow-hidden mb-4">
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-7"
            style={{
              background: isWin
                ? "linear-gradient(135deg,#052e16,#14532d)"
                : "linear-gradient(135deg,#1e293b,#334155)",
              minHeight: 120,
            }}
          >
            {isWin ? (
              <FiCheckCircle
                size={34}
                color="#4ade80"
                style={{ marginBottom: 8 }}
              />
            ) : (
              <FiRotateCcw
                size={28}
                color="#94a3b8"
                style={{ marginBottom: 8 }}
              />
            )}
            <p
              className="font-extrabold text-[20px]"
              style={{ color: isWin ? "#4ade80" : "#94a3b8" }}
            >
              {prize}
            </p>
            {isWin && (
              <p className="text-[12px] text-emerald-400 mt-1">
                Added to your wallet
              </p>
            )}
          </div>
          {!revealed && (
            <canvas
              ref={canvasRef}
              width={330}
              height={130}
              className="absolute inset-0 w-full h-full rounded-2xl touch-none"
              style={{ cursor: "crosshair" }}
              onMouseDown={(e) => {
                drawing.current = true;
                doScratch(e);
              }}
              onMouseMove={doScratch}
              onMouseUp={() => {
                drawing.current = false;
              }}
              onMouseLeave={() => {
                drawing.current = false;
              }}
              onTouchStart={(e) => {
                drawing.current = true;
                doScratch(e);
                e.preventDefault();
              }}
              onTouchMove={(e) => {
                doScratch(e);
                e.preventDefault();
              }}
              onTouchEnd={() => {
                drawing.current = false;
              }}
            />
          )}
        </div>
        {!revealed ? (
          <div className="mb-4">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-500">Scratched</span>
              <span className="text-indigo-400 font-bold">{progress}%</span>
            </div>
            <div
              className="h-[5px] rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg,#4f46e5,#7c3aed)",
                }}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 rounded-[14px] py-3 font-bold text-[14px] text-white"
            style={{
              background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              cursor: "pointer",
            }}
          >
            <FiCheckCircle size={14} /> Claim &amp; Close
          </button>
        )}
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  LEADERBOARD MODAL
// ─────────────────────────────────────────────────────────────
const RANK_ICONS = [FiAward, FiTrendingUp, FiStar, FiChevronRight];

const LeaderboardModal = ({ coins, onClose, darkMode }) => {
  const dm = darkMode;
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); // FIX: track error state

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // FIX: Use correct endpoint /api/leaderboard and correct token key facepay_token
        const token = localStorage.getItem("facepay_token");
        const response = await fetch("/api/leaderboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch leaderboard");
        const data = await response.json();
        // The API returns an array directly
        setLeaderboard(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const card = dm
    ? { background: "rgba(30,41,59,0.95)", border: "1px solid #334155" }
    : { background: "#fff", border: "1px solid #e2e8f0" };
  const textPri = dm ? "#f1f5f9" : "#0f172a";
  const textSec = dm ? "#94a3b8" : "#64748b";

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] rounded-[24px] p-8 text-center"
          style={{ ...card }}
        >
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin border-indigo-500 mx-auto mb-4" />
          <p
            className="font-bold text-sm tracking-wide"
            style={{ color: textSec }}
          >
            Fetching Rankings...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.6)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-[400px] rounded-[24px] p-7"
        style={{ ...card, boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: dm ? "rgba(79,70,229,0.2)" : "#eff6ff" }}
          >
            <FiAward size={18} color="#4f46e5" />
          </div>
          <h2 className="font-extrabold text-[18px]" style={{ color: textPri }}>
            Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-[10px]"
            style={{
              background: dm ? "rgba(255,255,255,0.06)" : "#f1f5f9",
              border: "none",
              cursor: "pointer",
              color: textSec,
            }}
          >
            <FiX size={14} />
          </button>
        </div>

        {/* FIX: Show error state */}
        {error ? (
          <div className="text-center py-8" style={{ color: textSec }}>
            <p className="font-semibold">Could not load leaderboard.</p>
            <p className="text-xs mt-1">Please try again later.</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8" style={{ color: textSec }}>
            No data yet.
          </div>
        ) : (
          <div className="flex flex-col gap-[9px] max-h-[480px] overflow-y-auto pr-1">
            {leaderboard.map((u, i) => {
              const RIcon = RANK_ICONS[u.rank - 1] || RANK_ICONS[3];
              return (
                <div
                  key={u.rank + (u.isMe ? "-me" : "")}
                  className={`flex flex-col gap-2 ${u.isGap ? "mt-3 pt-3 border-t border-dashed border-slate-500/30" : ""}`}
                >
                  {u.isGap && (
                    <div
                      className="text-[10px] font-bold text-center uppercase tracking-widest opacity-40 mb-1"
                      style={{ color: textSec }}
                    >
                      Your Position
                    </div>
                  )}
                  <div
                    className="flex items-center gap-3 px-[14px] py-3 rounded-[14px]"
                    style={{
                      background: u.isMe
                        ? dm
                          ? "rgba(79,70,229,0.22)"
                          : "#eff6ff"
                        : dm
                          ? "rgba(255,255,255,0.04)"
                          : "#f8fafc",
                      border: u.isMe
                        ? dm
                          ? "1.5px solid #6366f1"
                          : "1.5px solid #c7d2fe"
                        : dm
                          ? "1px solid #334155"
                          : "1px solid #f1f5f9",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                      style={{
                        background: u.isMe
                          ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                          : dm
                            ? "rgba(255,255,255,0.06)"
                            : "#f1f5f9",
                      }}
                    >
                      <RIcon
                        size={14}
                        color={
                          u.isMe
                            ? "#fff"
                            : u.rank === 1
                              ? "#f59e0b"
                              : u.rank === 2
                                ? "#94a3b8"
                                : u.rank === 3
                                  ? "#b45309"
                                  : "#64748b"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-bold text-[13px] truncate"
                        style={{
                          color: u.isMe
                            ? dm
                              ? "#818cf8"
                              : "#4f46e5"
                            : textPri,
                        }}
                      >
                        {u.name}
                        {u.isMe && (
                          <span
                            className="ml-2 text-[9px] px-[6px] py-[0.5px] rounded-[4px] font-black uppercase tracking-tighter"
                            style={{
                              background: dm ? "#4338ca" : "#e0e7ff",
                              color: dm ? "#e0e7ff" : "#4338ca",
                            }}
                          >
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-[10px]" style={{ color: textSec }}>
                        Rank #{u.rank}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-1 font-extrabold text-[13px] text-amber-500">
                      <FiStar size={11} fill="#f59e0b" />{" "}
                      {u.coins.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[11px] text-center mt-4" style={{ color: textSec }}>
          Resets every Sunday midnight
        </p>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  STREAK SHIELD MODAL
// ─────────────────────────────────────────────────────────────
const StreakShieldModal = ({ onClose, onPurchase, coins, darkMode }) => {
  const dm = darkMode;
  const card = dm
    ? { background: "rgba(30,41,59,0.95)", border: "1px solid #334155" }
    : { background: "#fff", border: "1px solid #e2e8f0" };
  const textPri = dm ? "#f1f5f9" : "#0f172a";
  const textSec = dm ? "#94a3b8" : "#64748b";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.6)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-[380px] rounded-[24px] p-7 text-center"
        style={{ ...card, boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-[10px]"
          style={{
            background: dm ? "rgba(255,255,255,0.06)" : "#f1f5f9",
            border: "none",
            cursor: "pointer",
            color: textSec,
          }}
        >
          <FiX size={14} />
        </button>
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-4"
          style={{
            background: dm
              ? "rgba(79,70,229,0.2)"
              : "linear-gradient(135deg,#eff6ff,#e0e7ff)",
          }}
        >
          <FiShield size={28} color="#4f46e5" />
        </div>
        <h2
          className="font-extrabold text-[20px] mb-2"
          style={{ color: textPri }}
        >
          Streak Shield
        </h2>
        <p
          className="text-[13px] mb-5 leading-relaxed"
          style={{ color: textSec }}
        >
          Protect your streak for 1 day if you miss a check-in. Your progress
          stays safe!
        </p>
        <div
          className="rounded-[14px] p-4 mb-5 text-left"
          style={{
            background: dm ? "rgba(255,255,255,0.04)" : "#f8fafc",
            border: dm ? "1px solid #334155" : "1px solid #f1f5f9",
          }}
        >
          {[
            "Protects 1 missed day",
            "Activates automatically",
            "Valid 30 days after purchase",
          ].map((f) => (
            <div
              key={f}
              className="flex items-center gap-3 mb-2 text-[13px]"
              style={{ color: textPri }}
            >
              <div
                className="w-5 h-5 rounded-[6px] flex items-center justify-center flex-shrink-0"
                style={{ background: "#dcfce7" }}
              >
                <FiCheck size={11} color="#16a34a" />
              </div>
              {f}
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            if (coins >= 100) {
              onPurchase();
              onClose();
            } else toast.error("Need 100 coins!");
          }}
          className="w-full flex items-center justify-center gap-2 rounded-[14px] py-3 font-extrabold text-[14px] text-white"
          style={{
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(79,70,229,0.35)",
          }}
        >
          <FiShield size={15} /> Buy for 100 Coins
        </button>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  MISSIONS PANEL
// ─────────────────────────────────────────────────────────────
const MissionsPanel = ({ onClaim, darkMode }) => {
  const dm = darkMode;
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  // FIX: Separate error state from empty state
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchMissions = async () => {
      setFetchError(false);
      try {
        const token = localStorage.getItem("token");
        // Try authenticated endpoint first, fallback to unauthenticated
        const response = await fetch("/api/missions", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        // Debug: log status for troubleshooting
        console.log("Missions response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          setMissions(Array.isArray(data) ? data : []);
        } else if (response.status === 401 || response.status === 403) {
          // Auth failed — token expired or invalid, try without auth
          console.warn("Auth failed for missions, trying without token...");
          const retryRes = await fetch("/api/missions");
          if (retryRes.ok) {
            const data = await retryRes.json();
            setMissions(Array.isArray(data) ? data : []);
          } else {
            throw new Error(`Missions fetch failed: ${retryRes.status}`);
          }
        } else {
          throw new Error(`Missions fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to fetch missions:", error.message);
        setFetchError(true);
        setMissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMissions();
  }, []);

  const card = dm
    ? { background: "rgba(30,41,59,0.8)", border: "1px solid #334155" }
    : { background: "#fff", border: "1.5px solid #f1f5f9" };
  const textPri = dm ? "#f1f5f9" : "#0f172a";
  const textSec = dm ? "#94a3b8" : "#64748b";

  if (loading)
    return (
      <div className="text-center py-8" style={{ color: textSec }}>
        Loading missions...
      </div>
    );

  // FIX: Distinct UI for error vs genuinely empty
  if (fetchError) {
    return (
      <div className="rounded-[20px] p-8 text-center" style={card}>
        <FiActivity
          size={28}
          color="#ef4444"
          style={{ margin: "0 auto 8px" }}
        />
        <p className="font-semibold text-[13px]" style={{ color: "#ef4444" }}>
          Failed to load missions.
        </p>
        <p className="text-[11px] mt-1" style={{ color: textSec }}>
          Please refresh the page.
        </p>
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="rounded-[20px] p-8 text-center" style={card}>
        <FiTarget
          size={28}
          color={dm ? "#475569" : "#cbd5e1"}
          style={{ margin: "0 auto 8px" }}
        />
        <p className="text-[13px]" style={{ color: textSec }}>
          No missions available right now.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[20px] p-[22px]"
      style={{ ...card, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-[10px] mb-5">
        <div
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center"
          style={{ background: dm ? "rgba(79,70,229,0.2)" : "#eff6ff" }}
        >
          <FiTarget size={16} color="#4f46e5" />
        </div>
        <h3 className="font-extrabold text-[16px]" style={{ color: textPri }}>
          Daily Missions
        </h3>
        <span
          className="ml-auto text-[11px] font-bold px-3 py-[3px] rounded-full"
          style={{
            background: dm ? "rgba(79,70,229,0.2)" : "#eff6ff",
            color: "#4f46e5",
            border: "1px solid #c7d2fe",
          }}
        >
          Resets 00:00
        </span>
      </div>
      <div className="flex flex-col gap-[10px]">
        {missions.map((m) => {
          const pct = Math.min((m.progress / m.total) * 100, 100);
          const done = pct >= 100 && !m.claimed;
          const greenBg = dm ? "rgba(16,185,129,0.08)" : "#f0fdf4";
          const greenBd = dm ? "rgba(16,185,129,0.3)" : "#bbf7d0";
          const normalBg = dm ? "rgba(255,255,255,0.03)" : "#f8fafc";
          const normalBd = dm ? "#334155" : "#f1f5f9";
          const isGreen = m.claimed || done;

          return (
            <div
              key={m.id}
              className="flex items-center gap-3 px-[14px] py-3 rounded-[14px]"
              style={{
                background: isGreen ? greenBg : normalBg,
                border: `${isGreen ? "1.5" : "1"}px solid ${isGreen ? greenBd : normalBd}`,
              }}
            >
              <div
                className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                style={{
                  background: isGreen
                    ? dm
                      ? "rgba(16,185,129,0.2)"
                      : "#dcfce7"
                    : dm
                      ? "rgba(79,70,229,0.2)"
                      : "#eff6ff",
                }}
              >
                <FiTarget size={16} color={isGreen ? "#16a34a" : "#4f46e5"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-[3px]">
                  <p
                    className="font-bold text-[13px]"
                    style={{ color: textPri }}
                  >
                    {m.title}
                  </p>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 whitespace-nowrap ml-2">
                    <FiStar size={10} fill="#f59e0b" />+{m.reward}
                  </span>
                </div>
                <p className="text-[11px] mb-[6px]" style={{ color: textSec }}>
                  {m.desc}
                </p>
                <div
                  className="h-[4px] rounded-full overflow-hidden"
                  style={{
                    background: dm ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: isGreen
                        ? "linear-gradient(90deg,#10b981,#059669)"
                        : "linear-gradient(90deg,#4f46e5,#7c3aed)",
                    }}
                  />
                </div>
                <p className="text-[10px] mt-[3px]" style={{ color: textSec }}>
                  {m.progress}/{m.total}
                </p>
              </div>
              {!m.claimed && done && (
                <button
                  onClick={() => onClaim(m.id, m.reward)}
                  className="flex items-center gap-1 px-3 py-2 rounded-[10px] text-[12px] font-bold text-white whitespace-nowrap ml-1"
                  style={{
                    background: "linear-gradient(135deg,#10b981,#059669)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <FiCheckCircle size={11} /> Claim
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  COIN HISTORY PANEL
// ─────────────────────────────────────────────────────────────
const CoinHistoryPanel = ({ darkMode }) => {
  const dm = darkMode;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  // FIX: Add error state
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching coin history, token present:", !!token);

        const response = await fetch("/api/coupons/coin-history", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        console.log("Coin history response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          setHistory(Array.isArray(data) ? data : []);
        } else if (response.status === 401 || response.status === 403) {
          // Token issue — show empty history instead of error
          console.warn("Auth failed for coin history");
          setHistory([]);
          // Don't show error — just show empty state
        } else {
          throw new Error(`History fetch failed: ${response.status}`);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error.message);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const card = dm
    ? { background: "rgba(30,41,59,0.8)", border: "1px solid #334155" }
    : { background: "#fff", border: "1.5px solid #f1f5f9" };
  const textPri = dm ? "#f1f5f9" : "#0f172a";
  const textSec = dm ? "#94a3b8" : "#64748b";

  if (loading)
    return (
      <div className="text-center py-8" style={{ color: textSec }}>
        Loading history...
      </div>
    );

  // FIX: Show error clearly
  if (fetchError) {
    return (
      <div className="rounded-[20px] p-8 text-center" style={card}>
        <FiBarChart2
          size={28}
          color="#ef4444"
          style={{ margin: "0 auto 8px" }}
        />
        <p className="font-semibold text-[13px]" style={{ color: "#ef4444" }}>
          Failed to load history.
        </p>
        <p className="text-[11px] mt-1" style={{ color: textSec }}>
          Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[20px] p-[22px]"
      style={{ ...card, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-[10px] mb-5">
        <div
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center"
          style={{ background: dm ? "rgba(245,158,11,0.15)" : "#fffbeb" }}
        >
          <FiBarChart2 size={16} color="#f59e0b" />
        </div>
        <h3 className="font-extrabold text-[16px]" style={{ color: textPri }}>
          Coin History
        </h3>
      </div>

      {history.length === 0 ? (
        <p className="text-center text-[13px] py-6" style={{ color: textSec }}>
          No transactions yet.
        </p>
      ) : (
        history.map((h, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-[10px]"
            style={{
              borderBottom:
                i < history.length - 1
                  ? dm
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "1px solid #f8fafc"
                  : "none",
            }}
          >
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{
                background: h.pos
                  ? dm
                    ? "rgba(79,70,229,0.2)"
                    : "#eff6ff"
                  : dm
                    ? "rgba(239,68,68,0.2)"
                    : "#fff1f2",
              }}
            >
              {h.pos ? (
                <FiArrowUpRight size={15} color="#4f46e5" />
              ) : (
                <FiArrowDownLeft size={15} color="#ef4444" />
              )}
            </div>
            <div className="flex-1">
              <p
                className="font-semibold text-[13px]"
                style={{ color: textPri }}
              >
                {h.label}
              </p>
              <p className="text-[11px]" style={{ color: textSec }}>
                {h.time}
              </p>
            </div>
            <span
              className="flex items-center gap-1 font-extrabold text-[14px]"
              style={{ color: h.pos ? "#10b981" : "#ef4444" }}
            >
              {h.pos ? "+" : ""}
              {h.coins}
              <FiStar size={11} fill="#f59e0b" color="#f59e0b" />
            </span>
          </div>
        ))
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  FEATURED OFFERS CAROUSEL
// ─────────────────────────────────────────────────────────────
// Fallback offers — shown if API fails (same as backend hardcoded)
const FALLBACK_OFFERS = [
  {
    brand: "Swiggy",
    discount: "Up to 60% off",
    code: "SWIG60",
    bg: "linear-gradient(135deg,#fc5c7d,#6a3093)",
  },
  {
    brand: "Amazon",
    discount: "₹200 off on ₹999",
    code: "AMZ200",
    bg: "linear-gradient(135deg,#f7971e,#ffd200)",
  },
  {
    brand: "MakeMyTrip",
    discount: "Flat ₹500 off",
    code: "MMT500",
    bg: "linear-gradient(135deg,#11998e,#38ef7d)",
  },
  {
    brand: "Zomato",
    discount: "40% off upto ₹80",
    code: "ZOM40",
    bg: "linear-gradient(135deg,#e52d27,#b31217)",
  },
  {
    brand: "Myntra",
    discount: "Extra 20% off",
    code: "MYN20",
    bg: "linear-gradient(135deg,#f953c6,#b91d73)",
  },
];

const FeaturedCarousel = ({ onCopy }) => {
  const [offers, setOffers] = useState(FALLBACK_OFFERS); // start with fallback
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch("/api/coupons/featured", {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Use API data if valid, otherwise keep fallback
        if (Array.isArray(data) && data.length > 0) {
          setOffers(data);
        }
        // else: keep FALLBACK_OFFERS already set
      } catch (error) {
        // Network error or timeout — silently use fallback, no error shown
        console.warn(
          "Featured offers API unavailable, using fallback:",
          error.message,
        );
        // offers already set to FALLBACK_OFFERS — no action needed
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    if (offers.length === 0) return;
    const timer = setInterval(
      () => setCurrent((c) => (c + 1) % offers.length),
      5000,
    );
    return () => clearInterval(timer);
  }, [offers]);

  if (loading)
    return (
      <div className="h-40 rounded-[24px] bg-slate-200 animate-pulse mb-6" />
    );
  if (offers.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-[24px] h-40 mb-6">
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full p-6 flex items-center justify-between"
          style={{ background: offers[current].bg, color: "white" }}
        >
          <div>
            <p className="text-xs font-bold tracking-widest opacity-80 mb-1">
              FEATURED
            </p>
            <h3 className="text-2xl font-extrabold mb-1">
              {offers[current].brand}
            </h3>
            <p className="text-sm opacity-90">{offers[current].discount}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold mb-2">
              {offers[current].code}
            </div>
            {/* FIX: Pass current offer id so copy feedback can work */}
            <button
              onClick={() =>
                onCopy(offers[current].code, `featured-${current}`)
              }
              className="flex items-center gap-1 px-4 py-2 bg-white bg-opacity-25 rounded-xl text-sm font-bold hover:bg-opacity-40 transition"
            >
              <FiCopy size={14} /> Copy Code
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
        {offers.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white w-4" : "bg-white bg-opacity-50"}`}
          />
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  MAIN — CouponsOffers
// ─────────────────────────────────────────────────────────────
export default function CouponsOffers() {
  const { darkMode } = useDashboard?.() ?? { darkMode: false };
  const dm = darkMode;

  const bgMain = dm
    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
    : "bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f5f3ff]";
  const cardCls = dm
    ? "bg-slate-800/80 border-slate-700"
    : "bg-white border-slate-100";
  const textPri = dm ? "text-slate-100" : "text-slate-900";
  const textSec = dm ? "text-slate-400" : "text-slate-500";

  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [claimedToday, setClaimedToday] = useState(false);
  const [marketplace, setMarketplace] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [referralCode, setReferralCode] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [expiryTimers, setExpiryTimers] = useState({});
  const [totalCashback, setTotalCashback] = useState(0);
  const [referralBonus, setReferralBonus] = useState(0);
  const [splitRewards, setSplitRewards] = useState(0);
  const [upiStreak, setUpiStreak] = useState(0);
  const [showSpin, setShowSpin] = useState(false);
  const [showScratch, setShowScratch] = useState(false);
  const [scratchAvail, setScratchAvail] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLeader, setShowLeader] = useState(false);
  const [showShield, setShowShield] = useState(false);
  const [hasShield, setHasShield] = useState(false);
  const [section, setSection] = useState("rewards");

  const getToken = () =>
    localStorage.getItem("facepay_token") || localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, marketplaceRes, couponsRes] = await Promise.all([
        fetch("/api/user/stats", { headers }).catch(() => null),
        fetch("/api/marketplace").catch(() => null),
        fetch("/api/coupons").catch(() => null),
      ]);

      if (userRes?.ok) {
        const u = await userRes.json();
        setCoins(u.coins ?? 0);
        setStreak(u.streak ?? 0);
        setClaimedToday(u.claimedToday ?? false);
        setReferralCode(u.referralCode ?? "");
        setTotalCashback(u.totalCashback ?? 0);
        // backend field is referralChainBonus
        setReferralBonus(u.referralChainBonus ?? u.referralBonus ?? 0);
        // backend field is billSplitRewards
        setSplitRewards(u.billSplitRewards ?? u.splitRewards ?? 0);
        setUpiStreak(u.upiStreak ?? 0);
        setScratchAvail(u.scratchAvail ?? false);
        setHasShield(u.hasShield ?? false);
        // If dashboard includes marketplace/coupons inline, use them
        if (u.marketplace)
          setMarketplace(Array.isArray(u.marketplace) ? u.marketplace : []);
        if (u.activeCoupons)
          setCoupons(Array.isArray(u.activeCoupons) ? u.activeCoupons : []);
      } else {
        console.warn("Failed to fetch user stats");
      }

      if (marketplaceRes?.ok) {
        const d = await marketplaceRes.json();
        setMarketplace(Array.isArray(d) ? d : []);
      } else {
        setMarketplace([]);
      }

      if (couponsRes?.ok) {
        const d = await couponsRes.json();
        setCoupons(Array.isArray(d) ? d : []);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
      setMarketplace([]);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch all dashboard data ───────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  // ── Expiry timers ──────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const t = {};
      if (Array.isArray(coupons)) {
        coupons.forEach((c) => {
          if (!c.expiryDate) return;
          const diff = new Date(c.expiryDate) - Date.now();
          const id = c._id || c.id;
          if (diff <= 0) {
            t[id] = "Expired";
            return;
          }
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          t[id] =
            diff > 86400000
              ? `${Math.floor(h / 24)}d left`
              : h > 0
                ? `${h}h ${m}m left`
                : `${m}m left`;
        });
      }
      setExpiryTimers(t);
    };
    update();
    const iv = setInterval(update, 60000);
    return () => clearInterval(iv);
  }, [coupons]);

  const boom = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3500);
  };

  const handleClaim = async () => {
    if (claimedToday || claimLoading) return;
    setClaimLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login first!");
        setClaimLoading(false);
        return;
      }

      // FIX: Use correctly mounted backend endpoints
      const res = await fetch("/api/claim-daily", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Debug — remove after testing
      console.log("Claim response status:", res.status);

      let data = {};
      try {
        data = await res.json();
      } catch (_) {}

      console.log("Claim response data:", data);

      if (!res.ok && res.status !== 200) {
        toast.error(data.message || data.error || `Error ${res.status}`);
        return;
      }

      if (data.success || data.newCoins) {
        const newCoins =
          data.newCoins ?? data.newBalance ?? data.coins ?? coins + 50;
        const newStreak = data.streak ?? data.newStreak ?? streak + 1;
        const reward = data.reward ?? 50;

        setCoins(newCoins);
        setStreak(newStreak);
        setClaimedToday(true);
        // Backend tells us if scratch is unlocked
        if (data.scratchAvail || data.scratchUnlocked) {
          setScratchAvail(true);
          toast.success(`+${reward} Coins claimed! 🎉 Scratch card unlocked!`);
        } else {
          toast.success(`+${reward} Coins claimed! 🎉`);
        }
        boom();
      } else if (data.claimedToday || data.success) {
        toast("Already claimed today! Come back tomorrow.");
        setClaimedToday(true);
      } else {
        toast.error(data.message || data.error || "Claim failed");
      }
    } catch (err) {
      console.error("Claim error:", err);
      toast.error("Network error — please try again");
    } finally {
      setClaimLoading(false);
    }
  };

  const handleRedeem = async (item) => {
    if (!item?.price) return;
    if (coins < item.price) {
      toast.error(`Need ${item.price - coins} more coins`);
      return;
    }
    try {
      const token = getToken();
      const res = await fetch("/api/marketplace/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: item._id }),
      });
      const data = await res.json();
      if (data.success) {
        setCoins(data.newCoins || data.newBalance);
        toast.success(`Redeemed ${item.title}!`);
        // Refresh coupons list since a new one might be added
        fetchData();
      } else toast.error(data.error || data.message || "Redemption failed");
    } catch {
      toast.error("Redemption failed");
    }
  };

  // FIX: handleCopy accepts id so featured carousel copy feedback also works
  const handleCopy = (code, id) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpinEnd = async (result) => {
    const SPIN_COST = 10;
    // We'll trust the server for the final amount

    // Sync with backend — use proper /api/spin-result endpoint
    try {
      const token = getToken();
      const res = await fetch("/api/spin-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ result }),
      });
      const data = await res.json();

      if (data.success || data.newCoins) {
        const newTotal = data.newCoins || data.newBalance;
        setCoins(newTotal);

        if (result.value === 0) {
          toast("Better luck next time!");
        } else {
          toast.success(`Won ${result.label}!`);
          boom();
        }

        // Refresh coupons if a coupon was won
        if (result.type === "coupon") fetchData();
      } else {
        toast.error(data.error || data.message || "Spin failed");
      }
    } catch (err) {
      console.error("Failed to sync spin result with backend", err);
      toast.error("Network error sync failed");
    }
  };

  const handleScratchReveal = async (prize) => {
    setScratchAvail(false);
    if (!prize.toLowerCase().includes("luck")) {
      toast.success(`Won ${prize}!`);
      boom();
    } else {
      toast("Better luck next time!");
    }

    try {
      const token = getToken();
      const res = await fetch("/api/scratch-reveal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prize }),
      });
      const data = await res.json();

      if (data.success || data.newCoins !== undefined) {
        setCoins(data.newCoins || data.newBalance);
        fetchData(); // Sync state to ensure UI matches DB (especially scratch availability)
      } else {
        toast.error(data.error || "Failed to save scratch reward");
      }
    } catch (err) {
      console.error("Failed to send scratch result", err);
      toast.error("Network error: scratch reveal failed");
    }
  };

  const handleMissionClaim = async (missionId, reward) => {
    try {
      const token = getToken();
      const res = await fetch("/api/missions/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ missionId }),
      });
      const data = await res.json();
      if (data.success) {
        setCoins(data.newCoins || data.newBalance);
        toast.success(`+${reward} coins!`);
        boom();
        // Refresh missions list to show as completed
        fetchData();
      } else toast.error(data.error || data.message || "Claim failed");
    } catch {
      toast.error("Claim failed");
    }
  };

  const handleShieldPurchase = async () => {
    try {
      const token = getToken();
      const res = await fetch("/api/shield/purchase", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success || data.newCoins) {
        setCoins(data.newCoins || data.newBalance);
        setHasShield(true);
        toast.success("Streak Shield activated!");
        fetchData(); // Sync everything
      } else {
        toast.error(data.error || data.message || "Purchase failed");
      }
    } catch (err) {
      console.error("Shield purchase error", err);
      toast.error("Network error: Purchase failed");
    }
  };

  const filteredCoupons = Array.isArray(coupons)
    ? coupons.filter(
        (c) =>
          filter === "All" ||
          (c.category || "").toLowerCase() === filter.toLowerCase(),
      )
    : [];

  // FIX: Clamp streak display so it never goes negative
  const daysToReward = Math.max(0, 7 - streak);

  const NAV = [
    { id: "rewards", Icon: FiGift, label: "Rewards" },
    { id: "missions", Icon: FiTarget, label: "Missions" },
    { id: "history", Icon: FiBarChart2, label: "History" },
    { id: "coupons", Icon: FiTag, label: "Coupons" },
  ];

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${dm ? "bg-slate-900" : "bg-slate-50"}`}
      >
        <div
          className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${dm ? "border-indigo-400" : "border-slate-900"}`}
        />
      </div>
    );

  return (
    <div
      className={`${bgMain} min-h-screen transition-colors duration-300 font-sans`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        body{font-family:'Plus Jakarta Sans',sans-serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fp-card{transition:all 0.18s ease}
        .fp-card:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(79,70,229,0.11)!important}
        .fp-btn{transition:all 0.18s ease}
        .fp-btn:hover{transform:translateY(-1px)}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes badgePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.8;transform:scale(1.06)}}
      `}</style>

      {showConfetti && <Confetti recycle={false} numberOfPieces={260} />}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontWeight: 600,
            fontSize: 13,
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* BALANCE CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[28px] p-6 md:p-8 relative overflow-hidden mb-6"
          style={{
            background: "linear-gradient(135deg,#4f46e5 0%,#312e81 100%)",
            color: "white",
            boxShadow: "0 12px 40px rgba(79,70,229,0.35)",
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-5">
            <div>
              <p className="text-indigo-200 text-xs font-bold tracking-[0.2em] uppercase mb-1">
                Rewards Club
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">
                Earn &amp; Redeem
              </h1>
              <div className="flex flex-wrap gap-2">
                {[
                  { Icon: FiDollarSign, label: `Cashback ₹${totalCashback}` },
                  { Icon: FiRepeat, label: `Referral ₹${referralBonus}` },
                  { Icon: FiUsers, label: `Split ₹${splitRewards}` },
                  { Icon: FiZap, label: `UPI Streak ${upiStreak}` },
                ].map((s) => (
                  <span
                    key={s.label}
                    className="flex items-center gap-[6px] text-xs font-semibold px-3 py-[5px] rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      color: "#c7d2fe",
                    }}
                  >
                    <s.Icon size={11} /> {s.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-[10px] self-end sm:self-start flex-shrink-0">
              {[
                {
                  Icon: FiAward,
                  tip: "Leaderboard",
                  fn: () => setShowLeader(true),
                  active: false,
                },
                {
                  Icon: FiShield,
                  tip: "Streak Shield",
                  fn: () => setShowShield(true),
                  active: hasShield,
                },
                ...(scratchAvail
                  ? [
                      {
                        Icon: FiScissors,
                        tip: "Scratch Card!",
                        fn: () => setShowScratch(true),
                        active: true,
                        pulse: true,
                      },
                    ]
                  : []),
              ].map((b) => (
                <button
                  key={b.tip}
                  title={b.tip}
                  onClick={b.fn}
                  className="flex items-center justify-center w-10 h-10 rounded-[12px] transition-colors"
                  style={{
                    background: b.active
                      ? "rgba(255,255,255,0.22)"
                      : "rgba(255,255,255,0.12)",
                    border: b.active
                      ? "1px solid rgba(255,255,255,0.4)"
                      : "1px solid rgba(255,255,255,0.18)",
                    cursor: "pointer",
                    color: b.active ? "#fff" : "#c7d2fe",
                    animation: b.pulse ? "badgePulse 1.5s infinite" : undefined,
                  }}
                >
                  <b.Icon size={16} />
                </button>
              ))}
              <div
                className="px-5 py-3 rounded-[16px] text-center"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <p className="text-[9px] font-bold tracking-[0.15em] text-indigo-300 uppercase mb-[2px]">
                  Coins
                </p>
                <p className="text-[26px] font-extrabold text-amber-300 flex items-center gap-[5px] leading-none">
                  <FiStar size={16} fill="#fcd34d" color="#fcd34d" />{" "}
                  {coins.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 mt-5">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowSpin(true)}
              className="group flex items-center gap-2 px-5 py-[11px] rounded-[14px] font-bold text-[13px] text-white transition-all"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div className="p-[6px] rounded-full bg-indigo-900/50 text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <FiActivity size={13} />
              </div>
              Daily Spin
              <span
                className="text-[11px] px-2 py-[2px] rounded-[7px]"
                style={{ background: "rgba(0,0,0,0.22)" }}
              >
                −10
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleClaim}
              disabled={claimedToday || claimLoading}
              className="group flex items-center gap-2 px-5 py-[11px] rounded-[14px] font-bold text-[13px] transition-all"
              style={{
                background: claimedToday
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.9)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: claimedToday ? "rgba(255,255,255,0.4)" : "#4f46e5",
                cursor: claimedToday ? "not-allowed" : "pointer",
                backdropFilter: "blur(16px)",
              }}
            >
              <div
                className={`p-[6px] rounded-full transition-colors ${claimedToday ? "bg-slate-200/20 text-slate-400" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"}`}
              >
                <FiClock size={13} />
              </div>
              {claimLoading
                ? "Claiming..."
                : claimedToday
                  ? "Claimed"
                  : "Claim 50 Coins"}
            </motion.button>
          </div>
        </motion.div>

        {/* STREAK BAR */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className={`flex flex-wrap items-center gap-4 rounded-[20px] p-5 border mb-5 ${cardCls}`}
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`p-3 rounded-xl ${dm ? "bg-orange-900/40 text-orange-400" : "bg-orange-50 text-orange-500"}`}
            >
              <FiZap size={20} />
            </div>
            <div>
              <p className={`font-extrabold text-[14px] ${textPri}`}>
                {streak}-Day Streak
              </p>
              {/* FIX: Clamped to never be negative */}
              <p className={`text-[11px] ${textSec}`}>
                {daysToReward > 0
                  ? `${daysToReward} days to Super Box (500 coins)`
                  : "🎉 Super Box unlocked!"}
              </p>
            </div>
          </div>
          <div className="flex gap-[5px]">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => {
              const done = d < streak;
              const active = d === streak;
              const grand = d === 7;
              return (
                <div
                  key={d}
                  className="flex items-center justify-center font-bold text-[13px] rounded-[10px]"
                  style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    background: done
                      ? dm
                        ? "rgba(16,185,129,0.15)"
                        : "#dcfce7"
                      : active
                        ? dm
                          ? "rgba(79,70,229,0.15)"
                          : "#eff6ff"
                        : dm
                          ? "rgba(255,255,255,0.04)"
                          : "#f8fafc",
                    border: done
                      ? `1.5px solid ${dm ? "rgba(16,185,129,0.4)" : "#86efac"}`
                      : active
                        ? "2px solid #4f46e5"
                        : dm
                          ? "1px solid #334155"
                          : "1.5px solid #f1f5f9",
                    color: done
                      ? dm
                        ? "#34d399"
                        : "#16a34a"
                      : active
                        ? "#4f46e5"
                        : dm
                          ? "#334155"
                          : "#cbd5e1",
                    boxShadow: active
                      ? "0 0 0 3px rgba(79,70,229,0.18)"
                      : "none",
                  }}
                >
                  {done ? (
                    <FiCheck size={13} />
                  ) : grand ? (
                    <FiGift size={13} />
                  ) : (
                    d
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 flex-wrap">
            {scratchAvail && (
              <button
                onClick={() => setShowScratch(true)}
                className="fp-btn flex items-center gap-[6px] px-[14px] py-2 rounded-[12px] font-bold text-[12px] border"
                style={{
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  border: "1px solid #059669",
                  color: "#fff",
                  cursor: "pointer",
                  animation: "badgePulse 1.5s infinite",
                }}
              >
                <FiScissors size={12} /> Scratch Card!
              </button>
            )}
            {!hasShield && (
              <button
                onClick={() => setShowShield(true)}
                className={`fp-btn flex items-center gap-[6px] px-[14px] py-2 rounded-[12px] font-bold text-[12px] ${dm ? "bg-indigo-900/30 border-indigo-800 text-indigo-400" : "bg-indigo-50 border-indigo-200 text-indigo-600"} border`}
                style={{ cursor: "pointer" }}
              >
                <FiShield size={12} /> Get Shield
              </button>
            )}
          </div>
        </motion.div>

        {/* Featured Carousel */}
        <FeaturedCarousel onCopy={handleCopy} />

        {/* SECTION NAV */}
        <div
          className={`flex gap-1 p-[5px] rounded-[16px] border mb-5 ${cardCls}`}
        >
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className="flex-1 flex items-center justify-center gap-[6px] py-[9px] rounded-[12px] font-bold text-[13px] transition-all duration-200"
              style={{
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                background:
                  section === n.id
                    ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                    : "transparent",
                color: section === n.id ? "#fff" : dm ? "#94a3b8" : "#64748b",
                boxShadow:
                  section === n.id ? "0 4px 12px rgba(79,70,229,0.3)" : "none",
              }}
            >
              <n.Icon size={14} />{" "}
              <span className="hidden sm:inline">{n.label}</span>
            </button>
          ))}
        </div>

        {/* REWARDS */}
        {section === "rewards" && (
          <div
            className="flex flex-col gap-5"
            style={{ animation: "fadeUp 0.28s ease" }}
          >
            {/* Referral */}
            <div
              className="rounded-[20px] p-6 relative overflow-hidden flex flex-wrap items-center justify-between gap-5"
              style={{
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                color: "#fff",
                boxShadow: "0 8px 28px rgba(79,70,229,0.3)",
              }}
            >
              <div
                className="absolute right-0 top-0 w-36 h-36 rounded-full opacity-10"
                style={{
                  background: "#fff",
                  filter: "blur(20px)",
                  transform: "translate(30px,-30px)",
                }}
              />
              <div className="flex items-center gap-5 z-10">
                <div
                  className="p-[14px] rounded-[16px]"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <FiUsers size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-[16px] mb-[2px]">
                    Refer &amp; Earn ₹100
                  </h3>
                  <p className="text-[12px] text-indigo-200">
                    Both you and friend get ₹100 scratch card!
                  </p>
                  <p className="text-[11px] text-indigo-300 mt-1">
                    + 5% of friend's earnings forever
                  </p>
                </div>
              </div>
              <div className="flex gap-[10px] flex-wrap z-10">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    toast.success("Referral code copied!");
                  }}
                  className="flex items-center gap-2 px-4 py-[9px] rounded-[12px] font-bold text-[13px] tracking-wide"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <FiCopy size={13} /> {referralCode}
                </button>
                {/* FIX: navigator.share check done properly */}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator
                        .share({
                          title: "Join FacePay",
                          text: `Use ${referralCode} to get ₹100!`,
                          url: "https://facepay.com",
                        })
                        .catch(() => {});
                    } else {
                      navigator.clipboard.writeText(
                        `Use ${referralCode} to get ₹100! https://facepay.com`,
                      );
                      toast.success("Link copied to share!");
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-[9px] rounded-[12px] font-bold text-[13px]"
                  style={{
                    background: "#fff",
                    border: "none",
                    color: "#4f46e5",
                    cursor: "pointer",
                  }}
                >
                  <FiChevronRight size={14} /> Share
                </button>
              </div>
            </div>

            {/* Mini stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  Icon: FiUsers,
                  label: "Bill Split Rewards",
                  sub: "Earn coins every time you split",
                  value: `₹${splitRewards} earned`,
                  valColor: "#059669",
                  bg: dm ? "rgba(16,185,129,0.08)" : "#f0fdf4",
                  bd: dm ? "rgba(16,185,129,0.2)" : "#bbf7d0",
                  icoBg: dm ? "rgba(16,185,129,0.15)" : "#dcfce7",
                  icoCol: "#10b981",
                },
                {
                  Icon: FiZap,
                  label: "UPI Streak Bonus",
                  sub: "Pay daily to grow your streak",
                  value: `${upiStreak} days`,
                  valColor: "#d97706",
                  bg: dm ? "rgba(245,158,11,0.08)" : "#fffbeb",
                  bd: dm ? "rgba(245,158,11,0.2)" : "#fde68a",
                  icoBg: dm ? "rgba(245,158,11,0.15)" : "#fef3c7",
                  icoCol: "#f59e0b",
                },
              ].map((c) => (
                <motion.div
                  key={c.label}
                  whileHover={{ y: -2 }}
                  className="fp-card rounded-[28px] p-5 relative overflow-hidden cursor-pointer flex flex-col justify-center"
                  style={{
                    background: c.bg,
                    border: `1.5px solid ${c.bd}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: c.icoBg }}
                    >
                      <c.Icon size={20} color={c.icoCol} />
                    </div>
                    <div>
                      <h4 className={`font-extrabold text-[14px] ${textPri}`}>
                        {c.label}
                      </h4>
                      <p className={`text-[11px] ${textSec}`}>{c.sub}</p>
                    </div>
                  </div>
                  <p
                    className="font-extrabold text-[20px] mt-3 ml-1"
                    style={{ color: c.valColor }}
                  >
                    {c.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Marketplace */}
            <div>
              <h3
                className={`text-sm font-bold uppercase tracking-wider mb-4 ml-1 ${textSec}`}
              >
                Redeem Coins
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Array.isArray(marketplace) &&
                  marketplace.map((item) => {
                    const id = item._id || item.id;
                    const can = coins >= item.price;
                    return (
                      <motion.div
                        key={id}
                        whileHover={{ y: -2 }}
                        className={`fp-card rounded-[24px] p-5 border ${cardCls}`}
                        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div
                            className={`p-3 rounded-xl ${dm ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}
                          >
                            <FiGift size={22} />
                          </div>
                          <span
                            className="flex items-center gap-1 text-[11px] font-bold px-[10px] py-1 rounded-full"
                            style={{
                              background: "#fffbeb",
                              border: "1px solid #fde68a",
                              color: "#92400e",
                            }}
                          >
                            <FiStar size={10} fill="#f59e0b" color="#f59e0b" />{" "}
                            {item.price}
                          </span>
                        </div>
                        <h4
                          className={`font-bold text-[14px] mb-[2px] ${textPri}`}
                        >
                          {item.title}
                        </h4>
                        <p className={`text-[11px] mb-4 ${textSec}`}>
                          {item.brand} Voucher
                        </p>
                        <button
                          onClick={() => handleRedeem(item)}
                          disabled={!can}
                          className={`w-full flex items-center justify-center gap-[6px] py-[10px] rounded-[12px] font-bold text-[13px] transition-all ${
                            can
                              ? dm
                                ? "border border-indigo-800 text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
                                : "border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                              : dm
                                ? "border border-slate-700 text-slate-600"
                                : "border border-slate-200 text-slate-400"
                          }`}
                          style={{ cursor: can ? "pointer" : "not-allowed" }}
                        >
                          {can ? (
                            <>
                              <FiChevronRight size={13} /> Redeem Now
                            </>
                          ) : (
                            <>
                              <FiLock size={12} /> Need more
                            </>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {section === "missions" && (
          <div style={{ animation: "fadeUp 0.28s ease" }}>
            <MissionsPanel darkMode={dm} onClaim={handleMissionClaim} />
          </div>
        )}

        {section === "history" && (
          <div style={{ animation: "fadeUp 0.28s ease" }}>
            <CoinHistoryPanel darkMode={dm} />
          </div>
        )}

        {section === "coupons" && (
          <div style={{ animation: "fadeUp 0.28s ease" }}>
            <div
              className={`flex p-1 rounded-[14px] w-max mb-5 ${dm ? "bg-slate-700" : "bg-slate-100"}`}
            >
              {["All", "Food", "Travel", "Shopping"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-[6px] rounded-[10px] text-xs font-bold capitalize transition-all ${
                    filter === f
                      ? dm
                        ? "bg-slate-600 shadow text-indigo-400"
                        : "bg-white shadow text-indigo-600"
                      : dm
                        ? "text-slate-400 hover:text-slate-200"
                        : "text-slate-500 hover:text-slate-700"
                  }`}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {filteredCoupons.length === 0 ? (
              <div
                className={`rounded-[20px] p-16 text-center border ${cardCls}`}
              >
                <div
                  className={`w-12 h-12 rounded-[14px] flex items-center justify-center mx-auto mb-3 ${dm ? "bg-slate-700" : "bg-slate-100"}`}
                >
                  <FiTag size={20} color={dm ? "#475569" : "#cbd5e1"} />
                </div>
                <p className={`font-semibold ${textSec}`}>
                  No coupons in this category
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCoupons.map((coupon) => {
                  const id = coupon._id || coupon.id;
                  const exp = expiryTimers[id];
                  const urgent = exp && exp.includes("h") && parseInt(exp) < 6;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`fp-card group relative overflow-hidden rounded-[20px] p-6 border flex flex-col sm:flex-row gap-5 ${
                        urgent
                          ? dm
                            ? "border-red-900/60 bg-red-950/20"
                            : "border-red-200"
                          : dm
                            ? "border-slate-700 bg-slate-800/80"
                            : "border-slate-100 bg-white"
                      }`}
                      style={{
                        boxShadow: urgent
                          ? "0 4px 16px rgba(239,68,68,0.08)"
                          : "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[5px] rounded-l-[20px]"
                        style={{
                          background: urgent
                            ? "linear-gradient(to bottom,#ef4444,#f97316)"
                            : "linear-gradient(to bottom,#4f46e5,#7c3aed)",
                        }}
                      />
                      {urgent && (
                        <div
                          className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-extrabold px-2 py-[3px] rounded-full"
                          style={{ background: "#fee2e2", color: "#dc2626" }}
                        >
                          <FiBell size={9} /> EXPIRING SOON
                        </div>
                      )}
                      <div className="flex-1 pl-3">
                        <div className="flex items-center gap-[10px] mb-2">
                          <div
                            className={`p-[7px] rounded-[9px] ${dm ? "bg-indigo-900/50 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}
                          >
                            <FiTag size={13} />
                          </div>
                          <span
                            className={`font-extrabold text-[14px] ${textPri}`}
                          >
                            {coupon.brand}
                          </span>
                          <span
                            className={`ml-auto text-[10px] font-bold px-2 py-[2px] rounded-full uppercase ${dm ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}
                          >
                            {coupon.category}
                          </span>
                        </div>
                        <p className={`text-[13px] leading-[1.5] ${textSec}`}>
                          {coupon.description}
                        </p>
                        <div
                          className="flex items-center gap-1 mt-2 text-[11px] font-medium"
                          style={{
                            color: urgent
                              ? "#dc2626"
                              : dm
                                ? "#94a3b8"
                                : "#64748b",
                          }}
                        >
                          <FiClock size={11} /> {exp || "No expiry"}
                        </div>
                      </div>
                      <div
                        className="flex flex-col justify-center items-center gap-2 border-t sm:border-t-0 sm:border-l border-dashed pt-4 sm:pt-0 sm:pl-5"
                        style={{
                          borderColor: dm ? "#334155" : "#e2e8f0",
                          minWidth: 130,
                        }}
                      >
                        <div
                          onClick={() => handleCopy(coupon.code, id)}
                          className="font-mono font-extrabold text-[16px] tracking-[3px] px-4 py-2 rounded-[10px] cursor-pointer group-hover:scale-105 transition-transform"
                          style={{
                            color: "#4f46e5",
                            background: dm ? "rgba(79,70,229,0.12)" : "#eff6ff",
                            border: "1.5px dashed #c7d2fe",
                          }}
                        >
                          {coupon.code}
                        </div>
                        <div
                          onClick={() => handleCopy(coupon.code, id)}
                          className="flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                          style={{
                            color: copiedId === id ? "#16a34a" : "#4f46e5",
                          }}
                        >
                          {copiedId === id ? (
                            <>
                              <FiCheck size={11} /> COPIED
                            </>
                          ) : (
                            <>
                              <FiCopy size={11} /> TAP TO COPY
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showSpin && (
          <SpinWheel
            onSpinEnd={handleSpinEnd}
            onClose={() => setShowSpin(false)}
            coins={coins}
          />
        )}
        {showScratch && (
          <ScratchCard
            onClose={() => setShowScratch(false)}
            onReveal={handleScratchReveal}
          />
        )}
        {showLeader && (
          <LeaderboardModal
            coins={coins}
            darkMode={dm}
            onClose={() => setShowLeader(false)}
          />
        )}
        {showShield && (
          <StreakShieldModal
            coins={coins}
            darkMode={dm}
            onClose={() => setShowShield(false)}
            onPurchase={handleShieldPurchase}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
