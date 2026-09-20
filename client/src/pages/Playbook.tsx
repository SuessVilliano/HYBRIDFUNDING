import { useState } from "react";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";
import A2PCompliantOptInForm from "@/components/A2PCompliantOptInForm";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Download } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const benefits = [
  "Find your Trader DNA: Sniper, Architect, Hybrid, or Phoenix",
  "Compare five market paths: Forex, Crypto, Futures, Single Session Equities, and Prediction Markets",
  "Position-sizing, expectancy, daily-loss, and drawdown math you can reuse anywhere",
  "Prediction Markets walkthrough + how to use AI Market Radar as a research queue",
  "Daily checklist, weekly scorecard, and a 30-day trader-development roadmap",
  "Trade House + affiliate framework for traders who want to build a community",
];

const PDF_URL = "/trader-playbook.pdf";

const Playbook: React.FC = () => {
  const [unlocked, setUnlocked] = useState(false);

  const handleSuccess = () => {
    setUnlocked(true);
    trackEvent("playbook_unlocked");
    const a = document.createElement("a");
    a.href = PDF_URL;
    a.download = "Hybrid-Funding-Trader-Playbook.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <SEO
        title="Free Trader Operating Playbook — Hybrid Funding"
        description="Download the Hybrid Funding Trader Operating Playbook free. Trader DNA, market-fit guidance, risk math, Prediction Markets, AI Market Radar, and funded-trading rules."
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
              <span className="text-xs font-['Orbitron'] uppercase tracking-widest">Free Trader Operating Manual</span>
            </div>
            <h1 className="font-['Orbitron'] text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Know Your Style. Choose Your Market. <span className="text-accent neon-text-accent">Protect Capital.</span>
            </h1>
            <p className="text-[#B8B8D0] text-lg mb-6">
              A practical playbook built to make you a more informed trader before you buy anything. Learn your Trader DNA,
              compare market access, write your risk process, and understand the Hybrid Funding ecosystem from one guide.
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
              <Download className="h-3 w-3" /> Free download. Trading involves risk; the playbook is educational, not financial advice.
            </p>
          </motion.div>

          <motion.div
            className="glassmorphism rounded-xl p-6 md:p-8 border border-accent/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {unlocked ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-14 w-14 text-accent mx-auto mb-3" />
                <h2 className="font-['Orbitron'] text-2xl font-bold text-white mb-2">
                  You're in.
                </h2>
                <p className="text-[#B8B8D0] mb-5">
                  Your download should have started automatically. Use the button below if your browser blocked it.
                </p>
                <a href={PDF_URL} download="Hybrid-Funding-Trader-Playbook.pdf">
                  <Button variant="neon-filled" size="lg" rounded="full" className="font-['Orbitron']">
                    <Download className="mr-2 h-5 w-5" /> Download Playbook (PDF)
                  </Button>
                </a>
              </div>
            ) : (
              <>
                <h2 className="font-['Orbitron'] text-2xl font-bold text-white mb-2 text-center">
                  Get the Playbook
                </h2>
                <p className="text-[#B8B8D0] text-sm text-center mb-4">
                  Drop your info and we'll unlock the download immediately.
                </p>
                <A2PCompliantOptInForm
                  showResourceLinks={false}
                  compactMode
                  onSuccess={handleSuccess}
                />
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Playbook;
