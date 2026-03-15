/**
 * VaultCard
 * - A card used in the Digital Vault dashboard to highlight a feature.
 */
const VaultCard = ({ icon, title, desc }) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-colors">
    <div className="text-indigo-400 mb-4 text-3xl">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default VaultCard;
