import React, { useState, useRef, useEffect } from "react";

const OTPVerifyStep = ({ userId, email, onSuccess, onResend, onBack }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (index === 5 && value) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newOtp = pastedData.split("");
    while (newOtp.length < 6) {
      newOtp.push("");
    }
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode) => {
    try {
      setLoading(true);
      setError("");

      console.log("🔐 Verifying OTP:", otpCode);

      const response = await fetch(
        "http://localhost:5000/api/auth/login/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            otp: otpCode,
          }),
        },
      );

      const result = await response.json();
      console.log("📥 OTP verification response:", result);

      if (result.success && result.token) {
        console.log("✅ OTP verified successfully!");
        console.log("User:", result.user);

        // Save to localStorage
        localStorage.setItem("facepay_token", result.token);
        localStorage.setItem("facepay_user", JSON.stringify(result.user));

        // Call onSuccess callback
        if (onSuccess) onSuccess(result);

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else {
        console.log("❌ OTP verification failed:", result.message);
        setError(result.message || "Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error("❌ OTP verification error:", err);
      setError("Verification failed. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("📧 Resending OTP...");

      const response = await fetch(
        "http://localhost:5000/api/auth/login/resend-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        },
      );

      const result = await response.json();
      console.log("📥 Resend OTP response:", result);

      if (result.success) {
        console.log("✅ OTP resent successfully");
        setResendTimer(30);
        setCanResend(false);
        if (onResend) onResend();

        // Show dev OTP in console
        if (result._devOTP) {
          console.log("🔐 DEV OTP:", result._devOTP);
        }
      } else {
        setError(result.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("❌ Resend OTP error:", err);
      setError("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-slate-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-sm text-slate-600">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-slate-900">{email}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl animate-shake">
          <p className="text-red-700 text-sm text-center font-medium">
            {error}
          </p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-xl 
                         focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20 outline-none transition-all
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              autoFocus={index === 0}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleVerify(otp.join(""))}
          disabled={otp.join("").length !== 6 || loading}
          className={`w-full py-4 rounded-xl font-semibold transition-all transform active:scale-[0.98] ${
            otp.join("").length === 6 && !loading
              ? "bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            "Verify OTP"
          )}
        </button>

        <button
          onClick={onBack}
          disabled={loading}
          className="w-full py-3 border-2 border-slate-300 hover:border-slate-400 text-slate-700 
                     font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          Back to Login
        </button>
      </div>

      <div className="mt-6 text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-sm text-slate-900 font-semibold hover:underline disabled:opacity-50 transition-all"
          >
            Resend Code
          </button>
        ) : (
          <p className="text-sm text-slate-600">
            Resend code in{" "}
            <span className="font-semibold text-slate-900">{resendTimer}s</span>
          </p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          Didn't receive the code? Check your spam folder
        </p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
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
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default OTPVerifyStep;
