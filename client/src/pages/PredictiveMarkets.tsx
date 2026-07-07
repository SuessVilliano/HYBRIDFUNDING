import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { breadcrumbSchema, faqPageSchema, productSchema } from "@/lib/jsonLd";
import {
  Target,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Wallet,
  Clock,
  BarChart3,
} from "lucide-react";

const pricing = [
  { tier: "5K", size: "$5,000", price: 98, target: "$500" },
  { tier: "10K", size: "$10,000", price: 188, target: "$1,000" },
  { tier: "25K", size: "$25,000", price: 528, target: "$2,500" },
  { tier: "50K", size: "$50,000", price: 988, target: "$5,000" },
  { tier: "100K", size: "$100,000", price: 1888, target: "$10,000" },
];

const concepts = [
  {
    icon: BarChart3,
    title: "Prediction Market",
    body: "A market tied to a future event. Each one asks a defined question — will this happen by a certain date? The price moves as traders reassess how likely the outcome is.",
  },
  {
    icon: TrendingUp,
    title: 'Buy "Yes"',
    body: "You think the event will happen. If the market resolves Yes, every share you hold settles at $1.00. If it resolves No, those shares expire worthless.",
  },
  {
    icon: ShieldCheck,
    title: 'Buy "No"',
    body: "You think it won't happen. If the market resolves No, every share settles at $1.00. To bet against an outcome you simply buy No — there is no short selling.",
  },
];

const tradeSteps = [
  {
    step: "1",
    title: "Pick a market",
    body: "Choose a live event market. Prices display from 0 to 100 — a price of 25 means each share costs $0.25. Opening trades are allowed between $0.20 and $0.80.",
  },
  {
    step: "2",
    title: "Buy your shares",
    body: "Shares = order amount ÷ contract price. Buy $1,000 of Yes at 25¢ and you hold 4,000 shares. A 1% commission applies on the opening trade only.",
  },
  {
    step: "3",
    title: "Watch it move",
    body: "Your position is marked to the live price. If Yes rises from 25 to 40, your 4,000 shares move from ~$1,000 to ~$1,600. If it falls to 10, they fall to ~$400.",
  },
  {
    step: "4",
    title: "Close or hold to resolution",
    body: "Sell anytime to lock your gain or loss, or hold until the event resolves. Winning shares settle at $1.00 each; losing shares settle at $0.00.",
  },
];

const rules = [
  { label: "Profit Target", value: "10%", note: "Evaluation only" },
  { label: "Daily Drawdown", value: "3%", note: "EOD equity, resets 5 PM ET" },
  { label: "Max Drawdown", value: "6%", note: "Trailing equity high" },
  { label: "Max Profit / Event", value: "0.5%", note: "Of account, aggregated" },
  { label: "Evaluation Time", value: "30 days", note: "60 with Double Time" },
  { label: "Commission", value: "1%", note: "Opening trades only" },
  { label: "Opening Price Range", value: "$0.20–$0.80", note: "Close at any price" },
  { label: "Leverage", value: "None", note: "Pay per share" },
];

const edges = [
  {
    icon: Zap,
    title: "Trade the news, not the charts",
    body: "Elections, sports, economics, culture — if there's a market on it, you can trade your read on the outcome.",
  },
  {
    icon: ShieldCheck,
    title: "No leverage, no liquidations",
    body: "You pay only for the shares you buy. Your risk on any position is capped at what you put in — nothing gets margin-called.",
  },
  {
    icon: Target,
    title: "One step to funded",
    body: "Hit a 10% target once while respecting drawdown and you're funded — half the profit target of the leading competitor.",
  },
  {
    icon: Wallet,
    title: "Keep up to 90%",
    body: "Funded accounts start at a 75/25 split with an add-on to take it to 90/10, plus payouts every 7 days.",
  },
];

const addOns = [
  {
    title: "90% Profit Split",
    cost: "+20% of plan price",
    body: "Upgrade your funded split from 75/25 to 90/10 and keep more of every winning event.",
  },
  {
    title: "Double Time",
    cost: "+15% of plan price",
    body: "Extend your Evaluation from 30 to 60 days for more room to hit the 10% target.",
  },
];

const faqs = [
  {
    question: "What is the Predictive Markets program?",
    answer:
      "A funded account program where you trade the outcome of real-world events instead of forex, crypto, or futures. You buy Yes or No positions on live event markets, and your account progress, drawdown, and payouts are calculated from your account equity. It's a single-step evaluation with a 10% profit target and up to a 90% profit split.",
  },
  {
    question: "Can I short a prediction market?",
    answer:
      "No. Short selling is not available. To take the opposite view, you simply buy the other side — if you think an outcome won't happen, you buy No rather than shorting Yes. There is no leverage or margin; you only pay for the shares you buy.",
  },
  {
    question: "How do payouts work?",
    answer:
      "Funded accounts start at a 75/25 split, upgradeable to 90/10. Your first payout is available 7 days after funding, with subsequent requests every 7 days. The minimum payout is 2% of your starting balance, requested as a full withdrawal of eligible profits with no open positions.",
  },
];

const PredictiveMarkets = () => {
  return (
    <div className="page-transition">
      <SEO
        title="Predictive Markets — Get Funded to Trade Real-World Events | Hybrid Funding"
        description="Trade the outcome of real-world events on a funded account. Buy Yes or No on live prediction markets, hit a 10% target, and keep up to 90% of profits. Funded from $98."
        path="/predictive-markets"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Predictive Markets", path: "/predictive-markets" },
          ]),
          productSchema({
            name: "Hybrid Funding Predictive Markets Challenge",
            description:
              "One-step prediction market evaluation with a 10% profit target and up to 90% profit split.",
            url: "/predictive-markets",
            offers: pricing.map((p) => ({
              tier: p.tier,
              price: p.price,
              assetClass: "Prediction Market",
              challengeType: "One-Step",
            })),
          }),
          faqPageSchema(faqs),
        ]}
      />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center cyberpunk-bg overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full glassmorphism neon-border px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent font-['Orbitron']">
              <span className="rounded-full bg-accent px-2 py-0.5 text-[#0B1426]">New</span>
              Now Live at Hybrid Funding
            </span>
            <h1 className="font-['Orbitron'] text-4xl md:text-6xl font-bold mt-6 mb-5">
              <span className="text-white">Predictive </span>
              <span className="text-accent neon-text-accent">Markets</span>
            </h1>
            <p className="text-[#B8B8D0] text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Get funded to trade the outcome of real-world events. Buy Yes or No on live
              prediction markets, hit your target, and get paid when your read is right.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#pricing">
                <Button variant="neon-filled" size="xl" rounded="full" className="font-['Orbitron'] shadow-glow-accent">
                  VIEW PLANS &amp; PRICING
                </Button>
              </a>
              <a href="#how-it-works">
                <Button variant="neon" size="xl" rounded="full" className="font-['Orbitron']">
                  SEE HOW IT WORKS
                </Button>
              </a>
            </div>
            <p className="mt-6 text-sm text-[#B8B8D0]">
              Funded from <span className="text-accent font-bold">$98</span> &nbsp;•&nbsp; 10% target
              &nbsp;•&nbsp; up to 90% split
            </p>
          </motion.div>
        </div>
      </section>

      {/* What it is */}
      <section id="how-it-works" className="py-20 bg-[#0B1426]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-2xl mx-auto text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              What Is Prediction Market Trading?
            </h2>
            <p className="text-[#B8B8D0] text-lg">
              Instead of trading forex, crypto, or futures, you take positions on whether a specific
              event will happen. Each market asks a clear question and settles Yes or No. You trade a
              funded balance, and your progress, drawdown, and payouts are all tracked from account equity.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {concepts.map((c, i) => (
              <motion.div
                key={c.title}
                className="glassmorphism rounded-xl p-6 neon-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center mb-4">
                  <c.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-2">{c.title}</h3>
                <p className="text-[#B8B8D0] text-sm leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How a trade works */}
      <section className="py-20 bg-gradient-to-b from-[#0B1426] to-[#1A1A2E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-2xl mx-auto text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              How A Trade Works
            </h2>
            <p className="text-[#B8B8D0] text-lg">Follow a single position from open to resolution.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {tradeSteps.map((s, i) => (
              <motion.div
                key={s.step}
                className="glassmorphism rounded-xl p-6 flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center font-['Orbitron'] font-bold text-white">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-1">{s.title}</h3>
                  <p className="text-[#B8B8D0] text-sm leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Worked example */}
          <motion.div
            className="max-w-4xl mx-auto mt-8 glassmorphism neon-border rounded-xl p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-['Orbitron'] text-xs font-bold uppercase tracking-wider text-accent mb-3">
              Worked Example
            </p>
            <p className="text-white text-sm md:text-base leading-relaxed">
              You buy <span className="font-bold text-accent">$1,000 of Yes at 25¢</span> → <span className="font-bold">4,000 shares</span>.
              If the price climbs to 40¢, your position is worth about <span className="font-bold text-green-400">$1,600</span>.
              Hold to resolution and if it settles <span className="font-bold">Yes</span>, your shares pay{" "}
              <span className="font-bold text-green-400">$4,000</span>. If it settles <span className="font-bold">No</span>,
              they settle at <span className="font-bold text-yellow-400">$0</span> — which is exactly why the
              Max Profit Per Event cap keeps any single event in check.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-20 bg-[#0B1426]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-2xl mx-auto text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              The Rules, In Plain Terms
            </h2>
            <p className="text-[#B8B8D0] text-lg">
              One evaluation phase. Clear equity-based targets. No surprises.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {rules.map((r, i) => (
              <motion.div
                key={r.label}
                className="glassmorphism rounded-xl p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <p className="text-[#B8B8D0] text-xs">{r.label}</p>
                <p className="font-['Orbitron'] text-xl font-bold text-white mt-1">{r.value}</p>
                <p className="text-accent text-xs mt-1">{r.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-[#0B1426] to-[#1A1A2E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-2xl mx-auto text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              Plans &amp; Pricing
            </h2>
            <p className="text-[#B8B8D0] text-lg">
              One-time entry fee. Pass once, get funded, and keep up to 90%.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto glassmorphism neon-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-accent/20">
                  <th className="text-left px-6 py-4 font-['Orbitron'] text-xs uppercase tracking-wider text-accent">Account Size</th>
                  <th className="text-left px-6 py-4 font-['Orbitron'] text-xs uppercase tracking-wider text-accent">Profit Target</th>
                  <th className="text-right px-6 py-4 font-['Orbitron'] text-xs uppercase tracking-wider text-accent">Entry Fee</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((p) => (
                  <tr key={p.tier} className="border-b border-white/5 last:border-0">
                    <td className="px-6 py-4 text-white font-medium">{p.size}</td>
                    <td className="px-6 py-4 text-[#B8B8D0]">{p.target}</td>
                    <td className="px-6 py-4 text-right text-white font-bold font-['Orbitron']">${p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add-ons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mt-8">
            {addOns.map((a) => (
              <div key={a.title} className="glassmorphism rounded-xl p-6">
                <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-1">{a.title}</h3>
                <p className="text-accent text-sm font-medium mb-2">{a.cost}</p>
                <p className="text-[#B8B8D0] text-sm">{a.body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/trader-portal">
              <Button variant="neon-filled" size="xl" rounded="full" className="font-['Orbitron'] shadow-glow-accent">
                GET YOUR PREDICTION ACCOUNT
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Payout terms */}
      <section className="py-20 bg-[#0B1426]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.h2
            className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Getting Paid
          </motion.h2>
          <div className="glassmorphism rounded-xl p-6 space-y-4">
            {[
              { icon: Wallet, label: "Profit Split", value: "75% / 25% (90% with add-on)" },
              { icon: Clock, label: "First Payout", value: "7 days after funding" },
              { icon: Clock, label: "Payout Frequency", value: "Every 7 days" },
              { icon: CheckCircle, label: "Minimum Payout", value: "2% of starting balance" },
              { icon: ShieldCheck, label: "Withdrawal Rule", value: "Full withdrawal, no open positions" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <span className="flex items-center gap-3 text-[#B8B8D0] text-sm">
                  <row.icon className="h-4 w-4 text-accent" />
                  {row.label}
                </span>
                <span className="text-white font-medium text-sm text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why different */}
      <section className="py-20 bg-gradient-to-b from-[#0B1426] to-[#1A1A2E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white text-center max-w-2xl mx-auto mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Traders Are Switching To Prediction Markets
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {edges.map((e, i) => (
              <motion.div
                key={e.title}
                className="glassmorphism rounded-xl p-6 flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <e.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-2">{e.title}</h3>
                  <p className="text-[#B8B8D0] text-sm leading-relaxed">{e.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 cyberpunk-bg relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
            Ready To Trade The Outcome?
          </h2>
          <p className="text-[#B8B8D0] text-lg mb-8 max-w-xl mx-auto">
            Get a funded prediction market account from $98 and keep up to 90% of your profits.
          </p>
          <Link href="/trader-portal">
            <Button variant="neon-filled" size="xl" rounded="full" className="font-['Orbitron'] shadow-glow-accent">
              GET FUNDED NOW
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PredictiveMarkets;
