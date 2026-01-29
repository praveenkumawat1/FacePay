import React, { useEffect, useRef, useState } from "react";

const FaceScanStep = ({ next, back }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState("Initializing...");
  const [scanProgress, setScanProgress] = useState(0);
  const [faceapi, setFaceapi] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const detectionInterval = useRef(null);
  const scanAnimationRef = useRef(null);
  const particlesRef = useRef([]);

  // particles init
  useEffect(() => {
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.001 + Math.random() * 0.002,
      size: 1 + Math.random() * 2,
    }));
  }, []);

  // load face-api script and init
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";
    script.async = true;
    script.onload = () => {
      if (window.faceapi) {
        console.log("face-api.js loaded from CDN");
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

      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }

      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // scanning animation logic
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
      if (scanAnimationRef.current) {
        clearInterval(scanAnimationRef.current);
      }
    };
  }, [faceDetected, scanComplete]);

  const init = async (faceapiLib) => {
    try {
      setLoadingStep("Loading AI models...");
      await loadModels(faceapiLib);

      setLoadingStep("Starting camera...");
      await startVideo();

      setLoadingStep("Initializing detection...");
      startDetection(faceapiLib);

      setIsLoading(false);
    } catch (err) {
      console.error("Initialization error:", err);
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
      console.log("All face-api models loaded successfully");
    } catch (err) {
      console.error("Model loading error:", err);
      throw new Error("Failed to load face detection/recognition models");
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      throw new Error("Camera access denied. Please allow camera permissions.");
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

  const getFaceEmbeddingFromVideoFrame = async () => {
    if (!faceapi || !videoRef.current) {
      console.error("faceapi or video not ready");
      return null;
    }

    try {
      const result = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5,
          }),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!result) {
        console.warn("No face with descriptor detected");
        return null;
      }

      const descriptor = result.descriptor;
      const embeddingVector = Array.from(descriptor);
      console.log("Face embedding length:", embeddingVector.length);
      return embeddingVector;
    } catch (err) {
      console.error("Error generating face embedding:", err);
      return null;
    }
  };

  const drawFaceMesh = (ctx, box, width, height) => {
    drawParticles(ctx, width, height);
    drawGridOverlay(ctx, box);
    drawSimulatedMesh(ctx, box);
    drawOuterFrame(ctx, box);

    if (isScanning && !scanComplete) {
      drawScanLine(ctx, box);
    }

    if (scanComplete) {
      drawCompleteGlow(ctx, box);
    }
  };

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

  const drawGridOverlay = (ctx, box) => {
    const { x, y, width, height } = box;
    ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= 8; i++) {
      const xPos = x + (width / 8) * i;
      ctx.beginPath();
      ctx.moveTo(xPos, y);
      ctx.lineTo(xPos, y + height);
      ctx.stroke();
    }

    for (let i = 0; i <= 10; i++) {
      const yPos = y + (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, yPos);
      ctx.lineTo(x + width, yPos);
      ctx.stroke();
    }
  };

  const drawSimulatedMesh = (ctx, box) => {
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
    ctx.shadowBlur = 10;

    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  };

  const drawOuterFrame = (ctx, box) => {
    const { x, y, width, height } = box;
    const padding = 20;
    const cornerLength = 40;
    const lineWidth = 3;

    ctx.strokeStyle = scanComplete ? "#10b981" : "#3b82f6";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.shadowColor = scanComplete ? "#10b981" : "#3b82f6";
    ctx.shadowBlur = 15;

    const frameX = x - padding;
    const frameY = y - padding;
    const frameWidth = width + padding * 2;
    const frameHeight = height + padding * 2;

    ctx.beginPath();
    ctx.moveTo(frameX, frameY + cornerLength);
    ctx.lineTo(frameX, frameY);
    ctx.lineTo(frameX + cornerLength, frameY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(frameX + frameWidth - cornerLength, frameY);
    ctx.lineTo(frameX + frameWidth, frameY);
    ctx.lineTo(frameX + frameWidth, frameY + cornerLength);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(frameX, frameY + frameHeight - cornerLength);
    ctx.lineTo(frameX, frameY + frameHeight);
    ctx.lineTo(frameX + cornerLength, frameY + frameHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(frameX + frameWidth - cornerLength, frameY + frameHeight);
    ctx.lineTo(frameX + frameWidth, frameY + frameHeight);
    ctx.lineTo(frameX + frameWidth, frameY + frameHeight - cornerLength);
    ctx.stroke();

    ctx.shadowBlur = 0;
  };

  const drawScanLine = (ctx, box) => {
    const { x, y, width, height } = box;
    const scanY = y + (height * scanProgress) / 100;

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

  const captureFaceImage = () => {
    return new Promise((resolve) => {
      try {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");

        if (!video || video.readyState !== 4) {
          console.error("Video not ready");
          resolve(null);
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        console.log("Canvas size:", canvas.width, "x", canvas.height);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `face_${Date.now()}.jpg`, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              console.log("Face image file created:", {
                name: file.name,
                size: file.size + " bytes",
                type: file.type,
              });

              resolve(file);
            } else {
              console.error("Failed to create blob from canvas");
              resolve(null);
            }
          },
          "image/jpeg",
          0.95,
        );
      } catch (error) {
        console.error("Error capturing face image:", error);
        resolve(null);
      }
    });
  };

  if (error) {
    return (
      <>
        <h2 className="text-xl font-semibold mb-4">Face Scan</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error: </p>
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
      <h2 className="text-xl font-semibold mb-4">Face Recognition Scan</h2>

      <div className="relative">
        <div className="h-80 relative border-2 border-gray-800 rounded-xl mb-4 overflow-hidden bg-black shadow-2xl">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
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
                <div>FACIAL RECOGNITION</div>
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
                  scanComplete
                    ? "bg-green-500/90 text-white border-green-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                    : faceDetected
                      ? "bg-blue-500/90 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                      : "bg-gray-800/80 text-gray-300 border-gray-600"
                }`}
              >
                {scanComplete
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
                ></div>
              </div>
            </div>
          )}

          {scanComplete && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-[scale-in_0.5s_ease-out]">
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

        <p className="text-sm text-gray-600 mb-6 text-center font-medium">
          {faceDetected
            ? scanComplete
              ? "✓ Biometric verification successful"
              : "Hold steady while scanning facial features"
            : "Position your face within the detection area"}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={back}
          className="flex-1 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
        >
          Back
        </button>

        <button
          disabled={!scanComplete || isLoading}
          onClick={async () => {
            console.log("Continue clicked");

            try {
              console.log("Generating face embedding...");
              const faceEmbedding = await getFaceEmbeddingFromVideoFrame();

              console.log("Embedding result:", {
                ok: !!faceEmbedding,
                len: faceEmbedding?.length,
                sample: faceEmbedding?.slice(0, 5),
              });

              if (!faceEmbedding) {
                alert(
                  "Face vector generate nahi ho paya. Please apna face clearly dikhaye aur fir try karein.",
                );
                return;
              }

              console.log("Capturing face image...");
              const capturedImage = await captureFaceImage();

              console.log("Captured result:", {
                success: Boolean(capturedImage),
                isFile: capturedImage instanceof File,
                name: capturedImage?.name,
                size: capturedImage?.size,
                type: capturedImage?.type,
                embeddingLength: faceEmbedding.length,
              });

              if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach((track) => {
                  track.stop();
                  console.log("Camera track stopped:", track.kind);
                });
              }

              console.log("Calling next() from FaceScanStep...");
              if (typeof next === "function") {
                next({
                  faceImage: capturedImage || null,
                  faceEmbedding,
                });
                console.log("next() called successfully");
              } else {
                console.error("next prop is not a function:", next);
              }
            } catch (err) {
              console.error("Error in Continue handler:", err);
              alert(
                "Kuch galat ho gaya face scan ke baad. Console check karo.",
              );
            }
          }}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            scanComplete && !isLoading
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isLoading
            ? "Loading..."
            : scanComplete
              ? "Continue →"
              : `Scanning...  ${scanProgress.toFixed(0)}%`}
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
