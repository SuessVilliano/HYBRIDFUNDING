import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Activity, ExternalLink, Radio, ShieldCheck, Swords, Trophy, Users, Zap } from "lucide-react";
import SEO from "@/components/SEO";

type Standing = {
  id: string;
  name: string;
  rank: number;
  accountId: string;
  dashboardUrl: string;
  startingBalance: number;
  balance: number;
  equity: number;
  pnl: number;
  returnPct: number;
  tradeCount: number;
  wins: number;
  losses: number;
  biggestWin: number;
  openPositionCount: number;
  lastTradeAt: string | null;
  fetchedAt: string | null;
  verified: boolean;
  status: "live" | "flat" | "unavailable";
};

type LeaderboardPayload = {
  season: {
    name: string;
    status: "forming" | "live" | "complete";
    accountType: "simulated";
    refreshSeconds: number;
    endsAt: string | null;
    dataPolicy: string;
  };
  standings: Standing[];
  updatedAt: string;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);

const TradeHouse: React.FC = () => {
  const [data, setData] = useState<LeaderboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    const load = async () => {
      try {
        const res = await fetch("/api/tradehouse/leaderboard", { cache: "no-store" });
        if (!res.ok) throw new Error("feed unavailable");
        const next = (await res.json()) as LeaderboardPayload;
        if (active) {
          setData(next);
          setFeedError(false);
          setLoading(false);
        }
      } catch {
        if (active) {
          setFeedError(true);
          setLoading(false);
        }
      } finally {
        if (active) timer = window.setTimeout(load, 15000);
      }
    };

    load();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const totals = useMemo(() => {
    const standings = data?.standings ?? [];
    return {
      traders: standings.length,
      trades: standings.reduce((sum, trader) => sum + trader.tradeCount, 0),
      live: standings.filter((trader) => trader.status === "live").length,
      verified: standings.filter((trader) => trader.verified).length,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-[#070b13] text-white">
      <SEO
        title="Trade House — Live Hybrid Funding Trading Competition"
        description="Follow Trade House standings powered by verified Hybrid Funding public dashboard data from simulated competition accounts."
        path="/tradehouse"
      />

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,135,0.12),transparent_48%)]" />
        <div className="container relative mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 font-['Orbitron'] text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">
              <Radio className="h-3.5 w-3.5" />
              {data?.season.status === "live" ? "Season Live" : "Season 1 Forming"} · Simulated Accounts
            </div>
            <h1 className="mt-6 font-['Orbitron'] text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-7xl">
              TRADE <span className="text-amber-300">HOUSE</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Traders compete on Hybrid-issued demo accounts. Official standings are calculated from each account&apos;s public Hybrid Funding dashboard — not self-reported P&amp;L.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#leaderboard" className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-400 px-6 font-['Orbitron'] text-xs font-black tracking-wider text-[#07100c] shadow-[0_0_28px_rgba(52,211,153,0.28)]">
                <Trophy className="mr-2 h-4 w-4" />
                VIEW LEADERBOARD
              </a>
              <Link href="/tradehouse/studio" className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 font-['Orbitron'] text-xs font-black tracking-wider text-white">
                <Swords className="mr-2 h-4 w-4" />
                BROADCAST STUDIO
              </Link>
              <a href="/#choose-program" className="inline-flex h-12 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 px-6 font-['Orbitron'] text-xs font-black tracking-wider text-amber-200">
                <Zap className="mr-2 h-4 w-4" />
                START INSTANT FUNDING
              </a>
            </div>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Contestants", totals.traders, Users],
              ["Verified Feeds", totals.verified, ShieldCheck],
              ["Trades Tracked", totals.trades, Activity],
              ["Positions Open", totals.live, Radio],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center backdrop-blur">
                <Icon className="mx-auto h-5 w-5 text-emerald-300" />
                <div className="mt-2 font-['Orbitron'] text-2xl font-black text-white">{value as number}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">{label as string}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="leaderboard" className="scroll-mt-24 py-14 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="font-['Orbitron'] text-[11px] uppercase tracking-[0.22em] text-emerald-300">Official Board</div>
                <h2 className="mt-2 font-['Orbitron'] text-3xl font-black">Season 1 Leaderboard</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Refreshed about every 15 seconds from allowlisted public Hybrid Funding dashboard links.
                </p>
              </div>
              {data?.updatedAt && (
                <div className="text-xs text-slate-500">
                  Last refresh {new Date(data.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}
                </div>
              )}
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center text-slate-400">Connecting to verified dashboards…</div>
            ) : feedError ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center">
                <div className="font-['Orbitron'] font-bold text-red-300">LIVE FEED TEMPORARILY UNAVAILABLE</div>
                <p className="mt-2 text-sm text-slate-400">The page will retry automatically.</p>
              </div>
            ) : (data?.standings.length ?? 0) === 0 ? (
              <div className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/[0.07] to-white/[0.02] p-8 text-center sm:p-12">
                <Swords className="mx-auto h-10 w-10 text-amber-300" />
                <h3 className="mt-4 font-['Orbitron'] text-2xl font-black">Season 1 roster is being loaded.</h3>
                <p className="mx-auto mt-3 max-w-2xl text-slate-400">
                  Each contestant will receive a Hybrid demo account and public dashboard. Once those dashboard links are added to the season roster, their verified stats appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b111d]">
                <div className="hidden grid-cols-[70px_1.35fr_1fr_1fr_1fr_90px_80px] gap-3 border-b border-white/10 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 md:grid">
                  <div>Rank</div><div>Trader</div><div>P&amp;L</div><div>Return</div><div>Equity</div><div>Trades</div><div>Status</div>
                </div>
                {data?.standings.map((trader) => (
                  <div key={trader.id} className="border-b border-white/[0.07] p-5 last:border-b-0 md:grid md:grid-cols-[70px_1.35fr_1fr_1fr_1fr_90px_80px] md:items-center md:gap-3">
                    <div className="mb-3 flex items-center justify-between md:mb-0 md:block">
                      <span className={`font-['Orbitron'] text-xl font-black ${trader.rank <= 3 ? "text-amber-300" : "text-white"}`}>#{trader.rank}</span>
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] uppercase tracking-wider text-slate-400 md:hidden">{trader.status}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Orbitron'] text-sm font-black">{trader.name}</span>
                        {trader.verified && <ShieldCheck className="h-4 w-4 text-emerald-300" aria-label="Verified dashboard feed" />}
                      </div>
                      <a href={trader.dashboardUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-300">
                        Public dashboard <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className={`mt-4 font-mono text-lg font-bold md:mt-0 ${trader.pnl >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                      {trader.pnl >= 0 ? "+" : ""}{formatMoney(trader.pnl)}
                    </div>
                    <div className={`mt-1 font-mono text-sm md:mt-0 ${trader.returnPct >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                      {trader.returnPct >= 0 ? "+" : ""}{trader.returnPct.toFixed(2)}%
                    </div>
                    <div className="mt-1 font-mono text-sm text-slate-300 md:mt-0">{formatMoney(trader.equity)}</div>
                    <div className="mt-1 font-mono text-sm text-slate-300 md:mt-0">{trader.tradeCount}</div>
                    <div className="hidden md:block">
                      <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${trader.status === "live" ? "bg-red-400/10 text-red-300" : trader.status === "flat" ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-slate-500"}`}>
                        {trader.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-relaxed text-slate-500">
              <strong className="text-slate-300">Competition disclosure:</strong> Trade House Season accounts are simulated/demo trading accounts unless a specific event states otherwise. Leaderboard data reflects those accounts and is not a representation of customer investment returns.
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-14 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <div className="font-['Orbitron'] text-[10px] uppercase tracking-[0.22em] text-amber-300">Always Open · Quarterly Championship</div>
              <h2 className="mt-3 font-['Orbitron'] text-3xl font-black sm:text-4xl">Enter the House anytime. Earn your way to the Final.</h2>
              <p className="mt-4 text-slate-400">
                Any eligible Hybrid-funded trader can enter the open ladder during the quarter. Weekly heats create fresh qualification windows so late entrants still have a path into the championship.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                ["OPEN LADDER", "Join anytime", "Your public Hybrid dashboard becomes the verified scoring feed. Rank is based on performance from your Trade House entry baseline, not self-reported stats."],
                ["WEEKLY HEATS", "Fresh chances every week", "Short competition windows create content and qualification opportunities without forcing every trader to enter on day one of the quarter."],
                ["QUARTERLY FINAL", "The main event", "Heat winners and season-point leaders advance into a broadcast final with the largest Hybrid rewards and featured trader profiles."],
              ].map(([title, kicker, body]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-[#0b111d] p-6">
                  <div className="font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">{kicker}</div>
                  <h3 className="mt-3 font-['Orbitron'] text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.04] p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="font-['Orbitron'] text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Broadcast-ready by design</div>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
                    Leaderboards, duel plates, trader lower-thirds, and scorebugs are separate transparent browser sources. Cameras and trading screens can come from Trade House video rooms, Zoom, or standard OBS inputs without changing the scoring layer.
                  </p>
                </div>
                <Link href="/tradehouse/studio" className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-300 px-5 font-['Orbitron'] text-[10px] font-black tracking-wider text-[#071018]">
                  OPEN PRODUCER TOOLS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.02] py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {[
              ["1. Hybrid issues the account", "Every contestant receives the same account class and competition rules."],
              ["2. The dashboard verifies the score", "Trade House reads the public Hybrid dashboard feed. Manual stats never determine official rank."],
              ["3. The board creates the show", "Rank changes, open positions, trade counts, and verified results become the live broadcast story."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-[#0b111d] p-6">
                <h3 className="font-['Orbitron'] text-sm font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TradeHouse;
