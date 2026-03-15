import React, { useState, useRef } from "react";

const MAX_TRIES = 5;
const LOCKOUT_SEC = 60;
const OTP_EXPIRE_SEC = 90;
const OTP_LENGTH = 6;

export default function OTPVerifyStep({
  email,
  mobile,
  next,
  back,
  onEditContact,
}) {
  const [emailOtp, setEmailOtp] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const emailOtpRef = useRef(null);
  const mobileOtpRef = useRef(null);

  const [tries, setTries] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ email: "init", mobile: "init" });
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // OTP Expiry and Lockout timers
  React.useEffect(() => {
    let otpInterval = null,
      lockoutInterval = null;
    if (timer > 0 && !isExpired) {
      otpInterval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            setIsExpired(true);
            clearInterval(otpInterval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    if (lockTimer > 0) {
      lockoutInterval = setInterval(() => {
        setLockTimer((l) => {
          if (l <= 1) {
            setIsLocked(false);
            clearInterval(lockoutInterval);
            setTries(0);
            return 0;
          }
          return l - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(otpInterval);
      clearInterval(lockoutInterval);
    };
  }, [timer, lockTimer, isExpired]);

  // Send OTP/resend with real API
  const handleSendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mobile }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send OTPs.");
      setStatus({ email: "sent", mobile: "sent" });
      setTimer(OTP_EXPIRE_SEC);
      setIsExpired(false);
      setEmailOtp("");
      setMobileOtp("");
      setTries(0);
      setIsLocked(false);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // For popup resend email
  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      await handleSendOtp();
      // optionally: show toast for confirmation
    } catch (err) {}
    setResendLoading(false);
  };

  // Handle OTP submit/verify with real API
  const handleVerify = async () => {
    if (isExpired) {
      setError("OTP expired. Please resend and try again.");
      return;
    }
    if (tries >= MAX_TRIES && !isLocked) {
      setIsLocked(true);
      setLockTimer(LOCKOUT_SEC);
      setError(
        `Too many failed attempts. Please wait ${LOCKOUT_SEC} seconds before retry.`,
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          mobile,
          emailOtp,
          mobileOtp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ email: "verified", mobile: "verified" });
        if (typeof next === "function") next({ otpVerified: true });
      } else {
        setTries((t) => t + 1);
        setError(data.error || "Invalid OTPs. Try again.");
      }
    } catch (err) {
      setError("Verification failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // OTP input fields: auto-move, paste support
  function handleOtpInput(e, which) {
    const val = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (which === "email") {
      setEmailOtp(val);
      if (val.length === OTP_LENGTH) mobileOtpRef.current?.focus();
    } else {
      setMobileOtp(val);
    }
  }
  function handlePaste(e, which) {
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, "");
    if (which === "email") {
      setEmailOtp(pasted.slice(0, OTP_LENGTH));
      if (pasted.length === OTP_LENGTH) mobileOtpRef.current?.focus();
    } else {
      setMobileOtp(pasted.slice(0, OTP_LENGTH));
    }
    e.preventDefault();
  }

  const validEmailOtp = /^\d{6}$/.test(emailOtp);
  const validMobileOtp = /^\d{6}$/.test(mobileOtp);

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Verify Your Contact Info
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter codes sent to your Email & Mobile
        </p>
        <div className="text-xs mt-2 flex flex-col items-center gap-1">
          <div>
            OTP Expires in:{" "}
            <span className={timer < 20 ? "text-red-600" : "text-black"}>
              {isExpired ? "Expired!" : `${timer}s`}
            </span>
            {isExpired && (
              <span className="ml-1 text-red-600">Please resend</span>
            )}
          </div>
          {isLocked && (
            <div className="font-semibold text-red-600">
              Locked for {lockTimer}s
            </div>
          )}
        </div>
      </div>
      {/* Email & Mobile (readonly) + Edit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            Your Email
            <button
              className="text-xs text-blue-500 underline"
              onClick={() => onEditContact?.("email")}
              type="button"
            >
              Edit
            </button>
          </label>
          <input
            type="text"
            value={email}
            readOnly
            disabled
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            Your Mobile
            <button
              className="text-xs text-blue-500 underline"
              onClick={() => onEditContact?.("mobile")}
              type="button"
            >
              Edit
            </button>
          </label>
          <input
            type="text"
            value={mobile}
            readOnly
            disabled
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email OTP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email OTP
          </label>
          <input
            ref={emailOtpRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={emailOtp}
            onChange={(e) => handleOtpInput(e, "email")}
            onPaste={(e) => handlePaste(e, "email")}
            placeholder="Enter 6-digit OTP"
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none ${
              validEmailOtp ? "border-green-500" : "border-gray-300"
            }`}
            disabled={
              status.email === "verified" || loading || isLocked || isExpired
            }
            maxLength={OTP_LENGTH}
          />
          {status.email === "verified" && (
            <p className="mt-1 text-xs text-green-600 font-semibold">
              Verified!
            </p>
          )}
        </div>
        {/* Mobile OTP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile OTP
          </label>
          <input
            ref={mobileOtpRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={mobileOtp}
            onChange={(e) => handleOtpInput(e, "mobile")}
            onPaste={(e) => handlePaste(e, "mobile")}
            placeholder="Enter 6-digit OTP"
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none ${
              validMobileOtp ? "border-green-500" : "border-gray-300"
            }`}
            disabled={
              status.mobile === "verified" || loading || isLocked || isExpired
            }
            maxLength={OTP_LENGTH}
          />
          {status.mobile === "verified" && (
            <p className="mt-1 text-xs text-green-600 font-semibold">
              Verified!
            </p>
          )}
        </div>
      </div>
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-1">
          <p className="text-red-700 text-sm font-medium">❌ {error}</p>
        </div>
      )}
      {/* Send OTP/Resend + Help/Back */}
      <div className="flex justify-between mt-2 mb-2 gap-2">
        <button
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
            loading || timer > 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-900 shadow"
          }`}
          onClick={handleSendOtp}
          disabled={loading || timer > 0 || isLocked}
        >
          {loading
            ? "Sending OTPs..."
            : timer > 0
              ? `Resend OTP (${timer}s)`
              : "Send OTP"}
        </button>
        <button
          className="px-4 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          onClick={back}
          disabled={loading}
        >
          Back
        </button>
        <button
          className="px-4 py-2 rounded-lg font-semibold bg-gray-100 text-blue-700 hover:bg-blue-200 transition-colors"
          onClick={() => setShowHelp(true)}
          type="button"
        >
          Didn't receive OTP?
        </button>
      </div>
      <button
        className={`w-full py-3.5 rounded-xl font-semibold text-lg mt-2 transition-all duration-300 ${
          validEmailOtp && validMobileOtp && !loading && !isLocked && !isExpired
            ? "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
        onClick={handleVerify}
        disabled={
          !(validEmailOtp && validMobileOtp) ||
          loading ||
          (status.email === "verified" && status.mobile === "verified") ||
          isLocked ||
          isExpired
        }
      >
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>
      {/* Custom Email Confirmation Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-8 w-full max-w-md text-center">
            {/* Close */}
            <button
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowHelp(false)}
              aria-label="Close"
            >
              ×
            </button>
            {/* Illustration */}
            <div className="flex justify-center mb-3">
              <svg width="68" height="68" fill="none" viewBox="0 0 68 68">
                <circle cx="34" cy="34" r="34" fill="#E7F6EF" />
                <rect
                  x="18"
                  y="24"
                  width="32"
                  height="24"
                  rx="3"
                  fill="#4BB543"
                />
                <rect x="22" y="28" width="24" height="16" rx="2" fill="#fff" />
                <path d="M22 28l12 11 12-11" stroke="#4BB543" strokeWidth="2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email & SMS Confirmation
            </h2>
            <div className="text-gray-600 text-[16px] mb-3 leading-relaxed">
              We have sent an OTP to <b>{email}</b> (email) and <b>{mobile}</b>{" "}
              (SMS) to confirm your contact info.
              <br />
              Please check both and enter the codes above.
            </div>
            <hr className="my-3 opacity-30" />
            <div className="text-gray-700 text-sm">
              If you didn&apos;t get any OTP:&nbsp;
              <button
                disabled={resendLoading}
                className={`underline font-medium text-[#388E3C] hover:text-[#225322] ${resendLoading ? "opacity-60 cursor-wait" : ""}`}
                onClick={handleResendEmail}
                style={{ transition: "color 0.2s" }}
              >
                {resendLoading ? "Sending..." : "Resend OTPs"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
