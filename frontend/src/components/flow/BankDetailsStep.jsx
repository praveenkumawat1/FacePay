import { useState } from "react";
import { motion } from "framer-motion";

// --- Large list of Indian Banks (add more as needed) ---
const indianBanks = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Union Bank of India",
  "IndusInd Bank",
  "IDFC First Bank",
  "Bank of India",
  "Central Bank of India",
  "Indian Bank",
  "Federal Bank",
  "Yes Bank",
  "RBL Bank",
  "UCO Bank",
  "Bank of Maharashtra",
  "Indian Overseas Bank",
  "Punjab & Sind Bank",
  "South Indian Bank",
  "Bandhan Bank",
  "City Union Bank",
  "Karur Vysya Bank",
  "DCB Bank",
  "Jammu & Kashmir Bank",
  "Dhanlaxmi Bank",
  "Karnataka Bank",
  "Catholic Syrian Bank",
  "Saraswat Bank",
  "Tamilnad Mercantile Bank",
  // ... you can extend for full RBI list as desired
];

// --- Helper functions ---
const formatAccountNumber = (val) =>
  val
    .replace(/\D/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim()
    .slice(0, 23);

const maskAccountNumber = (val) => {
  const digits = val.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  let masked = "";
  for (let i = 0; i < digits.length - 4; i++) {
    masked += "*";
    if ((i + 1) % 4 === 0) masked += " ";
  }
  masked += " " + digits.slice(-4);
  return masked.trim().replace(/\s+/g, " ");
};

const isIFSCValidFormat = (ifsc) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);

// --- SVG Eye Icon (not emoji) ---
const EyeIcon = ({ show }) =>
  show ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M17.94 17.94A10.49 10.49 0 0112 19c-7 0-11-7-11-7a21.62 21.62 0 014.09-5.33"
      />
      <path d="M1 1l22 22" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

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

  const [touched, setTouched] = useState({});
  const [bankSearch, setBankSearch] = useState("");
  const [dropdownActive, setDropdownActive] = useState(false);
  const [showAcc, setShowAcc] = useState(false);
  const [ifscStatus, setIfscStatus] = useState({
    loading: false,
    valid: false,
    error: "",
    bank: "",
    branch: "",
    address: "",
  });

  // --- Bank Name Dropdown Logic ---
  const filteredBanks = !bankSearch
    ? indianBanks
    : indianBanks.filter((n) =>
        n.toLowerCase().includes(bankSearch.toLowerCase()),
      );
  const handleBankDropdown = (bank) => {
    setData((d) => ({ ...d, bankName: bank }));
    setTouched((t) => ({ ...t, bankName: true }));
    setDropdownActive(false);
    setBankSearch("");
  };

  const handleBankInput = (e) => {
    const val = e.target.value;
    setBankSearch(val);
    setData((d) => ({ ...d, bankName: val }));
    setTouched((t) => ({ ...t, bankName: true }));
    setDropdownActive(true);
  };

  // --- Account Number Masked Input ---
  const handleAccInput = (e) => {
    let digits = e.target.value.replace(/\D/g, "").substring(0, 18);
    setData((d) => ({ ...d, accountNumber: digits }));
    setTouched((t) => ({ ...t, accountNumber: true }));
  };

  const handleConfirmAccInput = (e) => {
    let digits = e.target.value.replace(/\D/g, "").substring(0, 18);
    setData((d) => ({ ...d, confirmAccountNumber: digits }));
    setTouched((t) => ({ ...t, confirmAccountNumber: true }));
  };

  // --- IFSC with Razorpay API fetch for branch ---
  const handleIFSC = async (e) => {
    const value = e.target.value.toUpperCase();
    setData((d) => ({ ...d, ifsc: value }));
    setTouched((t) => ({ ...t, ifsc: true }));
    if (value.length === 11 && isIFSCValidFormat(value)) {
      setIfscStatus({ loading: true, valid: false, error: "" });
      try {
        const resp = await fetch(`https://ifsc.razorpay.com/${value}`);
        if (resp.status === 200) {
          const resData = await resp.json();
          setIfscStatus({
            loading: false,
            valid: true,
            error: "",
            bank: resData.BANK,
            branch: resData.BRANCH,
            address: resData.ADDRESS,
          });
          // Optional: auto-bankName fill
          if (!data.bankName)
            setData((prev) => ({ ...prev, bankName: resData.BANK }));
        } else {
          setIfscStatus({
            loading: false,
            valid: false,
            error: "Invalid IFSC code",
            bank: "",
            branch: "",
            address: "",
          });
        }
      } catch {
        setIfscStatus({
          loading: false,
          valid: false,
          error: "Network error",
          bank: "",
          branch: "",
          address: "",
        });
      }
    } else {
      setIfscStatus({
        loading: false,
        valid: false,
        error: "",
        bank: "",
        branch: "",
        address: "",
      });
    }
  };

  // --- Validation ---
  const isBankNameValid =
    data.bankName.length > 0 &&
    indianBanks.some((b) => b.toLowerCase() === data.bankName.toLowerCase());
  const isHolderValid = data.accountHolderName.trim().length >= 3;
  const isAccountValid = /^\d{9,18}$/.test(data.accountNumber);
  const isConfirmValid =
    data.accountNumber && data.accountNumber === data.confirmAccountNumber;
  const isIFSCValid = isIFSCValidFormat(data.ifsc) && ifscStatus.valid;

  const isFormValid =
    isBankNameValid &&
    isHolderValid &&
    isAccountValid &&
    isConfirmValid &&
    isIFSCValid;

  const getBorderClass = (valid, hasTouched) =>
    !hasTouched
      ? "border-gray-300"
      : valid
        ? "border-green-500"
        : "border-red-500";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.div variants={itemVariants} className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Bank Details</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter bank details exactly as per official record.
        </p>
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* --- Bank Name Dropdown --- */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <input
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="Select your bank"
            value={bankSearch.length ? bankSearch : data.bankName}
            onChange={handleBankInput}
            onFocus={() => setDropdownActive(true)}
            onBlur={() => setTimeout(() => setDropdownActive(false), 180)}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none z-20 focus:ring-4 focus:ring-black/10 transition-all ${getBorderClass(
              isBankNameValid,
              touched.bankName,
            )}`}
          />
          {dropdownActive && filteredBanks.length > 0 && (
            <ul className="absolute z-30 w-full bg-white border rounded-xl mt-1 max-h-40 overflow-auto shadow-xl">
              {filteredBanks.slice(0, 20).map((bank, i) => (
                <li
                  key={bank}
                  tabIndex={0}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onMouseDown={() => handleBankDropdown(bank)}
                >
                  {bank}
                </li>
              ))}
            </ul>
          )}
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
            onChange={(e) => {
              setData((d) => ({ ...d, accountHolderName: e.target.value }));
              setTouched((t) => ({ ...t, accountHolderName: true }));
            }}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getBorderClass(
              isHolderValid,
              touched.accountHolderName,
            )}`}
          />
        </div>
        {/* --- Account Number with mask/show toggle Eye --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number
          </label>
          <div className="relative group">
            <input
              type="text"
              autoComplete="off"
              inputMode="numeric"
              maxLength={23}
              placeholder="**** **** 1234"
              value={
                showAcc
                  ? formatAccountNumber(data.accountNumber)
                  : maskAccountNumber(data.accountNumber)
              }
              onChange={handleAccInput}
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 pr-12 font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getBorderClass(
                isAccountValid,
                touched.accountNumber,
              )}`}
              spellCheck={false}
            />
            {/* Eye Icon */}
            <button
              type="button"
              onClick={() => setShowAcc((show) => !show)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition text-xl p-1"
              aria-label="Show/hide account number"
              title={showAcc ? "Hide account number" : "Show account number"}
            >
              <EyeIcon show={showAcc} />
            </button>
          </div>
          {touched.accountNumber && !isAccountValid && data.accountNumber && (
            <p className="mt-1 text-xs text-red-600">
              Enter 9-18 digit account number
            </p>
          )}
        </div>
        {/* --- Confirm Account Number with formatting --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Account Number
          </label>
          <input
            type="text"
            maxLength={23}
            autoComplete="off"
            inputMode="numeric"
            spellCheck={false}
            placeholder="Re-enter to confirm"
            value={formatAccountNumber(data.confirmAccountNumber)}
            onChange={handleConfirmAccInput}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 font-mono tracking-wider focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getBorderClass(
              isConfirmValid,
              touched.confirmAccountNumber,
            )}`}
          />
          {touched.confirmAccountNumber && !isConfirmValid && (
            <p className="mt-1 text-xs text-red-600">Numbers do not match</p>
          )}
        </div>
        {/* IFSC Code + show branch/address below */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IFSC Code
          </label>
          <input
            type="text"
            placeholder="e.g. HDFC0000123"
            maxLength={11}
            spellCheck={false}
            autoComplete="off"
            value={data.ifsc}
            onChange={handleIFSC}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 font-mono uppercase focus:outline-none focus:ring-4 focus:ring-black/10 transition-all ${getBorderClass(
              isIFSCValidFormat(data.ifsc) && (ifscStatus.valid || !data.ifsc),
              touched.ifsc,
            )}`}
          />
          {data.ifsc && ifscStatus.loading && (
            <p className="mt-1 text-xs text-blue-500">Verifying IFSC code...</p>
          )}
          {!ifscStatus.loading && ifscStatus.error && (
            <p className="mt-1 text-xs text-red-600">{ifscStatus.error}</p>
          )}
          {!ifscStatus.loading && ifscStatus.valid && (
            <div className="mt-2 text-xs text-green-700">
              <span className="font-bold">{ifscStatus.bank}</span>
              {" — "}Branch: {ifscStatus.branch}
              <br />
              <span>{ifscStatus.address}</span>
            </div>
          )}
        </div>
      </motion.div>
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
