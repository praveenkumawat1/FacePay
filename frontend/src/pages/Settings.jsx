import React, { useState } from "react";
import {
  FiMoon,
  FiSun,
  FiBell,
  FiShield,
  FiTrash2,
  FiChevronRight,
  FiGlobe,
  FiUser,
  FiMail,
  FiLock,
} from "react-icons/fi";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNoti, setEmailNoti] = useState(true);
  const [smsNoti, setSmsNoti] = useState(false);
  const [inAppNoti, setInAppNoti] = useState(true);
  const [privacy, setPrivacy] = useState("private");
  const [language, setLanguage] = useState("en");
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiUser className="text-indigo-500" /> Dashboard Settings
      </h1>
      <div className="space-y-6">
        {/* Theme */}
        <section className="bg-white rounded-2xl p-5 shadow border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <FiMoon className="text-indigo-500" />
            ) : (
              <FiSun className="text-yellow-400" />
            )}
            <span className="font-medium">Dark Mode</span>
          </div>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode((v) => !v)}
            className="w-5 h-5 accent-indigo-500"
          />
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl p-5 shadow border border-slate-100">
          <div className="font-medium mb-2 flex items-center gap-2">
            <FiBell className="text-indigo-500" /> Notifications
          </div>
          <div className="flex flex-col gap-2 ml-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emailNoti}
                onChange={() => setEmailNoti((v) => !v)}
              />{" "}
              Email Alerts
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={smsNoti}
                onChange={() => setSmsNoti((v) => !v)}
              />{" "}
              SMS Alerts
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={inAppNoti}
                onChange={() => setInAppNoti((v) => !v)}
              />{" "}
              In-App Notifications
            </label>
          </div>
        </section>

        {/* Privacy */}
        <section className="bg-white rounded-2xl p-5 shadow border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiShield className="text-indigo-500" /> Privacy
          </div>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="private">Private</option>
            <option value="friends">Friends Only</option>
            <option value="public">Public</option>
          </select>
        </section>

        {/* Security */}
        <section className="bg-white rounded-2xl p-5 shadow border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiLock className="text-indigo-500" /> Two-Factor Authentication
          </div>
          <input
            type="checkbox"
            checked={twoFA}
            onChange={() => setTwoFA((v) => !v)}
            className="w-5 h-5 accent-indigo-500"
          />
        </section>

        {/* Language */}
        <section className="bg-white rounded-2xl p-5 shadow border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiGlobe className="text-indigo-500" /> Language
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
            <option value="mr">Marathi</option>
          </select>
        </section>

        {/* Delete Account */}
        <section className="bg-white rounded-2xl p-5 shadow border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-500">
            <FiTrash2 /> Delete Account
          </div>
          <button className="text-xs text-red-500 font-bold hover:underline">
            Delete
          </button>
        </section>
      </div>
    </div>
  );
}
