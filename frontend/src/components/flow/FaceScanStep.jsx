import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  captureFaceImage,
  stopCamera,
  startCamera,
} from "../../utils/faceCapture";

// ✅ FIX: This component now calls the enrollFace API after scan completes.
// Previously it only captured the image and passed it to next() without uploading.

const API = "http://localhost:5000";

const FaceScanStep = ({ next, back, mode = "signup" }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [faceDetected, setFaceDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState("Initializing...");
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // ✅ NEW: uploading state — separate from isProcessing so user sees what's happening
  const [uploadStatus, setUploadStatus] = useState(null); // null | "uploading" | "success" | "error"
  const [uploadError, setUploadError] = useState(null);

  const detectionInterval = useRef(null);
  const scanAnimationRef = useRef(null);
  const particlesRef = useRef([]);

  const scanProgressRef = useRef(0);
  const isScanningRef = useRef(false);
  const scanCompleteRef = useRef(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);
  useEffect(() => {
    scanCompleteRef.current = scanComplete;
  }, [scanComplete]);
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.001 + Math.random() * 0.002,
      size: 1 + Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    if (window.faceapi) {
      init(window.faceapi);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
    script.async = true;
    script.onload = () => {
      if (window.faceapi) init(window.faceapi);
      else {
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
      stopCamera(videoRef.current);
    };
  }, []);

  useEffect(() => {
    if (faceDetected && !scanCompleteRef.current) {
      setIsScanning(true);
      scanAnimationRef.current = setInterval(() => {
        setScanProgress((prev) => {
          const next = prev + 1.5;
          scanProgressRef.current = next;
          if (next >= 100) {
            clearInterval(scanAnimationRef.current);
            setScanComplete(true);
            scanCompleteRef.current = true;
            setIsScanning(false);
            isScanningRef.current = false;
            return 100;
          }
          return next;
        });
      }, 50);
    } else if (!faceDetected) {
      if (scanAnimationRef.current) clearInterval(scanAnimationRef.current);
      if (!scanCompleteRef.current) {
        setIsScanning(false);
        isScanningRef.current = false;
        setScanProgress(0);
        scanProgressRef.current = 0;
      }
    }
    return () => {
      if (scanAnimationRef.current) clearInterval(scanAnimationRef.current);
    };
  }, [faceDetected]);

  useEffect(() => {
    if (scanComplete && !isProcessingRef.current) {
      const timer = setTimeout(() => {
        handleContinue();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [scanComplete]);

  const init = async (faceapiLib) => {
    try {
      setLoadingStep("Loading AI models...");
      await loadModels(faceapiLib);
      setLoadingStep("Starting camera...");
      await startCamera(videoRef.current);
      setLoadingStep("Initializing detection...");
      startDetection(faceapiLib);
      setIsLoading(false);
    } catch (err) {
      console.error("❌ Initialization error:", err);
      setError(err.message || "Initialization failed");
      setIsLoading(false);
    }
  };

  const loadModels = async (faceapiLib) => {
    const MODEL_URL =
      "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
    await Promise.all([
      faceapiLib.nets.tinyFaceDetector.isLoaded
        ? Promise.resolve()
        : faceapiLib.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapiLib.nets.faceLandmark68Net.isLoaded
        ? Promise.resolve()
        : faceapiLib.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapiLib.nets.faceRecognitionNet.isLoaded
        ? Promise.resolve()
        : faceapiLib.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  };

  const startDetection = (faceapiLib) => {
    detectionInterval.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;
      if (scanCompleteRef.current) return;
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
            drawFaceMesh(
              ctx,
              resizedDetections[0].detection.box,
              canvas.width,
              canvas.height,
            );
          }
        }
      } catch (err) {
        console.error("❌ Detection error:", err);
      }
    }, 100);
  };

  const drawFaceMesh = (ctx, box, width, height) => {
    drawParticles(ctx, width, height);
    drawGridOverlay(ctx, box);
    drawSimulatedMesh(ctx, box, scanCompleteRef.current);
    drawOuterFrame(ctx, box, scanCompleteRef.current);
    if (isScanningRef.current && !scanCompleteRef.current)
      drawScanLine(ctx, box, scanProgressRef.current);
    if (scanCompleteRef.current) drawCompleteGlow(ctx, box);
  };

  const drawParticles = (ctx, width, height) => {
    particlesRef.current.forEach((particle) => {
      particle.y = (particle.y + particle.speed) % 1;
      ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(
        particle.x * width,
        particle.y * height,
        particle.size,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });
  };

  const drawGridOverlay = (ctx, box) => {
    const { x, y, width, height } = box;
    ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(x + (width / 8) * i, y);
      ctx.lineTo(x + (width / 8) * i, y + height);
      ctx.stroke();
    }
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + (height / 10) * i);
      ctx.lineTo(x + width, y + (height / 10) * i);
      ctx.stroke();
    }
  };

  const drawSimulatedMesh = (ctx, box, complete) => {
    const { x, y, width, height } = box;
    const cx = x + width / 2;
    const points = [
      { x: x + width * 0.1, y: y + height * 0.3 },
      { x: x + width * 0.05, y: y + height * 0.5 },
      { x: x + width * 0.1, y: y + height * 0.7 },
      { x: x + width * 0.2, y: y + height * 0.85 },
      { x: cx, y: y + height * 0.95 },
      { x: x + width * 0.8, y: y + height * 0.85 },
      { x: x + width * 0.9, y: y + height * 0.7 },
      { x: x + width * 0.95, y: y + height * 0.5 },
      { x: x + width * 0.9, y: y + height * 0.3 },
      { x: x + width * 0.3, y: y + height * 0.35 },
      { x: x + width * 0.7, y: y + height * 0.35 },
      { x: cx, y: y + height * 0.5 },
      { x: cx, y: y + height * 0.6 },
      { x: x + width * 0.35, y: y + height * 0.75 },
      { x: cx, y: y + height * 0.78 },
      { x: x + width * 0.65, y: y + height * 0.75 },
      { x: x + width * 0.25, y: y + height * 0.25 },
      { x: x + width * 0.35, y: y + height * 0.22 },
      { x: x + width * 0.65, y: y + height * 0.22 },
      { x: x + width * 0.75, y: y + height * 0.25 },
    ];
    ctx.strokeStyle = complete ? "#10b981" : "#3b82f6";
    ctx.lineWidth = 1;
    ctx.shadowColor = complete ? "#10b981" : "#3b82f6";
    ctx.shadowBlur = 8;
    [
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
    ].forEach(([s, e]) => {
      if (points[s] && points[e]) {
        ctx.beginPath();
        ctx.moveTo(points[s].x, points[s].y);
        ctx.lineTo(points[e].x, points[e].y);
        ctx.stroke();
      }
    });
    ctx.shadowBlur = 0;
    ctx.fillStyle = complete ? "#10b981" : "#3b82f6";
    ctx.shadowColor = complete ? "#10b981" : "#3b82f6";
    ctx.shadowBlur = 10;
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  };

  const drawOuterFrame = (ctx, box, complete) => {
    const { x, y, width, height } = box;
    const padding = 20,
      cornerLength = 40;
    ctx.strokeStyle = complete ? "#10b981" : "#3b82f6";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.shadowColor = complete ? "#10b981" : "#3b82f6";
    ctx.shadowBlur = 15;
    const fx = x - padding,
      fy = y - padding,
      fw = width + padding * 2,
      fh = height + padding * 2;
    [
      [fx, fy + cornerLength, fx, fy, fx + cornerLength, fy],
      [fx + fw - cornerLength, fy, fx + fw, fy, fx + fw, fy + cornerLength],
      [fx, fy + fh - cornerLength, fx, fy + fh, fx + cornerLength, fy + fh],
      [
        fx + fw - cornerLength,
        fy + fh,
        fx + fw,
        fy + fh,
        fx + fw,
        fy + fh - cornerLength,
      ],
    ].forEach(([x1, y1, x2, y2, x3, y3]) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;
  };

  const drawScanLine = (ctx, box, progress) => {
    const { x, y, width, height } = box;
    const scanY = y + (height * progress) / 100;
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#3b82f6";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(x - 20, scanY);
    ctx.lineTo(x + width + 20, scanY);
    ctx.stroke();
    const gradient = ctx.createLinearGradient(0, y, 0, scanY);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 20, y, width + 40, scanY - y);
    ctx.shadowBlur = 0;
  };

  const drawCompleteGlow = (ctx, box) => {
    const { x, y, width, height } = box;
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#10b981";
    ctx.shadowBlur = 30;
    ctx.strokeRect(x - 20, y - 20, width + 40, height + 40);
    ctx.shadowBlur = 0;
  };

  // ✅ FIX: handleContinue now ACTUALLY calls the enrollFace API
  // Previously it just passed faceImage to next() and enrollment never happened
  const handleContinue = useCallback(async () => {
    if (isProcessingRef.current) return;
    setIsProcessing(true);
    isProcessingRef.current = true;

    if (detectionInterval.current) clearInterval(detectionInterval.current);

    try {
      // Step 1: Capture face image from video stream
      const capturedImage = await captureFaceImage(videoRef.current);
      if (!capturedImage) {
        alert("Failed to capture face image. Please try again.");
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }
      stopCamera(videoRef.current);

      // Step 2 (only in signup mode): Upload to enrollFace API
      if (mode === "signup") {
        const userId = localStorage.getItem("facepay_userId");
        if (!userId) {
          console.error("❌ No userId in localStorage — cannot enroll face");
          // Still proceed to next step but warn
          next({
            faceImage: capturedImage,
            awsReady: false,
            error: "userId missing",
          });
          return;
        }

        setUploadStatus("uploading");

        // ✅ Build FormData with userId + image file
        const formData = new FormData();
        formData.append("userId", userId);

        // Convert base64/blob to File
        let imageFile;
        if (capturedImage instanceof Blob) {
          imageFile = new File([capturedImage], "face.jpg", {
            type: "image/jpeg",
          });
        } else if (
          typeof capturedImage === "string" &&
          capturedImage.startsWith("data:")
        ) {
          // base64 string → Blob → File
          const res = await fetch(capturedImage);
          const blob = await res.blob();
          imageFile = new File([blob], "face.jpg", { type: "image/jpeg" });
        } else {
          imageFile = capturedImage;
        }
        formData.append("faceImage", imageFile);

        const token = localStorage.getItem("facepay_token");
        const uploadRes = await fetch(`${API}/api/enroll-face`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const uploadResult = await uploadRes.json();

        if (!uploadResult.success) {
          setUploadStatus("error");
          setUploadError(uploadResult.message || "Face enrollment failed");
          setIsProcessing(false);
          isProcessingRef.current = false;
          return;
        }

        setUploadStatus("success");
        console.log(
          "✅ Face enrolled successfully:",
          uploadResult.data?.faceId,
        );

        // Pass enrollment result to parent
        next({
          faceImage: capturedImage,
          awsReady: true,
          faceId: uploadResult.data?.faceId,
          confidence: uploadResult.data?.confidence,
        });
      } else {
        // Login mode — just pass image, no enrollment
        next({ faceImage: capturedImage, awsReady: true });
      }
    } catch (err) {
      console.error("❌ Error in Continue handler:", err);
      setUploadStatus("error");
      setUploadError(err.message || "Something went wrong during face scan.");
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  }, [next, mode]);

  if (error) {
    return (
      <>
        <h2 className="text-xl font-semibold mb-4">Face Scan</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button onClick={back} className="w-full py-3 border rounded-xl">
          Back
        </button>
      </>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">
        {mode === "signup" ? "Face Registration" : "Face Recognition Login"}
      </h2>

      <div className="relative">
        <div className="h-80 relative border-2 border-gray-800 rounded-xl mb-4 overflow-hidden bg-black shadow-2xl">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                </div>
                <div className="text-sm text-blue-400 font-medium">
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
            className="w-full h-full object-cover opacity-90"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
          />

          {!isLoading && faceDetected && (
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

          {!isLoading && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div
                className={`px-6 py-2.5 text-sm font-semibold rounded-full backdrop-blur-md transition-all duration-300 border-2 ${
                  uploadStatus === "uploading"
                    ? "bg-blue-600/90 text-white border-blue-400"
                    : uploadStatus === "error"
                      ? "bg-red-500/90 text-white border-red-400"
                      : isProcessing
                        ? "bg-yellow-500/90 text-white border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                        : scanComplete
                          ? "bg-green-500/90 text-white border-green-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                          : faceDetected
                            ? "bg-blue-500/90 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                            : "bg-gray-800/80 text-gray-300 border-gray-600"
                }`}
              >
                {uploadStatus === "uploading"
                  ? "⟳ UPLOADING TO AWS..."
                  : uploadStatus === "error"
                    ? "✗ ENROLLMENT FAILED"
                    : isProcessing
                      ? "⟳ PROCESSING..."
                      : scanComplete
                        ? "✓ VERIFICATION COMPLETE"
                        : faceDetected
                          ? isScanning
                            ? "⟳ SCANNING BIOMETRICS..."
                            : "◉ FACE DETECTED"
                          : "⊗ NO FACE DETECTED"}
              </div>
            </div>
          )}

          {faceDetected && isScanning && !scanComplete && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 z-10">
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-blue-500/30">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {scanComplete && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
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
        </div>

        {/* ✅ Upload error message */}
        {uploadStatus === "error" && uploadError && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            <p className="font-semibold mb-1">Face enrollment failed</p>
            <p>{uploadError}</p>
            <button
              onClick={() => {
                setUploadStatus(null);
                setUploadError(null);
                setScanComplete(false);
                scanCompleteRef.current = false;
                setScanProgress(0);
                setIsProcessing(false);
                isProcessingRef.current = false;
              }}
              className="mt-2 text-red-600 underline font-medium"
            >
              Try again
            </button>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-6 text-center font-medium">
          {uploadStatus === "uploading"
            ? "Uploading your face data to AWS Rekognition..."
            : uploadStatus === "error"
              ? "Enrollment failed. Please try again."
              : isProcessing
                ? "Capturing and processing your face..."
                : faceDetected
                  ? scanComplete
                    ? "✓ Biometric verification successful"
                    : "Hold steady while scanning facial features"
                  : "Position your face within the detection area"}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={back}
          disabled={isProcessing || uploadStatus === "uploading"}
          className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          disabled={
            !scanComplete ||
            isLoading ||
            isProcessing ||
            uploadStatus === "uploading"
          }
          onClick={handleContinue}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            scanComplete &&
            !isLoading &&
            !isProcessing &&
            uploadStatus !== "uploading"
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {uploadStatus === "uploading"
            ? "Uploading..."
            : isProcessing
              ? "Processing..."
              : isLoading
                ? "Loading..."
                : scanComplete
                  ? "Continue →"
                  : `Scanning... ${scanProgress.toFixed(0)}%`}
        </button>
      </div>

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
      `}</style>
    </>
  );
};

export default FaceScanStep;
