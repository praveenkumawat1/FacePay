import { useState } from "react";
// import { Calendar, Mail, Phone, User } from "lucide-react"; // Baad mein install karne par uncomment kar dena

const PersonalInfoStep = ({ next }) => {
  const [data, setData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    mobile: false,
    dob: false,
  });

  const handleChange = (field) => (e) => {
    setData({ ...data, [field]: e.target.value });
    setTouched({ ...touched, [field]: true });
  };

  // Validation
  const isNameValid = data.name.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const isMobileValid = /^\d{10}$/.test(data.mobile.replace(/\D/g, ""));
  const isDobValid = data.dob !== "";

  const isFormValid =
    isNameValid && isEmailValid && isMobileValid && isDobValid;

  const getInputBorderClass = (isValid, hasTouched) => {
    if (!hasTouched) return "border-gray-300";
    return isValid ? "border-green-500" : "border-red-500";
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
        <p className="text-sm text-gray-600 mt-1">Tell us about yourself</p>
      </div>

      {/* 2-Column Grid for Wide Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={data.name}
            onChange={handleChange("name")}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 
              focus:outline-none focus:ring-4 focus:ring-black/10 transition-all
              ${getInputBorderClass(isNameValid, touched.name)}`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            value={data.email}
            onChange={handleChange("email")}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 
              focus:outline-none focus:ring-4 focus:ring-black/10 transition-all
              ${getInputBorderClass(isEmailValid, touched.email)}`}
          />
          {touched.email && !isEmailValid && (
            <p className="mt-1 text-xs text-red-600">Valid email required</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            placeholder="9876543210"
            value={data.mobile}
            onChange={handleChange("mobile")}
            maxLength={10}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 
              focus:outline-none focus:ring-4 focus:ring-black/10 transition-all
              ${getInputBorderClass(isMobileValid, touched.mobile)}`}
          />
          {touched.mobile && !isMobileValid && (
            <p className="mt-1 text-xs text-red-600">10 digits required</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={data.dob}
            onChange={handleChange("dob")}
            max="2010-12-31"
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 
              focus:outline-none focus:ring-4 focus:ring-black/10 transition-all
              ${getInputBorderClass(isDobValid, touched.dob)}`}
          />
        </div>
      </div>

      {/* Continue Button - Full Width */}
      <button
        disabled={!isFormValid}
        onClick={() => next(data)}
        className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 mt-5
          ${
            isFormValid
              ? "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
      >
        Continue
      </button>
    </div>
  );
};

export default PersonalInfoStep;
