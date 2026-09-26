import React, { useEffect, useMemo } from "react";
import { useParams, useSearch } from "wouter";
import { Crown, Radio, ShieldCheck, Trophy } from "lucide-react";

import { useTradeHouseFeed, type Standing, type LeaderboardPayload } from "@/lib/tradehouse-feed";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);

const percent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

const EmptyFeed = () => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="rounded-2xl border border-white/10 bg-black/60 px-8 py-5 font-['Orbitron'] text-sm font-black tracking-[0.18em] text-white/70 backdrop-blur-xl">
      WAITING FOR VERIFIED TRADE HOUSE FEED
    </div>
  </div>
);

const TraderPlate: React.FC<{ trader: Standing; side?: "left" | "right"; large?: boolean }> = ({ trader, side = "left", large = false }) => {
  const positive = trader.pnl >= 0;
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/15 bg-[#070b13]/90 backdrop-blur-2xl ${large ? "w-[620px] p-7" : "w-[470px] p-5"}`}
      style={{ boxShadow: "0 22px 70px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)" }}
    >
      <div className={`absolute inset-y-0 ${side === "left" ? "left-0" : "right-0"} w-1.5 bg-gradient-to-b from-amber-300 via-emerald-300 to-cyan-300`} />
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Rank #{trader.rank}</span>
            {trader.verified && <ShieldCheck className="h-4 w-4 text-emerald-300" />}
          </div>
          <div className={`mt-1 font-['Orbitron'] font-black uppercase tracking-tight text-white ${large ? "text-4xl" : "text-3xl"}`}>
            {trader.name}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-slate-500">
            <span className={trader.status === "live" ? "text-red-300" : "text-emerald-300"}>
              {trader.status === "live" ? "● POSITION OPEN" : "● FLAT"}
            </span>
            <span>·</span>
            <span>SIM ACCOUNT</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-mono font-black ${positive ? "text-emerald-300" : "text-red-300"} ${large ? "text-4xl" : "text-3xl"}`}>
            {positive ? "+" : ""}{money(trader.pnl)}
          </div>
          <div className={`mt-1 font-mono font-bold ${positive ? "text-emerald-200" : "text-red-200"}`}>
            {percent(trader.returnPct)}
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {[
          ["Equity", money(trader.equity)],
          ["Trades", trader.tradeCount.toString()],
          ["W / L", `${trader.wins} / ${trader.losses}`],
          ["Best", money(trader.biggestWin)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-2.5">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-1 truncate font-mono text-sm font-bold text-white">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LeaderboardOverlay: React.FC<{ data: LeaderboardPayload }> = ({ data }) => {
  const top = data.standings.slice(0, 8);
  return (
    <div className="flex h-full w-full items-start justify-end p-10">
      <div className="w-[560px] overflow-hidden rounded-[28px] border border-white/15 bg-[#070b13]/92 backdrop-blur-2xl" style={{ boxShadow: "0 30px 100px rgba(0,0,0,.5)" }}>
        <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-amber-300/10 via-white/[0.02] to-emerald-300/10 px-6 py-5">
          <div>
            <div className="font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.22em] text-amber-300">Trade House</div>
            <div className="mt-1 font-['Orbitron'] text-2xl font-black uppercase text-white">{data.season.name}</div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-red-300/20 bg-red-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-red-200">
            <Radio className="h-3.5 w-3.5" /> {data.season.status === "live" ? "Live Board" : data.season.status}
          </div>
        </div>
        <div>
          {top.map((trader) => (
            <div key={trader.id} className="grid grid-cols-[58px_1fr_135px] items-center gap-3 border-b border-white/[0.06] px-6 py-4 last:border-0">
              <div className={`font-['Orbitron'] text-xl font-black ${trader.rank <= 3 ? "text-amber-300" : "text-slate-400"}`}>#{trader.rank}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-['Orbitron'] text-sm font-black uppercase text-white">{trader.name}</span>
                  {trader.verified && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-300" />}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-600">{trader.tradeCount} trades · {trader.status}</div>
              </div>
              <div className="text-right">
                <div className={`font-mono text-lg font-black ${trader.pnl >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                  {trader.pnl >= 0 ? "+" : ""}{money(trader.pnl)}
                </div>
                <div className="font-mono text-xs font-bold text-slate-500">{percent(trader.returnPct)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
          <span>Verified Hybrid dashboard feeds</span>
          <span>Simulated competition accounts</span>
        </div>
      </div>
    </div>
  );
};

const DuelOverlay: React.FC<{ data: LeaderboardPayload; leftId?: string | null; rightId?: string | null }> = ({ data, leftId, rightId }) => {
  const left = leftId ? data.standings.find((x) => x.id === leftId) : data.standings[0];
  const right = rightId ? data.standings.find((x) => x.id === rightId && x.id !== left?.id) : data.standings.find(x => x.id !== left?.id);
  if (!left || !right) return <EmptyFeed />;

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full border border-white/15 bg-[#070b13]/90 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-amber-300" />
          <div className="font-['Orbitron'] text-sm font-black uppercase tracking-[0.18em] text-white">Trade House · {data.season.name}</div>
          <span className="rounded-full bg-red-400/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-red-300">{data.season.status}</span>
        </div>
      </div>
      <div className="absolute bottom-8 left-8"><TraderPlate trader={left} side="left" /></div>
      <div className="absolute bottom-8 right-8"><TraderPlate trader={right} side="right" /></div>
      <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/30 bg-[#070b13]/95 font-['Orbitron'] text-lg font-black text-amber-300 shadow-[0_0_40px_rgba(252,211,77,.18)]">
          VS
        </div>
      </div>
    </div>
  );
};

const TraderOverlay: React.FC<{ data: LeaderboardPayload; traderId?: string | null }> = ({ data, traderId }) => {
  const trader = traderId ? data.standings.find((x) => x.id === traderId) : data.standings[0];
  if (!trader) return <EmptyFeed />;
  return (
    <div className="flex h-full w-full items-end justify-start p-10">
      <TraderPlate trader={trader} large />
    </div>
  );
};

const ScorebugOverlay: React.FC<{ data: LeaderboardPayload }> = ({ data }) => {
  const leader = data.standings[0];
  if (!leader) return <EmptyFeed />;
  return (
    <div className="flex h-full w-full items-start justify-center p-7">
      <div className="flex items-center gap-5 rounded-2xl border border-white/15 bg-[#070b13]/92 px-5 py-3.5 backdrop-blur-2xl" style={{ boxShadow: "0 16px 55px rgba(0,0,0,.4)" }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300/10"><Crown className="h-5 w-5 text-amber-300" /></div>
        <div>
          <div className="font-['Orbitron'] text-[9px] font-black uppercase tracking-[0.18em] text-slate-500">Current Leader</div>
          <div className="font-['Orbitron'] text-sm font-black uppercase text-white">{leader.name}</div>
        </div>
        <div className="h-9 w-px bg-white/10" />
        <div className="font-mono text-xl font-black text-emerald-300">{leader.pnl >= 0 ? "+" : ""}{money(leader.pnl)}</div>
        <div className="font-mono text-xs font-bold text-slate-400">{percent(leader.returnPct)}</div>
        <div className="rounded-full border border-red-300/20 bg-red-300/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-red-200">{data.season.status.toUpperCase()}</div>
      </div>
    </div>
  );
};

const TradeHouseBroadcast: React.FC = () => {
  const { view } = useParams<{ view: string }>();
  const search = useSearch();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const { data, state } = useTradeHouseFeed();

  useEffect(() => {
    const originalBody = document.body.style.background;
    const originalHtml = document.documentElement.style.background;
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
    return () => {
      document.body.style.background = originalBody;
      document.documentElement.style.background = originalHtml;
    };
  }, []);

  if (!data || state === "stale") return <EmptyFeed />;
  const safeData = { ...data, standings: data.standings.filter(t => t.verified && t.status !== "unavailable") };
  if (!safeData.standings.length) return <EmptyFeed />;

  if (view === "leaderboard") return <LeaderboardOverlay data={safeData} />;
  if (view === "duel") return <DuelOverlay data={safeData} leftId={qs.get("left")} rightId={qs.get("right")} />;
  if (view === "trader") return <TraderOverlay data={safeData} traderId={qs.get("id")} />;
  if (view === "scorebug") return <ScorebugOverlay data={safeData} />;

  return <EmptyFeed />;
};

export default TradeHouseBroadcast;
