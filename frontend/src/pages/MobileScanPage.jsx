import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 320,
  height: 400,
  facingMode: "user",
};

const MobileScanPage = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("waiting");
  const [countdown, setCountdown] = useState(3);
  const [scanProgress, setScanProgress] = useState(0);
  const [challengeStep, setChallengeStep] = useState(0);
  const particlesRef = useRef([]);
  const scanAnimationRef = useRef(null);

  const params = new URLSearchParams(window.location.search);
  const sessionToken = params.get("session");

  useEffect(() => {
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.001 + Math.random() * 0.002,
      size: 1 + Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    if (showWebcam) {
      setError("");
      setStep("ready");
    }
  }, [showWebcam]);

  useEffect(() => {
    if (step === "ready") {
      const timer = setTimeout(() => {
        setStep("countdown");
        setCountdown(3);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === "countdown" && countdown === 0) {
      captureMultipleFrames();
    }
  }, [step, countdown]);

  useEffect(() => {
    if (step === "scanning") {
      scanAnimationRef.current = setInterval(() => {
        setScanProgress((prev) => (prev >= 100 ? 100 : prev + 2));
      }, 54);

      const animateCanvas = () => {
        if (canvasRef.current && step === "scanning") {
          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
          drawParticles(ctx, canvasRef.current.width, canvasRef.current.height);
          drawScanLine(
            ctx,
            canvasRef.current.width,
            canvasRef.current.height,
            scanProgress,
          );
          requestAnimationFrame(animateCanvas);
        }
      };
      animateCanvas();
    }
    return () => {
      if (scanAnimationRef.current) clearInterval(scanAnimationRef.current);
    };
  }, [step, scanProgress]);

  const drawParticles = (ctx, width, height) => {
    particlesRef.current.forEach((p) => {
      p.y = (p.y + p.speed) % 1;
      ctx.fillStyle = `rgba(59,130,246,${0.32 + Math.random() * 0.23})`;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawScanLine = (ctx, width, height, progress) => {
    const y = (height * progress) / 100;
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#3b82f6";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    const grad = ctx.createLinearGradient(0, 0, 0, y);
    grad.addColorStop(0, "rgba(59,130,246,0)");
    grad.addColorStop(1, "rgba(59,130,246,0.12)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, y);
    ctx.shadowBlur = 0;
  };

  const captureMultipleFrames = async () => {
    try {
      setStep("scanning");
      setLoading(true);
      setScanProgress(0);

      const frames = [];
      for (let i = 0; i < 3; i++) {
        setChallengeStep(i + 1);
        const frame = webcamRef.current?.getScreenshot();
        if (!frame) throw new Error(`Failed to capture frame ${i + 1}`);
        frames.push(frame);
        if (i < 2) await new Promise((r) => setTimeout(r, 500));
      }

      const response = await fetch("/api/session/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          image: frames[1],
          frames,
        }),
      });

      const result = await response.json();
      if (result.matched || result.success) {
        setStep("success");
      } else {
        throw new Error(result.message || "Face not recognized");
      }
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      setStep("error");
      setTimeout(() => {
        setStep("waiting");
        setShowWebcam(false);
        setError("");
        setChallengeStep(0);
        setScanProgress(0);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // --- UI starts ---
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 to-90% p-2">
      <div className="relative bg-white/90 shadow-2xl border border-blue-200 rounded-2xl w-full max-w-sm mx-auto pb-1">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 border-b border-blue-50 flex flex-col items-center gap-0">
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-800 shadow-lg mb-1">
            <svg
              width={28}
              height={28}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <circle cx="14" cy="14" r="13" stroke="#fff" strokeWidth="2" />
              <path
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 17.5a4 4 0 1 1-8 0M12 4.5v2"
              />
              <ellipse cx="14" cy="10" rx="2" ry="2" fill="#fff" />
            </svg>
          </span>
          <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-700 via-cyan-500 to-blue-900 tracking-tight">
            Face Authentication
          </h2>
          <p className="text-xs text-gray-500 mt-0 mb-2 text-center font-medium">
            Secure face scan – powered by AI liveness detection
          </p>
        </div>

        {/* Main */}
        <div className="relative flex flex-col items-center justify-center min-h-[440px] py-2">
          {/* Initial Button */}
          {!showWebcam ? (
            <div className="text-center px-6">
              <button
                onClick={() => setShowWebcam(true)}
                className="mt-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-700 text-white font-bold py-3 px-12 rounded-xl shadow-lg text-lg transition transform active:scale-95 tracking-wide hover:from-cyan-600 hover:to-blue-800"
              >
                Enable Camera
              </button>
              <p className="mt-6 text-sm text-blue-500 font-medium">
                Allow camera access when prompted to start scanning your face.
              </p>
            </div>
          ) : (
            <div className="w-full relative max-w-xs mx-auto flex flex-col items-center">
              {/* Webcam Box */}
              <div className="relative rounded-2xl overflow-hidden w-full shadow-lg bg-gradient-to-t from-gray-800/80 via-blue-900/70 to-cyan-700/50">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full object-cover rounded-2xl transition-all duration-300"
                  forceScreenshotSourceSize={true}
                  style={{
                    aspectRatio: "4/5",
                    background: "#182847",
                    objectFit: "cover",
                  }}
                  onUserMediaError={(err) => {
                    let msg = "Failed to start camera.";
                    if (err.name === "NotAllowedError")
                      msg =
                        "Camera permission denied. Please allow in browser settings.";
                    else if (err.name === "NotFoundError")
                      msg = "No camera found on this device.";
                    else if (
                      err.message?.includes("secure") ||
                      err.message?.includes("https")
                    )
                      msg =
                        "Camera access only works on HTTPS. Use HTTPS/ngrok.";
                    else msg += " " + (err.message || "Unknown error");
                    setError(msg);
                    setShowWebcam(false);
                  }}
                />
                {/* Animation Canvas */}
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={400}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[99%] h-full pointer-events-none"
                />

                {/* Countdown Overlay */}
                {step === "countdown" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-sm rounded-2xl">
                    <div className="text-center">
                      <div className="text-7xl font-extrabold text-white mb-2 drop-shadow-lg">
                        {countdown}
                      </div>
                      <div className="text-base text-cyan-300 font-semibold">
                        Get ready...
                      </div>
                    </div>
                  </div>
                )}

                {/* Scan Progress Bar */}
                {step === "scanning" && scanProgress < 100 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 z-10">
                    <div className="bg-gray-800/70 backdrop-blur-sm rounded-lg h-2.5 overflow-hidden border border-cyan-300/40 shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-700 animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Success & Error */}
                {step === "success" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-scale-in">
                    <div className="w-16 h-16 bg-green-400/20 border-4 border-green-500 rounded-full flex items-center justify-center backdrop-blur-sm shadow-xl">
                      <svg
                        className="w-9 h-9 text-green-400"
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
                  <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-400/20 border-4 border-red-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <svg
                          className="w-9 h-9 text-red-400"
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
                      <p className="text-white text-base font-bold drop-shadow">
                        {error || "Scan Failed"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Chip */}
              {(step === "scanning" ||
                step === "success" ||
                step === "error") && (
                <div
                  className={
                    "mt-3 mb-2 px-5 py-2 rounded-full text-sm font-bold shadow ring-1 backdrop-blur " +
                    (step === "success"
                      ? "bg-green-100/80 text-green-700 ring-green-300 animate-scale-in"
                      : step === "error"
                        ? "bg-red-100/90 text-red-700 ring-red-300 animate-scale-in"
                        : "bg-gradient-to-r from-cyan-100/80 to-blue-50/80 text-blue-700 ring-cyan-200")
                  }
                >
                  {step === "success" && "✓ SCAN SUCCESS"}
                  {step === "scanning" && (
                    <>
                      {challengeStep === 1 && "⟳ CHECKING LIVENESS..."}
                      {challengeStep === 2 && "⟳ ANALYZING FACE..."}
                      {challengeStep === 3 && "⟳ VERIFYING IDENTITY..."}
                    </>
                  )}
                  {step === "error" && "✖ SCAN FAILED"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && step !== "error" && (
          <div className="px-5 py-2 bg-red-50 border-t border-red-200">
            <p className="text-red-700 text-sm font-medium text-center">
              {error}
            </p>
          </div>
        )}

        {/* Instructions */}
        {step === "ready" && !error && (
          <div className="px-6 py-4 bg-gradient-to-t from-blue-50 via-cyan-50 to-white border-t border-blue-100">
            <ul className="space-y-1 text-sm text-gray-700 font-medium list-disc list-inside">
              <li>Use your real face (no photo or video)</li>
              <li>Position your face within the frame</li>
              <li>Remove sunglasses/headwear & ensure good lighting</li>
              <li>Look directly at the camera</li>
            </ul>
          </div>
        )}
        <div className="text-xs text-blue-400 tracking-wide font-bold text-center py-2 mt-1">
          Liveness AI secured · Powered by FacePay
        </div>
      </div>
      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) rotate(14deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.51, 1.7, 0.52, 0.93);
        }
      `}</style>
    </div>
  );
};

export default MobileScanPage;
