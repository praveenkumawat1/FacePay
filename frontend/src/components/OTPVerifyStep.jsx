import React, { useState, useRef, useEffect } from "react";

const OTP_LENGTH = 6;
const MAX_TRIES = 5;
const LOCKOUT_SEC = 60;
const OTP_EXPIRE_SEC = 90;

export default function OTPVerifyStep({
  email,
  next,
  back,
  onEditContact = () => {},
}) {
  const [emailOtp, setEmailOtp] = useState("");
  const emailOtpRef = useRef(null);

  const [tries, setTries] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("init");
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Timer effects
  useEffect(() => {
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

  // Automatically send OTP (on first mount or resend)
  useEffect(() => {
    handleSendOtp();
    // eslint-disable-next-line
  }, []);

  const handleSendOtp = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setStatus("sent");
      setTimer(OTP_EXPIRE_SEC);
      setIsExpired(false);
      setEmailOtp("");
      setTries(0);
      setIsLocked(false);
      setLoading(false);
      // For demo, OTP = 123456
    }, 700);
  };

  const handleVerify = () => {
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

    setTimeout(() => {
      if (emailOtp === "123456") {
        setStatus("verified");
        if (typeof next === "function") next({ otpVerified: true });
      } else {
        setTries((t) => t + 1);
        setError("Invalid OTP. Try again. (Hint: 123456)");
      }
      setLoading(false);
    }, 700);
  };

  const validEmailOtp = /^\d{6}$/.test(emailOtp);

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter the OTP sent to your email ({email})
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

      {/* Email (readonly) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
          Your Email
          <button
            className="text-xs text-blue-500 underline"
            onClick={() => onEditContact("email")}
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
          onChange={(e) =>
            setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
          }
          placeholder="Enter 6-digit OTP"
          className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none 
            ${validEmailOtp ? "border-green-500" : "border-gray-300"}`}
          disabled={status === "verified" || loading || isLocked || isExpired}
          maxLength={OTP_LENGTH}
        />
        {status === "verified" && (
          <p className="mt-1 text-xs text-green-600 font-semibold">Verified!</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-1">
          <p className="text-red-700 text-sm font-medium">❌ {error}</p>
        </div>
      )}

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
            ? "Sending OTP..."
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
          validEmailOtp && !loading && !isLocked && !isExpired
            ? "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
        onClick={handleVerify}
        disabled={
          !validEmailOtp ||
          loading ||
          status === "verified" ||
          isLocked ||
          isExpired
        }
      >
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>

      {/* Help Modal (optional) */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full relative">
            <button
              className="absolute top-2 right-4 text-gray-400 hover:text-black font-bold text-lg"
              onClick={() => setShowHelp(false)}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-2 text-center text-black">
              Didn't receive OTP?
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-3">
              <li>Check if your email is correct.</li>
              <li>Check your spam folder.</li>
              <li>Wait 30+ seconds (sometimes delayed).</li>
              <li>Contact support if still not received.</li>
            </ul>
            <button
              className="w-full py-2 mt-2 rounded-lg bg-blue-600 text-white font-semibold"
              type="button"
              onClick={() => {
                setShowHelp(false);
                window.open("mailto:support@facepay.com", "_blank");
              }}
            >
              Contact Support
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
