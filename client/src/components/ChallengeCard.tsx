import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatCurrency, getCheckoutUrl } from "@/lib/utils";

interface ChallengeCardProps {
  tier: string;
  price: number;
  profitTarget: number;
  maxDrawdown: number;
  label: string;
  bestValue?: boolean;
  delay?: number;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  tier,
  price,
  profitTarget,
  maxDrawdown,
  label,
  bestValue = false,
  delay = 0,
}) => {
  return (
    <motion.div
      className={`glassmorphism rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
    >
      {bestValue && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="bg-accent text-[#0F0F1A] px-4 py-1 rounded-full font-bold shadow-[0_0_8px_rgba(0,255,255,0.5)]">
            BEST VALUE
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-['Orbitron'] text-2xl font-bold text-white">${tier}</h3>
          <span className="bg-accent/20 text-accent py-1 px-3 rounded-full text-sm font-medium">
            {label}
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-[#B8B8D0]">Profit Target</span>
            <span className="text-white font-semibold">{profitTarget}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#B8B8D0]">Max Drawdown</span>
            <span className="text-white font-semibold">{maxDrawdown}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#B8B8D0]">Entry Fee</span>
            <span className="text-white font-bold text-2xl">{formatCurrency(price)}</span>
          </div>
        </div>

        <Button
          variant={bestValue ? "neon-filled" : "gradient"}
          size="lg"
          className="w-full py-3 px-4 font-medium rounded-lg"
          onClick={() => window.open(getCheckoutUrl(tier), "_blank")}
        >
          Purchase Now
        </Button>
      </div>
    </motion.div>
  );
};

export default ChallengeCard;
