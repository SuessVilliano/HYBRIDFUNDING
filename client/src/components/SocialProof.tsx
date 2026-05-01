import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Shield } from "lucide-react";

const stats = [
  {
    icon: Users,
    label: "Funded Traders",
    value: "10,000+",
    sub: "Across 80+ countries",
  },
  {
    icon: DollarSign,
    label: "Profit Splits Paid",
    value: "Up to 90%",
    sub: "Industry-leading payouts",
  },
  {
    icon: TrendingUp,
    label: "Asset Classes",
    value: "4",
    sub: "Forex · Crypto · Futures · Equities",
  },
  {
    icon: Shield,
    label: "Trusted Platforms",
    value: "6",
    sub: "cTrader, DXTrade, MatchTrader, Rithmic, GooeyPro, Tradovate (soon)",
  },
];

const SocialProof: React.FC = () => {
  return (
    <section className="py-16 bg-[#0B1426] border-y border-accent/15">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-accent font-['Orbitron'] uppercase tracking-widest text-xs mb-3">
            Built by traders, trusted by thousands
          </p>
          <h2 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white">
            Why traders choose <span className="text-accent neon-text-accent">Hybrid Funding</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                className="glassmorphism rounded-xl p-5 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Icon className="h-7 w-7 text-accent mx-auto mb-2" />
                <div className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white">
                  {s.value}
                </div>
                <div className="text-[#B8B8D0] text-sm font-semibold mt-1">{s.label}</div>
                <div className="text-[#6F6F8A] text-[11px] mt-1 leading-tight">{s.sub}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
