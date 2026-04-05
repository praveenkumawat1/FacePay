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
  FiChevronDown,
  FiHelpCircle,
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";

const API_BASE_URL = "http://localhost:5000";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "In what city were you born?",
  "What was the name of your first school?",
  "What is your favorite book?",
];

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
  { id: "basic", label: "Basic Info", icon: FiUser },
  { id: "personal", label: "Identity", icon: FiMapPin },
  { id: "aadhaar", label: "Aadhaar", icon: FiShield },
  { id: "pan", label: "PAN Card", icon: FiShield },
  { id: "face", label: "Biometrics", icon: FiCamera },
  { id: "consent", label: "Finished", icon: FiCheckCircle },
];

export default function KYCVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId") || localStorage.getItem("userId");
  const isEmbed = searchParams.get("embed") === "true";

  const [currentStep, setCurrentStep] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Small delay to prevent sudden layout shifts and ensure query params are stable
    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    state: "",
    city: "",
    securityQuestion: "",
    securityAnswer: "",
    dob: "",
    fatherName: "",
    address: "",
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
    const { firstName, lastName, mobile, state, city } = formData;
    if (!firstName || !lastName || !mobile || !state || !city) {
      toast.error("All basic fields are required");
      return false;
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return false;
    }
    return true;
  };

  // Step 1: Document info validation (Legacy Address/DOB/Father)
  const validateDocInfo = () => {
    const { dob, fatherName, address, securityQuestion, securityAnswer } =
      formData;
    if (
      !dob ||
      !fatherName ||
      !address ||
      !securityQuestion ||
      !securityAnswer
    ) {
      toast.error("Please fill all personal and security details");
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
      // Step 6: Complete KYC (Automatic Approval)
      const res = await apiFetch("/api/kyc/complete", {
        method: "POST",
        body: JSON.stringify({ formData }),
      });

      if (res.success) {
        setResult("approved");
        // Notify parent (Dashboard) that KYC is done
        window.parent.postMessage({ type: "kyc_success" }, "*");
        toast.success("KYC Verified Successfully!");
      } else {
        setResult("rejected");
        toast.error(res.message || "KYC verification failed");
      }
      setCurrentStep(6); // Move to Result step
    } catch (error) {
      console.error("KYC Submission Error:", error);
      toast.error(error.message || "Something went wrong during submission");
      setResult("rejected");
      setCurrentStep(6);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Step 1: Basic Information
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FiUser className="text-indigo-600" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(v) => updateForm("firstName", v)}
                placeholder="Ex: Rahul"
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(v) => updateForm("lastName", v)}
                placeholder="Ex: Sharma"
              />
            </div>
            <Input
              label="Mobile Number"
              icon={FiPhone}
              type="tel"
              value={formData.mobile}
              onChange={(v) => updateForm("mobile", v)}
              placeholder="10-digit mobile"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select State
                </label>
                <div className="relative">
                  <select
                    value={formData.state}
                    onChange={(e) => updateForm("state", e.target.value)}
                    className="w-full h-[54px] rounded-xl px-4 bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <Input
                label="City"
                value={formData.city}
                onChange={(v) => updateForm("city", v)}
                placeholder="City Name"
              />
            </div>
          </div>
        );

      case 1: // Step 2: Personal details
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FiMapPin className="text-indigo-600" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                icon={FiCalendar}
                type="date"
                value={formData.dob}
                onChange={(v) => updateForm("dob", v)}
              />
              <Input
                label="Father's Name"
                value={formData.fatherName}
                onChange={(v) => updateForm("fatherName", v)}
                placeholder="Father's full name"
              />
            </div>
            <Input
              label="Permanent Address"
              value={formData.address}
              onChange={(v) => updateForm("address", v)}
              placeholder="As per Document"
            />
            <div className="space-y-4 pt-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FiHelpCircle className="text-indigo-600" /> Security Question
              </label>
              <select
                value={formData.securityQuestion}
                onChange={(e) => updateForm("securityQuestion", e.target.value)}
                className="w-full h-[54px] rounded-xl px-4 bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a secret question</option>
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <Input
                label="Your Answer"
                value={formData.securityAnswer}
                onChange={(v) => updateForm("securityAnswer", v)}
                placeholder="Type your answer here..."
              />
            </div>
          </div>
        );

      case 2: // Step 3: Aadhaar
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FiShield className="text-indigo-600" /> Aadhaar Verification
            </h3>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
              <p className="text-xs text-blue-700 font-medium">
                Verify your identity using UIDAI Aadhaar authentication.
              </p>
            </div>
            <Input
              label="Aadhaar Card Number"
              value={formData.aadhaarNumber}
              onChange={(v) => updateForm("aadhaarNumber", v)}
              placeholder="12-digit number"
              maxLength={12}
            />
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="aadhaarConsent"
                checked={formData.aadhaarConsent}
                onChange={(e) => updateForm("aadhaarConsent", e.target.checked)}
                className="w-4 h-4 mt-1 text-indigo-600"
              />
              <label
                htmlFor="aadhaarConsent"
                className="text-xs text-slate-600 leading-tight"
              >
                I hereby consent for the authentication of my Aadhaar for KYC
                purposes as per UIDAI rules.
              </label>
            </div>
            {otpSent && (
              <Input
                label="Enter OTP"
                value={formData.aadhaarOtp}
                onChange={(v) => updateForm("aadhaarOtp", v)}
                placeholder="6-digit OTP"
                maxLength={6}
              />
            )}
            {!otpSent ? (
              <button
                onClick={sendAadhaarOtp}
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-2">
                  {otpTimer > 0
                    ? `Resend in ${otpTimer}s`
                    : "You can resend now"}
                </p>
              </div>
            )}
          </div>
        );

      case 3: // Step 4: PAN Card
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FiShield className="text-indigo-600" /> PAN Card Details
            </h3>
            <Input
              label="PAN Card Number"
              value={formData.panNumber}
              onChange={(v) => updateForm("panNumber", v.toUpperCase())}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Upload PAN Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 hover:bg-slate-50 transition cursor-pointer"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePanUpload}
                />
                {formData.panImage ? (
                  <div className="flex flex-col items-center">
                    <FiCheckCircle className="text-green-500 text-3xl mb-2" />
                    <p className="text-sm font-medium text-slate-700">
                      {formData.panImage.name}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-slate-400 text-3xl mb-2" />
                    <p className="text-sm text-slate-500">
                      Click to upload clear image of PAN card
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4: // Step 5: Biometrics (Face)
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FiCamera className="text-indigo-600" /> Face Verification
            </h3>
            <p className="text-sm text-slate-500">
              Live facial recognition ensures only you can access your wallet.
            </p>
            <div className="relative bg-black rounded-3xl aspect-video overflow-hidden shadow-lg border-4 border-white">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              {loading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <FiLoader className="text-white text-4xl animate-spin" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {!formData.faceImage ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={startCamera}
                    className="py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    Start
                  </button>
                  <button
                    onClick={captureFace}
                    className="py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    <FiCamera size={18} /> Capture
                  </button>
                </div>
              ) : (
                <div className="text-center bg-green-50 p-6 rounded-3xl border-2 border-green-200">
                  <FiCheckCircle className="text-4xl text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-bold">
                    Face Captured Successfully!
                  </p>
                  <button
                    onClick={() => updateForm("faceImage", null)}
                    className="text-xs text-green-600 mt-2 underline"
                  >
                    Retake Photo
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 5: // Step 6: Final Consent
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FiCheckCircle className="text-indigo-600" /> Confirmation
            </h3>
            <div className="space-y-4">
              <Checkbox
                id="dataUsage"
                checked={formData.consentDataUsage}
                onChange={(e) =>
                  updateForm("consentDataUsage", e.target.checked)
                }
                label="I agree to share my KYC data with FacePay for processing."
              />
              <Checkbox
                id="biometric"
                checked={formData.consentBiometric}
                onChange={(e) =>
                  updateForm("consentBiometric", e.target.checked)
                }
                label="I authorize FacePay to store my biometric data for secure logins."
              />
              <Checkbox
                id="rbi"
                checked={formData.consentRBI}
                onChange={(e) => updateForm("consentRBI", e.target.checked)}
                label="I accept all RBI and regulatory guidelines for digital KYC."
              />
              <Checkbox
                id="esign"
                checked={formData.consentEsign}
                onChange={(e) => updateForm("consentEsign", e.target.checked)}
                label="I hereby authorize digital signing of my verification request."
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
              <p className="text-[11px] text-slate-500 text-center">
                By clicking Submit, you agree to our Terms of Service & Privacy
                Policy.
              </p>
            </div>
          </div>
        );

      case 6: // Processing / Result UI
        return (
          <div className="text-center space-y-6 py-10">
            {result === "approved" ? (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="text-6xl text-green-600" />
                </div>
                <h3 className="text-3xl font-black text-slate-900">
                  Verified!
                </h3>
                <p className="text-slate-500 px-10">
                  Your KYC is complete. You can now use all FacePay features.
                </p>
              </div>
            ) : result === "rejected" ? (
              <div>
                <FiAlertCircle className="text-6xl text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-red-700">
                  Verification Failed
                </h3>
                <p className="text-slate-500">
                  Some details didn't match. Please try again with clear
                  documents.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Verifying Identity...
                </h3>
                <p className="text-slate-500 text-sm">
                  Please do not close this window.
                </p>
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
    else if (currentStep === 1 && validateDocInfo()) {
      if (!formData.securityQuestion || !formData.securityAnswer) {
        return toast.error("Please answer the security question");
      }
      nextStep();
    } else if (currentStep === 2) {
      if (!formData.aadhaarNumber || formData.aadhaarNumber.length < 12)
        return toast.error("Invalid Aadhaar");
      if (!formData.aadhaarConsent)
        return toast.error("Please provide consent");
      if (!otpSent) return sendAadhaarOtp();
      if (!formData.aadhaarOtp || formData.aadhaarOtp.length < 6)
        return toast.error("Please enter 6-digit OTP");
      nextStep();
    } else if (currentStep === 3) {
      if (validatePan()) nextStep();
    } else if (currentStep === 4 && !formData.faceImage) {
      toast.error("Please capture your face first");
    } else if (currentStep === 4 && formData.faceImage) nextStep();
    else if (currentStep === 5) {
      if (validateConsent()) submitKYC();
    }
  };

  if (isInitializing && !isEmbed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 font-medium">
            Initialising Secure KYC...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isEmbed ? "bg-white overflow-y-auto" : "bg-[#F0F2F5] py-12"} px-4 selection:bg-indigo-100 flex items-center justify-center font-sans`}
    >
      <Toaster position="top-center" />

      <div className="max-w-2xl w-full mx-auto">
        {/* Main form card */}
        <div
          className={`bg-white ${isEmbed ? "rounded-3xl shadow-none border-0" : "rounded-[40px] shadow-2xl border border-slate-100"} overflow-hidden flex flex-col`}
        >
          {/* Progress Timeline Header */}
          <div className="px-6 py-6 border-b border-slate-50 bg-slate-50/30">
            <div className="flex items-center justify-between relative px-2">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="z-10 flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                      idx < currentStep
                        ? "bg-green-500 text-white"
                        : idx === currentStep
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 ring-4 ring-indigo-50"
                          : "bg-white border-2 border-slate-200 text-slate-400"
                    }`}
                  >
                    {idx < currentStep ? (
                      <FiCheckCircle size={18} />
                    ) : (
                      <step.icon size={18} />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-tighter sm:tracking-wider transition-colors hidden sm:block ${
                      idx === currentStep ? "text-indigo-600" : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}

              {/* Background Line */}
              <div className="absolute top-5 left-8 right-8 h-[2px] bg-slate-200 -z-0">
                <div
                  className="h-full bg-indigo-500 transition-all duration-700 ease-in-out"
                  style={{
                    width: `${Math.min((currentStep / (steps.length - 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className={`${isEmbed ? "p-4 md:p-8" : "p-8 md:p-12"} animate-in fade-in slide-in-from-bottom-4 duration-500`}
          >
            {renderStep()}

            {/* Navigation buttons */}
            {currentStep < 6 && (
              <div className="flex gap-4 mt-12 bg-white sticky bottom-0 py-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition border border-slate-100"
                  >
                    Go Back
                  </button>
                )}
                <button
                  onClick={handleStepAction}
                  disabled={loading}
                  className={`py-4 px-10 rounded-2xl font-bold text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                    currentStep === 0 ? "w-full" : "flex-1"
                  } ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-black hover:bg-slate-800 shadow-xl shadow-slate-200"}`}
                >
                  {loading ? (
                    <FiLoader className="animate-spin" />
                  ) : currentStep === 5 ? (
                    "Submit Verification"
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            )}

            {currentStep === 6 && result && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => window.parent.postMessage("kyc_closed", "*")}
                  className="w-full py-4 rounded-2xl font-bold bg-black text-white hover:bg-slate-800 shadow-xl"
                >
                  {result === "approved" ? "Go to Wallet" : "Try Again"}
                </button>
              </div>
            )}
          </div>
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
