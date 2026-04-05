import React, { useState, useRef, useMemo, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  FiUser,
  FiLogOut,
  FiLock,
  FiMail,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiCamera,
  FiActivity,
  FiCreditCard,
  FiKey,
  FiPhone,
  FiLoader,
  FiCheckCircle,
  FiUpload,
  FiX,
  FiSave,
  FiCheck,
  FiAlertCircle,
  FiShield,
} from "react-icons/fi";

const API_BASE_URL = "http://localhost:5000";

function maskPhone(phone = "") {
  if (!phone) return "N/A";
  return phone.replace(/^(\d{2})\d+(\d{4})$/, (_m, p1, p2) => `${p1}XXXX${p2}`);
}

function maskEmail(email = "") {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, user.length - 2))}@${domain}`;
}

// ✅ FIX 1: Centralized API helper — token auto-attach + timeout + better errors
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("facepay_token");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout (Gmail SMTP slow hota hai)

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    clearTimeout(timeout);

    // ✅ FIX: Handle non-JSON responses (e.g., HTML error pages from server crash)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    return result;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Check if server is running.");
    }
    throw err;
  }
}

export default function ProfileSection() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("basic");
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [form, setForm] = useState({});
  const [originalForm, setOriginalForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [pwdStep, setPwdStep] = useState(1);
  const [showPwd, setShowPwd] = useState([false, false, false]);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [captureMode, setCaptureMode] = useState(false);
  const [stream, setStream] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [showViewPasswordModal, setShowViewPasswordModal] = useState(false);
  const [viewPasswordOTP, setViewPasswordOTP] = useState("");
  const [viewPasswordStep, setViewPasswordStep] = useState(1);
  const [otpLoading, setOtpLoading] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // KYC related state
  const [kycStatus, setKycStatus] = useState("not_started");
  const [kycLoading, setKycLoading] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

  const fileInput = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("facepay_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const result = await apiFetch("/api/dashboard");

        if (result.success) {
          const userData = {
            id: result.user._id,
            name: result.user.name || result.user.full_name || "User",
            email: result.user.email || "",
            mobile: result.user.mobile || "",
            avatar:
              result.user.profile_picture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.name || "User")}&background=4f46e5&color=fff&size=200&bold=true`,
          };
          setProfile(userData);
          setForm(userData);
          setOriginalForm(userData);
          setWallet(result.wallet);

          // After profile is loaded, fetch KYC status
          fetchKycStatus();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error("❌ Profile load error:", error);
        toast.error(error.message || "Failed to load profile");
        if (
          error.message?.includes("token") ||
          error.message?.includes("User not found")
        ) {
          localStorage.clear();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Fetch KYC status
  const fetchKycStatus = async () => {
    try {
      setKycLoading(true);
      const result = await apiFetch("/api/kyc/status");
      if (result.success) {
        setKycStatus(result.status); // e.g., 'verified', 'pending', 'not_started'
      }
    } catch (error) {
      console.error("KYC status error:", error);
    } finally {
      setKycLoading(false);
    }
  };

  const handleStartKYC = () => {
    setShowKYCModal(true);
  };

  const handleKYCComplete = (status) => {
    setKycStatus(status);
    setShowKYCModal(false);
    if (status === "pending") {
      toast.success("KYC documents submitted successfully!");
    } else if (status === "verified") {
      toast.success("Congratulations! Your KYC is verified.");
    }
  };

  useEffect(() => {
    if (tab !== "activity") return;
    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const result = await apiFetch("/api/security/activity");
        if (result.success) setActivityLogs(result.activities || []);
      } catch (err) {
        console.error("Activity fetch error:", err);
        toast.error("Could not load activity logs");
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, [tab]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stream]);

  const startResendTimer = () => {
    setOtpResendTimer(30);
    timerRef.current = setInterval(() => {
      setOtpResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completion = useMemo(() => {
    if (!profile) return 0;
    let score = 0;
    if (profile.name) score += 40;
    if (profile.avatar && !profile.avatar.includes("ui-avatars")) score += 30;
    if (profile.mobile) score += 15;
    if (profile.email) score += 15;
    return score;
  }, [profile]);

  const hasChanges = useMemo(() => {
    if (!originalForm || !form) return false;
    return (
      form.name !== originalForm.name || form.avatar !== originalForm.avatar
    );
  }, [form, originalForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setCaptureMode(true);
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Unable to access camera");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.7);
      setForm((prev) => ({ ...prev, avatar: imageData }));
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      setCaptureMode(false);
      setShowPhotoModal(false);
      toast.success("Photo captured!");
    }
  };

  const cancelCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCaptureMode(false);
    setShowPhotoModal(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, avatar: ev.target.result }));
      setShowPhotoModal(false);
      toast.success("Photo uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!hasChanges) {
      toast.error("No changes to save");
      return;
    }
    setSaving(true);
    try {
      const updateData = {};
      if (form.name !== originalForm.name) updateData.name = form.name;
      if (form.avatar !== originalForm.avatar)
        updateData.profile_picture = form.avatar;

      const result = await apiFetch("/api/auth/update-profile", {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (result.success) {
        setProfile(form);
        setOriginalForm(form);
        setEditing(false);
        toast.success("✅ Profile updated!");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("❌ Save error:", error);
      toast.error(error.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm(originalForm);
    setEditing(false);
  };

  const handlePwdInput = (e) =>
    setPasswords((pwd) => ({ ...pwd, [e.target.name]: e.target.value }));

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdStep === 1) {
      if (!passwords.old) {
        toast.error("Enter your current password");
        return;
      }
      setPwdStep(2);
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords don't match!");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be 8+ characters");
      return;
    }
    if (passwords.new === passwords.old) {
      toast.error("New password must be different");
      return;
    }

    setSaving(true);
    try {
      const result = await apiFetch("/api/security/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwords.old,
          newPassword: passwords.new,
        }),
      });

      if (result.success) {
        setPwdStep(1);
        setPasswords({ old: "", new: "", confirm: "" });
        setShowPwd([false, false, false]);
        toast.success("✅ Password changed successfully!");
      } else {
        throw new Error(result.message || "Failed to change password");
      }
    } catch (error) {
      console.error("❌ Password error:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIX 2: Correct OTP endpoint + proper error handling + loading always resets
  const handleRequestViewPasswordOTP = async () => {
    if (!profile?.email) {
      toast.error("Email not found in profile");
      return;
    }
    setOtpLoading(true);
    try {
      const result = await apiFetch("/api/auth/forgot-password-otp", {
        method: "POST",
        body: JSON.stringify({ email: profile.email }),
      });

      if (result.success) {
        const masked = maskEmail(profile.email);
        setMaskedEmail(masked);
        toast.success(`✅ OTP sent to ${masked}`);
        setViewPasswordStep(2);
        startResendTimer();
      } else {
        throw new Error(result.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP send error:", error);
      toast.error(
        error.message || "Could not send OTP. Check server connection.",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyViewPasswordOTP = async () => {
    if (viewPasswordOTP.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    try {
      const result = await apiFetch("/api/auth/verify-forgot-password-otp", {
        method: "POST",
        body: JSON.stringify({ otp: viewPasswordOTP }),
      });

      if (result.success) {
        setViewPasswordStep(3);
        toast.success("✅ Identity verified!");
      } else {
        throw new Error(result.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Verify error:", error);
      toast.error(error.message || "Invalid OTP");
    } finally {
      setOtpLoading(false); // ✅ Always resets
    }
  };

  const resetViewPasswordModal = () => {
    setShowViewPasswordModal(false);
    setViewPasswordStep(1);
    setViewPasswordOTP("");
    setMaskedEmail("");
    setOtpResendTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleLogout = () => {
    toast.success("Logging out...");
    setTimeout(() => {
      localStorage.clear();
      navigate("/login");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f5f3ff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-900 font-semibold mb-4">
            Failed to load profile
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f5f3ff] pt-12 pb-10 px-4">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg px-6 py-8 flex flex-col items-center h-fit sticky top-6">
          <div className="flex flex-col items-center w-full mb-6">
            <div className="relative group">
              <img
                src={form.avatar}
                alt={profile.name}
                className="rounded-full w-24 h-24 object-cover border-4 border-indigo-100 shadow-md"
              />
              {editing && (
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute -bottom-2 -right-2 bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 shadow-lg transition-all transform hover:scale-110"
                >
                  <FiCamera size={16} />
                </button>
              )}
            </div>
            <h3 className="mt-4 font-bold text-xl text-slate-900 text-center">
              {profile.name}
            </h3>
            <p className="text-sm text-slate-500">
              {maskPhone(profile.mobile)}
            </p>
            <div className="w-full mt-4">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Completion</span>
                <span className="text-indigo-600">{completion}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-200 mb-4" />

          <nav className="flex flex-col w-full gap-2">
            {[
              { id: "basic", icon: FiUser, label: "Basic Info" },
              { id: "wallet", icon: FiCreditCard, label: "Wallet" },
              { id: "security", icon: FiLock, label: "Security" },
              { id: "activity", icon: FiActivity, label: "Activity" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  if (item.id === "security") setPwdStep(1);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${tab === item.id ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
              >
                <item.icon
                  className={tab === item.id ? "text-indigo-600" : "opacity-70"}
                  size={18}
                />
                {item.label}
              </button>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm hover:bg-red-50 text-red-600 transition-colors"
                onClick={handleLogout}
              >
                <FiLogOut size={18} /> Log Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl shadow-lg px-8 py-10 min-h-[600px]">
          <div key={tab} className="animate-fade-in-up">
            {/* Basic Info Tab */}
            {tab === "basic" && (
              <form onSubmit={handleSaveProfile} autoComplete="off">
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-200">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Basic Information
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Update your personal details
                    </p>
                  </div>
                  {!editing ? (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 text-indigo-600 font-semibold px-5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition"
                    >
                      <FiEdit2 size={16} /> Edit
                    </button>
                  ) : (
                    hasChanges && (
                      <span className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                        <FiCheck size={16} /> Unsaved changes
                      </span>
                    )
                  )}
                </div>

                <div className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 block mb-2 flex items-center gap-2">
                      <FiUser size={16} className="text-indigo-600" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name || ""}
                      onChange={handleChange}
                      disabled={!editing}
                      required
                      className="w-full rounded-xl px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2 flex items-center gap-2">
                      <FiPhone size={16} className="text-slate-500" /> Phone
                      Number
                    </label>
                    <input
                      type="text"
                      value={profile.mobile || ""}
                      disabled
                      className="w-full rounded-xl px-4 py-3.5 bg-slate-100 border border-slate-200 text-slate-600 font-medium cursor-not-allowed opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2 flex items-center gap-2">
                      <FiMail size={16} className="text-slate-500" /> Email
                      Address
                    </label>
                    <input
                      type="email"
                      value={profile.email || ""}
                      disabled
                      className="w-full rounded-xl px-4 py-3.5 bg-slate-100 border border-slate-200 text-slate-600 font-medium cursor-not-allowed opacity-60"
                    />
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-4 justify-end mt-10 pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-6 py-3 rounded-xl font-semibold text-slate-600 border-2 border-slate-300 hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !hasChanges}
                      className="px-8 py-3 rounded-xl font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <FiLoader className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <FiSave /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Wallet Tab */}
            {tab === "wallet" && wallet && (
              <div>
                <div className="mb-8 pb-5 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FiCreditCard className="text-indigo-600" /> Wallet Overview
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Your digital wallet details
                  </p>
                </div>
                <div className="max-w-xl">
                  <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-indigo-100 text-sm mb-2">
                          Current Balance
                        </p>
                        <h2 className="text-4xl font-bold">
                          ₹{(wallet.balance || 0).toLocaleString("en-IN")}
                        </h2>
                      </div>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                        Active
                      </span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between py-2 border-b border-white/10">
                        <span className="flex items-center gap-2 text-indigo-100">
                          <FiKey size={14} /> Wallet ID
                        </span>
                        <span className="font-mono font-semibold">
                          {wallet.wallet_key?.slice(0, 16) || "W-XXXX-XXXX"}...
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-white/10">
                        <span className="flex items-center gap-2 text-indigo-100">
                          <FiUser size={14} /> Account Holder
                        </span>
                        <span className="font-semibold">{profile.name}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="flex items-center gap-2 text-indigo-100">
                          <FiMail size={14} /> Email
                        </span>
                        <span className="font-mono text-xs">
                          {maskEmail(profile.email)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="flex-1 py-3 rounded-xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition"
                      >
                        Add Money
                      </button>
                      <button className="flex-1 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold hover:bg-white/20 transition">
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {tab === "security" && (
              <div>
                <div className="mb-8 pb-5 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FiLock className="text-indigo-600" /> Security Settings
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage your password and security
                  </p>
                </div>

                <div className="max-w-xl space-y-6">
                  {/* KYC Verification Section */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <FiShield className="text-white" size={22} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1 text-lg">
                          KYC Verification
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Complete your KYC to unlock full features and higher
                          limits.
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold">Status:</span>
                          {kycLoading ? (
                            <span className="text-xs">Loading...</span>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                kycStatus === "verified"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {kycStatus === "verified"
                                ? "Verified"
                                : kycStatus === "pending"
                                  ? "Pending"
                                  : "Not Verified"}
                            </span>
                          )}
                        </div>
                        {kycStatus !== "verified" &&
                          kycStatus !== "pending" && (
                            <button
                              onClick={handleStartKYC}
                              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                            >
                              Start Free KYC
                            </button>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <h3 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2">
                      Security Timeline
                    </h3>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 before:h-full">
                      {[
                        {
                          title: "KYC Verification",
                          date:
                            kycStatus === "verified"
                              ? "Completed"
                              : "Pending Action",
                          status:
                            kycStatus === "verified" ? "success" : "warning",
                          desc: "Identity verification for regulatory compliance",
                        },
                        {
                          title: "2FA Setup",
                          date: "Mandatory",
                          status: "info",
                          desc: "Secure your account with two-factor authentication",
                        },
                        {
                          title: "Last Profile Update",
                          date: profile?.updatedAt
                            ? new Date(profile.updatedAt).toLocaleDateString()
                            : "Today",
                          status: "success",
                          desc: "Basic info was recently modified",
                        },
                        {
                          title: "Device Trust",
                          date: "Authorized",
                          status: "success",
                          desc: "Current browser is marked as a trusted device",
                        },
                      ].map((evt, i) => (
                        <div key={i} className="relative pl-10">
                          <div
                            className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
                              evt.status === "success"
                                ? "bg-green-500"
                                : evt.status === "warning"
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                            }`}
                          >
                            <FiCheck size={12} className="text-white" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-0.5">
                              <h4 className="text-sm font-bold text-slate-900 leading-none">
                                {evt.title}
                              </h4>
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  evt.status === "success"
                                    ? "bg-green-100 text-green-700"
                                    : evt.status === "warning"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {evt.date}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-tight">
                              {evt.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <FiShield className="text-white" size={22} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 mb-1 text-lg">
                          Forgot Your Password?
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                          Verify your identity via OTP to reset your password.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowViewPasswordModal(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <FiShield size={18} /> Reset via OTP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CHANGE PASSWORD FORM */}
                  <form
                    onSubmit={handlePwdSubmit}
                    autoComplete="off"
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-6"
                  >
                    <h3 className="font-bold text-slate-900 mb-1 text-lg">
                      Change Password
                    </h3>
                    <p className="text-sm text-slate-500 mb-5">
                      Update your account password
                    </p>

                    <div className="flex items-center gap-2 mb-6">
                      {[1, 2].map((s) => (
                        <React.Fragment key={s}>
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${pwdStep >= s ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}
                          >
                            {pwdStep > s ? <FiCheck size={14} /> : s}
                          </div>
                          {s < 2 && (
                            <div
                              className={`flex-1 h-1 rounded-full transition-all ${pwdStep > s ? "bg-indigo-600" : "bg-slate-200"}`}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {pwdStep === 1 && (
                      <div className="animate-fade-in-up">
                        <label className="text-sm font-semibold text-slate-700 block mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            name="old"
                            type={showPwd[0] ? "text" : "password"}
                            value={passwords.old}
                            onChange={handlePwdInput}
                            required
                            placeholder="Enter your current password"
                            className="w-full rounded-xl px-4 py-3.5 pr-12 bg-white border border-slate-300 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            onClick={() =>
                              setShowPwd([!showPwd[0], showPwd[1], showPwd[2]])
                            }
                          >
                            {showPwd[0] ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                      </div>
                    )}

                    {pwdStep === 2 && (
                      <>
                        <div className="animate-fade-in-up mb-4">
                          <label className="text-sm font-semibold text-slate-700 block mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              name="new"
                              type={showPwd[1] ? "text" : "password"}
                              value={passwords.new}
                              onChange={handlePwdInput}
                              required
                              minLength={8}
                              placeholder="Min 8 characters"
                              className="w-full rounded-xl px-4 py-3.5 pr-12 bg-white border border-slate-300 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              onClick={() =>
                                setShowPwd([
                                  showPwd[0],
                                  !showPwd[1],
                                  showPwd[2],
                                ])
                              }
                            >
                              {showPwd[1] ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {passwords.new && (
                            <div className="mt-2">
                              <div className="flex gap-1 mb-1">
                                {[...Array(4)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`h-1 flex-1 rounded-full transition-all ${passwords.new.length >= [6, 8, 10, 12][i] ? ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"][i] : "bg-slate-200"}`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-slate-500">
                                {passwords.new.length < 6
                                  ? "Too short"
                                  : passwords.new.length < 8
                                    ? "Weak"
                                    : passwords.new.length < 10
                                      ? "Fair"
                                      : passwords.new.length < 12
                                        ? "Good"
                                        : "Strong"}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="animate-fade-in-up">
                          <label className="text-sm font-semibold text-slate-700 block mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              name="confirm"
                              type={showPwd[2] ? "text" : "password"}
                              value={passwords.confirm}
                              onChange={handlePwdInput}
                              required
                              minLength={8}
                              placeholder="Re-enter new password"
                              className={`w-full rounded-xl px-4 py-3.5 pr-12 bg-white border font-medium outline-none focus:ring-2 focus:ring-indigo-500 ${passwords.confirm && passwords.new !== passwords.confirm ? "border-red-400 focus:ring-red-500" : "border-slate-300"}`}
                            />
                            <button
                              type="button"
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              onClick={() =>
                                setShowPwd([
                                  showPwd[0],
                                  showPwd[1],
                                  !showPwd[2],
                                ])
                              }
                            >
                              {showPwd[2] ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          {passwords.confirm &&
                            passwords.new !== passwords.confirm && (
                              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <FiAlertCircle size={12} /> Passwords don't
                                match
                              </p>
                            )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPwdStep(1);
                            setPasswords((p) => ({
                              ...p,
                              new: "",
                              confirm: "",
                            }));
                          }}
                          className="mt-3 text-sm text-slate-500 hover:text-slate-700 underline"
                        >
                          ← Back
                        </button>
                      </>
                    )}

                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={
                          saving ||
                          (pwdStep === 2 && passwords.new !== passwords.confirm)
                        }
                        className="px-8 py-3 rounded-xl font-semibold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <FiLoader className="animate-spin" /> Processing...
                          </>
                        ) : pwdStep === 1 ? (
                          "Next →"
                        ) : (
                          "Update Password"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {tab === "activity" && (
              <div>
                <div className="mb-8 pb-5 border-b border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FiActivity className="text-indigo-600" /> Recent Activity
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Your recent account activities
                  </p>
                </div>
                {activityLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : activityLogs.length > 0 ? (
                  <ul className="space-y-3 max-w-2xl">
                    {activityLogs.map((act, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 px-5 py-4 rounded-xl transition-colors border border-slate-100"
                      >
                        <div
                          className={`p-3 rounded-full ${act.status === "failed" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}
                        >
                          <FiActivity size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {act.action}
                          </p>
                          {act.device && (
                            <p className="text-xs text-slate-400">
                              {act.device}
                            </p>
                          )}
                        </div>
                        <span className="ml-auto text-xs text-slate-400 font-medium whitespace-nowrap">
                          {act.date ? new Date(act.date).toLocaleString() : ""}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${act.status === "failed" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                        >
                          {act.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <FiActivity size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No recent activity found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* VIEW PASSWORD / RESET MODAL */}
      {showViewPasswordModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={resetViewPasswordModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Password Reset</h3>
                  <p className="text-sm text-blue-100 mt-1">
                    Step {viewPasswordStep} of 3
                  </p>
                </div>
                <button
                  onClick={resetViewPasswordModal}
                  className="p-2 hover:bg-white/20 rounded-full transition"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1 flex-1 rounded-full transition-all ${viewPasswordStep >= s ? "bg-white" : "bg-white/30"}`}
                  />
                ))}
              </div>
            </div>

            <div className="p-6">
              {viewPasswordStep === 1 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <FiMail className="text-white text-2xl" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    Verify Your Identity
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">
                    We'll send a verification code to
                  </p>
                  <p className="font-semibold text-indigo-600 mb-6">
                    {maskEmail(profile.email)}
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-left">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                      <FiShield
                        className="flex-shrink-0 mt-0.5 text-amber-600"
                        size={14}
                      />
                      <span>
                        Passwords are encrypted for your security. After OTP
                        verification, you'll be able to set a new password.
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={handleRequestViewPasswordOTP}
                    disabled={otpLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                  >
                    {otpLoading ? (
                      <>
                        <FiLoader className="animate-spin" /> Sending OTP...
                      </>
                    ) : (
                      <>
                        <FiMail /> Send Verification Code
                      </>
                    )}
                  </button>
                </div>
              )}

              {viewPasswordStep === 2 && (
                <div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheckCircle className="text-green-600 text-2xl" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                      Enter Verification Code
                    </h4>
                    <p className="text-sm text-slate-600">
                      We sent a 6-digit code to{" "}
                      <span className="font-semibold text-indigo-600">
                        {maskedEmail}
                      </span>
                    </p>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={viewPasswordOTP}
                    onChange={(e) =>
                      setViewPasswordOTP(e.target.value.replace(/\D/g, ""))
                    }
                    autoFocus
                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-300 text-center text-3xl font-mono tracking-widest focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none mb-4"
                  />
                  <button
                    onClick={handleVerifyViewPasswordOTP}
                    disabled={otpLoading || viewPasswordOTP.length !== 6}
                    className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mb-3 shadow-lg"
                  >
                    {otpLoading ? (
                      <>
                        <FiLoader className="animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle /> Verify Code
                      </>
                    )}
                  </button>
                  <button
                    onClick={
                      otpResendTimer === 0
                        ? handleRequestViewPasswordOTP
                        : undefined
                    }
                    disabled={otpLoading || otpResendTimer > 0}
                    className="w-full text-blue-600 text-sm font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {otpResendTimer > 0
                      ? `Resend in ${otpResendTimer}s`
                      : "Resend Code"}
                  </button>
                </div>
              )}

              {viewPasswordStep === 3 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="text-green-600 text-2xl" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    Identity Verified!
                  </h4>
                  <p className="text-sm text-slate-600 mb-6">
                    Your identity has been confirmed. You can now set a new
                    password.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-green-800 flex items-start gap-2">
                      <FiCheckCircle className="flex-shrink-0 mt-0.5 text-green-600" />
                      <span>
                        OTP verified successfully. Proceed to change your
                        password below.
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetViewPasswordModal();
                      setPwdStep(1);
                      toast.success("Now enter your new password below");
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                  >
                    Go to Change Password →
                  </button>
                  <button
                    onClick={resetViewPasswordModal}
                    className="w-full mt-3 text-slate-500 text-sm hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KYC MODAL */}
      <AnimatePresence>
        {showKYCModal && profile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl min-h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowKYCModal(false)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                {/* KYC UI Logic here - Importing component style */}
                <iframe
                  src={`/dashboard/kyc-verification?userId=${profile.id}&embed=true`}
                  className="w-full h-full border-0 min-h-[700px]"
                  title="KYC Verification"
                  onLoad={(e) => {
                    // This is a placeholder for real message passing if needed
                    console.log("KYC Iframe loaded");
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !captureMode && setShowPhotoModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {!captureMode ? (
              <>
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">
                      Update Profile Photo
                    </h3>
                    <button
                      onClick={() => setShowPhotoModal(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <FiX size={24} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Choose how to upload
                  </p>
                </div>
                <div className="p-6 space-y-3">
                  <button
                    onClick={startCamera}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
                  >
                    <FiCamera size={20} /> Capture from Camera
                  </button>
                  <button
                    onClick={() => fileInput.current?.click()}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition"
                  >
                    <FiUpload size={20} /> Upload from Gallery
                  </button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900">
                    Capture Photo
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Position yourself in the frame
                  </p>
                </div>
                <div className="relative bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="p-6 flex gap-3">
                  <button
                    onClick={cancelCamera}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-semibold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    <FiCamera /> Capture
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
