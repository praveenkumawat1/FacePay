import React, { useState, useRef, useMemo, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast"; // Toast Notification
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
  FiTrendingUp,
  FiKey,
  FiSettings, // New Icon
  FiBell, // New Icon
  FiMoon, // New Icon
  FiSun, // New Icon
  FiGlobe, // New Icon
  FiLoader, // New Icon for loading
} from "react-icons/fi";

// Initial Data
const initialProfile = {
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  name: "Praveen Kumawat",
  phone: "9876543210",
  email: "praveen@example.com",
};

const mockWallet = {
  id: "WLT982134321",
  balance: 12540.75,
  created: "2022-08-11",
  upi: "praveen123@ybl",
  status: "Active",
  lastUpdate: "2024-07-05 12:42",
};

// Helper function
function maskPhone(phone = "") {
  return phone.replace(/^(\d{2})\d+(\d{4})$/, (_m, p1, p2) => `${p1}XXXX${p2}`);
}

export default function ProfileSection() {
  const [tab, setTab] = useState("basic");
  const [profile, setProfile] = useState(initialProfile);
  const [form, setForm] = useState(profile);
  const [editing, setEditing] = useState(false);
  const [pwdStep, setPwdStep] = useState(1);
  const [showPwd, setShowPwd] = useState([false, false]);
  const [passwords, setPasswords] = useState({ old: "", new: "" });
  const [loading, setLoading] = useState(false); // Loading state
  const fileInput = useRef(null);

  // New State for Settings
  const [settings, setSettings] = useState({
    emailNotif: true,
    smsNotif: false,
    theme: "light", // 'light' or 'dark'
    language: "en", // 'en' or 'hi'
  });

  // Calculate Profile Completion
  const completion = useMemo(() => {
    let score = 0;
    if (profile.name) score += 25;
    if (profile.avatar) score += 25;
    if (profile.phone) score += 25;
    if (profile.email) score += 25;
    return score;
  }, [profile]);

  // Handlers
  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setForm((prev) => ({ ...prev, avatar: ev.target.result }));
    reader.readAsDataURL(f);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    // Simulate API call
    setTimeout(() => {
      setProfile(form);
      setEditing(false);
      setLoading(false); // Stop loading
      toast.success("Profile updated successfully!"); // Toast popup
    }, 1500);
  };

  const handleCancelEdit = () => {
    setForm(profile);
    setEditing(false);
  };

  const handlePwdInput = (e) =>
    setPasswords((pwd) => ({ ...pwd, [e.target.name]: e.target.value }));

  const handlePwdSubmit = (e) => {
    e.preventDefault();
    if (pwdStep === 1) {
      setPwdStep(2);
    } else {
      setLoading(true);
      setTimeout(() => {
        setPwdStep(1);
        setPasswords({ old: "", new: "" });
        setLoading(false);
        toast.success("Password changed successfully!");
      }, 1500);
    }
  };

  const handleLogout = () => {
    toast((t) => (
      <span>
        Logging out... <b>See you soon!</b>
      </span>
    ));
    setTimeout(() => (window.location.href = "/"), 1000);
  };

  // Theme Classes Helper
  const isDark = settings.theme === "dark";
  const bgMain = isDark ? "bg-gray-900" : "bg-[#f8fafb]";
  const bgCard = isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-indigo-50";
  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark
    ? "bg-gray-700 text-white"
    : "bg-[#f4f5fa] text-gray-900";

  return (
    <div
      className={`min-h-screen ${bgMain} flex flex-col items-center pt-12 pb-10 transition-colors duration-300`}
    >
      <Toaster position="top-center" reverseOrder={false} />

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside
          className={`w-full md:w-64 flex-shrink-0 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border rounded-2xl shadow-md px-0 py-9 flex flex-col items-center transition-colors duration-300`}
        >
          {/* Profile Header */}
          <div className="flex flex-col items-center justify-center w-full mb-6 px-6">
            <div className="relative group">
              <img
                src={profile.avatar}
                alt=""
                className="rounded-full w-20 h-20 object-cover border-4 border-indigo-50 shadow-sm"
              />
              {editing && tab === "basic" && (
                <>
                  <button
                    onClick={() => fileInput.current.click()}
                    className="absolute bottom-1 right-0 bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 shadow-md transition-all transform hover:scale-110"
                  >
                    <FiCamera size={14} />
                  </button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhoto}
                  />
                </>
              )}
            </div>
            <div className={`mt-4 font-bold text-[18px] ${textMain}`}>
              {profile.name}
            </div>
            <div className={`text-sm ${textSub}`}>
              {maskPhone(profile.phone)}
            </div>

            {/* Progress Bar */}
            <div className="w-full mt-4">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className={isDark ? "text-gray-300" : "text-gray-600"}>
                  Profile Completion
                </span>
                <span className="text-orange-500">{completion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${completion}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div
            className={`w-full h-[1px] ${isDark ? "bg-gray-700" : "bg-gray-100"} mb-2`}
          ></div>

          {/* Side Nav */}
          <nav className="flex flex-1 flex-col w-full px-4 gap-1">
            {[
              { id: "basic", icon: FiUser, label: "Basic Information" },
              { id: "wallet", icon: FiCreditCard, label: "Wallet" },
              { id: "security", icon: FiLock, label: "Security" },
              { id: "settings", icon: FiSettings, label: "Settings" }, // New Tab
              { id: "activity", icon: FiActivity, label: "Activity" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  if (item.id === "security") setPwdStep(1);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-[15px] transition-all duration-200 
                  ${
                    tab === item.id
                      ? "bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100"
                      : `hover:${isDark ? "bg-gray-700" : "bg-gray-50"} ${textSub} hover:text-gray-700`
                  }`}
              >
                <item.icon
                  className={tab === item.id ? "text-orange-600" : "opacity-70"}
                />
                {item.label}
              </button>
            ))}

            <div className="mt-auto pt-4">
              <button
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-[15px] hover:bg-red-50 text-red-500 transition-colors"
                onClick={handleLogout}
              >
                <FiLogOut /> Log Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main
          className={`flex-1 w-full ${bgCard} rounded-2xl shadow-md px-8 py-10 min-h-[550px] transition-colors duration-300 relative overflow-hidden`}
        >
          {/* Simple CSS Fade Animation Wrapper */}
          <div key={tab} className="animate-fade-in-up">
            {/* 1. Basic Info Tab */}
            {tab === "basic" && (
              <form
                className="max-w-2xl mx-auto"
                autoComplete="off"
                onSubmit={handleSaveProfile}
              >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <span className={`text-xl font-bold ${textMain}`}>
                    Basic Information
                  </span>
                  {!editing && (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 text-orange-600 font-bold px-4 py-2 bg-orange-50 border border-orange-100 rounded-lg hover:bg-orange-100 transition"
                    >
                      <FiEdit2 /> Edit
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label
                      className={`text-sm font-medium ${textSub} block mb-2`}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={!editing}
                      className={`w-full rounded-xl px-4 py-3 ${inputBg} font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all`}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-sm font-medium ${textSub} block mb-2`}
                    >
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      className={`w-full rounded-xl px-4 py-3 ${inputBg} font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all`}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-sm font-medium ${textSub} block mb-2`}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled={!editing}
                      className={`w-full rounded-xl px-4 py-3 ${inputBg} font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all`}
                    />
                  </div>
                </div>

                {editing && (
                  <div className="flex mt-10 gap-4 justify-end border-t border-gray-100 pt-6">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={loading}
                      className="rounded-lg font-bold text-gray-500 border border-gray-200 bg-white px-6 py-2.5 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg font-bold bg-orange-500 text-white px-8 py-2.5 shadow hover:bg-orange-600 transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <FiLoader className="animate-spin" /> Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* 2. Wallet Tab */}
            {tab === "wallet" && (
              <div className="max-w-xl mx-auto">
                <div className="mb-8 flex items-center gap-4 pb-4 border-b border-gray-100">
                  <span
                    className={`text-xl font-bold flex items-center gap-2 ${textMain}`}
                  >
                    <FiCreditCard /> Wallet Overview
                  </span>
                </div>
                <div
                  className={`border ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-100 bg-gray-50"} rounded-2xl px-6 py-8 shadow-sm flex flex-col gap-6`}
                >
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        Current Balance
                      </p>
                      <h2 className="text-3xl font-bold text-green-600">
                        ₹{mockWallet.balance.toLocaleString()}
                      </h2>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full border 
                            ${mockWallet.status === "Active" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-600 border-red-200"}`}
                    >
                      {mockWallet.status}
                    </span>
                  </div>

                  <div
                    className={`h-[1px] w-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                  ></div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex items-center gap-2 ${textSub} text-sm font-medium`}
                      >
                        <FiKey /> Wallet ID
                      </span>
                      <span className={`font-mono ${textMain}`}>
                        {mockWallet.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex items-center gap-2 ${textSub} text-sm font-medium`}
                      >
                        <FiCreditCard /> UPI ID
                      </span>
                      <span className={`font-mono ${textMain}`}>
                        {mockWallet.upi}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex items-center gap-2 ${textSub} text-sm font-medium`}
                      >
                        <FiActivity /> Last Updated
                      </span>
                      <span className={`font-mono ${textMain}`}>
                        {mockWallet.lastUpdate}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button className="flex-1 py-2.5 rounded-xl bg-orange-100 text-orange-700 font-bold hover:bg-orange-200 transition text-sm">
                      Add Money
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200 transition text-sm">
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Security Tab */}
            {tab === "security" && (
              <form
                className="max-w-lg mx-auto"
                onSubmit={handlePwdSubmit}
                autoComplete="off"
              >
                <div className="mb-8 pb-4 border-b border-gray-100">
                  <span className={`text-xl font-bold ${textMain}`}>
                    Security Settings
                  </span>
                  <p className={`text-sm mt-1 ${textSub}`}>
                    Manage your password and account security
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {pwdStep === 1 && (
                    <div className="animate-fade-in-up">
                      <label
                        className={`text-sm font-medium ${textSub} block mb-2`}
                      >
                        Enter Current Password
                      </label>
                      <div className="relative">
                        <input
                          name="old"
                          type={showPwd[0] ? "text" : "password"}
                          value={passwords.old}
                          onChange={handlePwdInput}
                          required
                          placeholder="••••••••"
                          className={`w-full rounded-xl px-4 py-3 ${inputBg} font-medium outline-none focus:ring-2 focus:ring-orange-200 pr-12`}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPwd([!showPwd[0], showPwd[1]])}
                        >
                          {showPwd[0] ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  )}
                  {pwdStep === 2 && (
                    <div className="animate-fade-in-up">
                      <label
                        className={`text-sm font-medium ${textSub} block mb-2`}
                      >
                        Create New Password
                      </label>
                      <div className="relative">
                        <input
                          name="new"
                          type={showPwd[1] ? "text" : "password"}
                          value={passwords.new}
                          onChange={handlePwdInput}
                          required
                          minLength={6}
                          placeholder="Min 6 characters"
                          className={`w-full rounded-xl px-4 py-3 ${inputBg} font-medium outline-none focus:ring-2 focus:ring-orange-200 pr-12`}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPwd([showPwd[0], !showPwd[1]])}
                        >
                          {showPwd[1] ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex mt-10">
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-auto rounded-xl font-bold bg-orange-500 text-white px-8 py-3 shadow-lg shadow-orange-200 hover:bg-orange-600 hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <FiLoader className="animate-spin" />
                    ) : pwdStep === 1 ? (
                      "Verify & Continue"
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* 4. Settings Tab (NEW) */}
            {tab === "settings" && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8 pb-4 border-b border-gray-100">
                  <span className={`text-xl font-bold ${textMain}`}>
                    App Preferences
                  </span>
                </div>

                {/* Theme Section */}
                <div className="mb-8">
                  <h3
                    className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Appearance
                  </h3>
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"} mb-3`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        {settings.theme === "light" ? <FiSun /> : <FiMoon />}
                      </div>
                      <div>
                        <div className={`font-bold ${textMain}`}>Dark Mode</div>
                        <div className="text-xs text-gray-500">
                          Switch between light and dark themes
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setSettings((s) => ({
                          ...s,
                          theme: s.theme === "light" ? "dark" : "light",
                        }))
                      }
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.theme === "dark" ? "bg-orange-500" : "bg-gray-300"}`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${settings.theme === "dark" ? "translate-x-6" : "translate-x-0"}`}
                      ></div>
                    </button>
                  </div>
                </div>

                {/* Notifications Section */}
                <div className="mb-8">
                  <h3
                    className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Notifications
                  </h3>
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"} mb-3`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <FiMail />
                      </div>
                      <div className={`font-bold ${textMain}`}>
                        Email Notifications
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailNotif}
                      onChange={() =>
                        setSettings((s) => ({
                          ...s,
                          emailNotif: !s.emailNotif,
                        }))
                      }
                      className="w-5 h-5 accent-orange-500"
                    />
                  </div>
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <FiBell />
                      </div>
                      <div className={`font-bold ${textMain}`}>SMS Alerts</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.smsNotif}
                      onChange={() =>
                        setSettings((s) => ({ ...s, smsNotif: !s.smsNotif }))
                      }
                      className="w-5 h-5 accent-orange-500"
                    />
                  </div>
                </div>

                {/* Language Section */}
                <div>
                  <h3
                    className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Localization
                  </h3>
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                        <FiGlobe />
                      </div>
                      <div className={`font-bold ${textMain}`}>Language</div>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, language: e.target.value }))
                      }
                      className={`bg-transparent font-bold outline-none ${textMain}`}
                    >
                      <option value="en" className="text-black">
                        English (US)
                      </option>
                      <option value="hi" className="text-black">
                        Hindi (IN)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Activity Tab */}
            {tab === "activity" && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8 pb-4 border-b border-gray-100">
                  <span className={`text-xl font-bold ${textMain}`}>
                    Recent Activity
                  </span>
                </div>
                <ul className="space-y-4">
                  {[
                    {
                      icon: FiUser,
                      text: "Profile viewed",
                      time: "2 min ago",
                      color: "text-blue-500",
                      bg: "bg-blue-50",
                    },
                    {
                      icon: FiLock,
                      text: "Password changed",
                      time: "3 hr ago",
                      color: "text-orange-500",
                      bg: "bg-orange-50",
                    },
                    {
                      icon: FiMail,
                      text: "Email updated",
                      time: "1 day ago",
                      color: "text-green-500",
                      bg: "bg-green-50",
                    },
                    {
                      icon: FiSettings,
                      text: "Theme updated",
                      time: "2 days ago",
                      color: "text-purple-500",
                      bg: "bg-purple-50",
                    },
                  ].map((act, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-4 ${isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"} px-5 py-4 rounded-xl transition-colors`}
                    >
                      <div
                        className={`p-2 rounded-full ${act.bg} ${act.color}`}
                      >
                        <act.icon />
                      </div>
                      <span className={`font-medium ${textMain}`}>
                        {act.text}
                      </span>
                      <span className="ml-auto text-xs text-gray-400 font-medium">
                        {act.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Inline styles for simple animation */}
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
