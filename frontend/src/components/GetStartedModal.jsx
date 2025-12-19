import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import PersonalInfoStep from "./flow/PersonalInfoStep";
import PasswordStep from "./flow/PasswordStep";
import BankDetailsStep from "./flow/BankDetailsStep";
import FaceScanStep from "./flow/FaceScanStep";
import CompleteStep from "./flow/CompleteStep";

const steps = ["Personal", "Security", "Bank", "Face", "Done"];

const slideVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const GetStartedModal = ({ close }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const next = (data) => {
    setFormData({ ...formData, ...data });
    setStep((prev) => prev + 1);
  };

  const back = () => setStep((prev) => prev - 1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
      >
        {/* Header with Close Button */}
        <div className="relative px-8 pt-8 pb-6">
          <button
            onClick={close}
            className="absolute top-4 right-6 w-10 h-10 rounded-full flex items-center justify-center 
                       bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black 
                       transition-all duration-200"
          >
            ✕
          </button>

          <h2 className="text-2xl font-bold text-gray-900 text-center pr-8">
            Create your FacePay account
          </h2>
          <p className="text-sm text-gray-600 text-center mt-2">
            Step {step} of {steps.length}
          </p>
        </div>

        {/* Modern Timeline */}
        <div className="px-8 mb-8">
          <div className="relative flex items-center justify-between">
            {/* Connecting Line */}
            <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 -z-0" />
            <div
              className="absolute top-5 left-10 h-0.5 bg-black transition-all duration-500 -z-0"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((label, i) => (
              <div
                key={label}
                className="flex flex-col items-center relative z-10"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                    ${
                      i + 1 <= step
                        ? "bg-black text-white shadow-lg scale-110"
                        : "bg-gray-200 text-gray-500"
                    }`}
                >
                  {i + 1 <= step ? i + 1 : i + 1}
                </div>
                <p
                  className={`mt-3 text-xs font-medium transition-colors duration-300
                    ${i + 1 <= step ? "text-black" : "text-gray-400"}
                  `}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content with Smooth Animation */}
        <div className="px-8 pb-10 min-h-96">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {step === 1 && <PersonalInfoStep next={next} />}
              {step === 2 && <PasswordStep next={next} back={back} />}
              {step === 3 && <BankDetailsStep next={next} back={back} />}
              {step === 4 && <FaceScanStep next={next} back={back} />}
              {step === 5 && <CompleteStep closeModal={close} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default GetStartedModal;
