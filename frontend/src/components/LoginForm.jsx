import React, { useState, useRef, useEffect } from "react";
import OTPVerifyStep from "./OTPVerifyStep";
import { useNavigate } from "react-router-dom";
import FaceLoginModal from "./FaceLoginModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

const CAPTCHA_LEN = 6;

const LoginForm = ({ onClose, switchToSignup, onForgotPassword }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Login, 2: OTP, 3: TOTP
  const [userForOtp, setUserForOtp] = useState(null);
  const [userFor2FA, setUserFor2FA] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);

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

  const canvasRef = useRef(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // CAPTCHA GENERATOR
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

  // CAPTCHA Drawing
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
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 220)},${Math.floor(
        Math.random() * 220,
      )},${Math.floor(Math.random() * 220)},${(Math.random() * 0.29 + 0.08).toFixed(2)})`;
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
      ctx.strokeStyle = `rgba(${130 + Math.random() * 80},${130 + Math.random() * 80},${130 + Math.random() * 80},0.29)`;
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
        setLoginError(data.message || data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      // ⚡ NEW: Check if OTP required
      if (data.requiresOTP) {
        console.log("OTP required. DEV OTP:", data._devOTP);

        setUserForOtp({
          userId: data.userId,
          email: data.email || email.trim().toLowerCase(),
        });
        setStep(2); // Go to OTP verification
        setLoading(false);
        return;
      }

      // Check if 2FA required (should not happen here, but fallback)
      if (data.requires2FA) {
        setUserFor2FA({
          userId: data.userId,
          email: email.trim().toLowerCase(),
        });
        setStep(3);
        setLoading(false);
        return;
      }

      // Direct login (shouldn't happen now)
      if (data.token) {
        localStorage.setItem("facepay_token", data.token);
        localStorage.setItem("facepay_user", JSON.stringify(data.user));
        if (onClose) onClose();
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ⚡ Handle OTP Success
  const handleOTPSuccess = (result) => {
    // If 2FA required, prompt for TOTP
    if (result.requires2FA && result.userId) {
      setUserFor2FA({
        userId: result.userId,
        email: email.trim().toLowerCase(),
      });
      setStep(3);
      return;
    }
    // Otherwise, login complete
    if (onClose) onClose();
    navigate("/dashboard");
  };

  // ⚡ Handle TOTP (2FA) submit
  const handleTOTPSubmit = async (e) => {
    e.preventDefault();
    setTotpError("");
    if (!totpCode || totpCode.length !== 6) {
      setTotpError("Enter 6-digit code");
      return;
    }
    setTotpLoading(true);
    try {
      const res = await fetch("/api/auth/login/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userFor2FA.userId, token: totpCode }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("facepay_token", data.token);
        localStorage.setItem("facepay_user", JSON.stringify(data.user));
        if (onClose) onClose();
        navigate("/dashboard");
      } else {
        setTotpError(data.message || "Invalid code");
      }
    } catch (err) {
      setTotpError("Connection error. Try again.");
    } finally {
      setTotpLoading(false);
    }
  };

  // ⚡ Handle Face Login Success
  const handleFaceLoginSuccess = (result) => {
    console.log("✅ Face login successful:", result);
    setShowFaceModal(false);
    if (onClose) onClose();
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  // ⚡ If on OTP step, show OTP component
  if (step === 2 && userForOtp) {
    return (
      <div className="w-full max-w-lg mx-auto relative">
        <OTPVerifyStep
          userId={userForOtp.userId}
          email={userForOtp.email}
          onSuccess={handleOTPSuccess}
          onResend={() => console.log("OTP resent")}
          onBack={() => setStep(1)}
        />
      </div>
    );
  }

  // ⚡ If on TOTP (2FA) step, show TOTP input
  if (step === 3 && userFor2FA) {
    return (
      <div className="w-full max-w-lg mx-auto relative">
        <form
          onSubmit={handleTOTPSubmit}
          className="space-y-6 bg-white p-8 rounded-2xl shadow-xl"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">
            Two-Factor Authentication
          </h2>
          <p className="text-slate-600 text-center mb-4">
            Enter the 6-digit code from your authenticator app
          </p>
          <input
            type="text"
            maxLength={6}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center text-3xl font-bold tracking-widest border-2 border-slate-300 rounded-xl py-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            placeholder="000000"
            disabled={totpLoading}
            autoFocus
          />
          {totpError && (
            <div className="text-red-600 text-center text-sm font-semibold">
              {totpError}
            </div>
          )}
          <button
            type="submit"
            disabled={totpCode.length !== 6 || totpLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {totpLoading ? "Verifying..." : "Verify & Login"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setTotpCode("");
              setTotpError("");
              setUserFor2FA(null);
            }}
            className="w-full text-slate-600 hover:text-slate-900 text-sm font-semibold mt-2"
            disabled={totpLoading}
          >
            ← Back to Login
          </button>
        </form>
      </div>
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
            <div className="mb-3.5 p-2.5 bg-red-50/70 border border-red-200 rounded-xl text-center animate-shake">
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
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm text-slate-700 hover:text-slate-900 font-medium transition"
                >
                  Forgot?
                </button>
                {showForgotModal && (
                  <ForgotPasswordModal
                    close={() => setShowForgotModal(false)}
                  />
                )}
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

          <button
            type="button"
            onClick={() => setShowFaceModal(true)}
            className="w-full py-3 rounded-xl border-2 border-slate-800 font-semibold text-slate-800
                       hover:bg-slate-900 hover:text-white transition-all duration-200 shadow-sm hover:shadow 
                       active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="text-xl">👤</span>
            <span>Login with Face</span>
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

          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-center text-xs text-slate-500">
              🔒 Secured by AWS Rekognition & 256-bit encryption
            </p>
          </div>
        </div>
      </div>

      {showFaceModal && (
        <FaceLoginModal
          close={() => setShowFaceModal(false)}
          onSuccess={handleFaceLoginSuccess}
        />
      )}

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default LoginForm;
