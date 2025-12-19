import { useState } from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const BankDetailsStep = ({ next, back }) => {
  const [data, setData] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
  });

  const [touched, setTouched] = useState({
    bankName: false,
    accountHolderName: false,
    accountNumber: false,
    confirmAccountNumber: false,
    ifsc: false,
  });

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === "ifsc") value = value.toUpperCase();
    setData({ ...data, [field]: value });
    setTouched({ ...touched, [field]: true });
  };

  // Validation
  const isBankNameValid = data.bankName.trim().length >= 3;
  const isHolderNameValid = data.accountHolderName.trim().length >= 3;
  const isAccountValid = /^\d{9,18}$/.test(
    data.accountNumber.replace(/\D/g, "")
  );
  const isConfirmValid =
    data.accountNumber && data.accountNumber === data.confirmAccountNumber;
  const isIFSCValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifsc);

  const isFormValid =
    isBankNameValid &&
    isHolderNameValid &&
    isAccountValid &&
    isConfirmValid &&
    isIFSCValid;

  const getBorderClass = (valid, hasTouched) => {
    if (!hasTouched) return "border-gray-300";
    return valid ? "border-green-500" : "border-red-500";
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Compact Header */}
      <motion.div variants={itemVariants} className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Bank Details</h2>
        <p className="text-sm text-gray-600 mt-1">
          Link your bank account securely
        </p>
      </motion.div>

      {/* 2-Column Grid for Wide Layout */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <input
            type="text"
            placeholder="e.g. HDFC Bank"
            value={data.bankName}
            onChange={handleChange("bankName")}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getBorderClass(
              isBankNameValid,
              touched.bankName
            )}`}
          />
        </div>

        {/* Account Holder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name
          </label>
          <input
            type="text"
            placeholder="As per bank records"
            value={data.accountHolderName}
            onChange={handleChange("accountHolderName")}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getBorderClass(
              isHolderNameValid,
              touched.accountHolderName
            )}`}
          />
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number
          </label>
          <input
            type="text"
            placeholder="Enter account number"
            value={data.accountNumber}
            onChange={handleChange("accountNumber")}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getBorderClass(
              isAccountValid,
              touched.accountNumber
            )}`}
          />
        </div>

        {/* Confirm Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Account Number
          </label>
          <input
            type="text"
            placeholder="Re-enter to confirm"
            value={data.confirmAccountNumber}
            onChange={handleChange("confirmAccountNumber")}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getBorderClass(
              isConfirmValid,
              touched.confirmAccountNumber
            )}`}
          />
          {touched.confirmAccountNumber && !isConfirmValid && (
            <p className="mt-1 text-xs text-red-600">Numbers do not match</p>
          )}
        </div>

        {/* IFSC Code (full width for importance) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IFSC Code
          </label>
          <input
            type="text"
            placeholder="e.g. HDFC0000123"
            value={data.ifsc}
            onChange={handleChange("ifsc")}
            maxLength={11}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 font-mono focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getBorderClass(
              isIFSCValid,
              touched.ifsc
            )}`}
          />
          {touched.ifsc && !isIFSCValid && data.ifsc && (
            <p className="mt-1 text-xs text-red-600">Invalid IFSC format</p>
          )}
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div variants={itemVariants} className="flex gap-4 mt-5">
        <button
          onClick={back}
          className="flex-1 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 transition-all"
        >
          Back
        </button>
        <button
          disabled={!isFormValid}
          onClick={() =>
            next({
              bankName: data.bankName,
              accountHolderName: data.accountHolderName,
              accountNumber: data.accountNumber,
              ifsc: data.ifsc,
            })
          }
          className={`flex-1 py-3 rounded-xl font-semibold text-lg transition-all duration-300
            ${
              isFormValid
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

export default BankDetailsStep;
