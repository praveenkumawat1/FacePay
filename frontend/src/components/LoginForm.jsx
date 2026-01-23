import React, { useState, useEffect, useRef } from "react";
import OTPVerifyStep from "./OTPVerifyStep";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ onClose, switchToSignup, onForgotPassword }) => {
  const navigate = useNavigate();

  // Steps: 1 = login, 2 = OTP
  const [step, setStep] = useState(1);
  const [userForOtp, setUserForOtp] = useState(null);

  // Login form states
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inputText, setInputText] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const canvasRef = useRef(null);

  // CAPTCHA logic
  function generateChallenge() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < 5; i++) {
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
  useEffect(() => {
    if (!canvasRef.current || !challengeText) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 300;
    const height = 56;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    ctx.font = "bold 28px monospace";
    ctx.fillStyle = "#1e293b";
    ctx.textBaseline = "middle";
    const letterSpacing = width / (challengeText.length + 1);
    challengeText.split("").forEach((char, i) => {
      const x = letterSpacing * (i + 1);
      const y = height / 2 + Math.sin(i) * 4;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.25);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });

    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(0, height * Math.random());
      ctx.lineTo(width, height * Math.random());
      ctx.stroke();
    }
  }, [challengeText]);
  useEffect(() => {
    if (inputText.length === challengeText.length && inputText) {
      if (inputText.toUpperCase() === challengeText) {
        setIsVerified(true);
        setCaptchaError(false);
      } else {
        setCaptchaError(true);
      }
    } else if (inputText.length > 0) {
      setCaptchaError(false);
    }
  }, [inputText, challengeText]);

  // Step 1 submit
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError(null);

    if (!email || !password) {
      setLoginError("Please enter email and password");
      return;
    }
    if (!isVerified) {
      setLoginError("Please complete the CAPTCHA verification");
      return;
    }
    setLoading(true);

    // Demo "login": OTP step
    setTimeout(() => {
      setLoading(false);
      setUserForOtp({
        email,
        full_name: email.split("@")[0] || "User",
        token: "test-token-abcde",
      });
      setStep(2);
    }, 900);
  };

  // OTP Step
  if (step === 2 && userForOtp) {
    return (
      <OTPVerifyStep
        email={userForOtp.email}
        back={() => setStep(1)}
        next={() => {
          // Localstorage set (demo), then dashboard
          localStorage.setItem("facepay_token", userForOtp.token);
          localStorage.setItem("facepay_user", JSON.stringify(userForOtp));
          if (onClose) onClose();
          navigate("/dashboard");
        }}
        onEditContact={() => setStep(1)}
      />
    );
  }

  // Login Step
  return (
    <>
      {loading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-900">Logging in...</p>
          </div>
        </div>
      )}

      <div className="px-8 py-7">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-600 mt-1">
            Login to <span className="font-semibold text-black">FacePay</span>
          </p>
        </div>

        {loginError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm font-medium">❌ {loginError}</p>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3.5">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email or Username
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/70 
                         focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black transition"
              required
            />
          </div>

          <div className="mb-3.5">
            <div className="flex justify-between items-end mb-1">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm font-medium text-black hover:underline transition"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/70 
                           focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black transition pr-14"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-black transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium text-gray-700">
                Verify you're human
              </p>
              <button
                type="button"
                onClick={generateChallenge}
                className="text-xs text-gray-500 hover:text-black underline transition"
              >
                Refresh
              </button>
            </div>

            <div className="p-2.5 bg-gray-50/70 rounded-xl border border-gray-200 shadow-inner">
              <canvas
                ref={canvasRef}
                width={300}
                height={56}
                className="mx-auto rounded-lg"
              />
            </div>

            <div className="relative mt-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.toUpperCase())}
                placeholder="Type the text"
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/70 
                           focus:outline-none focus:ring-4 focus:ring-black/10 transition
                           ${
                             isVerified
                               ? "border-green-500"
                               : captchaError
                                 ? "border-red-500"
                                 : "border-gray-200"
                           }`}
              />
              {isVerified && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 text-lg font-bold">
                  ✓
                </span>
              )}
            </div>
            {captchaError && (
              <p className="text-xs text-red-600 mt-1 text-center">
                Incorrect CAPTCHA
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isVerified || loading}
            className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300
              ${
                isVerified && !loading
                  ? "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white/95 text-gray-500 font-medium">
              OR
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert("Face login coming soon!  🚀")}
          className="w-full py-3 rounded-xl border-2 border-black bg-transparent font-semibold text-black 
                     hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Login with Face
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          New here?{" "}
          <button
            onClick={switchToSignup}
            className="font-semibold text-black hover:underline transition"
          >
            Create account
          </button>
        </p>
      </div>
    </>
  );
};

export default LoginForm;
