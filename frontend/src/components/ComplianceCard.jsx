/**
 * ComplianceCard
 * - A small card used in the Compliance dashboard to show a principle and its status.
 */
import { FiCheckCircle } from "react-icons/fi";

const ComplianceCard = ({ title, status }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">
      Principle
    </p>
    <h4 className="font-bold">{title}</h4>
    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
      <FiCheckCircle /> {status}
    </div>
  </div>
);

export default ComplianceCard;
