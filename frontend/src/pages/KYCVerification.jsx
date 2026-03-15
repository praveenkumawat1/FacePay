import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiLock,
  FiCamera,
  FiCheckCircle,
  FiX,
  FiLoader,
  FiShield,
  FiUpload,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000";

// Helper to fetch with token
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("facepay_token");
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const steps = [
  { id: "basic", label: "Basic Details" },
  { id: "aadhaar", label: "Aadhaar Verification" },
  { id: "pan", label: "PAN Verification" },
  { id: "face", label: "Face Capture" },
  { id: "consent", label: "Consent" },
  { id: "result", label: "Result" },
];

export default function KYCVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId") || localStorage.getItem("userId"); // adjust as needed

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    fatherName: "",
    address: "",
    mobile: "",
    aadhaarNumber: "",
    aadhaarOtp: "",
    aadhaarConsent: false,
    panNumber: "",
    panImage: null,
    faceImage: null,
    consentDataUsage: false,
    consentRBI: false,
    consentBiometric: false,
    consentEsign: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // 'approved' or 'rejected'
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle OTP timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step 0: Basic details validation
  const validateBasic = () => {
    const { fullName, dob, fatherName, address, mobile } = formData;
    if (!fullName || !dob || !fatherName || !address || !mobile) {
      toast.error("All fields are required");
      return false;
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return false;
    }
    return true;
  };

  // Step 1: Aadhaar
  const sendAadhaarOtp = async () => {
    if (!formData.aadhaarNumber || !/^\d{12}$/.test(formData.aadhaarNumber)) {
      toast.error("Enter a valid 12-digit Aadhaar number");
      return;
    }
    if (!formData.aadhaarConsent) {
      toast.error("You must give consent to verify Aadhaar");
      return;
    }
    setLoading(true);
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setOtpSent(true);
      setOtpTimer(60);
      toast.success("OTP sent to registered mobile");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAadhaarOtp = async () => {
    if (!formData.aadhaarOtp || formData.aadhaarOtp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      // Mock verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Aadhaar verified successfully");
      nextStep();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: PAN
  const validatePan = () => {
    if (
      !formData.panNumber ||
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)
    ) {
      toast.error("Enter a valid PAN (e.g., ABCDE1234F)");
      return false;
    }
    if (!formData.panImage) {
      toast.error("Please upload a clear image of your PAN card");
      return false;
    }
    return true;
  };

  const handlePanUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      updateForm("panImage", file);
    }
  };

  // Step 3: Face capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error("Unable to access camera");
    }
  };

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        updateForm("faceImage", blob);
        // Stop camera
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
        toast.success("Face captured");
      }, "image/jpeg");
    }
  };

  // Step 4: Consent validation
  const validateConsent = () => {
    const { consentDataUsage, consentRBI, consentBiometric, consentEsign } =
      formData;
    if (
      !consentDataUsage ||
      !consentRBI ||
      !consentBiometric ||
      !consentEsign
    ) {
      toast.error("You must accept all consents to proceed");
      return false;
    }
    return true;
  };

  // Final submission
  const submitKYC = async () => {
    setLoading(true);
    try {
      // Mock submission
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // Random result for demo
      const approved = Math.random() > 0.3;
      setResult(approved ? "approved" : "rejected");
      nextStep(); // go to result step
    } catch (error) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Details
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              Basic Information
            </h3>
            <p className="text-sm text-slate-500">
              Enter your details as per Aadhaar
            </p>
            <div className="space-y-4">
              <Input
                label="Full Name (as per Aadhaar)"
                icon={FiUser}
                value={formData.fullName}
                onChange={(v) => updateForm("fullName", v)}
                placeholder="John Doe"
              />
              <Input
                label="Date of Birth"
                icon={FiCalendar}
                type="date"
                value={formData.dob}
                onChange={(v) => updateForm("dob", v)}
              />
              <Input
                label="Father's Name"
                icon={FiUser}
                value={formData.fatherName}
                onChange={(v) => updateForm("fatherName", v)}
                placeholder="Father's full name"
              />
              <Input
                label="Address"
                icon={FiMapPin}
                value={formData.address}
                onChange={(v) => updateForm("address", v)}
                placeholder="Full address"
              />
              <Input
                label="Mobile Number (linked to bank)"
                icon={FiPhone}
                type="tel"
                value={formData.mobile}
                onChange={(v) => updateForm("mobile", v)}
                placeholder="10-digit mobile"
              />
            </div>
          </div>
        );

      case 1: // Aadhaar
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              Aadhaar Verification
            </h3>
            <p className="text-sm text-slate-500">
              Enter your Aadhaar number and consent
            </p>
            <Input
              label="Aadhaar Number"
              value={formData.aadhaarNumber}
              onChange={(v) => updateForm("aadhaarNumber", v)}
              placeholder="12-digit Aadhaar"
              maxLength={12}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="aadhaarConsent"
                checked={formData.aadhaarConsent}
                onChange={(e) => updateForm("aadhaarConsent", e.target.checked)}
                className="w-4 h-4 text-indigo-600"
              />
              <label
                htmlFor="aadhaarConsent"
                className="text-sm text-slate-700"
              >
                I consent to verify my Aadhaar details (as per UIDAI guidelines)
              </label>
            </div>
            {!otpSent ? (
              <button
                onClick={sendAadhaarOtp}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Enter OTP"
                  value={formData.aadhaarOtp}
                  onChange={(v) => updateForm("aadhaarOtp", v)}
                  placeholder="6-digit OTP"
                  maxLength={6}
                />
                <button
                  onClick={verifyAadhaarOtp}
                  disabled={loading || otpTimer === 0}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading
                    ? "Verifying..."
                    : `Verify OTP ${otpTimer > 0 ? `(${otpTimer}s)` : ""}`}
                </button>
                {otpTimer === 0 && (
                  <button
                    onClick={sendAadhaarOtp}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            )}
          </div>
        );

      case 2: // PAN
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              PAN Verification
            </h3>
            <p className="text-sm text-slate-500">
              Enter your PAN and upload a clear image
            </p>
            <Input
              label="PAN Number"
              value={formData.panNumber}
              onChange={(v) => updateForm("panNumber", v.toUpperCase())}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Upload PAN Card Image
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  <FiUpload className="inline mr-2" /> Choose File
                </button>
                <span className="text-sm text-slate-500">
                  {formData.panImage
                    ? formData.panImage.name
                    : "No file chosen"}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePanUpload}
                className="hidden"
              />
            </div>
          </div>
        );

      case 3: // Face capture
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              Live Face Capture
            </h3>
            <p className="text-sm text-slate-500">
              Position your face in the frame and capture
            </p>
            <div className="relative bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            {!formData.faceImage ? (
              <div className="flex gap-3">
                <button
                  onClick={startCamera}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  Start Camera
                </button>
                <button
                  onClick={captureFace}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                >
                  <FiCamera className="inline mr-2" /> Capture
                </button>
              </div>
            ) : (
              <div className="text-center">
                <FiCheckCircle className="text-4xl text-green-600 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  Face captured successfully
                </p>
              </div>
            )}
          </div>
        );

      case 4: // Consent
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">
              Terms & Consent
            </h3>
            <p className="text-sm text-slate-500">
              Please read and accept all consents
            </p>
            <div className="space-y-4">
              <Checkbox
                id="dataUsage"
                checked={formData.consentDataUsage}
                onChange={(e) =>
                  updateForm("consentDataUsage", e.target.checked)
                }
                label="I consent to the usage of my data for KYC verification"
              />
              <Checkbox
                id="rbi"
                checked={formData.consentRBI}
                onChange={(e) => updateForm("consentRBI", e.target.checked)}
                label="I agree to RBI/NPCI guidelines for digital KYC"
              />
              <Checkbox
                id="biometric"
                checked={formData.consentBiometric}
                onChange={(e) =>
                  updateForm("consentBiometric", e.target.checked)
                }
                label="I consent to storage of my face biometrics for authentication"
              />
              <Checkbox
                id="esign"
                checked={formData.consentEsign}
                onChange={(e) => updateForm("consentEsign", e.target.checked)}
                label="I authorize eSign on my behalf"
              />
            </div>
          </div>
        );

      case 5: // Result
        return (
          <div className="text-center space-y-6">
            {result === "approved" ? (
              <>
                <FiCheckCircle className="text-6xl text-green-600 mx-auto" />
                <h3 className="text-2xl font-bold text-green-700">
                  KYC Approved!
                </h3>
                <p className="text-slate-600">
                  Your identity has been successfully verified.
                </p>
              </>
            ) : result === "rejected" ? (
              <>
                <FiAlertCircle className="text-6xl text-red-600 mx-auto" />
                <h3 className="text-2xl font-bold text-red-700">
                  KYC Rejected
                </h3>
                <p className="text-slate-600">
                  We could not verify your details. Please contact support.
                </p>
              </>
            ) : (
              <div className="py-10">
                <FiLoader className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
                <p className="text-slate-600">Processing your KYC...</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleStepAction = () => {
    if (currentStep === 0 && validateBasic()) nextStep();
    else if (currentStep === 2 && validatePan()) nextStep();
    else if (currentStep === 3 && !formData.faceImage) {
      toast.error("Please capture your face first");
    } else if (currentStep === 3 && formData.faceImage) nextStep();
    else if (currentStep === 4 && validateConsent()) submitKYC();
    else if (currentStep < 4 && currentStep !== 1) nextStep(); // for steps without extra validation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f5f3ff] py-8 px-4">
      <Toaster position="top-center" />

      <div className="max-w-3xl mx-auto">
        {/* Header with progress */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-6 mb-6 border border-white/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">
              KYC Verification
            </h1>
            <button
              onClick={() => window.close()}
              className="p-2 hover:bg-slate-100 rounded-full transition"
              title="Close"
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex-1 h-2 rounded-full ${
                    idx <= currentStep ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                />
                {idx < steps.length - 1 && <div className="w-1" />}
              </React.Fragment>
            ))}
          </div>
          <p className="text-right text-sm text-slate-500 mt-2">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
          </p>
        </div>

        {/* Main form card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-white/50">
          {renderStep()}

          {/* Navigation buttons */}
          {currentStep < steps.length - 1 && currentStep !== 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleStepAction}
                disabled={loading}
                className="px-8 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" /> Processing...
                  </>
                ) : currentStep === 4 ? (
                  "Submit KYC"
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          )}

          {currentStep === 5 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => window.close()}
                className="px-8 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Close Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Input component
const Input = ({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
}) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
      {Icon && <Icon size={16} className="text-indigo-600" />}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full rounded-xl px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
    />
  </div>
);

// Reusable Checkbox
const Checkbox = ({ id, checked, onChange, label }) => (
  <div className="flex items-start gap-3">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="w-5 h-5 mt-0.5 text-indigo-600 rounded focus:ring-indigo-500"
    />
    <label htmlFor={id} className="text-sm text-slate-700">
      {label}
    </label>
  </div>
);
