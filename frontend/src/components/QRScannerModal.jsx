import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { FiX, FiCamera, FiAlertCircle, FiLoader } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";

const QRScannerModal = ({ isOpen, onClose, onUserDetected, darkMode }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef(null);
  const dm = darkMode;

  useEffect(() => {
    if (isOpen) {
      const scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current
            .clear()
            .catch((e) => console.error("Scanner clear error:", e));
        }
      };
    }
  }, [isOpen]);

  const onScanSuccess = async (decodedText) => {
    try {
      // Handle UPI URI format: upi://pay?pa=recipient@upi&pn=Recipient%20Name&...
      let upiId = "";
      if (decodedText.startsWith("upi://pay")) {
        const urlParams = new URLSearchParams(decodedText.split("?")[1]);
        upiId = urlParams.get("pa");
      } else if (decodedText.includes("@")) {
        // Plain UPI ID
        upiId = decodedText.trim();
      } else {
        setError("Invalid QR Code. Please scan a FacePay or UPI QR.");
        return;
      }

      if (upiId) {
        setLoading(true);
        setError(null);

        // Match with FacePay Backend
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/dashboard/user-by-upi/${upiId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (response.data.success) {
            onUserDetected(response.data.user);
            onClose();
          }
        } catch (err) {
          if (err.response && err.response.status === 404) {
            // Not a FacePay user, but maybe a standard UPI ID
            onUserDetected({
              upi_id: upiId,
              name: upiId.split("@")[0],
              isExternal: true,
            });
            onClose();
          } else {
            setError("Failed to verify UPI ID. Please try again.");
          }
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Scan processing error:", err);
      setError("Error processing QR code.");
    }
  };

  const onScanFailure = (err) => {
    // Failures happen frequently during scanning (no QR found in frame)
    // We only log if it's a critical error
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl ${
          dm
            ? "bg-slate-900 border border-slate-800"
            : "bg-white border border-slate-200"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${dm ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}
            >
              <FiCamera size={20} />
            </div>
            <h2
              className={`text-lg font-bold ${dm ? "text-white" : "text-slate-900"}`}
            >
              Scan QR Code
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${dm ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6">
          <div
            id="reader"
            className="overflow-hidden rounded-2xl border-2 border-dashed border-indigo-500/30"
            style={{ width: "100%", minHeight: "300px" }}
          ></div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-500 text-sm"
              >
                <FiAlertCircle className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {loading && (
              <motion.div className="mt-4 flex items-center justify-center gap-2 text-indigo-500 font-medium">
                <FiLoader className="animate-spin" />
                <span>Verifying FacePay User...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`mt-6 p-4 rounded-2xl text-xs flex flex-col gap-2 ${dm ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"}`}
          >
            <p className="font-bold uppercase tracking-wider text-[10px] opacity-70">
              Instructions
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Align QR code within the frame</li>
              <li>Supports FacePay and standard UPI QRs</li>
              <li>Ensure good lighting for faster detection</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QRScannerModal;
