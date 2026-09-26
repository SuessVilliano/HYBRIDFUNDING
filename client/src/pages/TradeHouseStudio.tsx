import React, { useEffect, useMemo, useState } from "react";
import { Copy, Check, MonitorPlay, Radio, ShieldCheck, Swords, Trophy, UserRound } from "lucide-react";
import SEO from "@/components/SEO";

type Standing = {
  id: string;
  name: string;
  rank: number;
  pnl: number;
  returnPct: number;
  verified: boolean;
};

type Payload = {
  season: { name: string; status: string };
  standings: Standing[];
};

const TradeHouseStudio: React.FC = () => {
  const [feed, setFeed] = useState<Payload | null>(null);
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [solo, setSolo] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/tradehouse/leaderboard", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        setFeed(data);
        setLeft(data.standings?.[0]?.id ?? "");
        setRight(data.standings?.[1]?.id ?? "");
        setSolo(data.standings?.[0]?.id ?? "");
      })
      .catch(() => undefined);
  }, []);

  const base = typeof window !== "undefined" ? window.location.origin : "";
  const urls = useMemo(() => ({
    leaderboard: `${base}/tradehouse/broadcast/leaderboard`,
    scorebug: `${base}/tradehouse/broadcast/scorebug`,
    duel: `${base}/tradehouse/broadcast/duel?left=${encodeURIComponent(left)}&right=${encodeURIComponent(right)}`,
    trader: `${base}/tradehouse/broadcast/trader?id=${encodeURIComponent(solo)}`,
  }), [base, left, right, solo]);

  const copy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(""), 1500);
  };

  const SourceCard = ({ title, description, url, id, icon: Icon }: any) => (
    <div className="rounded-2xl border border-white/10 bg-[#0d1626] p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06]">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-['Orbitron'] text-base font-black text-white">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
          <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/20 p-3 font-mono text-xs text-slate-400 break-all">{url}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => copy(id, url)} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-[#071018]">
              {copied === id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === id ? "COPIED" : "COPY SOURCE"}
            </button>
            <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-slate-300">
              PREVIEW
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08101c] text-white">
      <SEO title="Trade House Broadcast Studio" description="OBS browser-source graphics for Trade House live trading broadcasts." path="/tradehouse/studio" />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.12),transparent_45%)]">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
              <MonitorPlay className="h-4 w-4" /> Producer Tools
            </div>
            <h1 className="mt-5 font-['Orbitron'] text-4xl font-black sm:text-5xl">TRADE HOUSE <span className="text-cyan-300">BROADCAST STUDIO</span></h1>
            <p className="mt-4 max-w-3xl text-slate-300">
              Permanent transparent browser sources for OBS. Cameras and screen shares stay independent; these URLs handle the verified competition graphics automatically.
            </p>

            <div className="mt-8 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5 text-sm text-slate-300">
              <strong className="text-amber-200">OBS setup:</strong> Browser Source · 1920×1080 · 60 FPS · custom frame rate enabled · shutdown source when not visible. Keep the browser source above camera/chart layers.
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <SourceCard id="leaderboard" title="Live Leaderboard" description="Top-eight broadcast board. Ideal as a full-screen standings scene or a side panel beside commentary." url={urls.leaderboard} icon={Trophy} />
            <SourceCard id="scorebug" title="Leader Scorebug" description="Compact top-of-screen bug showing the current leader, verified P&L, return, and live status." url={urls.scorebug} icon={Radio} />

            <div className="rounded-2xl border border-white/10 bg-[#0d1626] p-6">
              <div className="flex items-center gap-3">
                <Swords className="h-6 w-6 text-amber-300" />
                <h3 className="font-['Orbitron'] text-base font-black">Duel Scene</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">Choose any two verified contestants. OBS can place their cameras/screens in the center while this source renders the two competing score plates.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <select value={left} onChange={(e) => setLeft(e.target.value)} className="rounded-xl border border-white/10 bg-[#07101b] px-4 py-3 text-sm text-white">
                  <option value="">Left trader</option>
                  {feed?.standings.map((t) => <option key={t.id} value={t.id}>{t.rank}. {t.name}</option>)}
                </select>
                <select value={right} onChange={(e) => setRight(e.target.value)} className="rounded-xl border border-white/10 bg-[#07101b] px-4 py-3 text-sm text-white">
                  <option value="">Right trader</option>
                  {feed?.standings.map((t) => <option key={t.id} value={t.id}>{t.rank}. {t.name}</option>)}
                </select>
              </div>
              <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/20 p-3 font-mono text-xs text-slate-400 break-all">{urls.duel}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => copy("duel", urls.duel)} className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-[#141007]">
                  {copied === "duel" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied === "duel" ? "COPIED" : "COPY SOURCE"}
                </button>
                <a href={urls.duel} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-slate-300">PREVIEW</a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1626] p-6">
              <div className="flex items-center gap-3">
                <UserRound className="h-6 w-6 text-emerald-300" />
                <h3 className="font-['Orbitron'] text-base font-black">Trader Lower Third</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">Use for interviews, trader introductions, winner announcements, or a single-trader spotlight scene.</p>
              <select value={solo} onChange={(e) => setSolo(e.target.value)} className="mt-5 w-full rounded-xl border border-white/10 bg-[#07101b] px-4 py-3 text-sm text-white">
                <option value="">Choose trader</option>
                {feed?.standings.map((t) => <option key={t.id} value={t.id}>{t.rank}. {t.name}</option>)}
              </select>
              <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/20 p-3 font-mono text-xs text-slate-400 break-all">{urls.trader}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => copy("trader", urls.trader)} className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-[#07100c]">
                  {copied === "trader" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied === "trader" ? "COPIED" : "COPY SOURCE"}
                </button>
                <a href={urls.trader} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-slate-300">PREVIEW</a>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["CAMERA", "Use Trade House's existing Stream video room, Zoom, or any OBS camera source. Graphics do not care which camera system you choose."],
                ["TRADING SCREEN", "Capture the trader's platform/window as its own OBS source. Keep credentials and account-sensitive details hidden."],
                ["VERIFIED DATA", "The graphics read only the allowlisted public Hybrid dashboard feed, so the scoreboard stays independent of the camera and screen capture."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-[#0d1626] p-5">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" />
                  <div className="mt-3 font-['Orbitron'] text-xs font-black text-white">{title}</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TradeHouseStudio;
