import { motion } from "framer-motion";

const CompleteStep = ({ closeModal }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center space-y-8"
    >
      {/* Premium Success Icon (No Emoji) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          type: "spring",
          stiffness: 200,
        }}
        className="mx-auto w-28 h-28 bg-green-100 rounded-full flex items-center justify-center shadow-lg"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-inner">
          <span className="text-5xl text-white font-bold">✓</span>
        </div>
      </motion.div>

      {/* Heading */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-gray-900 mb-3"
        >
          Account Created Successfully!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-gray-600 max-w-md mx-auto"
        >
          Welcome to FacePay – your secure, face-powered payment experience is
          now ready.
        </motion.p>
      </div>

      {/* Dashboard Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={closeModal}
          className="w-full max-w-sm mx-auto py-4 rounded-2xl bg-black text-white font-semibold text-lg 
                     hover:bg-gray-900 shadow-xl hover:shadow-2xl hover:-translate-y-1 
                     transition-all duration-300"
        >
          Go to Dashboard
        </button>
      </motion.div>

      {/* Subtle Thank You */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-sm text-gray-500"
      >
        Thank you for choosing FacePay
      </motion.p>
    </motion.div>
  );
};

export default CompleteStep;
