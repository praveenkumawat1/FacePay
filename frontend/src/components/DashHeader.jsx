/**
 * DashHeader
 * - Header used inside each dashboard stack, includes title and action icons.
 */
import { FiBell, FiUserCheck } from "react-icons/fi";

const DashHeader = ({ title, isDark }) => (
  <div className="flex justify-between items-center mb-10">
    <div>
      <h2
        className={`text-3xl font-bold tracking-tight ${
          isDark ? "text-white" : "text-slate-800"
        }`}
      >
        {title}
      </h2>
      <p
        className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${
          isDark ? "text-indigo-400" : "text-slate-400"
        }`}
      >
        Simulated Monitoring Dashboard
      </p>
    </div>
    <div className="flex gap-3">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
          isDark
            ? "border-white/10 bg-white/5"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <FiBell className={isDark ? "text-white" : "text-slate-600"} />
      </div>
      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
        <FiUserCheck />
      </div>
    </div>
  </div>
);

export default DashHeader;
