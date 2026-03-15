import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGift, FiX } from "react-icons/fi";

export default function ReferStatsModal({ open, onClose, code }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (!code) {
      setLoading(false);
      setStats(null);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:5000/api/refer/stats?code=${code}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, code]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 rounded-full p-2 z-10"
              title="Close"
            >
              <FiX size={22} />
            </button>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex items-center gap-3">
              <FiGift size={28} />
              <div>
                <h2 className="text-xl font-bold">Referral Stats</h2>
                <p className="text-xs text-purple-100">
                  Code: <span className="font-mono font-bold">{code}</span>
                </p>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center text-slate-400">Loading...</div>
              ) : !code ? (
                <div className="text-center text-slate-400">
                  No referral code available.
                </div>
              ) : stats ? (
                <>
                  <div className="mb-4">
                    <div className="font-semibold text-lg text-indigo-700">
                      Total Referrals: {stats.total}
                    </div>
                    <div className="text-sm text-slate-600">
                      Joined: {stats.joined}
                    </div>
                    <div className="text-sm text-slate-600">
                      Rewards Earned: ₹{stats.rewards}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recent Referrals</h4>
                    <ul className="max-h-40 overflow-y-auto text-sm">
                      {stats.recent && stats.recent.length > 0 ? (
                        stats.recent.map((r, i) => (
                          <li
                            key={i}
                            className="mb-1 flex justify-between border-b border-slate-100 pb-1"
                          >
                            <span>
                              {r.name || r.email || r.mobile || "User"}
                            </span>
                            <span className="text-slate-400">
                              {new Date(r.date).toLocaleDateString()}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400">No recent referrals</li>
                      )}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-400">
                  No referral data found.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
