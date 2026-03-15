import { useState } from "react";

const ForgotPasswordModal = ({ close, openSignup }) => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: password, 4: done
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [error, setError] = useState("");
  const [suggestSignup, setSuggestSignup] = useState(false);

  // Step 1: Send email for OTP
  const sendOtp = async () => {
    setLoading(true);
    setError("");
    setSuggestSignup(false);
    try {
      const res = await fetch("/api/auth/request-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Could not send OTP. Try again.");
        if (data.next === "signup") setSuggestSignup(true);
        setLoading(false);
        return;
      }
      setStep(2);
    } catch {
      setError("Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    setLoading(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!data.success || !data.token) {
        setOtpError(data.message || "OTP verification failed.");
        setLoading(false);
        return;
      }
      setResetToken(data.token);
      setStep(3);
    } catch {
      setOtpError("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set new password
  const resetPassword = async () => {
    setLoading(true);
    setError("");
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Reset failed.");
        setLoading(false);
        return;
      }
      setStep(4);
    } catch {
      setError("Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Prevent closing modal by accidental click outside
  const preventParentFormClose = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl border border-slate-100 relative"
        onClick={preventParentFormClose}
      >
        <button
          onClick={close}
          className="absolute top-3 right-4 text-slate-500 hover:text-black text-xl font-bold"
          tabIndex={0}
          type="button"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-2 text-center select-none">
          {step === 1 && "Reset Password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "Create New Password"}
          {step === 4 && "Success!"}
        </h3>

        {/* === Step 1 - Email === */}
        {step === 1 && (
          <>
            <div>
              <p className="text-slate-500 text-center text-sm mb-4">
                Enter your email to receive an OTP for password reset.
              </p>
              <input
                type="email"
                required
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 mb-3 focus:outline-blue-500 transition"
                autoFocus
              />
              {error && (
                <div className="text-red-600 text-xs mb-2 text-center">
                  {error}
                </div>
              )}
              <button
                type="button"
                disabled={loading || !email}
                className={`w-full py-3 rounded-lg font-bold transition ${
                  loading
                    ? "bg-slate-300 text-slate-400 cursor-not-allowed"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
                onClick={sendOtp}
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
            {suggestSignup && (
              <div className="mt-4 text-center">
                <span className="text-slate-700 text-sm">
                  Don't have an account?
                </span>
                <button
                  onClick={() => {
                    if (openSignup) openSignup(email);
                    close();
                  }}
                  className="ml-2 font-semibold text-blue-600 hover:underline"
                  type="button"
                >
                  Sign up
                </button>
              </div>
            )}
          </>
        )}

        {/* === Step 2 - OTP === */}
        {step === 2 && (
          <div>
            <p className="text-slate-500 text-center text-sm mb-4">
              Enter the OTP sent to <b>{email}</b>
            </p>
            <input
              type="text"
              required
              minLength={4}
              maxLength={8}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/[^\dA-Za-z]/g, ""))
              }
              className="w-full px-4 py-3 rounded-lg border border-slate-200 mb-3 focus:outline-blue-500 transition tracking-widest text-lg text-center"
              inputMode="numeric"
              autoFocus
            />
            {otpError && (
              <div className="text-red-600 text-xs mb-2 text-center">
                {otpError}
              </div>
            )}
            <button
              type="button"
              disabled={loading || !otp}
              className={`w-full py-3 rounded-lg font-bold transition ${
                loading
                  ? "bg-slate-300 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
              onClick={verifyOtp}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {/* === Step 3 - New Password === */}
        {step === 3 && (
          <div>
            <p className="text-slate-500 text-center text-sm mb-4">
              Set your new password for <b>{email}</b>
            </p>
            <input
              type="password"
              required
              minLength={8}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 mb-3 focus:outline-blue-500 transition"
              autoFocus
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 mb-3 focus:outline-blue-500 transition"
            />
            {error && (
              <div className="text-red-600 text-xs mb-2 text-center">
                {error}
              </div>
            )}
            <button
              type="button"
              disabled={loading || !password || !confirm}
              className={`w-full py-3 rounded-lg font-bold transition ${
                loading
                  ? "bg-slate-300 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
              onClick={resetPassword}
            >
              {loading ? "Resetting..." : "Change Password"}
            </button>
          </div>
        )}

        {/* === Step 4 - Done === */}
        {step === 4 && (
          <div className="py-5 text-center">
            <div className="text-green-700 font-semibold text-2xl mb-2">
              🎉 Password changed!
            </div>
            <div className="text-slate-700 mb-4">
              You may now login with your new password.
            </div>
            <button
              className="bg-slate-900 text-white hover:bg-slate-800 w-full py-3 rounded-lg font-bold"
              onClick={close}
              type="button"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
