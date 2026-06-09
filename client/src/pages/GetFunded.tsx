import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import A2PCompliantOptInForm from "@/components/A2PCompliantOptInForm";
import { trackEvent } from "@/lib/analytics";
import {
  CheckCircle,
  Target,
  Shield,
  Wallet,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────
const CHALLENGES = [
  { tier: "$5K",   price: "$48",   target: "10%", drawdown: "6%", label: "Start Here" },
  { tier: "$25K",  price: "$228",  target: "10%", drawdown: "6%", label: "Most Popular", highlight: true },
  { tier: "$50K",  price: "$428",  target: "10%", drawdown: "6%", label: "Advanced" },
  { tier: "$100K", price: "$858",  target: "10%", drawdown: "6%", label: "Professional" },
];

const STEPS = [
  {
    num: "01",
    icon: Target,
    color: "text-accent",
    border: "border-accent/30",
    title: "Choose Your Challenge",
    desc: "Pick your account size ($5K–$100K) and challenge type. Prices start at $48. Forex, Crypto, Futures, and Single Session Equities available.",
  },
  {
    num: "02",
    icon: Shield,
    color: "text-primary",
    border: "border-primary/30",
    title: "Pass the Evaluation",
    desc: "Hit your 10% profit target while staying within the drawdown rules. No time limit — trade at your own pace with fair, transparent rules.",
  },
  {
    num: "03",
    icon: Wallet,
    color: "text-accent",
    border: "border-accent/30",
    title: "Get Funded & Keep 90%",
    desc: "You're funded with firm capital. Trade, withdraw, and scale. Keep up to 90% of your profits with no lock-in.",
  },
];

const TRUST = [
  { icon: Users,     stat: "500+",  label: "Funded Traders" },
  { icon: TrendingUp, stat: "90%",  label: "Max Profit Split" },
  { icon: Star,       stat: "$48",  label: "Starting Price" },
  { icon: Zap,        stat: "4",    label: "Asset Classes" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function GetFunded() {
  useEffect(() => {
    trackEvent("lp_get_funded_view");
    // Fire GTM custom event for Google Ads / Meta pixel
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({ event: "landing_page_view", page: "get-funded" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">

      {/* ── Minimal sticky header (no nav links) ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0F0F1A]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <span className="font-['Orbitron'] text-lg font-bold text-white tracking-wider">
              HYBRID <span className="text-accent neon-text-accent">FUNDING</span>
            </span>
          </Link>
          <a
            href="#get-started"
            className="font-['Orbitron'] text-xs font-bold px-4 py-2 rounded-full border border-accent text-accent hover:bg-accent hover:text-[#0F0F1A] transition-all"
            onClick={() => trackEvent("lp_header_cta_click")}
          >
            GET STARTED
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-accent/10 border border-accent/20 text-accent text-xs font-bold px-4 py-1.5 rounded-full font-['Orbitron'] tracking-widest mb-6">
              PROP FUNDING — FOREX · CRYPTO · FUTURES · EQUITIES
            </span>
            <h1 className="font-['Orbitron'] text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
              Get Funded.<br />
              <span className="text-primary neon-text-primary">Trade Capital.</span>{" "}
              <span className="text-accent neon-text-accent">Keep 90%.</span>
            </h1>
            <p className="text-[#B8B8D0] text-lg sm:text-xl max-w-2xl mx-auto mb-10">
              Pass a simple evaluation, trade Hybrid Funding's capital, and earn up to 90% profit splits — starting at just $48.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#get-started" onClick={() => trackEvent("lp_hero_primary_cta")}>
                <Button variant="neon-filled" size="xl" rounded="full" className="font-['Orbitron'] shadow-glow-accent">
                  CHOOSE MY CHALLENGE
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="#how-it-works" onClick={() => trackEvent("lp_hero_secondary_cta")}>
                <Button variant="neon" size="xl" rounded="full" className="font-['Orbitron']">
                  SEE HOW IT WORKS
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="py-10 bg-white/2 border-y border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {TRUST.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Icon className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="font-['Orbitron'] text-2xl font-bold text-white">{item.stat}</p>
                  <p className="text-[#B8B8D0] text-sm">{item.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 bg-[#0B1426]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-accent font-['Orbitron'] text-sm tracking-widest uppercase mb-3 block">Simple Process</span>
            <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-bold text-white">
              3 Steps to a <span className="text-primary neon-text-primary">Funded Account</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className={`glassmorphism rounded-xl p-8 border ${step.border} relative`}
                >
                  <div className="absolute -top-4 -left-4 w-9 h-9 rounded-full bg-[#0F0F1A] border border-white/10 flex items-center justify-center">
                    <span className="font-['Orbitron'] text-xs font-bold text-white/50">{step.num}</span>
                  </div>
                  <Icon className={`h-10 w-10 ${step.color} mb-4`} />
                  <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-[#B8B8D0] text-sm leading-relaxed">{step.desc}</p>
                  {i < 2 && (
                    <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="h-5 w-5 text-white/20" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Challenge Cards ── */}
      <section className="py-20 bg-[#0F0F1A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Orbitron'] text-3xl font-bold text-white mb-2">
              Pick Your <span className="text-accent neon-text-accent">Account Size</span>
            </h2>
            <p className="text-[#B8B8D0]">Forex 1-Step Challenge — most popular starting point</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {CHALLENGES.map((c, i) => (
              <motion.div
                key={c.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`glassmorphism rounded-xl p-6 relative ${
                  c.highlight
                    ? "border border-accent/50 shadow-[0_0_24px_rgba(0,255,255,0.12)]"
                    : "border border-white/5"
                }`}
              >
                {c.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-[#0F0F1A] text-xs font-bold px-3 py-1 rounded-full font-['Orbitron']">BEST VALUE</span>
                  </div>
                )}
                <p className="font-['Orbitron'] text-2xl font-bold text-white mb-1">{c.tier}</p>
                <p className="text-accent text-3xl font-bold mb-4">{c.price}</p>
                <div className="space-y-2 mb-5 text-sm">
                  {[
                    ["Profit Target", c.target],
                    ["Max Drawdown", c.drawdown],
                    ["Profit Split", "Up to 90%"],
                    ["Time Limit", "Unlimited"],
                    ["Asset Classes", "4 Markets"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[#B8B8D0]">{k}</span>
                      <span className="text-white font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                <a
                  href="#get-started"
                  onClick={() => trackEvent("lp_challenge_card_click", { tier: c.tier })}
                >
                  <Button
                    variant={c.highlight ? "neon-filled" : "neon"}
                    size="sm"
                    rounded="full"
                    className="w-full font-['Orbitron'] text-xs"
                  >
                    {c.label}
                  </Button>
                </a>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/challenges">
              <span className="text-[#B8B8D0] text-sm hover:text-accent transition-colors cursor-pointer">
                See all challenge types — Crypto, Futures &amp; Equities →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Choose ── */}
      <section className="py-16 bg-[#0B1426]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { icon: CheckCircle, text: "Fair, transparent rules — no tricks" },
              { icon: CheckCircle, text: "5 trading platforms to choose from" },
              { icon: CheckCircle, text: "No time limit on most evaluations" },
              { icon: CheckCircle, text: "Payouts on demand — no lock-in" },
              { icon: CheckCircle, text: "Profit splits up to 90%" },
              { icon: CheckCircle, text: "Forex · Crypto · Futures · Equities" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-[#B8B8D0] text-sm">{item.text}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Opt-In Form ── */}
      <section id="get-started" className="py-20 bg-gradient-to-b from-[#0B1426] to-[#1A1A2E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-['Orbitron'] text-3xl font-bold text-white mb-3">
                Ready to Get <span className="text-accent neon-text-accent">Funded?</span>
              </h2>
              <p className="text-[#B8B8D0]">
                Enter your details to book a call with our team or watch the free webinar — we'll walk you through the right challenge for your trading style.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <A2PCompliantOptInForm
                showResourceLinks={false}
                onSuccess={() => {
                  trackEvent("lp_form_submit");
                  if (typeof window !== "undefined" && window.dataLayer) {
                    window.dataLayer.push({ event: "lead_form_submit", page: "get-funded" });
                  }
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Disclaimer footer ── */}
      <footer className="py-10 bg-[#0F0F1A]/80 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <p className="text-[#B8B8D0] text-xs text-center leading-relaxed">
            <strong className="text-white">DISCLAIMER:</strong> Hybrid Funding is an affiliate of Prop Account, LLC. All funding assessments are provided by Prop Account, LLC and all assessment fees are paid to Prop Account, LLC. If you qualify for a Funded Account, you will be required to enter into a Trader Agreement with Prop Account LC. For complete terms and conditions, visit our{" "}
            <Link href="/terms">
              <span className="text-accent hover:text-primary transition-colors underline cursor-pointer">Terms and Conditions</span>
            </Link>.
          </p>
          <p className="text-white/30 text-xs text-center mt-4">
            © {new Date().getFullYear()} Hybrid Funding. All rights reserved.{" "}
            <Link href="/"><span className="hover:text-accent transition-colors cursor-pointer">hybridfunding.co</span></Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
