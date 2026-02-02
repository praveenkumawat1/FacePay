import React, { useState } from "react";
import {
  FiLock,
  FiSmartphone,
  FiShield,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertTriangle,
  FiMonitor,
  FiActivity,
  FiLogOut,
  FiCopy,
  FiTrash2,
  FiBell,
  FiGithub,
  FiGlobe, // Placeholder for Google/FB
} from "react-icons/fi";
import { FaGoogle, FaFacebook } from "react-icons/fa"; // Importing FontAwesome for brands
import { Toaster, toast } from "react-hot-toast";

// Mock Data
const initialSessions = [
  {
    id: 1,
    device: "Windows PC",
    browser: "Chrome",
    location: "Mumbai, India",
    ip: "192.168.1.12",
    lastActive: "Current Session",
    isCurrent: true,
    icon: <FiMonitor />,
  },
  {
    id: 2,
    device: "iPhone 13 Pro",
    browser: "Safari",
    location: "Pune, India",
    ip: "10.0.0.14",
    lastActive: "2 hours ago",
    isCurrent: false,
    icon: <FiSmartphone />,
  },
];

const activityLog = [
  {
    id: 1,
    action: "Password Changed",
    date: "Today, 10:00 AM",
    device: "Windows PC",
    status: "Success",
  },
  {
    id: 2,
    action: "2FA Enabled",
    date: "Yesterday, 06:30 PM",
    device: "iPhone 13",
    status: "Success",
  },
  {
    id: 3,
    action: "Failed Login Attempt",
    date: "24 Jan, 03:15 AM",
    device: "Unknown (Russia)",
    status: "Failed",
  },
];

const backupCodes = ["8821-9921", "1102-3321", "9923-0012", "5543-2211"];

export default function Security() {
  const [sessions, setSessions] = useState(initialSessions);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState({ current: false, new: false });
  const [twoFactor, setTwoFactor] = useState(true);
  const [showCodes, setShowCodes] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Handlers
  const handleRevoke = (id) => {
    toast.success("Device logged out successfully!");
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const toggle2FA = () => {
    setTwoFactor(!twoFactor);
    toast(!twoFactor ? "2FA Enabled" : "2FA Disabled");
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full p-4 md:p-8 font-sans">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* --- Header --- */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
              <FiShield className="text-indigo-600" /> Security Settings
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Manage your password, 2FA, and connected accounts.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-green-700">
              Security Status: Good
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ================= LEFT COLUMN (Settings) ================= */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* 1. 2FA & Backup Codes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                    <FiSmartphone />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-sm">
                      Secure your account with 2FA.
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggle2FA}
                  className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${twoFactor ? "bg-indigo-600" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${twoFactor ? "translate-x-5" : "translate-x-0"}`}
                  ></div>
                </button>
              </div>

              {/* Backup Codes Section (Only if 2FA is ON) */}
              {twoFactor && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800 text-sm">
                      Recovery Codes
                    </h4>
                    <button
                      onClick={() => setShowCodes(!showCodes)}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      {showCodes ? "Hide Codes" : "Show Codes"}
                    </button>
                  </div>

                  {showCodes ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {backupCodes.map((code, i) => (
                        <div
                          key={i}
                          onClick={() => handleCopyCode(code)}
                          className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-center font-mono text-sm text-gray-600 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all flex items-center justify-center gap-2 group"
                        >
                          {code}{" "}
                          <FiCopy className="opacity-0 group-hover:opacity-100 text-xs" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400 italic">
                      ••••-•••• &nbsp;&nbsp; ••••-•••• &nbsp;&nbsp; ••••-••••
                      &nbsp;&nbsp; ••••-••••
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    Keep these safe. You can use these codes to login if you
                    lose your device.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Password Change (Collapsed Style) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <FiLock className="text-xl text-gray-400" />
                <h3 className="font-bold text-gray-900 text-lg">Password</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <div className="md:col-span-2 flex justify-end">
                  <button className="text-white bg-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Connected Accounts (Social) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                Connected Accounts
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FaGoogle className="text-xl text-red-500" />
                    <div>
                      <p className="font-bold text-sm text-gray-800">Google</p>
                      <p className="text-xs text-gray-400">
                        Connected as praveen@gmail.com
                      </p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-red-500 border border-red-100 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">
                    Disconnect
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiGithub className="text-xl text-gray-900" />
                    <div>
                      <p className="font-bold text-sm text-gray-800">GitHub</p>
                      <p className="text-xs text-gray-400">Not connected</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-gray-700 border border-gray-200 bg-white px-3 py-1.5 rounded-lg hover:bg-gray-50">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (Logs & Danger Zone) ================= */}
          <div className="flex flex-col gap-6">
            {/* 4. Login Alerts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">Login Alerts</h3>
                <FiBell className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Get notified when login occurs from a new device.
              </p>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-gray-700">
                  Email Alerts
                </span>
                <input
                  type="checkbox"
                  checked={loginAlerts}
                  onChange={() => setLoginAlerts(!loginAlerts)}
                  className="w-4 h-4 accent-indigo-600"
                />
              </div>
            </div>

            {/* 5. Active Sessions (Compact) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Active Sessions</h3>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3">
                    <div className="text-gray-400 text-xl">{session.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">
                        {session.device}
                      </p>
                      <p className="text-xs text-gray-400">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevoke(session.id)}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <FiLogOut />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Recent Activity Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="relative pl-4 border-l-2 border-gray-100 space-y-6">
                {activityLog.map((log) => (
                  <div key={log.id} className="relative">
                    <div
                      className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 border-white ${log.status === "Success" ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <p className="text-xs font-bold text-gray-800">
                      {log.action}
                    </p>
                    <p className="text-[10px] text-gray-400">{log.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. DANGER ZONE */}
            <div className="border border-red-200 bg-red-50 rounded-2xl p-6">
              <h3 className="font-bold text-red-700 mb-2">Danger Zone</h3>
              <p className="text-xs text-red-500 mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button
                onClick={() => toast.error("Action blocked in Demo")}
                className="w-full py-2 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <FiTrash2 /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
