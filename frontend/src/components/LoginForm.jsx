import { useState, useEffect, useRef } from "react";

const LoginForm = ({ onClose, switchToSignup, onForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputText, setInputText] = useState("");
  const [challengeText, setChallengeText] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);

  const canvasRef = useRef(null);

  const generateChallenge = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < 5; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setChallengeText(text);
    setInputText("");
    setIsVerified(false);
    setError(false);
  };

  useEffect(() => {
    if (!canvasRef.current || !challengeText) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 300;
    const height = 56;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    // Light noise
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }

    ctx.font = "bold 28px monospace";
    ctx.fillStyle = "#1e293b";
    ctx.textBaseline = "middle";

    const letterSpacing = width / (challengeText.length + 1);
    challengeText.split("").forEach((char, i) => {
      const x = letterSpacing * (i + 1);
      const y = height / 2 + Math.sin(i) * 4;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.25);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });

    // Subtle lines
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(0, height * Math.random());
      ctx.lineTo(width, height * Math.random());
      ctx.stroke();
    }
  }, [challengeText]);

  useEffect(() => {
    generateChallenge();
  }, []);

  useEffect(() => {
    if (inputText.length === challengeText.length && inputText) {
      if (inputText.toUpperCase() === challengeText) {
        setIsVerified(true);
        setError(false);
      } else {
        setError(true);
      }
    } else if (inputText.length > 0) {
      setError(false);
    }
  }, [inputText, challengeText]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 px-4">
      {/* Wide but Super Compact Card */}
      <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-600 hover:text-black transition flex items-center justify-center"
        >
          ✕
        </button>

        {/* Super Tight Padding */}
        <div className="px-8 py-7">
          {/* Header - Compact */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-600 mt-1">
              Login to <span className="font-semibold text-black">FacePay</span>
            </p>
          </div>

          {/* Email */}
          <div className="mb-3.5">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Email or Username
            </label>
            <input
              type="text"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/70 
                         focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black transition"
            />
          </div>

          {/* Password */}
          <div className="mb-3.5">
            <div className="flex justify-between items-end mb-1">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                onClick={onForgotPassword}
                className="text-sm font-medium text-black hover:underline transition"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/70 
                           focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black transition pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 hover:text-black transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* CAPTCHA - Compact */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium text-gray-700">
                Verify you're human
              </p>
              <button
                onClick={generateChallenge}
                className="text-xs text-gray-500 hover:text-black underline transition"
              >
                Refresh
              </button>
            </div>

            <div className="p-2.5 bg-gray-50/70 rounded-xl border border-gray-200 shadow-inner">
              <canvas
                ref={canvasRef}
                width={300}
                height={56}
                className="mx-auto rounded-lg"
              />
            </div>

            <div className="relative mt-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.toUpperCase())}
                placeholder="Type the text"
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/70 
                           focus:outline-none focus:ring-4 focus:ring-black/10 transition
                           ${
                             isVerified
                               ? "border-green-500"
                               : error
                               ? "border-red-500"
                               : "border-gray-200"
                           }`}
              />
              {isVerified && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 text-lg font-bold">
                  ✓
                </span>
              )}
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1 text-center">Incorrect</p>
            )}
          </div>

          {/* Login Button */}
          <button
            disabled={!isVerified}
            className={`w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300
              ${
                isVerified
                  ? "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
          >
            Login
          </button>

          {/* OR Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/95 text-gray-500 font-medium">
                OR
              </span>
            </div>
          </div>

          {/* Face Login */}
          <button
            className="w-full py-3 rounded-xl border-2 border-black bg-transparent font-semibold text-black 
                             hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Login with Face
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-4">
            New here?{" "}
            <button
              onClick={switchToSignup}
              className="font-semibold text-black hover:underline transition"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
