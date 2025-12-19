import LoginForm from "./LoginForm";

const AuthModal = ({ closeModal, switchToSignup }) => {
  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={closeModal}
    >
      {/* Modal Card */}
      <div
        className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
          aria-label="Close login modal"
        >
          ✕
        </button>

        {/* Login Form */}
        <LoginForm
          onClose={closeModal}
          switchToSignup={switchToSignup}
          onForgotPassword={() => {
            console.log("Forgot password clicked");
          }}
        />
      </div>
    </div>
  );
};

export default AuthModal;
