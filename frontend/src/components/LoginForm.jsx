import React, { useState, useRef, useEffect } from "react";
import OTPVerifyStep from "./OTPVerifyStep";
import { useNavigate } from "react-router-dom";
import FaceScanStep from "./flow/FaceScanStep";

const CAPTCHA_LEN = 6;

const LoginForm = ({ onClose, switchToSignup, onForgotPassword }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [userForOtp, setUserForOtp] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inputText, setInputText] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceLoginLoading, setFaceLoginLoading] = useState(false);

  const canvasRef = useRef(null);

  // STRONG CAPTCHA GENERATOR
  function generateChallenge() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let text = "";
    for (let i = 0; i < CAPTCHA_LEN; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setChallengeText(text);
    setInputText("");
    setIsVerified(false);
    setCaptchaError(false);
  }

  useEffect(() => {
    generateChallenge();
  }, []);

  // Strong CAPTCHA Drawing
  useEffect(() => {
    if (!canvasRef.current || !challengeText) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 340;
    const height = 56;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 55; i++) {
      ctx.fillStyle = `rgba(${Math.floor(
        Math.random() * 220,
      )},${Math.floor(Math.random() * 220)},${Math.floor(
        Math.random() * 220,
      )},${(Math.random() * 0.29 + 0.08).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2 + 1.1,
        0,
        2 * Math.PI,
      );
      ctx.fill();
    }

    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.strokeStyle = `rgba(${130 + Math.random() * 80},${
        130 + Math.random() * 80
      },${130 + Math.random() * 80},0.29)`;
      ctx.lineWidth = Math.random() * 1.8 + 1;
      ctx.beginPath();
      const phase = Math.random() * Math.PI * 2;
      for (let x = 0; x < width; x++) {
        ctx.lineTo(
          x,
          height / 2 +
            Math.sin((x / width) * Math.PI * 2 * 2 + phase) * 8 +
            Math.random() * 1.6,
        );
      }
      ctx.stroke();
      ctx.restore();
    }

    const spacing = width / (challengeText.length + 1.3);
    challengeText.split("").forEach((char, i) => {
      let fontSize = 24 + Math.floor(Math.random() * 10);
      ctx.save();
      ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
      ctx.textBaseline = "middle";
      ctx.translate(
        spacing * (i + 0.85) + Math.random() * 5 - 2.5,
        height / 2 + Math.sin(i * 2 + 2.4) * 7 + Math.random() * 2.5 - 1.25,
      );
      ctx.rotate((Math.random() - 0.5) * 0.32);
      ctx.fillStyle = i % 2 === 0 ? "#0f172a" : "#3753ad";
      ctx.shadowColor = "#888";
      ctx.shadowBlur = 1 + Math.random() * 1;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  }, [challengeText]);

  useEffect(() => {
    if (inputText.length === challengeText.length && inputText) {
      setIsVerified(inputText.toLowerCase() === challengeText.toLowerCase());
      setCaptchaError(inputText.toLowerCase() !== challengeText.toLowerCase());
    } else if (inputText.length > 0) {
      setCaptchaError(false);
    }
  }, [inputText, challengeText]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);

    if (!email.trim() || !password) {
      setLoginError("Email and password required");
      return;
    }
    if (!isVerified) {
      setLoginError("Please complete CAPTCHA");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setLoginError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      setUserForOtp({
        email: email.trim().toLowerCase(),
        full_name: data.user?.full_name || "",
      });
      setStep(2);
    } catch {
      setLoginError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 2 && userForOtp) {
    return (
      <OTPVerifyStep
        email={userForOtp.email}
        back={() => setStep(1)}
        next={() => {
          if (onClose) onClose();
          navigate("/dashboard");
        }}
        onEditContact={() => setStep(1)}
      />
    );
  }

  return (
    <>
      <div className="w-full max-w-lg mx-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-slate-800 text-sm font-medium">Verifying...</p>
            </div>
          </div>
        )}

        <div className="px-6 sm:px-8 py-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Sign in to{" "}
              <span className="font-semibold text-slate-900">FacePay</span>
            </p>
          </div>

          {loginError && (
            <div className="mb-3.5 p-2.5 bg-red-50/70 border border-red-200 rounded-xl text-center">
              <p className="text-red-700 text-sm font-medium">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white 
                           focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 
                           transition shadow-sm text-sm"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-slate-700 hover:text-slate-900 font-medium transition"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white 
                             focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 
                             transition shadow-sm pr-14 text-sm"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 text-xs font-medium transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Verification
                </label>
                <button
                  type="button"
                  onClick={generateChallenge}
                  className="text-xs text-slate-500 hover:text-slate-800 underline transition"
                >
                  Refresh
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={56}
                  className="w-full rounded-lg mx-auto"
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter characters"
                  maxLength={CAPTCHA_LEN}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white shadow-sm transition text-sm
                             focus:outline-none focus:ring-2 focus:ring-slate-900/20
                              ${
                                isVerified
                                  ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                                  : captchaError
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                    : "border-slate-200 focus:border-slate-400"
                              }`}
                />
                {isVerified && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 text-lg font-bold pointer-events-none">
                    ✓
                  </span>
                )}
              </div>

              {captchaError && (
                <p className="text-xs text-red-600 text-center font-medium pt-0.5">
                  Incorrect — try again
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isVerified || loading}
              className={`w-full py-2.5 rounded-xl font-semibold text-base transition-all duration-200 mt-1
                ${
                  isVerified && !loading
                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow hover:shadow-md active:scale-[0.98]"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">
                OR
              </span>
            </div>
          </div>

          {/* PURE FACE LOGIN BUTTON */}
          <button
            type="button"
            onClick={() => setShowFaceModal(true)}
            className="w-full py-2.5 rounded-xl border-2 border-slate-800 font-semibold text-slate-800
                       hover:bg-slate-900 hover:text-white transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]"
          >
            Login with Face
          </button>

          <p className="text-center text-sm text-slate-600 mt-3.5">
            Don't have an account?{" "}
            <button
              onClick={switchToSignup}
              className="font-semibold text-slate-900 hover:underline transition"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      {/* FACE LOGIN MODAL */}
      {showFaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-4 sm:p-6 relative">
            <button
              onClick={() => setShowFaceModal(false)}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-800 text-sm"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-2 text-slate-900 text-center">
              Face Login
            </h3>
            <p className="text-xs text-slate-500 mb-3 text-center">
              Look at the camera to verify your identity
            </p>

            {faceLoginLoading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-2xl z-10">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-800 text-sm font-medium">
                    Verifying face...
                  </p>
                </div>
              </div>
            )}

            <FaceScanStep
              back={() => setShowFaceModal(false)}
              next={async ({ faceEmbedding }) => {
                try {
                  setFaceLoginLoading(true);
                  console.log("Face embedding for login:", {
                    len: faceEmbedding?.length,
                    sample: faceEmbedding?.slice(0, 5),
                  });

                  const res = await fetch("/api/face/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ faceEmbedding }),
                  });

                  const data = await res.json();
                  console.log("Face login response:", data);

                  if (!data.success) {
                    alert(
                      data.error ||
                        `Face login failed. Try again.\nDistance: ${data.distance?.toFixed(
                          3,
                        )}`,
                    );
                    return;
                  }

                  // TODO: yahan token / auth state set karo agar use kar rahe ho
                  if (onClose) onClose();
                  setShowFaceModal(false);
                  navigate("/dashboard");
                } catch (err) {
                  console.error("Face login error:", err);
                  alert("Face login error: " + err.message);
                } finally {
                  setFaceLoginLoading(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default LoginForm;
