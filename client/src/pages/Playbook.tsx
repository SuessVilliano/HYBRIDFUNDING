import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";
import A2PCompliantOptInForm from "@/components/A2PCompliantOptInForm";
import { CheckCircle2, FileText, Download } from "lucide-react";

const benefits = [
  "Rule-by-rule walkthrough for every Hybrid Funding challenge type",
  "Position sizing math worked through on $5K–$200K accounts",
  "Trailing drawdown geometry — where most traders blow up",
  "Asset-class playbooks: Forex, Crypto, Futures, Single Session Equities",
  "Add-on decision tree (90% split, weekend hold, payout-on-breach, lock waiver)",
  "Free 20% off code for your first challenge",
];

const Playbook: React.FC = () => {
  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <SEO
        title="Free Trader Playbook PDF — Hybrid Funding"
        description="Download the Hybrid Funding Trader Playbook free. Rules, position sizing, drawdown math, and asset-class strategies for prop traders."
        path="/playbook"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Trader Playbook", path: "/playbook" },
        ])}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/40 text-accent rounded-full px-3 py-1 mb-4">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-['Orbitron'] uppercase tracking-widest">Free PDF</span>
            </div>
            <h1 className="font-['Orbitron'] text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              The Hybrid Funding <span className="text-accent neon-text-accent">Trader Playbook</span>
            </h1>
            <p className="text-[#B8B8D0] text-lg mb-6">
              50 pages of rule-by-rule strategy, position-sizing math, and asset-class breakdowns from the team behind Hybrid Funding. Free for traders who join our list.
            </p>
            <ul className="space-y-3 mb-6">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-white">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="text-[#6F6F8A] text-xs flex items-center gap-1.5">
              <Download className="h-3 w-3" /> We'll text you the download link + 20% off code.
            </p>
          </motion.div>

          <motion.div
            className="glassmorphism rounded-xl p-6 md:p-8 border border-accent/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="font-['Orbitron'] text-2xl font-bold text-white mb-2 text-center">
              Get the Playbook
            </h2>
            <p className="text-[#B8B8D0] text-sm text-center mb-4">
              We'll send the PDF and discount code to your phone.
            </p>
            <A2PCompliantOptInForm showResourceLinks={false} compactMode />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Playbook;
