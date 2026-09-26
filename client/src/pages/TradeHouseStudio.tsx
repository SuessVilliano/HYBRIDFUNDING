import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Link2,
  MonitorPlay,
  Plus,
  Radio,
  RefreshCw,
  ShieldCheck,
  Swords,
  Trash2,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { downloadOBSCollection } from "@/lib/tradehouse-obs";
import {
  encodeQuickRoster,
  rehearsalFeed,
  type QuickBattleEntry,
  type Standing,
} from "@/lib/tradehouse-feed";
import SEO from "@/components/SEO";

type Payload = {
  season: { name: string; status: string };
  standings: Standing[];
};

function newRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function validEntry(entry: QuickBattleEntry) {
  if (!entry.name.trim()) return false;
  if (entry.source === "hybrid") {
    try {
      const url = new URL(entry.dashboardUrl);
      return url.hostname === "hybridfundingdashboard.propaccount.com" && /\/public-overview\//i.test(url.pathname);
    } catch {
      return false;
    }
  }
  return /^0x[a-fA-F0-9]{40}$/.test(entry.wallet.trim());
}

const TradeHouseStudio: React.FC = () => {
  const [demo, setDemo] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [feed, setFeed] = useState<Payload | null>(null);
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [solo, setSolo] = useState("");
  const [copied, setCopied] = useState("");

  const [seasonName, setSeasonName] = useState("Trade House Quick Battle");
  const [roomId, setRoomId] = useState(() => newRoomId());
  const [quickStatus, setQuickStatus] = useState("");
  const [quickPreview, setQuickPreview] = useState<Payload | null>(null);
  const [quickEntries, setQuickEntries] = useState<QuickBattleEntry[]>([
    { source: "hybrid", id: "quick-1", name: "Trader A", dashboardUrl: "" },
    { source: "hybrid", id: "quick-2", name: "Trader B", dashboardUrl: "" },
  ]);

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

  const roster = demo ? rehearsalFeed().standings : feed?.standings ?? [];
  const stageUrl = (layout: string, overlay = false) =>
    `${base}/tradehouse/stage?${new URLSearchParams({
      layout,
      left,
      right,
      ...(demo ? { demo: "1" } : {}),
      ...(overlay ? { overlay: "1" } : {}),
    })}`;

  const readyQuickEntries = useMemo(() => quickEntries.filter(validEntry).slice(0, 8), [quickEntries]);
  const quickEncoded = useMemo(
    () => readyQuickEntries.length ? encodeQuickRoster(readyQuickEntries) : "",
    [readyQuickEntries],
  );
  const quickStageUrl = (layout: string, overlay = false) =>
    `${base}/tradehouse/stage?${new URLSearchParams({
      layout,
      quick: quickEncoded,
      season: seasonName,
      ...(overlay ? { overlay: "1" } : {}),
    })}`;
  const quickTvUrl = `${base}/tradehouse/tv?${new URLSearchParams({ quick: quickEncoded, season: seasonName })}`;

  const roomMode = readyQuickEntries.length <= 2 ? "1v1" : readyQuickEntries.length <= 4 ? "2v2" : "3v3";
  const participantLinks = useMemo(
    () => readyQuickEntries.slice(0, 6).map((entry, index) => {
      const side = index % 2 === 0 ? "left" : "right";
      const slot = Math.floor(index / 2);
      const params = new URLSearchParams({
        mode: roomMode,
        name: entry.name,
        side,
        slot: String(slot),
      });
      return { id: entry.id, name: entry.name, url: `${base}/battles/room/${roomId}?${params}` };
    }),
    [base, readyQuickEntries, roomId, roomMode],
  );

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyError("");
    } catch {
      setCopyError("Copy is unavailable. Select and copy the source URL shown below.");
      return;
    }
    setCopied(key);
    window.setTimeout(() => setCopied(""), 1500);
  };

  const updateQuickEntry = (index: number, patch: Record<string, unknown>) => {
    setQuickEntries((current) => current.map((entry, i) => i === index ? ({ ...entry, ...patch } as QuickBattleEntry) : entry));
  };

  const changeSource = (index: number, source: "hybrid" | "polymarket") => {
    setQuickEntries((current) => current.map((entry, i) => {
      if (i !== index) return entry;
      const baseEntry = { id: entry.id, name: entry.name };
      return source === "hybrid"
        ? { ...baseEntry, source, dashboardUrl: "" }
        : { ...baseEntry, source, wallet: "" };
    }));
  };

  const addQuickEntry = () => {
    if (quickEntries.length >= 8) return;
    const n = quickEntries.length + 1;
    setQuickEntries((current) => [
      ...current,
      { source: "hybrid", id: `quick-${Date.now()}-${n}`, name: `Trader ${n}`, dashboardUrl: "" },
    ]);
  };

  const verifyAndSnapshot = async () => {
    if (!readyQuickEntries.length) {
      setQuickStatus("Add at least one valid Hybrid public dashboard or Polymarket wallet.");
      return;
    }
    setQuickStatus("Verifying public feeds and taking the battle-start snapshot…");
    try {
      const response = await fetch("/api/tradehouse/quick-leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: readyQuickEntries, seasonName }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Verification failed");
      setQuickPreview(payload);
      const byId = new Map<string, Standing>(payload.standings.map((row: Standing) => [row.id, row]));
      setQuickEntries((current) => current.map((entry) => {
        const row = byId.get(entry.id);
        if (!row?.verified) return entry;
        return { ...entry, startingBalance: row.balance } as QuickBattleEntry;
      }));
      const verified = payload.standings.filter((row: Standing) => row.verified).length;
      setQuickStatus(
        `${verified}/${payload.standings.length} feeds verified. Starting values snapshotted. Do not snapshot again after the battle begins.`,
      );
    } catch (error) {
      setQuickStatus(error instanceof Error ? error.message : "Could not verify the battle feeds.");
    }
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
          <div className="mt-4 break-all rounded-xl border border-white/[0.07] bg-black/20 p-3 font-mono text-xs text-slate-400">{url}</div>
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

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(0,255,255,.12),transparent_38%),radial-gradient(circle_at_82%_12%,rgba(138,43,226,.14),transparent_35%)]">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
              <MonitorPlay className="h-4 w-4" /> Producer Tools
            </div>
            <h1 className="mt-5 font-['Orbitron'] text-4xl font-black sm:text-5xl">TRADE HOUSE <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">BROADCAST STUDIO</span></h1>
            <p className="mt-4 max-w-3xl text-slate-300">
              Connect verified public data, put traders into the room, and feed the same live competition into OBS without rebuilding scenes.
            </p>
            <div className="mt-8 rounded-2xl border border-violet-400/15 bg-violet-400/[0.05] p-5 text-sm text-slate-300">
              <strong className="text-violet-300">OBS setup:</strong> Browser Source · 1920×1080 · 30 FPS · keep source active between scenes. Put cameras or trading screens below the transparent Trade House graphics layer.
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-6">

            <div className="overflow-hidden rounded-3xl border border-cyan-300/30 bg-[linear-gradient(145deg,rgba(8,16,28,.98),rgba(12,15,33,.98))] shadow-[0_24px_80px_rgba(0,255,255,.08)]">
              <div className="border-b border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(0,255,255,.12),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(138,43,226,.14),transparent_35%)] p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Go Live Today</div>
                    <h2 className="mt-2 font-['Orbitron'] text-2xl font-black sm:text-3xl">CONNECT → SNAPSHOT → ROOM → OBS</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
                      Paste public Hybrid dashboards or Polymarket wallets. Trade House verifies the feed, snapshots the starting value, and packages the roster directly into the broadcast URL.
                    </p>
                  </div>
                  <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-violet-200">
                    NO TRADING CREDENTIALS REQUIRED
                  </span>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    ["01", "CONNECT", "Public dashboard / wallet"],
                    ["02", "SNAPSHOT", "Lock battle baseline"],
                    ["03", "ROOM", "Camera + mic + screen"],
                    ["04", "OBS", "One live browser source"],
                  ].map(([num, title, body]) => (
                    <div key={num} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                      <div className="font-mono text-xs font-black text-cyan-300">{num}</div>
                      <div className="mt-2 font-['Orbitron'] text-xs font-black">{title}</div>
                      <div className="mt-1 text-[11px] text-slate-500">{body}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Battle name</label>
                  <input
                    value={seasonName}
                    onChange={(e) => setSeasonName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#07101b] px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                  />
                </div>

                <div className="space-y-3">
                  {quickEntries.map((entry, index) => (
                    <div key={entry.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 lg:grid-cols-[1fr_150px_2fr_auto] lg:items-end">
                      <label className="text-xs text-slate-500">
                        Trader
                        <input
                          value={entry.name}
                          onChange={(e) => updateQuickEntry(index, { name: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300/60"
                        />
                      </label>
                      <label className="text-xs text-slate-500">
                        Feed
                        <select
                          value={entry.source}
                          onChange={(e) => changeSource(index, e.target.value as "hybrid" | "polymarket")}
                          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white"
                        >
                          <option value="hybrid">Hybrid</option>
                          <option value="polymarket">Polymarket</option>
                        </select>
                      </label>
                      {entry.source === "hybrid" ? (
                        <label className="text-xs text-slate-500">
                          Public Hybrid dashboard
                          <input
                            value={entry.dashboardUrl}
                            onChange={(e) => updateQuickEntry(index, { dashboardUrl: e.target.value, startingBalance: undefined })}
                            placeholder="https://hybridfundingdashboard.propaccount.com/en/public-overview/..."
                            className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-cyan-300/60"
                          />
                        </label>
                      ) : (
                        <label className="text-xs text-slate-500">
                          Polymarket wallet
                          <input
                            value={entry.wallet}
                            onChange={(e) => updateQuickEntry(index, { wallet: e.target.value, startingBalance: undefined })}
                            placeholder="0x..."
                            className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-violet-400/60"
                          />
                        </label>
                      )}
                      <button
                        onClick={() => setQuickEntries((current) => current.filter((_, i) => i !== index))}
                        disabled={quickEntries.length <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-400/20 bg-rose-400/[0.05] text-rose-300 disabled:opacity-25"
                        aria-label="Remove contestant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={addQuickEntry}
                    disabled={quickEntries.length >= 8}
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/[0.05] px-4 py-3 font-['Orbitron'] text-[10px] font-black tracking-wider text-cyan-200 disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" /> ADD CONTESTANT
                  </button>
                  <button
                    onClick={verifyAndSnapshot}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-violet-400 px-5 py-3 font-['Orbitron'] text-[10px] font-black tracking-wider text-[#061018] shadow-[0_0_30px_rgba(0,255,255,.16)]"
                  >
                    <ShieldCheck className="h-4 w-4" /> VERIFY + SNAPSHOT START
                  </button>
                </div>

                {quickStatus && (
                  <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4 text-sm text-cyan-100">{quickStatus}</div>
                )}

                {quickPreview && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {quickPreview.standings.map((row) => (
                      <div key={row.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-['Orbitron'] text-xs font-black">{row.name}</span>
                          <span className={row.verified ? "text-cyan-300" : "text-rose-300"}>{row.verified ? "✓" : "!"}</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">{row.sourceLabel || "Hybrid Funding"}</div>
                        <div className="mt-2 font-mono text-lg font-black text-white">${row.balance.toLocaleString()}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-600">snapshot value</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-['Orbitron'] text-xs font-black"><Users className="h-4 w-4 text-cyan-300" /> LIVE ROOM</div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">Send each contestant their personal link. Up to six can use the built-in room; seats 7-8 can use Zoom/OBS while their verified score still appears.</p>
                      </div>
                      <button onClick={() => setRoomId(newRoomId())} className="rounded-lg border border-white/10 p-2 text-slate-400" aria-label="Generate new room"><RefreshCw className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3 font-mono text-sm font-black tracking-[0.2em] text-violet-300">ROOM {roomId} · {roomMode.toUpperCase()}</div>
                    <div className="mt-3 space-y-2">
                      {participantLinks.map((participant, index) => (
                        <div key={participant.id} className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/15 p-2">
                          <span className="min-w-0 flex-1 truncate text-xs text-slate-300">{index + 1}. {participant.name}</span>
                          <button onClick={() => copy(`room-${participant.id}`, participant.url)} className="rounded-lg border border-cyan-300/20 px-3 py-1.5 text-[10px] font-bold text-cyan-200">
                            {copied === `room-${participant.id}` ? "COPIED" : "COPY LINK"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 font-['Orbitron'] text-xs font-black"><MonitorPlay className="h-4 w-4 text-violet-300" /> OBS / PROGRAM</div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">After snapshotting, use these sources. The roster and baseline travel inside the URL and refresh every 15 seconds.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={quickStageUrl(readyQuickEntries.length > 2 ? "grid" : "duel")} target="_blank" rel="noreferrer" className="rounded-lg bg-cyan-300 px-3 py-2 text-[10px] font-black text-slate-950">OPEN STAGE</a>
                      <a href={quickTvUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-violet-400 px-3 py-2 text-[10px] font-black text-white">OPEN TRADE HYBRID TV</a>
                      <button
                        onClick={() => downloadOBSCollection(base, false, readyQuickEntries[0]?.id || "", readyQuickEntries[1]?.id || "", quickEncoded, seasonName)}
                        className="rounded-lg border border-white/15 px-3 py-2 text-[10px] font-black text-slate-200"
                      >
                        DOWNLOAD OBS COLLECTION
                      </button>
                    </div>
                    <div className="mt-4 break-all rounded-xl border border-white/[0.07] bg-black/25 p-3 font-mono text-[10px] text-slate-400">{quickStageUrl(readyQuickEntries.length > 2 ? "grid" : "duel", true)}</div>
                    <button onClick={() => copy("quick-obs", quickStageUrl(readyQuickEntries.length > 2 ? "grid" : "duel", true))} className="mt-3 inline-flex items-center gap-2 text-[10px] font-black text-cyan-200">
                      <Link2 className="h-3.5 w-3.5" /> {copied === "quick-obs" ? "COPIED" : "COPY OBS BROWSER SOURCE"}
                    </button>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-600">
                  Polymarket support uses public wallet/profile data only. Kalshi portfolio data is account-authenticated, so Trade House does not request or store a trader&apos;s Kalshi login credentials.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-300/30 bg-[#0d1626] p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-black">Official season / rehearsal stage</h2>
                <label className="flex items-center gap-3 text-sm text-violet-300">
                  <input type="checkbox" checked={demo} onChange={e => { setDemo(e.target.checked); setLeft(""); setRight(""); }} />
                  Rehearsal · sample data
                </label>
              </div>
              <p className="text-slate-300">Use this section for the deployed season roster or a graphics rehearsal. Quick Battles above do not require a roster deployment.</p>
              <div className="flex flex-wrap gap-3">
                {[["duel", "Head to head"], ["grid", "Eight-trader wall"], ["break", "Intermission"]].map(([mode, title]) => (
                  <a key={mode} href={stageUrl(mode)} target="_blank" rel="noreferrer" className="rounded-lg bg-cyan-300 px-4 py-3 font-bold text-slate-950">{title}</a>
                ))}
              </div>
              <button onClick={() => downloadOBSCollection(base, demo, left, right)} className="rounded-lg border border-cyan-300/50 px-5 py-3 font-bold text-cyan-200">Download OBS scene collection</button>
              <details className="text-sm text-slate-300">
                <summary className="cursor-pointer font-bold">Camera placement and first broadcast</summary>
                <div className="mt-4 space-y-3">
                  <p>Duel: left video x49, y228, width896, height431; right video x975, y228, width896, height431.</p>
                  <p>Eight-seat wall: four columns at x49, 511, 973, 1435; first row y215, second row y569; video area 436×210.</p>
                  <p>Use the built-in room, Zoom, or another camera source. Keep camera/video below the Trade House browser source in OBS.</p>
                </div>
              </details>
              <div className="break-all rounded-lg bg-black/30 p-3 text-sm font-mono">{stageUrl("duel", true)}</div>
              <button onClick={() => copy("stage", stageUrl("duel", true))} className="text-sm font-bold text-cyan-200">{copied === "stage" ? "Copied" : "Copy transparent duel source"}</button>
              {copyError && <p role="alert" className="text-violet-300">{copyError}</p>}
            </div>

            <SourceCard id="leaderboard" title="Live Leaderboard" description="Top-eight broadcast board. Ideal as a full-screen standings scene or a side panel beside commentary." url={urls.leaderboard} icon={Trophy} />
            <SourceCard id="scorebug" title="Leader Scorebug" description="Compact top-of-screen bug showing the current leader, verified P&L, return, and live status." url={urls.scorebug} icon={Radio} />

            <div className="rounded-2xl border border-white/10 bg-[#0d1626] p-6">
              <div className="flex items-center gap-3">
                <Swords className="h-6 w-6 text-violet-400" />
                <h3 className="font-['Orbitron'] text-base font-black">Official Duel Scene</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">Choose two contestants from the deployed season roster.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <select value={left} onChange={(e) => setLeft(e.target.value)} className="rounded-xl border border-white/10 bg-[#07101b] px-4 py-3 text-sm text-white">
                  <option value="">Left trader</option>
                  {roster.map((t) => <option key={t.id} value={t.id}>{t.rank}. {t.name}</option>)}
                </select>
                <select value={right} onChange={(e) => setRight(e.target.value)} className="rounded-xl border border-white/10 bg-[#07101b] px-4 py-3 text-sm text-white">
                  <option value="">Right trader</option>
                  {roster.map((t) => <option key={t.id} value={t.id}>{t.rank}. {t.name}</option>)}
                </select>
              </div>
              <div className="mt-4 break-all rounded-xl border border-white/[0.07] bg-black/20 p-3 font-mono text-xs text-slate-400">{urls.duel}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => copy("duel", urls.duel)} className="inline-flex items-center gap-2 rounded-full bg-violet-400 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-white">
                  {copied === "duel" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied === "duel" ? "COPIED" : "COPY SOURCE"}
                </button>
                <a href={urls.duel} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-slate-300">PREVIEW</a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1626] p-6">
              <div className="flex items-center gap-3">
                <UserRound className="h-6 w-6 text-cyan-300" />
                <h3 className="font-['Orbitron'] text-base font-black">Trader Lower Third</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">Use for interviews, introductions, winner announcements, or trader spotlights.</p>
              <select value={solo} onChange={(e) => setSolo(e.target.value)} className="mt-5 w-full rounded-xl border border-white/10 bg-[#07101b] px-4 py-3 text-sm text-white">
                <option value="">Choose trader</option>
                {roster.map((t) => <option key={t.id} value={t.id}>{t.rank}. {t.name}</option>)}
              </select>
              <div className="mt-4 break-all rounded-xl border border-white/[0.07] bg-black/20 p-3 font-mono text-xs text-slate-400">{urls.trader}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => copy("trader", urls.trader)} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-[#071018]">
                  {copied === "trader" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied === "trader" ? "COPIED" : "COPY SOURCE"}
                </button>
                <a href={urls.trader} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 font-['Orbitron'] text-[10px] font-black tracking-wider text-slate-300">PREVIEW</a>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["CAMERA", "Use Trade House's room, Zoom, or any OBS camera source."],
                ["TRADING SCREEN", "Capture the trader's platform/window as its own OBS source. Keep credentials hidden."],
                ["VERIFIED DATA", "Scoring stays independent from camera/screen capture and comes from the verified public feed."],
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
