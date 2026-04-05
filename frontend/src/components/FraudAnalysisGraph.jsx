import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const FraudAnalysisGraph = () => {
  const [fraudScore, setFraudScore] = useState(15);
  const [dataPoints, setDataPoints] = useState([10, 15, 12, 18, 15]);

  useEffect(() => {
    // Real-time update simulation based on ghost monitor pulses
    const interval = setInterval(() => {
      const newPoint = Math.max(
        5,
        Math.min(95, fraudScore + (Math.random() * 10 - 5)),
      );
      setFraudScore(Math.round(newPoint));
      setDataPoints((prev) => [...prev.slice(-9), Math.round(newPoint)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [fraudScore]);

  const getStatusColor = (score) => {
    if (score < 30) return "#10b981"; // Green (Safe)
    if (score < 70) return "#f59e0b"; // Yellow (Warning)
    return "#ef4444"; // Red (Critical)
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-3xl border border-white/10 backdrop-blur-xl mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">
            Advanced Fraud Analysis
          </h3>
          <p className="text-sm text-gray-400">
            Real-time behavior & biometric risk scoring
          </p>
        </div>
        <div className="text-right">
          <span
            className="text-3xl font-black"
            style={{ color: getStatusColor(fraudScore) }}
          >
            {fraudScore}%
          </span>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
            Risk Level
          </p>
        </div>
      </div>

      {/* SVG Simple Sparkline Graph */}
      <div className="h-32 w-full flex items-end gap-1 px-2">
        {dataPoints.map((point, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${point}%` }}
            className="flex-1 rounded-t-sm"
            style={{
              backgroundColor: getStatusColor(point),
              opacity: (i + 1) / dataPoints.length,
            }}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase font-bold">
            Biometric Scan
          </p>
          <p className="text-sm text-green-400 font-mono">ENCRYPTED</p>
        </div>
        <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase font-bold">
            Movement Pattern
          </p>
          <p className="text-sm text-blue-400 font-mono">
            NATURAL (Ghost Mode)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FraudAnalysisGraph;
