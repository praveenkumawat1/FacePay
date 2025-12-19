import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import zxcvbn from "zxcvbn"; // ← Yeh import add karo

const containerVariants = {
  /* same as before */
};
const itemVariants = {
  /* same as before */
};

const PasswordStep = ({ next, back }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [result, setResult] = useState(null);

  // zxcvbn run on password change
  useEffect(() => {
    if (password) {
      // Optional: user inputs pass karo for better detection (e.g., name, email)
      const zxcvbnResult = zxcvbn(password, ["praveen", "kumawat", "facepay"]); // customize with user data
      setResult(zxcvbnResult);
    } else {
      setResult(null);
    }
  }, [password]);

  const passwordsMatch = password && password === confirm;

  const isValid = result && result.score >= 3 && passwordsMatch; // Minimum score 3 (strong)

  const getStrengthInfo = () => {
    if (!result)
      return { label: "Type a password", color: "bg-gray-300", time: "" };

    switch (result.score) {
      case 0:
        return { label: "Very Weak", color: "bg-red-600", time: "Instant" };
      case 1:
        return { label: "Weak", color: "bg-red-500", time: "Seconds to hours" };
      case 2:
        return {
          label: "Fair",
          color: "bg-orange-500",
          time: "Days to months",
        };
      case 3:
        return {
          label: "Strong",
          color: "bg-green-500",
          time: "Years to centuries",
        };
      case 4:
        return {
          label: "Very Strong",
          color: "bg-green-600",
          time: "Centuries+",
        };
      default:
        return { label: "", color: "bg-gray-300", time: "" };
    }
  };

  const strength = getStrengthInfo();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.div variants={itemVariants} className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Secure Your Account
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Create a strong, unique password
        </p>
      </motion.div>

      {/* Password Input */}
      <motion.div variants={itemVariants}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 
                       focus:outline-none focus:ring-4 focus:ring-black/10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-black"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </motion.div>

      {/* Confirm Password */}
      <motion.div variants={itemVariants}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Re-type password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 
                       focus:outline-none focus:ring-4 focus:ring-black/10 transition-all
                       ${
                         passwordsMatch && confirm
                           ? "border-green-500"
                           : confirm && !passwordsMatch
                           ? "border-red-500"
                           : "border-gray-300"
                       }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-black"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
        {confirm && !passwordsMatch && (
          <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
        )}
      </motion.div>

      {/* zxcvbn Strength Meter */}
      {result && (
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Password Strength
            </span>
            <span
              className={`text-sm font-bold ${strength.color.replace(
                "bg-",
                "text-"
              )}`}
            >
              {strength.label}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${strength.color} transition-all duration-500`}
              style={{ width: `${((result.score + 1) / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">
            Estimated crack time:{" "}
            <span className="font-medium">
              {result.crack_times_display.offline_slow_hashing_1e4_per_second}
            </span>
          </p>
          {result.feedback.warning && (
            <p className="text-xs text-orange-600">{result.feedback.warning}</p>
          )}
          {result.feedback.suggestions.length > 0 && (
            <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
              {result.feedback.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {/* Buttons */}
      <motion.div variants={itemVariants} className="flex gap-4 mt-5">
        <button
          onClick={back}
          className="flex-1 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 transition-all"
        >
          Back
        </button>
        <button
          disabled={!isValid}
          onClick={() => next({ password })}
          className={`flex-1 py-3 rounded-xl font-semibold text-lg transition-all duration-300
            ${
              isValid
                ? "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
        >
          Next
        </button>
      </motion.div>
    </motion.div>
  );
};

export default PasswordStep;
