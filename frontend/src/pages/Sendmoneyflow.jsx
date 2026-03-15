import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "react-icons/fi";

// ─── STEP CONSTANTS ─────────────────────────────────────────────────────────
const STEPS = {
  INTRO: "intro",
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

// ─── PARTICLES BACKGROUND (subtle, aesthetic) ───────────────────────────────
const ParticlesBackground = ({ count = 20, color = "rgb(59,130,246)" }) => {
  const particles = useRef([]);
  useEffect(() => {
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      speed: 0.01 + Math.random() * 0.04,
      delay: Math.random() * 5,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.current.map((p, i) => (
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

// ─── INTRO POPUP (enhanced aesthetics) ───────────────────────────────────────
const IntroPopup = ({ onNext, onClose, darkMode }) => {
  const dm = darkMode;
  const steps = [
    {
      icon: <FiUser size={14} />,
      title: "Scan Recipient's Face",
      desc: "Place the recipient's face in front of the camera",
    },
    {
      icon: <FiShield size={14} />,
      title: "AWS Recognition",
      desc: "Search the face database using AWS Rekognition",
    },
    {
      icon: <FiCheckCircle size={14} />,
      title: "Confirm Match",
      desc: "Recipient details appear after a successful match",
    },
    {
      icon: <FiDollarSign size={14} />,
      title: "Enter Amount",
      desc: "Enter the amount to send – balance is checked",
    },
    {
      icon: <FiSend size={14} />,
      title: "Payment Complete",
      desc: "One‑tap secure payment",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 30 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl z-50 ${
        dm
          ? "bg-slate-900/80 backdrop-blur-xl border border-slate-700/50"
          : "bg-white/80 backdrop-blur-xl border border-slate-200/50"
      }`}
    >
      <ParticlesBackground color={dm ? "#60a5fa" : "#2563eb"} count={15} />

      {/* Header with gradient line */}
      <div className="relative p-5 text-center border-b border-white/10">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <FiX size={16} className={dm ? "text-slate-300" : "text-slate-600"} />
        </button>
        <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <FiCamera size={28} className="text-white" />
        </div>
        <h2
          className={`text-2xl font-bold tracking-tight ${dm ? "text-white" : "text-slate-900"}`}
        >
          Send with Face Pay
        </h2>
        <p
          className={`text-sm mt-1 ${dm ? "text-slate-400" : "text-slate-600"}`}
        >
          Secure biometric payment – just by face!
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <FiLock size={14} className="text-green-400" />
          <span
            className={`text-xs font-medium ${dm ? "text-slate-400" : "text-slate-600"}`}
          >
            256‑bit Encrypted · AWS Powered
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="relative p-4">
        <p
          className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dm ? "text-slate-400" : "text-slate-500"}`}
        >
          How it works
        </p>
        <div className="flex flex-col gap-2">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                dm
                  ? "bg-slate-800/40 border-slate-700 hover:border-indigo-500/50"
                  : "bg-slate-50/40 border-slate-200 hover:border-indigo-400/50"
              } backdrop-blur-sm`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${
                  dm
                    ? "bg-slate-700 text-indigo-300"
                    : "bg-white text-indigo-600 shadow-sm"
                }`}
              >
                {s.icon}
              </div>
              <div className="flex-1">
                <p
                  className={`font-semibold text-xs ${dm ? "text-slate-200" : "text-slate-800"}`}
                >
                  {s.title}
                </p>
                <p
                  className={`text-[10px] mt-0.5 leading-relaxed ${dm ? "text-slate-500" : "text-slate-500"}`}
                >
                  {s.desc}
                </p>
              </div>
              <div
                className={`ml-auto text-xs font-mono ${dm ? "text-slate-600" : "text-slate-400"}`}
              >
                {i + 1}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{
            scale: 1.02,
            boxShadow: "0 10px 25px -5px rgba(99,102,241,0.5)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:shadow-xl transition-all"
        >
          <FiCamera size={18} /> Start — Face Scan
          <FiArrowRight size={16} />
        </motion.button>

        <p
          className={`text-center text-[9px] mt-2 ${dm ? "text-slate-600" : "text-slate-400"}`}
        >
          Your face data is processed securely, never stored
        </p>
      </div>
    </motion.div>
  );
};

// ─── FACE SCAN POPUP (refined visuals) ───────────────────────────────────────
const FaceScanPopup = ({ onSuccess, onClose, darkMode }) => {
  const dm = darkMode;
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [faceDetected, setFaceDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState("Initializing...");
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [faceapi, setFaceapi] = useState(null);

  const detectionInterval = useRef(null);
  const scanAnimationRef = useRef(null);
  const particlesRef = useRef([]);

  // Initialize particles for canvas overlay
  useEffect(() => {
    particlesRef.current = Array.from({ length: 20 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.001 + Math.random() * 0.002,
      size: 1 + Math.random() * 2,
    }));
  }, []);

  // Load face-api script
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
    script.async = true;

    script.onload = () => {
      if (window.faceapi) {
        setFaceapi(window.faceapi);
        init(window.faceapi);
      } else {
        setError("face-api.js loaded but faceapi not found on window");
        setIsLoading(false);
      }
    };

    script.onerror = () => {
      setError("Failed to load face-api.js from CDN");
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (detectionInterval.current) clearInterval(detectionInterval.current);
      if (scanAnimationRef.current) clearInterval(scanAnimationRef.current);
      stopCamera();
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const init = async (faceapiLib) => {
    try {
      setLoadingStep("Loading AI models...");
      await loadModels(faceapiLib);

      setLoadingStep("Starting camera...");
      await startCamera();

      setLoadingStep("Initializing detection...");
      startDetection(faceapiLib);

      setIsLoading(false);
    } catch (err) {
      setError(err.message || "Initialization failed");
      setIsLoading(false);
    }
  };

  const loadModels = async (faceapiLib) => {
    const MODEL_URL =
      "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
    try {
      await Promise.all([
        faceapiLib.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapiLib.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapiLib.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    } catch {
      throw new Error("Failed to load face detection models");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      throw new Error("Camera access denied. Please allow camera permission.");
    }
  };

  const startDetection = (faceapiLib) => {
    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      try {
        const detections = await faceapiLib.detectAllFaces(
          videoRef.current,
          new faceapiLib.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          }),
        );

        const detected = detections.length === 1;
        setFaceDetected(detected);

        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const displaySize = {
            width: videoRef.current.offsetWidth,
            height: videoRef.current.offsetHeight,
          };

          faceapiLib.matchDimensions(canvas, displaySize);
          const resizedDetections = faceapiLib.resizeResults(
            detections,
            displaySize,
          );

          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detected && resizedDetections.length > 0) {
            const detection = resizedDetections[0];
            drawFaceMesh(
              ctx,
              detection.detection.box,
              canvas.width,
              canvas.height,
            );
          }
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    }, 100);
  };

  const drawFaceMesh = (ctx, box, width, height) => {
    // Particles
    particlesRef.current.forEach((p) => {
      p.y = (p.y + p.speed) % 1;
      const x = p.x * width;
      const y = p.y * height;
      ctx.fillStyle = `rgba(59, 130, 246, ${0.2 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Grid overlay
    ctx.strokeStyle = "rgba(59, 130, 246, 0.1)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 8; i++) {
      const xPos = box.x + (box.width / 8) * i;
      ctx.beginPath();
      ctx.moveTo(xPos, box.y);
      ctx.lineTo(xPos, box.y + box.height);
      ctx.stroke();
    }
    for (let i = 0; i <= 10; i++) {
      const yPos = box.y + (box.height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(box.x, yPos);
      ctx.lineTo(box.x + box.width, yPos);
      ctx.stroke();
    }

    // Simulated mesh points
    const cx = box.x + box.width / 2;
    const points = [
      { x: box.x + box.width * 0.1, y: box.y + box.height * 0.3 },
      { x: box.x + box.width * 0.05, y: box.y + box.height * 0.5 },
      { x: box.x + box.width * 0.1, y: box.y + box.height * 0.7 },
      { x: box.x + box.width * 0.2, y: box.y + box.height * 0.85 },
      { x: cx, y: box.y + box.height * 0.95 },
      { x: box.x + box.width * 0.8, y: box.y + box.height * 0.85 },
      { x: box.x + box.width * 0.9, y: box.y + box.height * 0.7 },
      { x: box.x + box.width * 0.95, y: box.y + box.height * 0.5 },
      { x: box.x + box.width * 0.9, y: box.y + box.height * 0.3 },
      { x: box.x + box.width * 0.3, y: box.y + box.height * 0.35 },
      { x: box.x + box.width * 0.7, y: box.y + box.height * 0.35 },
      { x: cx, y: box.y + box.height * 0.5 },
      { x: cx, y: box.y + box.height * 0.6 },
      { x: box.x + box.width * 0.35, y: box.y + box.height * 0.75 },
      { x: cx, y: box.y + box.height * 0.78 },
      { x: box.x + box.width * 0.65, y: box.y + box.height * 0.75 },
      { x: box.x + box.width * 0.25, y: box.y + box.height * 0.25 },
      { x: box.x + box.width * 0.35, y: box.y + box.height * 0.22 },
      { x: box.x + box.width * 0.65, y: box.y + box.height * 0.22 },
      { x: box.x + box.width * 0.75, y: box.y + box.height * 0.25 },
    ];

    ctx.strokeStyle = scanComplete ? "#10b981" : "#3b82f6";
    ctx.lineWidth = 1;
    ctx.shadowColor = scanComplete ? "#10b981" : "#3b82f6";
    ctx.shadowBlur = 8;

    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [0, 16],
      [8, 19],
      [16, 17],
      [17, 9],
      [18, 19],
      [19, 10],
      [9, 11],
      [10, 11],
      [11, 12],
      [12, 4],
      [9, 13],
      [10, 15],
      [13, 14],
      [14, 15],
      [2, 13],
      [6, 15],
    ];

    connections.forEach(([start, end]) => {
      if (points[start] && points[end]) {
        ctx.beginPath();
        ctx.moveTo(points[start].x, points[start].y);
        ctx.lineTo(points[end].x, points[end].y);
        ctx.stroke();
      }
    });

    ctx.shadowBlur = 0;
    ctx.fillStyle = scanComplete ? "#10b981" : "#3b82f6";
    ctx.shadowColor = scanComplete ? "#10b981" : "#3b82f6";
    ctx.shadowBlur = 8;

    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;

    // Outer subtle frame (replacing corner frames with a simple glow)
    if (scanComplete) {
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 20;
      ctx.strokeRect(box.x - 10, box.y - 10, box.width + 20, box.height + 20);
      ctx.shadowBlur = 0;
    } else if (faceDetected) {
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 15;
      ctx.strokeRect(box.x - 10, box.y - 10, box.width + 20, box.height + 20);
      ctx.shadowBlur = 0;
    }

    // Scan line
    if (isScanning && !scanComplete) {
      const scanY = box.y + (box.height * scanProgress) / 100;
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(box.x - 15, scanY);
      ctx.lineTo(box.x + box.width + 15, scanY);
      ctx.stroke();

      const gradient = ctx.createLinearGradient(0, box.y, 0, scanY);
      gradient.addColorStop(0, "rgba(59, 130, 246, 0)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(box.x - 15, box.y, box.width + 30, scanY - box.y);
      ctx.shadowBlur = 0;
    }
  };

  // Scanning animation
  useEffect(() => {
    if (faceDetected && !scanComplete) {
      setIsScanning(true);
      scanAnimationRef.current = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(scanAnimationRef.current);
            setScanComplete(true);
            setIsScanning(false);
            return 100;
          }
          return prev + 1.5;
        });
      }, 50);
    } else if (!faceDetected && scanAnimationRef.current) {
      clearInterval(scanAnimationRef.current);
      setIsScanning(false);
      setScanProgress(0);
      setScanComplete(false);
    }

    return () => {
      if (scanAnimationRef.current) clearInterval(scanAnimationRef.current);
    };
  }, [faceDetected, scanComplete]);

  const handleContinue = async () => {
    if (!scanComplete) return;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

      const token = localStorage.getItem("facepay_token");
      const res = await fetch("http://localhost:5000/api/face/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image: imageBase64 }),
      });
      const data = await res.json();
      stopCamera();

      if (data.success && data.user) {
        onSuccess(data.user);
      } else {
        setError("No registered user found with this face.");
        setFaceDetected(false);
        setScanComplete(false);
        setScanProgress(0);
      }
    } catch {
      setError("Network error. Please try again.");
      stopCamera();
    }
  };

  const handleRetry = () => {
    setError(null);
    setFaceDetected(false);
    setScanComplete(false);
    setScanProgress(0);
    startCamera();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 30 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl z-50 ${
        dm
          ? "bg-slate-900/80 backdrop-blur-xl border border-slate-700/50"
          : "bg-white/80 backdrop-blur-xl border border-slate-200/50"
      }`}
    >
      <ParticlesBackground color={dm ? "#60a5fa" : "#2563eb"} count={10} />

      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${dm ? "border-white/10" : "border-black/10"}`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <FiCamera className="text-indigo-400" size={14} />
          </div>
          <span
            className={`font-semibold text-sm ${dm ? "text-white" : "text-slate-900"}`}
          >
            Face Scan
          </span>
        </div>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-xl transition-colors ${dm ? "hover:bg-white/10 text-slate-400" : "hover:bg-black/5 text-slate-600"}`}
        >
          <FiX size={16} />
        </button>
      </div>

      <div className="p-4">
        {error ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center">
              <FiAlertCircle size={32} className="text-red-500" />
            </div>
            <div>
              <h3
                className={`font-semibold text-sm ${dm ? "text-white" : "text-slate-900"}`}
              >
                Face Not Recognized
              </h3>
              <p
                className={`text-xs mt-1 ${dm ? "text-slate-400" : "text-slate-500"}`}
              >
                {error}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
            >
              <FiRefreshCw size={14} /> Try Again
            </motion.button>
          </div>
        ) : (
          <>
            {/* Camera view */}
            <div className="relative rounded-2xl overflow-hidden mb-3 h-48 bg-black border border-indigo-500/30 shadow-inner">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                  <div className="text-center">
                    <div className="relative w-10 h-10 mx-auto mb-2">
                      <div className="absolute inset-0 border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="text-xs text-indigo-400 font-medium">
                      {loadingStep}
                    </div>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />

              {/* Status overlays */}
              {!isLoading && faceDetected && (
                <>
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-indigo-400 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-indigo-500/30">
                    <div>AWS REKOGNITION</div>
                    <div className="text-green-400 mt-0.5 flex items-center gap-1">
                      <FiCheckCircle size={7} /> ACTIVE
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-indigo-400 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-indigo-500/30 text-right">
                    <div>CONFIDENCE: {scanProgress.toFixed(0)}%</div>
                    <div className="text-cyan-400 mt-0.5 flex items-center justify-end gap-1">
                      <FiClock size={7} /> {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </>
              )}

              {!isLoading && !faceDetected && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                  <span className="text-white text-[9px] font-medium">
                    No face detected
                  </span>
                </div>
              )}

              {scanComplete && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center backdrop-blur-sm"
                  >
                    <FiCheckCircle size={28} className="text-green-400" />
                  </motion.div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {isScanning && !scanComplete && (
              <div className="w-full bg-white/10 rounded-full h-1 mb-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            {/* Instruction text */}
            <p
              className={`text-[10px] text-center mb-3 ${dm ? "text-slate-400" : "text-slate-500"}`}
            >
              {scanComplete
                ? "Face verified successfully"
                : faceDetected
                  ? "Hold steady – scanning facial features"
                  : "Position your face within the frame"}
            </p>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className={`flex-1 py-2.5 rounded-xl font-medium text-xs border backdrop-blur-sm transition-colors ${
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
                disabled={!scanComplete || isLoading}
                onClick={handleContinue}
                className={`flex-1 py-2.5 rounded-xl font-medium text-xs flex items-center justify-center gap-1 shadow-lg ${
                  scanComplete && !isLoading
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30"
                    : dm
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isLoading
                  ? "Loading..."
                  : scanComplete
                    ? "Continue"
                    : `Scanning ${scanProgress.toFixed(0)}%`}
                {scanComplete && <FiArrowRight size={10} />}
              </motion.button>
            </div>
          </>
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
}) => {
  const dm = darkMode;
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
        if (data.success) setLiveBalance(data.balance);
      } catch {}
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setError("");
    setBalanceOk(null);
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    const num = Number(amount);
    if (num > liveBalance) {
      setBalanceOk(false);
      setError(
        `Insufficient balance! You have only ₹${liveBalance.toFixed(2)}.`,
      );
    } else if (num < 1) {
      setError("Minimum ₹1 is required.");
    } else {
      setBalanceOk(true);
    }
  }, [amount, liveBalance]);

  const handlePay = async () => {
    if (!balanceOk) return;
    setChecking(true);
    try {
      const token = localStorage.getItem("facepay_token");
      const res = await fetch("http://localhost:5000/api/wallet/balance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success || data.balance < Number(amount)) {
        setError("Balance check failed! Please try again.");
        setChecking(false);
        return;
      }
      setChecking(false);
      onConfirm({ amount: Number(amount), note, recipient });
    } catch {
      setError("Network error. Please try again.");
      setChecking(false);
    }
  };

  const remaining = liveBalance - (Number(amount) || 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 30 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl z-50 ${
        dm
          ? "bg-slate-900/80 backdrop-blur-xl border border-slate-700/50"
          : "bg-white/80 backdrop-blur-xl border border-slate-200/50"
      }`}
    >
      <ParticlesBackground color={dm ? "#60a5fa" : "#2563eb"} count={10} />

      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${dm ? "border-white/10" : "border-black/10"}`}
      >
        <span
          className={`font-semibold text-sm ${dm ? "text-white" : "text-slate-900"}`}
        >
          <FiDollarSign className="inline mr-1" /> Enter Amount
        </span>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-xl ${dm ? "hover:bg-white/10 text-slate-400" : "hover:bg-black/5 text-slate-600"}`}
        >
          <FiX size={16} />
        </button>
      </div>

      <div className="p-4">
        {/* Recipient info */}
        <div
          className={`flex items-center gap-2 p-2.5 rounded-xl border mb-3 backdrop-blur-sm ${
            dm
              ? "bg-slate-800/40 border-slate-700"
              : "bg-indigo-50/40 border-indigo-200"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {recipient?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p
              className={`font-semibold text-xs ${dm ? "text-white" : "text-slate-900"}`}
            >
              {recipient?.name}
            </p>
            <p
              className={`text-[9px] ${dm ? "text-slate-400" : "text-slate-500"}`}
            >
              {recipient?.email}
            </p>
          </div>
          <div className="ml-auto">
            <span className="text-[7px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30">
              ✓ Verified
            </span>
          </div>
        </div>

        {/* Live balance */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-xl mb-3 border backdrop-blur-sm ${
            dm
              ? "bg-slate-800/40 border-slate-700"
              : "bg-slate-50/40 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span
              className={`text-[9px] font-medium ${dm ? "text-slate-400" : "text-slate-500"}`}
            >
              Live Balance
            </span>
          </div>
          <span
            className={`font-semibold text-xs ${dm ? "text-green-400" : "text-green-600"}`}
          >
            ₹{liveBalance.toFixed(2)}
          </span>
        </div>

        {/* Amount input */}
        <div
          className={`relative mb-2 rounded-xl border-2 transition-all ${
            balanceOk === false
              ? "border-red-500"
              : balanceOk === true
                ? "border-green-500"
                : dm
                  ? "border-slate-700 focus-within:border-indigo-500"
                  : "border-slate-200 focus-within:border-indigo-400"
          }`}
        >
          <div
            className={`absolute left-3 top-1/2 -translate-y-1/2 font-medium text-lg ${dm ? "text-slate-400" : "text-slate-400"}`}
          >
            ₹
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className={`w-full pl-8 pr-10 py-3 text-xl font-semibold rounded-xl bg-transparent focus:outline-none ${dm ? "text-white placeholder-slate-700" : "text-slate-900 placeholder-slate-300"}`}
          />
          {balanceOk === true && (
            <FiCheckCircle
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400"
              size={16}
            />
          )}
          {balanceOk === false && (
            <FiAlertCircle
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400"
              size={16}
            />
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-[9px] font-medium mb-2 flex items-center gap-1"
            >
              <FiAlertCircle size={8} /> {error}
            </motion.p>
          )}
        </AnimatePresence>

        {balanceOk === true && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-[9px] mb-2 font-medium ${dm ? "text-slate-400" : "text-slate-500"}`}
          >
            Balance after payment:{" "}
            <span className={dm ? "text-slate-200" : "text-slate-800"}>
              ₹{remaining.toFixed(2)}
            </span>
          </motion.p>
        )}

        <div className="flex gap-1 flex-wrap mb-3">
          {quickAmounts.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(q.toString())}
              className={`px-2 py-1 rounded-lg text-[9px] font-medium transition-all border ${
                Number(amount) === q
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : dm
                    ? "border-slate-700 text-slate-400 hover:border-indigo-600 hover:text-indigo-400"
                    : "border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
              }`}
            >
              ₹{q}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional) – e.g. For dinner"
          maxLength={100}
          className={`w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 border mb-4 backdrop-blur-sm ${
            dm
              ? "bg-slate-800/40 border-slate-700 text-white placeholder-slate-500"
              : "bg-slate-50/40 border-slate-200 placeholder-slate-400"
          }`}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePay}
          disabled={!balanceOk || checking || !amount}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            balanceOk && !checking
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:shadow-xl"
              : dm
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {checking ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
              />
              Verifying...
            </>
          ) : (
            <>
              <FiSend size={14} /> Pay ₹{amount || "0"}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── CONFIRM POPUP (elegant) ─────────────────────────────────────────────────
const ConfirmPopup = ({ paymentData, onConfirm, onClose, darkMode }) => {
  const dm = darkMode;
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("facepay_token");
      const res = await fetch(
        "http://localhost:5000/api/transactions/face-pay",
        {
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
        },
      );
      const data = await res.json();
      if (data.success) {
        onConfirm(data.transaction);
      } else {
        alert(data.message || "Payment failed!");
        setLoading(false);
      }
    } catch {
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
      <ParticlesBackground color={dm ? "#60a5fa" : "#2563eb"} count={8} />

      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white text-center border-b border-white/10">
        <FiLock size={28} className="mx-auto mb-2" />
        <h2 className="text-lg font-semibold">Confirm Payment</h2>
        <p className="text-indigo-200 text-[10px] mt-1">
          Please verify the details
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

// ─── SUCCESS POPUP (keep green for success) ──────────────────────────────────
const SuccessPopup = ({
  transaction,
  recipient,
  amount,
  onClose,
  darkMode,
}) => {
  const dm = darkMode;
  const [count, setCount] = useState(0);

  useEffect(() => {
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
    return () => clearInterval(t);
  }, [amount]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", damping: 20, stiffness: 250 }}
      className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl z-50 ${
        dm
          ? "bg-slate-900/80 backdrop-blur-xl border border-slate-700/50"
          : "bg-white/80 backdrop-blur-xl border border-slate-200/50"
      }`}
    >
      <ParticlesBackground color="#10b981" count={12} />

      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-5 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white"
              initial={{ y: -5, x: Math.random() * 250, opacity: 1 }}
              animate={{ y: 150, opacity: 0 }}
              transition={{
                duration: 1.5 + Math.random(),
                delay: Math.random() * 0.5,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="relative z-10 mb-2"
        >
          <FiCheckCircle size={44} className="mx-auto" />
        </motion.div>
        <h2 className="text-xl font-semibold relative z-10">
          Payment Successful!
        </h2>
        <p className="text-green-100 text-[10px] mt-1 relative z-10">
          Money sent securely
        </p>
      </div>

      <div className="p-4 text-center">
        <motion.div
          className={`text-3xl font-semibold mb-1 ${dm ? "text-white" : "text-slate-900"}`}
        >
          ₹{count.toFixed(0)}
        </motion.div>
        <p
          className={`text-[10px] mb-1 ${dm ? "text-slate-400" : "text-slate-500"}`}
        >
          Sent to{" "}
          <span
            className={`font-medium ${dm ? "text-slate-200" : "text-slate-800"}`}
          >
            {recipient?.name}
          </span>
        </p>
        {transaction?.id && (
          <p
            className={`text-[7px] font-mono mt-1 ${dm ? "text-slate-600" : "text-slate-400"}`}
          >
            TXN: {transaction.id}
          </p>
        )}

        <div
          className={`mt-3 p-2.5 rounded-xl border backdrop-blur-sm ${
            dm
              ? "bg-slate-800/30 border-slate-700"
              : "bg-green-50/30 border-green-200"
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <FiCheckCircle className="text-green-400" size={12} />
            <span
              className={`text-[9px] font-medium ${dm ? "text-green-400" : "text-green-700"}`}
            >
              Transaction Successful
            </span>
          </div>
          <p
            className={`text-[6px] mt-0.5 ${dm ? "text-slate-500" : "text-slate-400"}`}
          >
            {new Date().toLocaleString("en-IN")}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-green-500/30"
        >
          Done
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
}) {
  const [step, setStep] = useState(STEPS.INTRO);
  const [isOpen, setIsOpen] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [completedTxn, setCompletedTxn] = useState(null);

  const openFlow = () => {
    setStep(STEPS.INTRO);
    setIsOpen(true);
  };
  const closeFlow = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep(STEPS.INTRO);
      setRecipient(null);
      setPaymentData(null);
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
            : "bg-white/60 border border-white/70 hover:bg-white/80"
        }`}
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div
          className={`p-3 rounded-full mb-2 transition-all duration-300 ${
            darkMode
              ? "bg-indigo-900/50 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30"
              : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30"
          }`}
        >
          <FiSend className="text-xl" />
        </div>
        <span
          className={`text-[10px] font-semibold tracking-wide uppercase ${
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
                    onNext={() => setStep(STEPS.FACE_SCAN)}
                    onClose={closeFlow}
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
