/**
 * HeroFeature
 * - A small card used in the hero section to display a feature with an icon, title, and description.
 */
const HeroFeature = ({ icon, title, desc, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-left hover:shadow-md transition-all hover:-translate-y-1">
    <div className={`${color} mb-3 text-2xl`}>{icon}</div>
    <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
    <p className="text-[12px] text-slate-400 mt-1 leading-tight">{desc}</p>
  </div>
);

export default HeroFeature;
