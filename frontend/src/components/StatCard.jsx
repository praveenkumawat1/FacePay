/**
 * StatCard
 * - Displays a statistic with a title, animated number, and optional suffix.
 * - Uses AnimatedNumber component for the number animation.
 */
import AnimatedNumber from "./AnimatedNumber";

const StatCard = ({ title, value, suffix = "" }) => (
  <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
      {title}
    </p>
    <div className="flex items-baseline gap-1">
      <p className="text-4xl font-extrabold text-slate-900 tracking-tighter">
        <AnimatedNumber value={value} />
      </p>
      <span className="text-lg font-bold text-slate-400">{suffix}</span>
    </div>
  </div>
);

export default StatCard;
