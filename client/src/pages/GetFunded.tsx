import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import A2PCompliantOptInForm from "@/components/A2PCompliantOptInForm";
import TrustpilotWidget from "@/components/TrustpilotWidget";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { trackEvent } from "@/lib/analytics";
import {
  CheckCircle, ArrowRight,
  Star, Users, TrendingUp, Zap, Info, Copy, Check,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type MarketKey = "forex" | "crypto" | "futures" | "equities";
type PlanKey = "one-step" | "two-step" | "three-step" | "four-phase" | "instant" | "instant-lite";

interface Tier {
  size: string;
  price: number;
  profitTarget: number | null;
  maxDrawdown: number;
  dailyDD?: number;
  leverage: string;
  profitSplit: string;
  timeLimit: string;
  recommended?: boolean;
  // Futures-specific
  contracts?: string;          // e.g. "1 Std / 15 Micro"
  phasePayouts?: [number, number, number, number]; // fixed $ per phase 1-4
}

interface Plan {
  key: PlanKey;
  label: string;
  badge?: string;
  description: string;
  highlight: string;
  tiers: Tier[];
}

interface Market {
  key: MarketKey;
  label: string;
  emoji: string;
  tagline: string;
  platforms: string[];
  plans: Plan[];
}

// ─── Data ────────────────────────────────────────────────────────────────────
const MARKETS: Market[] = [
  {
    key: "forex",
    label: "Forex",
    emoji: "💱",
    tagline: "Trade major, minor & exotic currency pairs with up to 1:50 leverage",
    platforms: ["MatchTrader", "DXtrade", "cTrader (International)"],
    plans: [
      {
        key: "one-step",
        label: "1-Step Challenge",
        badge: "Most Popular",
        description: "One evaluation phase to get funded. Hit 10% profit while staying within drawdown rules.",
        highlight: "Fastest path to a funded account",
        tiers: [
          { size: "$5K",   price: 48,   profitTarget: 10, maxDrawdown: 6, leverage: "1:20", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$10K",  price: 88,   profitTarget: 10, maxDrawdown: 6, leverage: "1:20", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$25K",  price: 228,  profitTarget: 10, maxDrawdown: 6, leverage: "1:20", profitSplit: "75–80%", timeLimit: "Unlimited", recommended: true },
          { size: "$50K",  price: 428,  profitTarget: 10, maxDrawdown: 6, leverage: "1:20", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$100K", price: 858,  profitTarget: 10, maxDrawdown: 6, leverage: "1:20", profitSplit: "75–80%", timeLimit: "Unlimited" },
        ],
      },
      {
        key: "two-step",
        label: "2-Step Challenge",
        description: "Two-phase evaluation — Phase 1 (10%) then Phase 2 (5%). More structured progression.",
        highlight: "More room with 8% drawdown",
        tiers: [
          { size: "$5K",   price: 68,   profitTarget: 10, maxDrawdown: 8, dailyDD: 4, leverage: "1:30", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$10K",  price: 118,  profitTarget: 10, maxDrawdown: 8, dailyDD: 4, leverage: "1:30", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$25K",  price: 268,  profitTarget: 10, maxDrawdown: 8, dailyDD: 4, leverage: "1:30", profitSplit: "75–80%", timeLimit: "Unlimited", recommended: true },
          { size: "$50K",  price: 508,  profitTarget: 10, maxDrawdown: 8, dailyDD: 4, leverage: "1:30", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$100K", price: 1028, profitTarget: 10, maxDrawdown: 8, dailyDD: 4, leverage: "1:30", profitSplit: "75–80%", timeLimit: "Unlimited" },
        ],
      },
      {
        key: "three-step",
        label: "3-Step Challenge",
        description: "Three evaluation phases with 5% target each. Ideal for conservative, methodical traders.",
        highlight: "Lower targets, easier to pass per phase",
        tiers: [
          { size: "$5K",   price: 48,  profitTarget: 5, maxDrawdown: 5, leverage: "1:20", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$10K",  price: 78,  profitTarget: 5, maxDrawdown: 5, leverage: "1:20", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$25K",  price: 188, profitTarget: 5, maxDrawdown: 5, leverage: "1:20", profitSplit: "75–80%", timeLimit: "Unlimited", recommended: true },
          { size: "$50K",  price: 338, profitTarget: 5, maxDrawdown: 5, leverage: "1:20", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$100K", price: 728, profitTarget: 5, maxDrawdown: 5, leverage: "1:20", profitSplit: "75–80%", timeLimit: "Unlimited" },
        ],
      },
      {
        key: "instant",
        label: "Instant Funding",
        badge: "No Evaluation",
        description: "Skip the evaluation entirely. Start trading funded capital today. KYC required before withdrawal.",
        highlight: "Trade immediately — no evaluation phase",
        tiers: [
          { size: "$5K",   price: 218,  profitTarget: null, maxDrawdown: 8, dailyDD: 5, leverage: "1:50", profitSplit: "80% (90% add-on)", timeLimit: "N/A" },
          { size: "$10K",  price: 428,  profitTarget: null, maxDrawdown: 8, dailyDD: 5, leverage: "1:50", profitSplit: "80% (90% add-on)", timeLimit: "N/A" },
          { size: "$25K",  price: 1198, profitTarget: null, maxDrawdown: 8, dailyDD: 5, leverage: "1:50", profitSplit: "80% (90% add-on)", timeLimit: "N/A", recommended: true },
          { size: "$50K",  price: 2588, profitTarget: null, maxDrawdown: 8, dailyDD: 5, leverage: "1:50", profitSplit: "80% (90% add-on)", timeLimit: "N/A" },
          { size: "$100K", price: 5198, profitTarget: null, maxDrawdown: 8, dailyDD: 5, leverage: "1:50", profitSplit: "80% (90% add-on)", timeLimit: "N/A" },
        ],
      },
      {
        key: "instant-lite",
        label: "Instant Funding Lite",
        badge: "Best Price",
        description: "Affordable instant funding with tighter risk rules. Includes 25% consistency requirement and 3% profit buffer.",
        highlight: "Lowest cost no-evaluation option",
        tiers: [
          { size: "$5K",   price: 70,  profitTarget: null, maxDrawdown: 5, dailyDD: 3, leverage: "1:50", profitSplit: "80% (90% add-on)", timeLimit: "N/A" },
          { size: "$10K",  price: 120, profitTarget: null, maxDrawdown: 5, dailyDD: 3, leverage: "1:50", profitSplit: "80% (90% add-on)", timeLimit: "N/A" },
          { size: "$25K",  price: 225, profitTarget: null, maxDrawdown: 5, dailyDD: 3, leverage: "1:50", profitSplit: "80% (90% add-on)", timeLimit: "N/A", recommended: true },
          { size: "$50K",  price: 350, profitTarget: null, maxDrawdown: 5, dailyDD: 3, leverage: "1:50", profitSplit: "80% (90% add-on)", timeLimit: "N/A" },
          { size: "$100K", price: 650, profitTarget: null, maxDrawdown: 5, dailyDD: 3, leverage: "1:50", profitSplit: "80% (90% add-on)", timeLimit: "N/A" },
        ],
      },
    ],
  },
  {
    key: "crypto",
    label: "Crypto",
    emoji: "₿",
    tagline: "Trade Bitcoin, Ethereum & more 24/7 including weekends with up to 5:1 leverage",
    platforms: ["MatchTrader", "DXtrade"],
    plans: [
      {
        key: "one-step",
        label: "1-Step Challenge",
        badge: "Most Popular",
        description: "One evaluation phase — hit 9% profit with a 6% max drawdown. Weekend trading allowed.",
        highlight: "Trade crypto 24/7, weekends included",
        tiers: [
          { size: "$5K",   price: 58,   profitTarget: 9, maxDrawdown: 6, dailyDD: 3, leverage: "5:1 BTC/ETH", profitSplit: "90%", timeLimit: "Unlimited" },
          { size: "$10K",  price: 98,   profitTarget: 9, maxDrawdown: 6, dailyDD: 3, leverage: "5:1 BTC/ETH", profitSplit: "90%", timeLimit: "Unlimited" },
          { size: "$25K",  price: 258,  profitTarget: 9, maxDrawdown: 6, dailyDD: 3, leverage: "5:1 BTC/ETH", profitSplit: "90%", timeLimit: "Unlimited", recommended: true },
          { size: "$50K",  price: 538,  profitTarget: 9, maxDrawdown: 6, dailyDD: 3, leverage: "5:1 BTC/ETH", profitSplit: "90%", timeLimit: "Unlimited" },
          { size: "$100K", price: 1078, profitTarget: 9, maxDrawdown: 6, dailyDD: 3, leverage: "5:1 BTC/ETH", profitSplit: "90%", timeLimit: "Unlimited" },
        ],
      },
      {
        key: "two-step",
        label: "2-Step Challenge",
        description: "Two evaluation phases with more generous drawdown. Phase 1: 6% target. Phase 2: 9% target.",
        highlight: "9% drawdown — most breathing room",
        tiers: [
          { size: "$5K",   price: 48,  profitTarget: 6, maxDrawdown: 9, dailyDD: 3, leverage: "5:1 BTC/ETH", profitSplit: "90%", timeLimit: "Unlimited" },
          { size: "$10K",  price: 88,  profitTarget: 6, maxDrawdown: 9, dailyDD: 3, leverage: "5:1 BTC/ETH", profitSplit: "90%", timeLimit: "Unlimited" },
          { size: "$25K",  price: 238, profitTarget: 6, maxDrawdown: 9, dailyDD: 3, leverage: "5:1 BTC/ETH", profitSplit: "90%", timeLimit: "Unlimited", recommended: true },
          { size: "$50K",  price: 458, profitTarget: 6, maxDrawdown: 9, dailyDD: 3, leverage: "5:1 BTC/ETH", profitSplit: "90%", timeLimit: "Unlimited" },
          { size: "$100K", price: 938, profitTarget: 6, maxDrawdown: 9, dailyDD: 3, leverage: "5:1 BTC/ETH", profitSplit: "90%", timeLimit: "Unlimited" },
        ],
      },
    ],
  },
  {
    key: "futures",
    label: "Futures",
    emoji: "📈",
    tagline: "Trade CME futures through 4 phases — get paid after each one, then graduate to a Live Funded account",
    platforms: ["DXtrade Futures", "Volumetrica"],
    plans: [
      {
        key: "four-phase",
        label: "4-Phase Funded Plan",
        badge: "Paid Every Phase",
        description: "Complete 4 phases, each with a 9% profit target and 5% trailing max loss (EOD). Receive a real payout after each phase. Graduate to a Live Funded Futures account with 90% profit split.",
        highlight: "Real payouts start at Phase 1 — not after you finish",
        tiers: [
          {
            size: "$25K",  price: 298,
            profitTarget: 9, maxDrawdown: 5,
            leverage: "1 Std / 15 Micro",
            profitSplit: "90% (Live Funded)",
            timeLimit: "60 days/phase",
            contracts: "1 Std / 15 Micro",
            phasePayouts: [500, 750, 750, 1500],
            recommended: true,
          },
          {
            size: "$50K",  price: 598,
            profitTarget: 9, maxDrawdown: 5,
            leverage: "3 Std / 30 Micro",
            profitSplit: "90% (Live Funded)",
            timeLimit: "60 days/phase",
            contracts: "3 Std / 30 Micro",
            phasePayouts: [1000, 1500, 1500, 3000],
          },
          {
            size: "$100K", price: 1098,
            profitTarget: 9, maxDrawdown: 5,
            leverage: "6 Std / 60 Micro",
            profitSplit: "90% (Live Funded)",
            timeLimit: "60 days/phase",
            contracts: "6 Std / 60 Micro",
            phasePayouts: [2000, 3000, 3000, 6000],
          },
          {
            size: "$150K", price: 1758,
            profitTarget: 9, maxDrawdown: 5,
            leverage: "9 Std / 90 Micro",
            profitSplit: "90% (Live Funded)",
            timeLimit: "60 days/phase",
            contracts: "9 Std / 90 Micro",
            phasePayouts: [3000, 4500, 4500, 9000],
          },
        ],
      },
    ],
  },
  {
    key: "equities",
    label: "Equities",
    emoji: "🏛️",
    tagline: "Trade S&P 100 stocks within a single session (9:30–15:55 ET) — no overnight risk",
    platforms: ["GooeyPro"],
    plans: [
      {
        key: "one-step",
        label: "Single Session Challenge",
        badge: "Unique",
        description: "Trade S&P 100 equity products with 2:1 leverage. All positions open and close within the same session. No overnight or weekend holds.",
        highlight: "No overnight risk — perfect for intraday traders",
        tiers: [
          { size: "$5K",   price: 48,   profitTarget: 10, maxDrawdown: 3, leverage: "2:1", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$10K",  price: 88,   profitTarget: 10, maxDrawdown: 3, leverage: "2:1", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$25K",  price: 228,  profitTarget: 10, maxDrawdown: 3, leverage: "2:1", profitSplit: "75–80%", timeLimit: "Unlimited", recommended: true },
          { size: "$50K",  price: 428,  profitTarget: 10, maxDrawdown: 3, leverage: "2:1", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$100K", price: 858,  profitTarget: 10, maxDrawdown: 3, leverage: "2:1", profitSplit: "75–80%", timeLimit: "Unlimited" },
          { size: "$200K", price: 1828, profitTarget: 10, maxDrawdown: 3, leverage: "2:1", profitSplit: "75–80%", timeLimit: "Unlimited" },
        ],
      },
    ],
  },
];

const PLATFORMS = [
  { name: "MatchTrader",      markets: "Forex, Crypto", color: "text-blue-400" },
  { name: "DXtrade",          markets: "Forex, Crypto, Futures", color: "text-purple-400" },
  { name: "cTrader",          markets: "Forex (International)", color: "text-cyan-400" },
  { name: "Volumetrica",      markets: "Futures", color: "text-orange-400" },
  { name: "GooeyPro",         markets: "Single Session Equities", color: "text-green-400" },
];

const TRUST = [
  { icon: Users,      stat: "500+", label: "Funded Traders" },
  { icon: TrendingUp, stat: "90%",  label: "Max Profit Split" },
  { icon: Star,       stat: "$48",  label: "Starting at" },
  { icon: Zap,        stat: "4",    label: "Asset Classes" },
];

const STEPS = [
  { num: "01", title: "Choose Your Market",  desc: "Forex, Crypto, Futures, or Single Session Equities — pick what you know best." },
  { num: "02", title: "Pick Your Plan",       desc: "Choose your challenge type and account size. Evaluation, Instant, or Instant Lite." },
  { num: "03", title: "Learn the Rules",      desc: "Clear profit targets and drawdown limits. No hidden rules, no surprises." },
  { num: "04", title: "Pass & Get Funded",    desc: "Hit your target, stay within drawdown. We fund your live account." },
  { num: "05", title: "Trade & Get Paid",     desc: "Keep up to 90% of profits. Request payouts on demand, scale your account." },
];

// ─── Coupon Copy Block ────────────────────────────────────────────────────────
function CouponBlock() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText("UNITY20").then(() => {
      setCopied(true);
      trackEvent("lp_coupon_copy");
      setTimeout(() => setCopied(false), 2500);
    });
  }, []);
  return (
    <div className="flex items-center justify-between gap-3 bg-accent/8 border border-accent/30 rounded-xl px-5 py-4 max-w-sm mx-auto">
      <div>
        <p className="text-[#B8B8D0] text-[10px] uppercase tracking-widest font-bold mb-0.5">Best deal — use code</p>
        <p className="font-['Orbitron'] text-xl font-bold text-accent tracking-widest">UNITY20</p>
      </div>
      <button
        onClick={copy}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition-all font-['Orbitron'] ${
          copied
            ? "bg-green-500/20 border border-green-500/40 text-green-400"
            : "bg-accent/15 border border-accent/30 text-accent hover:bg-accent hover:text-[#0F0F1A]"
        }`}
      >
        {copied ? <><Check className="h-3.5 w-3.5" /> COPIED</> : <><Copy className="h-3.5 w-3.5" /> COPY</>}
      </button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseSize(size: string): number {
  const s = size.replace(/[$,]/g, "");
  if (s.endsWith("K")) return parseFloat(s) * 1_000;
  if (s.endsWith("M")) return parseFloat(s) * 1_000_000;
  return parseFloat(s);
}

function fmt(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

// ─── Tier Card (dense — dollar amounts, accurate futures payouts) ─────────────
function TierCard({ tier, isMultiPhase = false }: { tier: Tier; isMultiPhase?: boolean }) {
  const sizeNum = parseSize(tier.size);
  const targetDollars   = tier.profitTarget !== null ? fmt(sizeNum * tier.profitTarget / 100) : null;
  const drawdownDollars = fmt(sizeNum * tier.maxDrawdown / 100);
  const dailyDollars    = tier.dailyDD ? fmt(sizeNum * tier.dailyDD / 100) : null;
  const totalPayout     = tier.phasePayouts ? tier.phasePayouts.reduce((a, b) => a + b, 0) : null;

  return (
    <motion.div
      layout
      className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${
        tier.recommended
          ? "border-accent/50 bg-accent/5 shadow-[0_0_20px_rgba(0,255,255,0.08)]"
          : "border-white/8 bg-white/2 hover:border-white/15"
      }`}
    >
      {tier.recommended && (
        <span className="self-start bg-accent text-[#0F0F1A] text-[10px] font-bold px-2.5 py-0.5 rounded-full font-['Orbitron'] tracking-wide">
          RECOMMENDED
        </span>
      )}

      {/* Price header */}
      <div>
        <p className="font-['Orbitron'] text-lg font-bold text-white">{tier.size}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-[#B8B8D0] text-sm line-through">${tier.price}</span>
          <span className="text-accent text-2xl font-bold leading-none">${Math.round(tier.price * 0.8)}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">20% OFF</span>
          <span className="text-[#B8B8D0] text-[10px]">one-time fee</span>
        </div>
      </div>

      {/* Futures: phase-by-phase payout breakdown */}
      {tier.phasePayouts && (
        <div className="bg-green-500/8 border border-green-500/20 rounded-lg p-2.5 space-y-1">
          {tier.phasePayouts.map((p, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-[#B8B8D0]">Phase {i + 1} payout</span>
              <span className={i === 3 ? "text-green-400 font-bold" : "text-white font-medium"}>${p.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between text-xs border-t border-green-500/20 pt-1 mt-1">
            <span className="text-green-400 font-bold">Total earned</span>
            <span className="text-green-400 font-bold">${totalPayout!.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* All specs inline */}
      <div className="space-y-1.5 border-t border-white/8 pt-3">
        {targetDollars !== null ? (
          <div className="flex justify-between text-xs">
            <span className="text-[#B8B8D0]">{isMultiPhase ? "Goal / Phase" : "Profit Goal"}</span>
            <span className="text-white font-medium">{targetDollars}</span>
          </div>
        ) : (
          <div className="flex justify-between text-xs">
            <span className="text-[#B8B8D0]">Evaluation</span>
            <span className="text-green-400 font-medium">None</span>
          </div>
        )}

        <div className="flex justify-between text-xs">
          <span className="text-[#B8B8D0]">{isMultiPhase ? "Max Trailing Loss (EOD)" : "Max Drawdown"}</span>
          <span className="text-white font-medium">{drawdownDollars}</span>
        </div>

        {/* Only show daily loss if it applies (not for futures) */}
        {!isMultiPhase && (
          <div className="flex justify-between text-xs">
            <span className="text-[#B8B8D0]">Daily Loss Limit</span>
            <span className={dailyDollars ? "text-white font-medium" : "text-[#B8B8D0] font-medium"}>
              {dailyDollars ?? "—"}
            </span>
          </div>
        )}

        {tier.contracts && (
          <div className="flex justify-between text-xs">
            <span className="text-[#B8B8D0]">Max Contracts</span>
            <span className="text-white font-medium">{tier.contracts}</span>
          </div>
        )}

        <div className="flex justify-between text-xs">
          <span className="text-[#B8B8D0]">{isMultiPhase ? "Time / Phase" : "Time Limit"}</span>
          <span className="text-white font-medium">{tier.timeLimit}</span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-[#B8B8D0]">Profit Split</span>
          <span className="text-green-400 font-medium">{tier.profitSplit}</span>
        </div>
      </div>

      <a href="#get-started" onClick={() => trackEvent("lp_tier_click", { size: tier.size, price: tier.price })}>
        <Button
          variant={tier.recommended ? "neon-filled" : "neon"}
          size="sm"
          rounded="full"
          className="w-full font-['Orbitron'] text-xs mt-auto"
        >
          Get Started →
        </Button>
      </a>
    </motion.div>
  );
}

// ─── Futures Full Payout Journey ─────────────────────────────────────────────
const FUTURES_PAYOUTS = [
  { size: "$25K",  phases: [500,  750,  750,  1500], total: 3500  },
  { size: "$50K",  phases: [1000, 1500, 1500, 3000], total: 7000  },
  { size: "$100K", phases: [2000, 3000, 3000, 6000], total: 14000 },
  { size: "$150K", phases: [3000, 4500, 4500, 9000], total: 21000 },
];

function FuturesLiveRules() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 space-y-6"
    >
      {/* ── Part 1: Payout by plan ── */}
      <div className="rounded-xl border border-accent/25 bg-accent/4 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center gap-3">
          <span className="text-xl">💰</span>
          <div>
            <p className="font-['Orbitron'] text-sm font-bold text-white">What You Earn — Phase by Phase</p>
            <p className="text-[#B8B8D0] text-xs mt-0.5">Fixed cash payouts after completing each phase. You get paid before moving to the next one.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/8 bg-white/2">
                <th className="text-left text-[#B8B8D0] px-4 py-3 font-medium">Plan Size</th>
                <th className="text-center text-[#B8B8D0] px-3 py-3 font-medium">Phase 1</th>
                <th className="text-center text-[#B8B8D0] px-3 py-3 font-medium">Phase 2</th>
                <th className="text-center text-[#B8B8D0] px-3 py-3 font-medium">Phase 3</th>
                <th className="text-center text-[#B8B8D0] px-3 py-3 font-medium">Phase 4</th>
                <th className="text-center text-green-400 px-4 py-3 font-bold">Total Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {FUTURES_PAYOUTS.map((row, i) => (
                <tr key={row.size} className={i % 2 === 0 ? "bg-white/1" : ""}>
                  <td className="px-4 py-3 font-['Orbitron'] text-white font-bold">{row.size}</td>
                  {row.phases.map((p, pi) => (
                    <td key={pi} className="px-3 py-3 text-center text-white font-medium">
                      ${p.toLocaleString()}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-green-400 font-bold font-['Orbitron']">
                    ${row.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-5 py-3 text-[#B8B8D0] text-[11px] border-t border-white/8">
          Each payout must be requested and completed before advancing to the next phase. 25% consistency rule applies per phase.
        </p>
      </div>

      {/* ── Part 2: The full journey ── */}
      <div className="rounded-xl border border-primary/25 bg-primary/4 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center gap-3">
          <span className="text-xl">🚀</span>
          <div>
            <p className="font-['Orbitron'] text-sm font-bold text-white">Your Full Journey — Phase 1 Through Live Funded</p>
            <p className="text-[#B8B8D0] text-xs mt-0.5">Here's exactly what happens from the moment you start to when you're getting paid on repeat.</p>
          </div>
        </div>
        <div className="px-5 py-5 space-y-3">
          {[
            {
              marker: "Phases 1–4",
              color: "text-accent",
              bg: "bg-accent/10 border-accent/20",
              title: "Hit your profit goal. Get paid. Move up.",
              body: "Each phase has a 9% profit target on your account size. Hit it while staying within the 5% trailing max loss and meeting the 25% consistency rule. Once you do, you request that phase's payout — the cash amounts are in the table above. Then you move to the next phase. 60 days to complete each one.",
            },
            {
              marker: "Phase 4 Complete",
              color: "text-yellow-400",
              bg: "bg-yellow-400/8 border-yellow-400/20",
              title: "You've graduated. Time to go live.",
              body: "After collecting your Phase 4 payout you transition out of evaluation entirely. No more targets, no more phases. You're now trading on a Live Funded Futures account — real money, real markets, real payouts.",
            },
            {
              marker: "Live Funded",
              color: "text-green-400",
              bg: "bg-green-500/8 border-green-500/20",
              title: "Trade. Stack 5 profitable days. Get paid. Repeat.",
              body: "To request a payout on your live account you need 5 qualifying profitable trading days — each day must show at least $150 in profit. The days don't need to be back-to-back. Once you have your 5 days, request your payout and keep 90% of the profits. After the payout processes, the 5-day clock resets and you start again. No cap on how many times you can request — as long as you keep hitting your days, you keep getting paid.",
            },
            {
              marker: "Stay Active",
              color: "text-[#B8B8D0]",
              bg: "bg-white/3 border-white/10",
              title: "One trade every 7 days keeps your account open.",
              body: "There are no ongoing profit requirements or time limits on the live account. Just make sure you place at least one executed trade every 7 calendar days to keep your account active.",
            },
          ].map(step => (
            <div key={step.marker} className={`rounded-lg border p-4 ${step.bg}`}>
              <div className="flex items-start gap-3">
                <span className={`font-['Orbitron'] text-[10px] font-bold ${step.color} shrink-0 mt-0.5 uppercase tracking-widest`}>
                  {step.marker}
                </span>
              </div>
              <p className="text-white text-xs font-bold mt-1.5 mb-1">{step.title}</p>
              <p className="text-[#B8B8D0] text-xs leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GetFunded() {
  const [activeMarket, setActiveMarket] = useState<MarketKey>("futures");
  const [activePlan, setActivePlan] = useState<PlanKey>("one-step");

  const market = MARKETS.find(m => m.key === activeMarket)!;
  const plan = market.plans.find(p => p.key === activePlan) ?? market.plans[0];

  // When market changes, reset to first available plan
  useEffect(() => {
    setActivePlan(market.plans[0].key);
  }, [activeMarket]);

  useEffect(() => {
    trackEvent("lp_get_funded_view");
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({ event: "landing_page_view", page: "get-funded" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">

      {/* ── Minimal sticky header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0F0F1A]/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <span className="font-['Orbitron'] text-lg font-bold text-white tracking-wider cursor-pointer">
              HYBRID <span className="text-accent neon-text-accent">FUNDING</span>
            </span>
          </Link>
          <a href="#get-started" onClick={() => trackEvent("lp_header_cta_click")}
            className="font-['Orbitron'] text-xs font-bold px-4 py-2 rounded-full border border-accent text-accent hover:bg-accent hover:text-[#0F0F1A] transition-all">
            GET STARTED
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-10 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block bg-accent/10 border border-accent/20 text-accent text-xs font-bold px-4 py-1.5 rounded-full font-['Orbitron'] tracking-widest mb-6">
              PROP FUNDING — FOREX · CRYPTO · FUTURES · EQUITIES
            </span>
            <h1 className="font-['Orbitron'] text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
              Get Funded.<br />
              <span className="text-primary neon-text-primary">Trade Capital.</span>{" "}
              <span className="text-accent neon-text-accent">Keep 90%.</span>
            </h1>
            <p className="text-[#B8B8D0] text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              Pass a simple evaluation or get instant funding — trade Hybrid Funding's capital across 4 markets on 5 platforms, starting at just $48.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <a href="#choose-program" onClick={() => trackEvent("lp_hero_primary_cta")}>
                <Button variant="neon-filled" size="xl" rounded="full" className="font-['Orbitron'] shadow-glow-accent">
                  CHOOSE MY PROGRAM <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="#how-it-works" onClick={() => trackEvent("lp_hero_secondary_cta")}>
                <Button variant="neon" size="xl" rounded="full" className="font-['Orbitron']">
                  HOW IT WORKS
                </Button>
              </a>
            </div>
            {/* Coupon code — visible above the fold */}
            <CouponBlock />
          </motion.div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="py-8 border-y border-white/5 bg-white/2">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {TRUST.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                  <Icon className="h-5 w-5 text-accent mx-auto mb-1" />
                  <p className="font-['Orbitron'] text-2xl font-bold text-white">{item.stat}</p>
                  <p className="text-[#B8B8D0] text-xs">{item.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5-Step Journey ── */}
      <section id="how-it-works" className="py-20 bg-[#0B1426]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-accent font-['Orbitron'] text-xs tracking-widest uppercase mb-3 block">Simple Process</span>
            <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-bold text-white">
              Your Path to a <span className="text-primary neon-text-primary">Funded Account</span>
            </h2>
          </div>
          <div className="relative">
            {/* connector line */}
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="text-center relative"
                >
                  <div className="w-14 h-14 rounded-full border border-accent/40 bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <span className="font-['Orbitron'] text-accent font-bold text-sm">{step.num}</span>
                  </div>
                  <h3 className="font-['Orbitron'] text-sm font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-[#B8B8D0] text-xs leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Program Selector ── */}
      <section id="choose-program" className="py-20 bg-[#0F0F1A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-accent font-['Orbitron'] text-xs tracking-widest uppercase mb-3 block">Step 1 of 2</span>
            <h2 className="font-['Orbitron'] text-3xl sm:text-4xl font-bold text-white mb-3">
              Choose Your <span className="text-accent neon-text-accent">Market</span>
            </h2>
            <p className="text-[#B8B8D0] max-w-xl mx-auto text-sm">Pick the asset class you trade best. Each market has its own rules, platforms, and program types.</p>
          </div>

          {/* Market tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {MARKETS.map(m => (
              <button
                key={m.key}
                onClick={() => { setActiveMarket(m.key); trackEvent("lp_market_tab", { market: m.key }); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-['Orbitron'] text-sm font-bold transition-all border ${
                  activeMarket === m.key
                    ? "bg-accent text-[#0F0F1A] border-accent shadow-glow-accent"
                    : "bg-transparent border-white/15 text-[#B8B8D0] hover:border-accent/40 hover:text-white"
                }`}
              >
                <span>{m.emoji}</span> {m.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeMarket}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Market tagline + platforms */}
              <div className="glassmorphism rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-[#B8B8D0] text-sm">{market.tagline}</p>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {market.platforms.map(p => (
                    <span key={p} className="bg-white/5 border border-white/10 text-white text-xs px-3 py-1 rounded-full">{p}</span>
                  ))}
                </div>
              </div>

              {/* Plan type tabs */}
              {market.plans.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {market.plans.map(p => (
                    <button
                      key={p.key}
                      onClick={() => { setActivePlan(p.key); trackEvent("lp_plan_tab", { plan: p.key }); }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        activePlan === p.key
                          ? "bg-primary/20 border-primary/50 text-white"
                          : "bg-transparent border-white/10 text-[#B8B8D0] hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {p.label}
                      {p.badge && (
                        <span className="bg-accent/20 text-accent text-[10px] font-bold px-1.5 py-0.5 rounded-full">{p.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected plan info */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start gap-3 mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium mb-0.5">{plan.label} — {plan.highlight}</p>
                      <p className="text-[#B8B8D0] text-xs">{plan.description}</p>
                    </div>
                  </div>

                  {/* Tier cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {plan.tiers.map(tier => (
                      <TierCard key={tier.size} tier={tier} isMultiPhase={plan.key === "four-phase"} />
                    ))}
                  </div>

                  {/* Futures: Live Funded explainer shown after tier cards */}
                  {activeMarket === "futures" && plan.key === "four-phase" && (
                    <FuturesLiveRules />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          <div className="text-center mt-8">
            <Link href="/challenges">
              <span className="text-[#B8B8D0] text-sm hover:text-accent transition-colors cursor-pointer">
                See full challenge page with all add-ons & comparison →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Platforms ── */}
      <section className="py-16 bg-[#0B1426]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-['Orbitron'] text-2xl font-bold text-white mb-2">
              Trade on <span className="text-primary neon-text-primary">5 Professional Platforms</span>
            </h2>
            <p className="text-[#B8B8D0] text-sm">Industry-standard platforms — use the one you already know</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {PLATFORMS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
                className="glassmorphism rounded-xl p-4 text-center border border-white/5 hover:border-accent/20 transition-all"
              >
                <p className={`font-['Orbitron'] font-bold text-sm mb-1 ${p.color}`}>{p.name}</p>
                <p className="text-[#B8B8D0] text-xs">{p.markets}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Hybrid Funding ── */}
      <section className="py-16 bg-[#0F0F1A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="font-['Orbitron'] text-2xl font-bold text-white text-center mb-8">
            Why Traders Choose <span className="text-accent neon-text-accent">Hybrid Funding</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Fair, transparent rules — no hidden tricks",
              "No time limit on most evaluation programs",
              "Profit splits up to 90% after funding",
              "5 platforms across 4 asset classes",
              "Payouts on demand — no lock-in period",
              "Instant Funding options — no evaluation needed",
              "4 challenge types to match every trading style",
              "25% consistency rule protects your account",
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/2 border border-white/5"
              >
                <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <span className="text-[#B8B8D0] text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Opt-In Form ── */}
      <section id="get-started" className="py-20 bg-gradient-to-b from-[#0B1426] to-[#1A1A2E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-xl">
          <div className="text-center mb-6">
            <h2 className="font-['Orbitron'] text-3xl font-bold text-white mb-3">
              Ready to Get <span className="text-accent neon-text-accent">Funded?</span>
            </h2>
            <p className="text-[#B8B8D0] text-sm mb-5">
              Enter your details — our team will help you choose the right program and walk you through your first challenge.
            </p>
            {/* Trustpilot widget */}
            <div className="max-w-xs mx-auto mb-4">
              <TrustpilotWidget />
            </div>
            {/* Coupon reminder above form */}
            <CouponBlock />
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
      </section>

      {/* ── Exit Intent Popup ── */}
      <ExitIntentPopup />

      {/* ── Footer ── */}
      <footer className="py-10 bg-[#0F0F1A]/90 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <p className="text-[#B8B8D0] text-xs text-center leading-relaxed">
            <strong className="text-white">DISCLAIMER:</strong> Hybrid Funding is an affiliate of Prop Account, LLC. All funding assessments are provided by Prop Account, LLC and all assessment fees are paid to Prop Account, LLC. If you qualify for a Funded Account, you will be required to enter into a Trader Agreement with Prop Account LC. For complete terms, visit our{" "}
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
