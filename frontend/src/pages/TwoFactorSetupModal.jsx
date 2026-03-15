import React, { useState } from "react";
import {
  FiSmartphone,
  FiCopy,
  FiCheck,
  FiX,
  FiDownload,
  FiCheckCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function TwoFactorSetupModal({ open, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnable2FA = async () => {
    try {
      const token = localStorage.getItem("facepay_token");
      const response = await fetch(
        "http://localhost:5000/api/security/2fa/enable",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await response.json();

      if (result.success) {
        setQrCode(result.qrCode);
        setSecret(result.secret);
        setStep(2);
      } else {
        toast.error(result.message || "Failed to enable 2FA");
      }
    } catch (error) {
      toast.error("Failed to enable 2FA");
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Enter valid 6-digit code");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("facepay_token");
      const response = await fetch(
        "http://localhost:5000/api/security/2fa/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code: verificationCode }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setStep(3);
        toast.success("2FA enabled successfully!");
      } else {
        toast.error(result.message || "Verification failed");
      }
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    resetModal();
    onClose();
  };

  const resetModal = () => {
    setStep(1);
    setQrCode("");
    setSecret("");
    setVerificationCode("");
  };

  const downloadBackupCodes = () => {
    const text = backupCodes.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "facepay-backup-codes.txt";
    a.click();
    toast.success("Backup codes downloaded");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Enable 2FA</h2>
                  <p className="text-sm text-indigo-100 mt-1">
                    Step {step} of 3
                  </p>
                </div>
                <button
                  onClick={() => {
                    resetModal();
                    onClose();
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div className="p-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiSmartphone className="text-indigo-600" size={28} />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-slate-600">
                      Add an extra layer of security to your account using an
                      authenticator app
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 text-sm mb-2">
                      You'll need an authenticator app:
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Google Authenticator</li>
                      <li>• Microsoft Authenticator</li>
                      <li>• Authy</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleEnable2FA}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Scan QR Code
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Open your authenticator app and scan this QR code
                    </p>
                    {qrCode ? (
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl">
                          <img
                            src={qrCode}
                            alt="QR Code"
                            className="w-52 h-52"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-64 h-64 bg-slate-100 animate-pulse rounded-2xl mx-auto mb-4"></div>
                    )}
                    <p className="text-xs text-slate-500 mb-2">
                      Or enter this code manually:
                    </p>
                    <div className="bg-slate-100 border border-slate-300 rounded-lg py-3 px-4 font-mono text-sm text-slate-900 flex items-center justify-center gap-2">
                      {secret}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(secret);
                          toast.success("Secret copied");
                        }}
                        className="p-1 hover:bg-slate-200 rounded transition"
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      Enter Verification Code
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Enter the 6-digit code from your authenticator app
                    </p>
                    <input
                      type="text"
                      maxLength="6"
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="000000"
                      className="w-full text-center text-3xl font-bold tracking-widest border-2 border-slate-300 rounded-xl py-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                    />
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={verificationCode.length !== 6 || loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiCheck /> Verify & Enable
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full text-slate-600 hover:text-slate-900 text-sm font-semibold"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheckCircle size={32} />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      2FA Enabled!
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Two-factor authentication is now active on your account.
                    </p>
                  </div>
                  <button
                    onClick={handleComplete}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
