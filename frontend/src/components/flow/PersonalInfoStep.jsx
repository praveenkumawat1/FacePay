import { useState } from "react";

// --- Mailboxlayer API function (updated & safe) ---
const checkEmailExistence = async (email) => {
  // Basic syntax check
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return false;
  }

  // CHANGE THIS: Apna fresh API key yaha daalo (https://mailboxlayer.com/ se free bana lo)
  const apiKey = "365bb9cd8d9340c0ff2f3a558873a893"; // ←←← YAHAN APNA KEY DAALO !!!

  try {
    const url = `https://apilayer.net/api/check?access_key=${apiKey}&email=${encodeURIComponent(email)}&smtp=1&format=1`;
    const resp = await fetch(url);

    if (!resp.ok) {
      console.warn(`API HTTP error: ${resp.status} for email ${email}`);
      return true; // Server error → temporarily allow (safe side)
    }

    const data = await resp.json();

    // Agar API success false return kare (invalid key, quota over, etc.)
    if (data.success === false) {
      console.warn(
        "Mailboxlayer API error:",
        data.error?.info || "Unknown error",
      );
      return true; // Fail-safe: block mat karo
    }

    // Real check: format + MX + SMTP
    const isValid =
      data.format_valid && data.mx_found && data.smtp_check === true;

    console.log(`Email check for ${email}:`, {
      format_valid: data.format_valid,
      mx_found: data.mx_found,
      smtp_check: data.smtp_check,
      result: isValid,
    });

    return isValid;
  } catch (err) {
    console.error("Email verification failed:", err);
    return true; // Network/API down → user ko block mat karo
  }
};

const calculateAge = (dob) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

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

  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(true); // Default true taaki bina check ke block na ho

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setData({ ...data, [field]: value });
    setTouched({ ...touched, [field]: true });

    if (field === "email") {
      setCheckingEmail(true);
      setEmailExists(true); // Optimistic update

      const isValidSyntax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (isValidSyntax) {
        checkEmailExistence(value).then((exists) => {
          setEmailExists(exists);
          setCheckingEmail(false);
        });
      } else {
        setEmailExists(false); // Invalid syntax → exists false
        setCheckingEmail(false);
      }
    }
  };

  const isNameValid = data.name.trim().length >= 2;
  const isEmailSyntaxValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const isMobileValid = /^[6-9]\d{9}$/.test(data.mobile.replace(/\D/g, ""));
  const isDobValid = data.dob !== "" && calculateAge(data.dob) >= 21;

  // Final form valid only if email syntax + existence dono sahi
  const isFormValid =
    isNameValid &&
    isEmailSyntaxValid &&
    emailExists &&
    !checkingEmail &&
    isMobileValid &&
    isDobValid;

  const getInputBorderClass = (isValid, hasTouched) => {
    if (!hasTouched) return "border-gray-300";
    return isValid ? "border-green-500" : "border-red-500";
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
        <p className="text-sm text-gray-600 mt-1">Tell us about yourself</p>
      </div>

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
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getInputBorderClass(
              isNameValid,
              touched.name,
            )}`}
          />
          {touched.name && !isNameValid && (
            <p className="mt-1 text-xs text-red-600">
              Minimum 2 letters required
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            value={data.email}
            onChange={handleChange("email")}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getInputBorderClass(
              isEmailSyntaxValid && emailExists,
              touched.email,
            )}`}
          />
          {touched.email && !isEmailSyntaxValid && (
            <p className="mt-1 text-xs text-red-600">Valid email required</p>
          )}
          {touched.email && isEmailSyntaxValid && checkingEmail && (
            <p className="mt-1 text-xs text-gray-500">Checking email...</p>
          )}
          {touched.email &&
            isEmailSyntaxValid &&
            !emailExists &&
            !checkingEmail && (
              <p className="mt-1 text-xs text-red-600">
                Email does not exist or cannot receive mail
              </p>
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
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getInputBorderClass(
              isMobileValid,
              touched.mobile,
            )}`}
          />
          {touched.mobile && !isMobileValid && (
            <p className="mt-1 text-xs text-red-600">
              Valid 10-digit Indian mobile (starting 6-9) required
            </p>
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
            max="2005-01-20" // Approx 21 years old on 2026-01-20
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getInputBorderClass(
              isDobValid,
              touched.dob,
            )}`}
          />
          {touched.dob && data.dob && calculateAge(data.dob) < 21 && (
            <p className="mt-1 text-xs text-red-600">
              You must be at least 21 years old
            </p>
          )}
        </div>
      </div>

      <button
        disabled={!isFormValid || checkingEmail}
        onClick={() => next(data)}
        className={`w-full py-3.5 rounded-xl font-semibold text-lg transition-all duration-300 mt-5 ${
          isFormValid && !checkingEmail
            ? "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        {checkingEmail ? "Checking email..." : "Continue"}
      </button>
    </div>
  );
};

export default PersonalInfoStep;
