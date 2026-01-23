import React from "react";

export default function EmailConfirmationModal({
  email,
  open,
  onClose,
  onResend,
  resendLoading = false,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(42, 44, 53, 0.7)" }} // Match your site theme
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl px-10 py-7 w-full max-w-[420px] text-center"
        style={{
          fontFamily: "inherit", // use your app font
        }}
      >
        {/* Close button */}
        <button
          className="absolute top-3 right-5 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {/* Illustration */}
        <div className="flex justify-center mb-3">
          <img
            src="/email-confirm-art.svg"
            alt="Email Illustration"
            style={{ width: 80, height: 80 }}
            // Use your own SVG or asset here
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Email Confirmation
        </h2>
        <div className="text-gray-600 text-[16px] mb-4 leading-relaxed">
          We have sent an email to{" "}
          <span className="text-[#388E3C] font-medium">{email}</span> to confirm
          the validity of your email address.
          <br />
          Please check your inbox and follow the link provided to complete
          registration.
        </div>
        <hr className="my-4 opacity-30" />
        <div className="text-gray-700 text-sm">
          If you did not get any mail,&nbsp;
          <button
            disabled={resendLoading}
            className={`underline font-medium text-[#388E3C] hover:text-[#225322] ${resendLoading ? "opacity-70 cursor-wait" : ""}`}
            onClick={onResend}
            style={{ transition: "color 0.2s" }}
          >
            {resendLoading ? "Sending..." : "Resend confirmation mail"}
          </button>
        </div>
      </div>
    </div>
  );
}
