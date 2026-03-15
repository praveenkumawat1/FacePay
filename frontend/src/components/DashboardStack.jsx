/**
 * DashboardStack
 * - Wrapper component for each stacked dashboard.
 * - Uses Framer Motion to animate in on scroll.
 * - Sticky positioning creates a stacking effect as user scrolls.
 */
import { motion } from "framer-motion";

const DashboardStack = ({ children, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-5%" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="sticky mb-6 w-full max-w-[1180px] mx-auto px-4"
      style={{
        zIndex: index,
        top: `${80 + index * 40}px`,
      }}
    >
      <div className="bg-white rounded-[3rem] border border-gray-200/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] flex overflow-hidden min-h-[700px] ring-1 ring-gray-200/50">
        {children}
      </div>
    </motion.div>
  );
};

export default DashboardStack;
