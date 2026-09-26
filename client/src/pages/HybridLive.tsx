import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Activity, BarChart3, Clock3, ExternalLink, Radio, ReceiptText, ShieldCheck, Swords, Users } from "lucide-react";
import SEO from "@/components/SEO";

type ActivityPayload = {
  events: { type: string; label: string; source: string; at: string | null }[];
  regions: { state: string; count: number }[];
  recentCount?: number;
};

type Payout = {
  id: string;
  displayName: string;
  amount: number;
  paidAt: string;
  program: string;
  proofUrl?: string;
};

type PayoutPayload = {
  payouts: Payout[];
  count: number;
  total: number;
  updatedAt: string;
};

type TradeHousePayload = {
  standings: { id: string; tradeCount: number; verified: boolean; status: string }[];
  updatedAt: string;
};

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);

const HybridLive: React.FC = () => {
  const [activity, setActivity] = useState<ActivityPayload>({ events: [], regions: [], recentCount: 0 });
  const [payouts, setPayouts] = useState<PayoutPayload>({ payouts: [], count: 0, total: 0, updatedAt: "" });
  const [tradeHouse, setTradeHouse] = useState<TradeHousePayload>({ standings: [], updatedAt: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [activityRes, payoutRes, tradeRes] = await Promise.all([
          fetch("/api/activity", { cache: "no-store" }),
          fetch("/api/public-payouts", { cache: "no-store" }),
          fetch("/api/tradehouse/leaderboard", { cache: "no-store" }),
        ]);
        const [activityData, payoutData, tradeData] = await Promise.all([
          activityRes.ok ? activityRes.json() : Promise.resolve({ events: [], regions: [], recentCount: 0 }),
          payoutRes.ok ? payoutRes.json() : Promise.resolve({ payouts: [], count: 0, total: 0, updatedAt: "" }),
          tradeRes.ok ? tradeRes.json() : Promise.resolve({ standings: [], updatedAt: "" }),
        ]);
        if (mounted) {
          setActivity(activityData);
          setPayouts(payoutData);
          setTradeHouse(tradeData);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const timer = window.setInterval(load, 30000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const tradeStats = useMemo(() => ({
    contestants: tradeHouse.standings.length,
    trades: tradeHouse.standings.reduce((sum, row) => sum + (row.tradeCount || 0), 0),
    verified: tradeHouse.standings.filter((row) => row.verified).length,
  }), [tradeHouse]);

  return (
    <div className="min-h-screen bg-[#08101c] text-white">
      <SEO
        title="Hybrid Live — Verified Hybrid Funding Activity"
        description="A public proof page for Hybrid Funding showing verified Trade House feeds, public payout records, and privacy-safe community activity."
        path="/live"
      />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_45%)]">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 font-['Orbitron'] text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
              <Radio className="h-3.5 w-3.5" /> Public Proof Layer
            </div>
            <h1 className="mt-5 font-['Orbitron'] text-4xl font-black sm:text-5xl lg:text-6xl">HYBRID <span className="text-cyan-300">LIVE</span></h1>
            <p className="mx-auto mt-5 max-w-3xl text-slate-300">
              No placeholder success numbers. This page is designed to publish only data we can tie to a real Hybrid system, public dashboard, or confirmed payout record.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Community joins · 30D", activity.recentCount ?? 0, Users],
              ["Trade House contestants", tradeStats.contestants, Swords],
              ["Verified battle feeds", tradeStats.verified, ShieldCheck],
              ["Trades monitored", tradeStats.trades, Activity],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-center">
                <Icon className="mx-auto h-5 w-5 text-cyan-300" />
                <div className="mt-2 font-['Orbitron'] text-2xl font-black">{loading ? "…" : value as number}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">{label as string}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-[#0d1626] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-['Orbitron'] text-[10px] uppercase tracking-[0.18em] text-cyan-300">Verified Payout Ledger</div>
                  <h2 className="mt-2 font-['Orbitron'] text-2xl font-black">Public payouts</h2>
                </div>
                <ReceiptText className="h-7 w-7 text-cyan-300" />
              </div>

              {payouts.payouts.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-black/10 p-8 text-center">
                  <div className="font-['Orbitron'] text-sm font-bold text-slate-300">PAYOUT FEED READY FOR VERIFIED RECORDS</div>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                    We will not fabricate a payout total. Confirmed payout records appear here once the back-office proof feed is connected.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] p-4">
                    <div><div className="text-[10px] uppercase tracking-wider text-slate-500">Verified payouts</div><div className="mt-1 font-['Orbitron'] text-xl font-black">{payouts.count}</div></div>
                    <div><div className="text-[10px] uppercase tracking-wider text-slate-500">Total published</div><div className="mt-1 font-['Orbitron'] text-xl font-black text-cyan-200">{usd(payouts.total)}</div></div>
                  </div>
                  {payouts.payouts.slice(0, 8).map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <div>
                        <div className="font-semibold">{payout.displayName}</div>
                        <div className="mt-1 text-xs text-slate-500">{payout.program} · {new Date(payout.paidAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-300">{usd(payout.amount)}</div>
                        {payout.proofUrl && <a href={payout.proofUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-cyan-300">Proof <ExternalLink className="h-3 w-3" /></a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-[#0d1626] p-6">
                <BarChart3 className="h-7 w-7 text-emerald-300" />
                <h3 className="mt-4 font-['Orbitron'] text-xl font-black">Trade House feed</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Official competition standings come from Hybrid-issued simulated accounts and their public dashboard links.
                </p>
                <Link href="/tradehouse" className="mt-5 inline-flex items-center gap-2 font-['Orbitron'] text-xs font-bold text-emerald-300">
                  OPEN TRADE HOUSE <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#0d1626] p-6">
                <Clock3 className="h-7 w-7 text-cyan-300" />
                <h3 className="mt-4 font-['Orbitron'] text-xl font-black">Proof before promotion</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Marketing claims should come from the same verified sources powering this page. If a number is not connected yet, it stays unpublished.
                </p>
              </div>
            </div>
          </div>

          {activity.regions.length > 0 && (
            <div className="mx-auto mt-6 max-w-6xl rounded-3xl border border-white/10 bg-[#0d1626] p-6">
              <div className="font-['Orbitron'] text-[10px] uppercase tracking-[0.18em] text-cyan-300">Community activity</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {activity.regions.map((region) => (
                  <span key={region.state} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                    {region.state}: {region.count} recent joins
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HybridLive;
