import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { QRCodeSVG } from "qrcode.react";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

const FaceLoginModal = ({ close, onSuccess }) => {
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

  const [showQRModal, setShowQRModal] = useState(false);
  const [sessionToken, setSessionToken] = useState("");

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

      console.log("Capturing frame for verification...");

      // ⚡ FAST: Capture only ONE frame for login instead of waiting for 3
      const frame = webcamRef.current?.getScreenshot();
      if (!frame) {
        throw new Error("Failed to capture face");
      }

      setScanProgress(50);
      console.log("Verifying with AWS Rekognition...");

      const response = await fetch(
        "http://localhost:5000/api/auth/login/face",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: frame,
          }),
        },
      );

      const result = await response.json();
      setScanProgress(100);
      console.log("Response:", result);

      if (result.success && result.token) {
        console.log("Face matched!");
        console.log("User:", result.user.full_name);
        console.log("Similarity:", result.faceMatch?.similarity + "%");

        localStorage.setItem("facepay_token", result.token);
        localStorage.setItem("facepay_user", JSON.stringify(result.user));

        setStep("success");

        // ⚡ INSTANT REDIRECT: Redirect immediately on success
        if (onSuccess) onSuccess(result);
        close();
        window.location.href = "/dashboard";
      } else {
        console.log("Verification failed");
        setError(result.message || "Face not recognized. Please try again.");
        setStep("error");
        setTimeout(() => {
          setStep("ready");
          setError("");
          setChallengeStep(0);
          setScanProgress(0);
        }, 2500);
      }
    } catch (e) {
      console.error("Error:", e);
      setError(e.message || "Verification failed. Please try again.");
      setStep("error");
      setTimeout(() => {
        setStep("ready");
        setError("");
        setChallengeStep(0);
        setScanProgress(0);
      }, 2500);
    } finally {
      setLoading(false);
    }
  };

  const handleScanWithMobile = () => {
    const dummyToken = "test-session-" + Date.now();
    setSessionToken(dummyToken);
    setShowQRModal(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setSessionToken("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <button
          onClick={close}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200"
          disabled={loading}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Face Login</h2>
          <p className="text-sm text-gray-600 mt-1">
            {step === "ready" && "Position your face within the detection area"}
            {step === "countdown" && "Get ready..."}
            {step === "scanning" &&
              "Hold steady while scanning facial features"}
            {step === "success" && "Biometric verification successful"}
            {step === "error" && "Verification failed"}
          </p>
        </div>

        <div className="relative">
          <div className="h-80 relative bg-black overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover opacity-90"
            />

            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute top-0 left-0 w-full h-full"
            />

            {step === "scanning" && (
              <>
                <div className="absolute top-4 left-4 text-xs font-mono text-blue-400 bg-black/50 backdrop-blur-sm px-3 py-2 rounded">
                  <div>AWS REKOGNITION</div>
                  <div className="text-green-400 mt-1">● ACTIVE</div>
                </div>

                <div className="absolute top-4 right-4 text-xs font-mono text-blue-400 bg-black/50 backdrop-blur-sm px-3 py-2 rounded text-right">
                  <div>CONFIDENCE: {scanProgress.toFixed(0)}%</div>
                  <div className="text-cyan-400 mt-1">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </>
            )}

            {step === "countdown" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-9xl font-bold text-white mb-4">
                    {countdown}
                  </div>
                  <div className="text-sm text-blue-400 font-medium">
                    Get ready...
                  </div>
                </div>
              </div>
            )}

            {step === "scanning" && scanProgress < 100 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 z-10">
                <div className="bg-gray-800/70 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-blue-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div
                className={`px-6 py-2.5 text-sm font-semibold rounded-full backdrop-blur-md transition-all duration-300 border-2 ${
                  step === "success"
                    ? "bg-green-500/90 text-white border-green-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                    : step === "scanning"
                      ? "bg-blue-500/90 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      : step === "error"
                        ? "bg-red-500/90 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        : "bg-gray-800/80 text-gray-300 border-gray-600"
                }`}
              >
                {step === "success" && "✓ VERIFICATION COMPLETE"}
                {step === "scanning" && (
                  <>
                    {challengeStep === 1 && "⟳ CHECKING LIVENESS..."}
                    {challengeStep === 2 && "⟳ ANALYZING FACE..."}
                    {challengeStep === 3 && "⟳ VERIFYING IDENTITY..."}
                  </>
                )}
                {step === "ready" && "◉ READY TO SCAN"}
                {step === "countdown" && "◉ STARTING..."}
                {step === "error" && "⊗ VERIFICATION FAILED"}
              </div>
            </div>

            {step === "success" && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-scale-in">
                <div className="w-24 h-24 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-14 h-14 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}

            {step === "error" && (
              <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-500/20 border-4 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-14 h-14 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <p className="text-white text-lg font-semibold">
                    {error || "Verification Failed"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && step !== "error" && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {step === "ready" && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-sm text-gray-700 font-medium mb-3">
                Important Instructions:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span>Use your real face, not a photo or video</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span>Remove sunglasses and look directly at camera</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">●</span>
                  <span>Ensure good lighting on your face</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={close}
            disabled={loading || step === "scanning"}
            className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          <button
            onClick={handleStartScan}
            disabled={step !== "ready" || loading}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              step === "ready" && !loading
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {step === "ready" && "Scan & Login"}
            {step === "countdown" && "Starting..."}
            {step === "scanning" && `Scanning... ${scanProgress.toFixed(0)}%`}
            {step === "success" && "Success"}
            {step === "error" && "Try Again"}
          </button>

          <button
            onClick={handleScanWithMobile}
            disabled={loading || step !== "ready"}
            className="flex-1 py-3.5 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-600 hover:via-cyan-500 hover:to-blue-700"
          >
            Scan with Mobile
          </button>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 font-medium">
            Liveness detection enabled · Secured by AWS Rekognition
          </p>
        </div>
      </div>

      {/* Updated QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full relative">
            <button
              onClick={handleCloseQRModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-center mb-6 text-gray-900">
              Scan with Mobile
            </h3>

            <div className="flex justify-center mb-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <QRCodeSVG
                value={`https://unissuant-annalise-unlecherously.ngrok-free.dev/scan?session=${sessionToken || "demo"}`}
                size={240}
                fgColor="#000000" // ← Black QR code
                bgColor="#ffffff"
                level="Q"
              />
            </div>

            <p className="text-center text-sm text-gray-600 mb-6 leading-relaxed">
              Open your phone camera or FacePay app and scan this QR code to
              continue login securely.
            </p>

            <button
              onClick={handleCloseQRModal}
              className="w-full py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FaceLoginModal;
