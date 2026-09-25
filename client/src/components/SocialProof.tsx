import { motion } from "framer-motion";
import { TrendingUp, Layers3, DollarSign, Shield } from "lucide-react";

const stats = [
  {
    icon: Layers3,
    label: "Market Paths",
    value: "5",
    sub: "Forex · Crypto · Futures · Equities · Predictive",
  },
  {
    icon: DollarSign,
    label: "Max Profit Split",
    value: "90%",
    sub: "Available on eligible programs and options",
  },
  {
    icon: TrendingUp,
    label: "Program Structures",
    value: "6+",
    sub: "1-Step · 2-Step · 3-Step · 4-Phase · Instant · IF Lite",
  },
  {
    icon: Shield,
    label: "Platform Choice",
    value: "Multi",
    sub: "MatchTrader · DXtrade · cTrader · Volumetrica · PropX · Tickblaze launching",
  },
];

const SocialProof: React.FC = () => {
  return (
    <section className="py-16 bg-[#0B1426] border-y border-accent/15">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-accent font-['Orbitron'] uppercase tracking-widest text-xs mb-3">
            Built for traders. Expanding continuously.
          </p>
          <h2 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white">
            Why traders explore <span className="text-accent neon-text-accent">Hybrid Funding</span>
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
                <div className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white">{s.value}</div>
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
