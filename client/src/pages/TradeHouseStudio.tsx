import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Link2,
  MonitorPlay,
  Plus,
  Radio,
  RefreshCw,
  Save,
  Database,
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
import { BATTLE_PRESETS, type BattleFormat } from "@/lib/tradehouse-rules";

type Payload = {
  season: { name: string; status: string };
  standings: Standing[];
};

type AdminEntryMeta = {
  entryId?: number;
  handle?: string;
  email?: string;
  phone?: string;
  accountKind?: "demo" | "challenge" | "funded";
  platformLogin?: string;
  supportStatus?: "requested" | "created" | "delivered" | "verified";
  supportReference?: string;
  credentialsDelivered?: boolean;
  inviteLastFour?: string;
  inviteUrl?: string;
};

type SavedBattleSummary = {
  id: number;
  roomId: string;
  name: string;
  format: BattleFormat;
  mode: string;
  status: string;
  accountSize?: number | null;
  entryCount: number;
  createdAt: string;
};


function newRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function defaultLeagueEnd() {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
  end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
  return end.toISOString().slice(0, 16);
}

function validEntry(entry: QuickBattleEntry) {
  if (!entry.name.trim()) return false;
  try {
    const url = new URL(entry.dashboardUrl);
    return url.hostname === "hybridfundingdashboard.propaccount.com" && /\/public-overview\//i.test(url.pathname);
  } catch {
    return false;
  }
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
  const [battleFormat, setBattleFormat] = useState<BattleFormat>("spotlight");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [targetPct, setTargetPct] = useState(5);
  const [profitTargetPct, setProfitTargetPct] = useState(8);
  const [maxDDPct, setMaxDDPct] = useState(5);
  const [accountSize, setAccountSize] = useState(25000);
  const [leagueEndsAt, setLeagueEndsAt] = useState(defaultLeagueEnd);
  const [promoText, setPromoText] = useState("Instant Funding · Trade House · Verified Hybrid performance");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorUrl, setSponsorUrl] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [shareAccess, setShareAccess] = useState("");
  const [roomId, setRoomId] = useState(() => newRoomId());
  const [quickStatus, setQuickStatus] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [savedBattles, setSavedBattles] = useState<SavedBattleSummary[]>([]);
  const [adminMeta, setAdminMeta] = useState<Record<string, AdminEntryMeta>>({});
  const [quickPreview, setQuickPreview] = useState<Payload | null>(null);
  const [quickEntries, setQuickEntries] = useState<QuickBattleEntry[]>([
    { id: "quick-1", name: "Trader A", dashboardUrl: "", division: "trading", platform: "matchtrader" },
    { id: "quick-2", name: "Trader B", dashboardUrl: "", division: "trading", platform: "ctrader" },
  ]);

  const refreshSavedBattles = async () => {
    try {
      const response = await fetch("/api/tradehouse/admin/battles", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) return;
      const body = await response.json();
      setSavedBattles(Array.isArray(body?.battles) ? body.battles : []);
    } catch {
      // Admin beta may still be configuring its database on first load.
    }
  };

  const loadSavedBattle = async (savedRoomId: string) => {
    setSaveStatus("Loading saved battle…");
    try {
      const response = await fetch(`/api/tradehouse/admin/battles/${encodeURIComponent(savedRoomId)}`, {
        credentials: "include",
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok || !body?.battle) throw new Error(body?.error || "Could not load battle");
      const battle = body.battle;

      setRoomId(battle.roomId);
      setSeasonName(battle.name || "Trade House Battle");
      setBattleFormat((battle.format || "spotlight") as BattleFormat);
      setAccountSize(Number(battle.accountSize || 25000));
      setSponsorName(battle.sponsorName || "");
      setSponsorUrl(battle.sponsorUrl || "");
      setPromoText(battle.promoText || "Instant Funding · Trade House · Verified Hybrid performance");
      setMusicUrl(battle.musicUrl || "");

      const rule = battle.ruleConfig || {};
      if (Number.isFinite(Number(rule.durationSeconds))) setDurationMinutes(Math.max(1, Number(rule.durationSeconds) / 60));
      if (Number.isFinite(Number(rule.targetReturnPct))) setTargetPct(Number(rule.targetReturnPct));
      if (Number.isFinite(Number(rule.profitTargetPct))) setProfitTargetPct(Number(rule.profitTargetPct));
      if (Number.isFinite(Number(rule.maxDrawdownPct))) setMaxDDPct(Number(rule.maxDrawdownPct));
      if (rule.endsAt) {
        const date = new Date(rule.endsAt);
        if (!Number.isNaN(date.getTime())) {
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          setLeagueEndsAt(date.toISOString().slice(0, 16));
        }
      }

      const entries: QuickBattleEntry[] = (battle.entries || []).slice(0, 8).map((entry: any) => ({
        id: entry.id,
        name: entry.name,
        dashboardUrl: entry.dashboardUrl || "",
        avatarUrl: entry.avatarUrl || undefined,
        startingBalance: entry.startingBalance ?? undefined,
        division: entry.division || "trading",
        platform: entry.platform || "other",
      }));
      if (entries.length) setQuickEntries(entries);

      const meta: Record<string, AdminEntryMeta> = {};
      (battle.entries || []).forEach((entry: any) => {
        meta[entry.id] = {
          entryId: entry.entryId,
          handle: entry.handle || "",
          email: entry.email || "",
          phone: entry.phone || "",
          accountKind: entry.accountKind || "demo",
          platformLogin: entry.platformLogin || "",
          supportStatus: entry.supportStatus || "requested",
          supportReference: entry.supportReference || "",
          credentialsDelivered: Boolean(entry.credentialsDelivered),
          inviteLastFour: entry.inviteLastFour || "",
        };
      });
      setAdminMeta(meta);
      setQuickPreview(null);
      setQuickStatus("");
      setSaveStatus(`Loaded ${battle.name} from the Trade House database.`);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("battle", battle.roomId);
        window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
      }
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : "Could not load battle.");
    }
  };

  const saveBattle = async () => {
    if (!quickEntries.length) {
      setSaveStatus("Add at least one contestant before saving.");
      return;
    }
    setSaveStatus("Saving battle, roster, account assignments, and invite state…");
    const mode = quickEntries.length <= 2 ? "1v1" : quickEntries.length <= 4 ? "2v2" : quickEntries.length <= 6 ? "3v3" : "4v4";
    const ruleConfig = {
      format: battleFormat,
      label: BATTLE_PRESETS[battleFormat].label,
      durationSeconds: Math.max(60, Math.round(durationMinutes * 60)),
      targetReturnPct: targetPct,
      profitTargetPct,
      maxDrawdownPct: maxDDPct,
      accountSize,
      endsAt: battleFormat === "league" && leagueEndsAt ? new Date(leagueEndsAt).toISOString() : null,
    };
    try {
      const response = await fetch("/api/tradehouse/admin/battles", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          name: seasonName,
          format: battleFormat,
          mode,
          accountSize,
          sponsorName,
          sponsorUrl,
          promoText,
          musicUrl,
          ruleConfig,
          status: "forming",
          entries: quickEntries.slice(0, 8).map((entry) => {
            const meta = adminMeta[entry.id] || {};
            return {
              id: entry.id,
              name: entry.name,
              handle: meta.handle || "",
              email: meta.email || "",
              phone: meta.phone || "",
              dashboardUrl: entry.dashboardUrl || "",
              avatarUrl: entry.avatarUrl || "",
              startingBalance: entry.startingBalance,
              division: entry.division || "trading",
              platform: entry.platform || "other",
              accountKind: meta.accountKind || "demo",
              platformLogin: meta.platformLogin || "",
              supportStatus: meta.supportStatus || "requested",
              supportReference: meta.supportReference || "",
              credentialsDelivered: Boolean(meta.credentialsDelivered),
            };
          }),
        }),
      });
      const body = await response.json();
      if (!response.ok || !body?.battle) throw new Error(body?.error || "Battle save failed");

      const nextMeta: Record<string, AdminEntryMeta> = {};
      (body.battle.entries || []).forEach((entry: any) => {
        nextMeta[entry.id] = {
          entryId: entry.entryId,
          handle: entry.handle || "",
          email: entry.email || "",
          phone: entry.phone || "",
          accountKind: entry.accountKind || "demo",
          platformLogin: entry.platformLogin || "",
          supportStatus: entry.supportStatus || "requested",
          supportReference: entry.supportReference || "",
          credentialsDelivered: Boolean(entry.credentialsDelivered),
          inviteLastFour: entry.inviteLastFour || "",
        };
      });
      (body.newInvites || []).forEach((invite: any) => {
        nextMeta[invite.rosterId] = {
          ...(nextMeta[invite.rosterId] || {}),
          entryId: invite.entryId,
          inviteUrl: invite.inviteUrl,
          inviteLastFour: invite.lastFour,
        };
      });
      setAdminMeta(nextMeta);
      setSaveStatus(
        body.newInvites?.length
          ? `Saved. ${body.newInvites.length} secure trader invite${body.newInvites.length === 1 ? "" : "s"} created.`
          : "Saved to the Trade House database. This battle will now survive refreshes and other devices.",
      );
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("battle", roomId);
        window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
      }
      await refreshSavedBattles();
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : "Battle could not be saved.");
    }
  };

  const regenerateInvite = async (rosterId: string) => {
    const meta = adminMeta[rosterId];
    if (!meta?.entryId) {
      setSaveStatus("Save this battle first so the trader has a persistent entry.");
      return;
    }
    try {
      const response = await fetch(`/api/tradehouse/admin/entries/${meta.entryId}/invite`, {
        method: "POST",
        credentials: "include",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error || "Invite could not be generated");
      setAdminMeta((current) => ({
        ...current,
        [rosterId]: {
          ...current[rosterId],
          inviteUrl: body.inviteUrl,
          inviteLastFour: body.lastFour,
        },
      }));
      setSaveStatus("A new trader invite was generated. The previous invite is no longer valid.");
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : "Invite could not be generated.");
    }
  };

  useEffect(() => {
    void refreshSavedBattles();
    if (typeof window !== "undefined") {
      const savedRoomId = new URLSearchParams(window.location.search).get("battle");
      if (savedRoomId) void loadSavedBattle(savedRoomId);
    }
  }, []);

  useEffect(() => {
    fetch("/api/tradehouse/beta/link-token", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((body) => {
        if (!body?.token) return;
        setShareAccess(body.token);
      })
      .catch(() => undefined);
  }, []);

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
  const urls = useMemo(() => {
    const access = shareAccess ? { access: shareAccess } : {};
    return {
      leaderboard: `${base}/tradehouse/broadcast/leaderboard?${new URLSearchParams(access)}`,
      scorebug: `${base}/tradehouse/broadcast/scorebug?${new URLSearchParams(access)}`,
      duel: `${base}/tradehouse/broadcast/duel?${new URLSearchParams({ left, right, ...access })}`,
      trader: `${base}/tradehouse/broadcast/trader?${new URLSearchParams({ id: solo, ...access })}`,
    };
  }, [base, left, right, solo, shareAccess]);

  const roster = demo ? rehearsalFeed().standings : feed?.standings ?? [];
  const stageUrl = (layout: string, overlay = false) =>
    `${base}/tradehouse/stage?${new URLSearchParams({
      layout,
      left,
      right,
      ...(demo ? { demo: "1" } : {}),
      ...(overlay ? { overlay: "1" } : {}),
      ...experienceParams,
    })}`;

  const experienceParams = useMemo(() => {
    const params: Record<string, string> = {
      format: battleFormat,
      ruleLabel: BATTLE_PRESETS[battleFormat].label,
      duration: String(Math.max(60, Math.round(durationMinutes * 60))),
      target: String(targetPct),
      profitTarget: String(profitTargetPct),
      maxDD: String(maxDDPct),
      accountSize: String(accountSize),
      promo: promoText,
    };
    if (battleFormat === "league" && leagueEndsAt) {
      params.endsAt = new Date(leagueEndsAt).toISOString();
    }
    if (sponsorName.trim()) params.sponsor = sponsorName.trim();
    if (sponsorUrl.trim()) params.sponsorUrl = sponsorUrl.trim();
    if (musicUrl.trim()) params.music = musicUrl.trim();
    if (shareAccess) params.access = shareAccess;
    return params;
  }, [battleFormat, durationMinutes, targetPct, profitTargetPct, maxDDPct, accountSize, promoText, sponsorName, sponsorUrl, musicUrl, leagueEndsAt, shareAccess]);

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
      ...experienceParams,
    })}`;
  const quickTvUrl = `${base}/tradehouse/tv?${new URLSearchParams({ quick: quickEncoded, season: seasonName, ...experienceParams })}`;

  const roomMode = quickEntries.length <= 2 ? "1v1" : quickEntries.length <= 4 ? "2v2" : quickEntries.length <= 6 ? "3v3" : "4v4";
  const producerLink = `${base}/battles/room/${roomId}?${new URLSearchParams({
    producer: "1",
    mode: roomMode,
    name: "Producer",
    quick: quickEncoded,
    season: seasonName,
    ...experienceParams,
  })}`;

  const participantLinks = useMemo(
    () => readyQuickEntries.slice(0, 8).map((entry, index) => {
      const side = index % 2 === 0 ? "left" : "right";
      const slot = Math.floor(index / 2);
      const params = new URLSearchParams({
        mode: roomMode,
        name: entry.name,
        side,
        slot: String(slot),
        quick: quickEncoded,
        seat: entry.id,
        season: seasonName,
        ...experienceParams,
      });
      return { id: entry.id, name: entry.name, url: `${base}/battles/room/${roomId}?${params}` };
    }),
    [base, readyQuickEntries, roomId, roomMode, quickEncoded, seasonName, experienceParams],
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

  const addQuickEntry = () => {
    if (quickEntries.length >= 8) return;
    const n = quickEntries.length + 1;
    setQuickEntries((current) => [
      ...current,
      { id: `quick-${Date.now()}-${n}`, name: `Trader ${n}`, dashboardUrl: "", division: "trading", platform: "other" },
    ]);
  };

  const verifyAndSnapshot = async () => {
    if (!readyQuickEntries.length) {
      setQuickStatus("Add at least one valid Hybrid Funding public dashboard.");
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

            <div className="rounded-2xl border border-white/10 bg-[#0d1626] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                    <Database className="h-4 w-4" /> Saved Trade House
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Battle setup now lives in the database, not just this browser. Open the same battle from another device and continue where you left off.
                  </p>
                </div>
                <button onClick={() => void refreshSavedBattles()} className="rounded-xl border border-white/10 px-3 py-2 text-[9px] font-bold text-slate-400">
                  REFRESH
                </button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {savedBattles.slice(0, 9).map((battle) => (
                  <button
                    key={battle.id}
                    onClick={() => void loadSavedBattle(battle.roomId)}
                    className={`rounded-xl border p-3 text-left transition-all ${battle.roomId === roomId ? "border-cyan-300/30 bg-cyan-300/[0.05]" : "border-white/[0.07] bg-black/15 hover:border-white/15"}`}
                  >
                    <div className="truncate font-['Orbitron'] text-[10px] font-black text-white">{battle.name}</div>
                    <div className="mt-1 text-[9px] uppercase tracking-wider text-slate-600">
                      {battle.mode} · {battle.format} · {battle.entryCount} traders
                    </div>
                    <div className="mt-2 font-mono text-[9px] text-violet-300">{battle.roomId}</div>
                  </button>
                ))}
                {!savedBattles.length && (
                  <div className="rounded-xl border border-dashed border-white/10 p-4 text-xs text-slate-600 sm:col-span-2 lg:col-span-3">
                    No saved battles yet. Configure the first battle below, then press Save Battle.
                  </div>
                )}
              </div>
              {saveStatus && <div className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] p-3 text-xs text-cyan-100">{saveStatus}</div>}
            </div>

            <div className="overflow-hidden rounded-3xl border border-cyan-300/30 bg-[linear-gradient(145deg,rgba(8,16,28,.98),rgba(12,15,33,.98))] shadow-[0_24px_80px_rgba(0,255,255,.08)]">
              <div className="border-b border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(0,255,255,.12),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(138,43,226,.14),transparent_35%)] p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">Go Live Today</div>
                    <h2 className="mt-2 font-['Orbitron'] text-2xl font-black sm:text-3xl">CONNECT → SNAPSHOT → ROOM → OBS</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
                      Paste the Hybrid Funding public dashboard for each contestant. The dashboard is the normalized scoring layer whether the account trades through MatchTrader, cTrader, DXtrade, DX Futures, Tickblaze, or another supported Hybrid platform.
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
                    ["01", "CONNECT", "Hybrid public dashboard"],
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

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Battle rules</div>
                      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500">
                        Pick the reason the clock exists. Spotlight can run as long as the setups require; Sprint is the scalper clock; Prop ends on the challenge conditions; League follows the season window.
                      </p>
                    </div>
                    <span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-3 py-1.5 font-['Orbitron'] text-[9px] font-bold text-cyan-200">
                      {BATTLE_PRESETS[battleFormat].label}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-5">
                    {(["spotlight", "sprint", "target", "prop", "league"] as BattleFormat[]).map((format) => (
                      <button
                        key={format}
                        onClick={() => setBattleFormat(format)}
                        className="rounded-xl border px-3 py-3 text-left transition-all"
                        style={{
                          borderColor: battleFormat === format ? "rgba(34,211,238,.45)" : "rgba(255,255,255,.08)",
                          background: battleFormat === format ? "rgba(34,211,238,.07)" : "rgba(255,255,255,.02)",
                        }}
                      >
                        <div className={`font-['Orbitron'] text-[9px] font-black uppercase tracking-[0.08em] ${battleFormat === format ? "text-cyan-200" : "text-slate-500"}`}>
                          {BATTLE_PRESETS[format].label}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {(battleFormat === "sprint") && (
                      <label className="text-xs text-slate-500">
                        Duration (minutes)
                        <input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value) || 1)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white" />
                      </label>
                    )}
                    {(battleFormat === "target") && (
                      <label className="text-xs text-slate-500">
                        First to return %
                        <input type="number" step="0.25" value={targetPct} onChange={(e) => setTargetPct(Number(e.target.value) || 0)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white" />
                      </label>
                    )}
                    {(battleFormat === "prop") && (
                      <>
                        <label className="text-xs text-slate-500">
                          Profit target %
                          <input type="number" step="0.25" value={profitTargetPct} onChange={(e) => setProfitTargetPct(Number(e.target.value) || 0)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white" />
                        </label>
                        <label className="text-xs text-slate-500">
                          Max drawdown %
                          <input type="number" step="0.25" value={maxDDPct} onChange={(e) => setMaxDDPct(Number(e.target.value) || 0)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white" />
                        </label>
                      </>
                    )}
                    {(battleFormat === "league") && (
                      <label className="text-xs text-slate-500 sm:col-span-2">
                        League closes
                        <input type="datetime-local" value={leagueEndsAt} onChange={(e) => setLeagueEndsAt(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white" />
                      </label>
                    )}
                    {battleFormat !== "spotlight" && battleFormat !== "sprint" && (
                      <label className="text-xs text-slate-500">
                        Same account size
                        <input type="number" step="1000" value={accountSize} onChange={(e) => setAccountSize(Number(e.target.value) || 0)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white" />
                      </label>
                    )}
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-3">
                    <label className="text-xs text-slate-500 lg:col-span-1">
                      Hybrid promo ribbon
                      <input value={promoText} onChange={(e) => setPromoText(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white" />
                    </label>
                    <label className="text-xs text-slate-500">
                      Sponsor name
                      <input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="Optional" className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white" />
                    </label>
                    <label className="text-xs text-slate-500">
                      Sponsor URL
                      <input value={sponsorUrl} onChange={(e) => setSponsorUrl(e.target.value)} placeholder="https://…" className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white" />
                    </label>
                    <label className="text-xs text-slate-500 lg:col-span-3">
                      House music URL
                      <input value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="Direct audio URL for producer/OBS playback" className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white" />
                      <span className="mt-1 block text-[9px] text-slate-600">Use music you have rights to broadcast. It plays in the producer browser, not through trader microphones.</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  {quickEntries.map((entry, index) => (
                    <div key={entry.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 lg:grid-cols-[1fr_150px_1.2fr_2fr_160px_auto] lg:items-end">
                      <label className="text-xs text-slate-500">
                        Trader
                        <input
                          value={entry.name}
                          onChange={(e) => updateQuickEntry(index, { name: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300/60"
                        />
                      </label>
                      <label className="text-xs text-slate-500">
                        Division
                        <select
                          value={entry.division || "trading"}
                          onChange={(e) => updateQuickEntry(index, { division: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white"
                        >
                          <option value="trading">Trading</option>
                          <option value="prediction">Prediction</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </label>
                      <label className="text-xs text-slate-500">
                        Avatar / logo URL
                        <input
                          value={entry.avatarUrl || ""}
                          onChange={(e) => updateQuickEntry(index, { avatarUrl: e.target.value.trim() || undefined })}
                          placeholder="https://…"
                          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-300/60"
                        />
                      </label>
                      <label className="text-xs text-slate-500">
                        Hybrid public dashboard
                        <input
                          value={entry.dashboardUrl}
                          onChange={(e) => updateQuickEntry(index, { dashboardUrl: e.target.value, startingBalance: undefined })}
                          placeholder="https://hybridfundingdashboard.propaccount.com/en/public-overview/..."
                          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-cyan-300/60"
                        />
                      </label>
                      <label className="text-xs text-slate-500">
                        Platform
                        <select
                          value={entry.platform || "other"}
                          onChange={(e) => updateQuickEntry(index, { platform: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white"
                        >
                          <option value="matchtrader">MatchTrader</option>
                          <option value="ctrader">cTrader</option>
                          <option value="dxtrade">DXtrade</option>
                          <option value="dxfutures">DX Futures</option>
                          <option value="tickblaze">Tickblaze</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                      <button
                        onClick={() => setQuickEntries((current) => current.filter((_, i) => i !== index))}
                        disabled={quickEntries.length <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-400/20 bg-rose-400/[0.05] text-rose-300 disabled:opacity-25"
                        aria-label="Remove contestant"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <details className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 lg:col-span-6">
                        <summary className="cursor-pointer font-['Orbitron'] text-[9px] font-black uppercase tracking-[0.12em] text-violet-300">
                          Admin account + contact details
                        </summary>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <label className="text-xs text-slate-500">
                            Email
                            <input
                              type="email"
                              value={adminMeta[entry.id]?.email || ""}
                              onChange={(e) => setAdminMeta((current) => ({ ...current, [entry.id]: { ...current[entry.id], email: e.target.value } }))}
                              placeholder="Trader email"
                              className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white"
                            />
                          </label>
                          <label className="text-xs text-slate-500">
                            Phone
                            <input
                              value={adminMeta[entry.id]?.phone || ""}
                              onChange={(e) => setAdminMeta((current) => ({ ...current, [entry.id]: { ...current[entry.id], phone: e.target.value } }))}
                              placeholder="Optional"
                              className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white"
                            />
                          </label>
                          <label className="text-xs text-slate-500">
                            Account type
                            <select
                              value={adminMeta[entry.id]?.accountKind || "demo"}
                              onChange={(e) => setAdminMeta((current) => ({ ...current, [entry.id]: { ...current[entry.id], accountKind: e.target.value as AdminEntryMeta["accountKind"] } }))}
                              className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white"
                            >
                              <option value="demo">Demo</option>
                              <option value="challenge">Challenge</option>
                              <option value="funded">Funded</option>
                            </select>
                          </label>
                          <label className="text-xs text-slate-500">
                            Platform login / account ID
                            <input
                              value={adminMeta[entry.id]?.platformLogin || ""}
                              onChange={(e) => setAdminMeta((current) => ({ ...current, [entry.id]: { ...current[entry.id], platformLogin: e.target.value } }))}
                              placeholder="No password stored"
                              className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 font-mono text-sm text-white"
                            />
                          </label>
                          <label className="text-xs text-slate-500">
                            Support status
                            <select
                              value={adminMeta[entry.id]?.supportStatus || "requested"}
                              onChange={(e) => setAdminMeta((current) => ({ ...current, [entry.id]: { ...current[entry.id], supportStatus: e.target.value as AdminEntryMeta["supportStatus"] } }))}
                              className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white"
                            >
                              <option value="requested">Requested</option>
                              <option value="created">Created</option>
                              <option value="delivered">Delivered</option>
                              <option value="verified">Verified</option>
                            </select>
                          </label>
                          <label className="text-xs text-slate-500 sm:col-span-2">
                            Support reference / note
                            <input
                              value={adminMeta[entry.id]?.supportReference || ""}
                              onChange={(e) => setAdminMeta((current) => ({ ...current, [entry.id]: { ...current[entry.id], supportReference: e.target.value } }))}
                              placeholder="Ticket, confirmation, or account-creation note"
                              className="mt-1 w-full rounded-lg border border-white/10 bg-[#07101b] px-3 py-2.5 text-sm text-white"
                            />
                          </label>
                          <label className="flex items-end gap-2 pb-2 text-xs text-slate-500">
                            <input
                              type="checkbox"
                              checked={Boolean(adminMeta[entry.id]?.credentialsDelivered)}
                              onChange={(e) => setAdminMeta((current) => ({ ...current, [entry.id]: { ...current[entry.id], credentialsDelivered: e.target.checked } }))}
                            />
                            Credentials delivered by support
                          </label>
                        </div>
                        <p className="mt-3 text-[9px] leading-relaxed text-slate-600">
                          Trade House stores the issued account/login ID and delivery state. Platform passwords are not kept in this normal admin record.
                        </p>
                      </details>
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
                        <div className="mt-2 text-xs text-slate-500">{row.sourceLabel || "Hybrid Funding"} · {(row.division || "trading").toUpperCase()} · {(row.platform || "other").toUpperCase()}</div>
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
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">Send each contestant their personal link. All eight seats can use the built-in room. Mobile layouts collapse cleanly, while OBS keeps the full broadcast grid.</p>
                      </div>
                      <button onClick={() => setRoomId(newRoomId())} className="rounded-lg border border-white/10 p-2 text-slate-400" aria-label="Generate new room"><RefreshCw className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3 font-mono text-sm font-black tracking-[0.2em] text-violet-300">ROOM {roomId} · {roomMode.toUpperCase()}</div>
                    <div className="mt-3 rounded-lg border border-violet-400/15 bg-violet-400/[0.05] p-2">
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs font-bold text-violet-200">Producer / host controls</span>
                        <button onClick={() => copy("producer-room", producerLink)} className="rounded-lg border border-violet-400/20 px-3 py-1.5 text-[10px] font-bold text-violet-200">
                          {copied === "producer-room" ? "COPIED" : "COPY PRODUCER LINK"}
                        </button>
                      </div>
                    </div>
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
                        onClick={() => downloadOBSCollection(base, false, readyQuickEntries[0]?.id || "", readyQuickEntries[1]?.id || "", quickEncoded, seasonName, experienceParams)}
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
                  Every division uses the Hybrid Funding public dashboard as the scoring feed. Prediction-market activity can live inside a Hybrid account and appear on the same dashboard, while the underlying execution platform remains metadata for display and filtering.
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
                ["VERIFIED DATA", "Scoring stays independent from camera/screen capture and always comes from the Hybrid Funding public dashboard."],
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
