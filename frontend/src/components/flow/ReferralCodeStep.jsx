import { useState } from "react";

const ReferralCodeStep = ({ next, back, initialValue }) => {
  const [referralCode, setReferralCode] = useState(initialValue || "");
  const [error, setError] = useState("");

  const handleNext = () => {
    // Optionally validate: 6 chars, not required
    if (referralCode && referralCode.length < 4) {
      setError("Referral code must be at least 4 characters.");
      return;
    }
    setError("");
    next({ referralCode }); // Real-time data passed up
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">
        Enter Referral Code{" "}
        <span className="font-normal text-gray-500">(optional)</span>
      </h3>
      <label className="block mb-3 text-sm text-gray-600">
        Enter referral code if you have one.
      </label>
      <input
        className="block w-full rounded-lg border border-gray-300 px-4 py-3 mb-2 focus:outline-blue-500 transition"
        type="text"
        placeholder="Referral Code (optional)"
        value={referralCode}
        maxLength={10}
        onChange={(e) => setReferralCode(e.target.value.trim().toUpperCase())}
      />
      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
      <div className="flex gap-4 mt-5">
        <button
          onClick={back}
          className="bg-gray-200 hover:bg-gray-300 rounded-lg px-5 py-2 font-semibold transition"
          type="button"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 font-bold transition"
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ReferralCodeStep;
