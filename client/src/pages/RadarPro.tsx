import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import {
  Radar,
  TrendingUp,
  Activity,
  Timer,
  Scale,
  RefreshCw,
  ExternalLink,
  Lock,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  Banknote,
  Settings,
  Sparkles,
  History,
  Trash2,
  CheckCircle2,
  XCircle,
  CircleDashed,
  X,
} from "lucide-react";

/**
 * Radar Pro — INTERNAL, passcode-gated.
 *
 * v2 adds:
 *  - Track record: every LEAN YES / LEAN NO pick is logged (first-seen price)
 *    and auto-graded once its market resolves. History tab shows W-L + hit rates.
 *  - BYOK AI vetting: plug in any LLM API key (OpenAI, Anthropic, Gemini, Groq,
 *    xAI, DeepSeek, OpenRouter, or any OpenAI-compatible endpoint). Keys live in
 *    this browser's localStorage only — never in our code or on our servers.
 */

const DASHBOARD_URL = "https://hybridfundingdashboard.propaccount.com/en/prediction";
const API = "https://gamma-api.polymarket.com/events/pagination";
const MARKETS_API = "https://gamma-api.polymarket.com/markets";
// SHA-256 of the access passcode (never stored in plaintext in the bundle)
const GATE_HASH = "070489c5d58234cafcbb2284b86305c07b09c1548febc5307157e632778ea285";
const GATE_KEY = "hf-radar-pro";
const TRACK_KEY = "hf-rp-track";
const AI_KEY = "hf-rp-ai";

type SignalType = "MOVER" | "VOL SPIKE" | "DECISION" | "BOOK CHECK";
type Stance = "LEAN YES" | "LEAN NO" | "SELL BOOK" | "PASS";

type ProSignal = {
  type: SignalType;
  score: number;
  event: string;
  market: string;
  detail: string;
  image?: string;
  vol24: number;
  endDate?: string;
  stance: Stance;
  confidence: number;
  why: string;
  mid?: string; // gamma market id, for track-record grading
};

type TrackedPick = {
  key: string;
  type: SignalType;
  stance: "LEAN YES" | "LEAN NO";
  confidence: number;
  event: string;
  market: string;
  entryYes: number;
  ts: number;
  mid: string;
  status: "pending" | "won" | "lost" | "void";
  finalYes?: number;
  gradedTs?: number;
};

type AiVerdict = { verdict: "CONFIRM" | "REJECT" | "UNSURE"; reason: string };

type AiConfig = { provider: string; baseUrl: string; model: string; apiKey: string };

const AI_PRESETS: { id: string; name: string; baseUrl: string; model: string; kind: "openai" | "anthropic" | "gemini" }[] = [
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", kind: "openai" },
  { id: "anthropic", name: "Anthropic (Claude)", baseUrl: "https://api.anthropic.com", model: "claude-3-5-haiku-latest", kind: "anthropic" },
  { id: "gemini", name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com", model: "gemini-2.0-flash", kind: "gemini" },
  { id: "groq", name: "Groq (free tier)", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", kind: "openai" },
  { id: "xai", name: "xAI (Grok)", baseUrl: "https://api.x.ai/v1", model: "grok-2-latest", kind: "openai" },
  { id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com", model: "deepseek-chat", kind: "openai" },
  { id: "openrouter", name: "OpenRouter (any model)", baseUrl: "https://openrouter.ai/api/v1", model: "meta-llama/llama-3.3-70b-instruct", kind: "openai" },
  { id: "custom", name: "Custom (OpenAI-compatible)", baseUrl: "", model: "", kind: "openai" },
];

const num = (x: unknown, d = 0): number => {
  const v = typeof x === "string" ? parseFloat(x) : typeof x === "number" ? x : NaN;
  return isNaN(v) ? d : v;
};

const safeParse = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const fmtVol = (v: number): string => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}m`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}k`;
  return `$${Math.round(v)}`;
};

const hoursTo = (iso?: string): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  return (t - Date.now()) / 3_600_000;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const sigKey = (s: { type: string; event: string; market: string }) => `${s.type}|${s.event}|${s.market}`;

function computeProSignals(events: any[]): ProSignal[] {
  const out: ProSignal[] = [];

  for (const e of events || []) {
    const title = (e?.title || "").trim();
    const image = e?.image || e?.icon || undefined;
    const endDate = e?.endDate;
    const endh = hoursTo(endDate);

    const ms = (e?.markets || [])
      .filter((m: any) => m && m.active && !m.closed)
      .map((m: any) => {
        const prices = safeParse(m.outcomePrices);
        return {
          q: (m.groupItemTitle || m.question || "").trim(),
          mid: String(m.id ?? ""),
          yes: num(prices[0], -1),
          bid: num(m.bestBid),
          vol24: num(m.volume24hr),
          liq: num(m.liquidity),
          chg: num(m.oneDayPriceChange),
        };
      })
      .filter((m: any) => m.yes >= 0);

    if (!ms.length) continue;

    for (const m of ms) {
      const pct = Math.round(m.yes * 100);

      // MOVER — overshoot vs drift
      if (Math.abs(m.chg) >= 0.1 && m.vol24 >= 25_000 && m.yes >= 0.03 && m.yes <= 0.97) {
        let stance: Stance = "PASS";
        let confidence = 50;
        let why = "Move and volume are both moderate — no statistical lean either way.";
        const big = Math.abs(m.chg) >= 0.25;
        const heavy = m.vol24 >= 100_000;
        if (big && !heavy) {
          stance = m.chg > 0 ? "LEAN NO" : "LEAN YES";
          confidence = clamp(Math.round(52 + Math.abs(m.chg) * 40), 52, 68);
          why = `${Math.abs(Math.round(m.chg * 100))}-pt move on only ${fmtVol(m.vol24)} — big swings on modest volume tend to overshoot. Fade toward the pre-move price.`;
        } else if (!big && heavy) {
          const target = m.chg > 0 ? "LEAN YES" : "LEAN NO";
          const intoExtreme = (m.chg > 0 && m.yes > 0.92) || (m.chg < 0 && m.yes < 0.08);
          if (intoExtreme) {
            why = "Move looks real but the price has little room left — poor payoff to chase.";
          } else {
            stance = target;
            confidence = clamp(Math.round(52 + Math.abs(m.chg) * 30 + Math.log10(m.vol24)), 52, 64);
            why = `Confirmed by ${fmtVol(m.vol24)} of volume — markets historically underreact to real news, so the drift tends to continue.`;
          }
        }
        out.push({
          type: "MOVER",
          score: Math.abs(m.chg) * Math.log10(Math.max(m.vol24, 10)),
          event: title,
          market: m.q,
          detail: `Yes moved ${m.chg > 0 ? "+" : ""}${Math.round(m.chg * 100)} pts in 24h to ${pct}% on ${fmtVol(m.vol24)}`,
          image,
          vol24: m.vol24,
          endDate,
          stance,
          confidence,
          why,
          mid: m.mid,
        });
      }

      // VOL SPIKE — churn without movement
      if (
        m.vol24 >= 100_000 &&
        m.liq > 0 &&
        m.vol24 / m.liq >= 8 &&
        Math.abs(m.chg) < 0.05 &&
        m.yes >= 0.05 &&
        m.yes <= 0.95
      ) {
        let stance: Stance = "PASS";
        let confidence = 50;
        let why = "Two-way war with no price info — no lean until one side breaks. Watch it.";
        if (m.yes >= 0.85) {
          stance = "LEAN YES";
          confidence = clamp(Math.round(53 + (m.yes - 0.85) * 60), 53, 60);
          why = "Heavy churn against a pinned favorite — extreme favorites are historically underpriced (favorite-longshot bias), and the longshot buyers are usually the ones wrong.";
        } else if (m.yes <= 0.15) {
          stance = "LEAN NO";
          confidence = clamp(Math.round(53 + (0.15 - m.yes) * 60), 53, 60);
          why = "Heavy churn against a pinned longshot — longshots are historically overpriced; the NO side has the statistical edge.";
        }
        out.push({
          type: "VOL SPIKE",
          score: (m.vol24 / m.liq) * 0.5,
          event: title,
          market: m.q,
          detail: `${fmtVol(m.vol24)} traded vs ${fmtVol(m.liq)} book — price flat at ${pct}%`,
          image,
          vol24: m.vol24,
          endDate,
          stance,
          confidence,
          why,
          mid: m.mid,
        });
      }

      // DECISION — favorite-longshot bias near resolution
      if (endh !== null && endh > 0 && endh <= 72 && m.yes >= 0.2 && m.yes <= 0.8 && m.vol24 >= 10_000) {
        let stance: Stance = "PASS";
        let confidence = 50;
        let why = "Effectively a coin flip near resolution — only trade this if your research finds something the market missed.";
        if (m.yes >= 0.55) {
          stance = "LEAN YES";
          confidence = clamp(Math.round(50 + (m.yes - 0.5) * 60 + Math.min(6, Math.log10(m.vol24))), 52, 72);
          why = `Favorite at ${pct}% into resolution — favorites are historically underpriced near the wire (favorite-longshot bias). Confirm with 30 minutes of current research.`;
        } else if (m.yes <= 0.45) {
          stance = "LEAN NO";
          confidence = clamp(Math.round(50 + (0.5 - m.yes) * 60 + Math.min(6, Math.log10(m.vol24))), 52, 72);
          why = `Underdog at ${pct}% into resolution — longshots are historically overpriced, so NO carries the statistical edge. Confirm before trading.`;
        }
        out.push({
          type: "DECISION",
          score: ((72 - endh) / 72) * 3 + Math.log10(Math.max(m.vol24, 10)),
          event: title,
          market: m.q,
          detail: `Resolves in ~${Math.max(1, Math.round(endh))}h, at ${pct}% (${fmtVol(m.vol24)} 24h)`,
          image,
          vol24: m.vol24,
          endDate,
          stance,
          confidence,
          why,
          mid: m.mid,
        });
      }
    }

    // BOOK CHECK — arithmetic overpricing (bid side)
    if (ms.length >= 3 && e?.negRisk) {
      const bidSum = ms.reduce((s: number, m: any) => s + m.bid, 0);
      if (bidSum >= 1.03 && num(e?.volume24hr) >= 25_000) {
        const richest = [...ms].sort((a: any, b: any) => b.bid - a.bid).slice(0, 2);
        out.push({
          type: "BOOK CHECK",
          score: (bidSum - 1) * 20,
          event: title,
          market: `${ms.length} outcomes`,
          detail: `Bids sum to ${Math.round(bidSum * 100)}% across ${ms.length} mutually exclusive outcomes`,
          image,
          vol24: num(e?.volume24hr),
          endDate,
          stance: "SELL BOOK",
          confidence: clamp(Math.round(60 + (bidSum - 1.03) * 400), 60, 80),
          why: `The book is mathematically overpriced by ${Math.round((bidSum - 1) * 100)} pts. Selling the richest outcomes (start with ${richest.map((r: any) => `${r.q} @ ${Math.round(r.bid * 100)}%`).join(", ")}) profits regardless of the winner — check fillable size first.`,
        });
      }
    }
  }

  const seen = new Set<string>();
  return out
    .sort((a, b) => {
      const act = (s: ProSignal) => (s.stance === "PASS" ? 0 : 1);
      return act(b) - act(a) || b.confidence - a.confidence || b.score - a.score;
    })
    .filter((s) => {
      const k = sigKey(s);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

// ---------- track record (localStorage) ----------

const loadTrack = (): TrackedPick[] => {
  try {
    const raw = localStorage.getItem(TRACK_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const saveTrack = (t: TrackedPick[]) => {
  try {
    localStorage.setItem(TRACK_KEY, JSON.stringify(t.slice(-600)));
  } catch {}
};

const recordPicks = (signals: ProSignal[]): TrackedPick[] => {
  const track = loadTrack();
  const known = new Set(track.map((t) => t.key));
  for (const s of signals) {
    if ((s.stance !== "LEAN YES" && s.stance !== "LEAN NO") || !s.mid) continue;
    const key = sigKey(s);
    if (known.has(key)) continue;
    const pctMatch = s.detail.match(/at (\d+)%/) || s.detail.match(/to (\d+)%/);
    track.push({
      key,
      type: s.type,
      stance: s.stance,
      confidence: s.confidence,
      event: s.event,
      market: s.market,
      entryYes: pctMatch ? parseInt(pctMatch[1]) / 100 : -1,
      ts: Date.now(),
      mid: s.mid,
      status: "pending",
    });
    known.add(key);
  }
  saveTrack(track);
  return track;
};

const gradeTrack = async (): Promise<TrackedPick[]> => {
  const track = loadTrack();
  const pending = track.filter((t) => t.status === "pending" && t.mid);
  if (!pending.length) return track;
  const ids = Array.from(new Set(pending.map((t) => t.mid)));
  const byId: Record<string, any> = {};
  for (let i = 0; i < ids.length; i += 20) {
    const chunk = ids.slice(i, i + 20);
    try {
      const res = await fetch(`${MARKETS_API}?${chunk.map((id) => `id=${id}`).join("&")}`);
      if (!res.ok) continue;
      const arr = await res.json();
      for (const m of Array.isArray(arr) ? arr : []) byId[String(m.id)] = m;
    } catch {}
  }
  for (const t of track) {
    if (t.status !== "pending") continue;
    const m = byId[t.mid];
    if (!m || !m.closed) continue;
    const finalYes = num(safeParse(m.outcomePrices)[0], -1);
    if (finalYes < 0) continue;
    t.finalYes = finalYes;
    t.gradedTs = Date.now();
    if (finalYes >= 0.95) t.status = t.stance === "LEAN YES" ? "won" : "lost";
    else if (finalYes <= 0.05) t.status = t.stance === "LEAN NO" ? "won" : "lost";
    else t.status = "void"; // ambiguous resolution
  }
  saveTrack(track);
  return track;
};

// ---------- BYOK AI vetting ----------

const loadAiCfg = (): AiConfig | null => {
  try {
    const raw = localStorage.getItem(AI_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    return c && c.apiKey && c.model ? c : null;
  } catch {
    return null;
  }
};

const extractJson = (text: string): any => {
  const cleaned = text.replace(/```json/gi, "```").split("```").filter(Boolean);
  for (const part of [text, ...cleaned]) {
    const start = part.indexOf("[");
    const end = part.lastIndexOf("]");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(part.slice(start, end + 1));
      } catch {}
    }
  }
  return null;
};

const runAiVet = async (cfg: AiConfig, picks: ProSignal[]): Promise<Record<string, AiVerdict>> => {
  const preset = AI_PRESETS.find((p) => p.id === cfg.provider);
  const kind = preset?.kind || "openai";
  const today = new Date().toDateString();
  const list = picks
    .map(
      (s, i) =>
        `${i}. [${s.stance} ${s.confidence}%] ${s.event} — ${s.market}. Data: ${s.detail}. Statistical basis: ${s.why}`,
    )
    .join("\n");
  const prompt = `Today is ${today}. You are vetting statistical picks on prediction markets (probability that the named outcome happens). For each pick below, use your knowledge and reasoning to judge whether the statistical lean makes sense. If you lack current information about the event, reason from base rates and say so — do not invent news.

Picks:
${list}

Respond with ONLY a JSON array, one object per pick, in the same order:
[{"i": 0, "verdict": "CONFIRM" | "REJECT" | "UNSURE", "reason": "<one sentence, max 20 words>"}, ...]`;

  let text = "";
  if (kind === "anthropic") {
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": cfg.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model: cfg.model, max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 120)}`);
    const j = await res.json();
    text = j?.content?.[0]?.text || "";
  } else if (kind === "gemini") {
    const res = await fetch(
      `${cfg.baseUrl.replace(/\/$/, "")}/v1beta/models/${cfg.model}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 120)}`);
    const j = await res.json();
    text = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } else {
    const res = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${cfg.apiKey}` },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 120)}`);
    const j = await res.json();
    text = j?.choices?.[0]?.message?.content || "";
  }

  const arr = extractJson(text);
  if (!Array.isArray(arr)) throw new Error("Model returned unparseable output — try a different model.");
  const out: Record<string, AiVerdict> = {};
  for (const v of arr) {
    const idx = num(v?.i, -1);
    const verdict = ["CONFIRM", "REJECT", "UNSURE"].includes(v?.verdict) ? v.verdict : "UNSURE";
    if (idx >= 0 && idx < picks.length) out[sigKey(picks[idx])] = { verdict, reason: String(v?.reason || "").slice(0, 160) };
  }
  return out;
};

// ---------- UI meta ----------

const STANCE_META: Record<Stance, { color: string; bg: string; icon: typeof ThumbsUp }> = {
  "LEAN YES": { color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/40", icon: ThumbsUp },
  "LEAN NO": { color: "text-red-400", bg: "bg-red-400/10 border-red-400/40", icon: ThumbsDown },
  "SELL BOOK": { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/40", icon: Banknote },
  PASS: { color: "text-[#8888A8]", bg: "bg-white/5 border-white/10", icon: MinusCircle },
};

const TYPE_ICON: Record<SignalType, typeof Radar> = {
  MOVER: TrendingUp,
  "VOL SPIKE": Activity,
  DECISION: Timer,
  "BOOK CHECK": Scale,
};

const VERDICT_META: Record<AiVerdict["verdict"], { color: string; icon: typeof CheckCircle2 }> = {
  CONFIRM: { color: "text-emerald-400", icon: CheckCircle2 },
  REJECT: { color: "text-red-400", icon: XCircle },
  UNSURE: { color: "text-amber-400", icon: CircleDashed },
};

const sha256Hex = async (text: string): Promise<string> => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const RadarPro = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [gateError, setGateError] = useState(false);
  const [signals, setSignals] = useState<ProSignal[]>([]);
  const [scanned, setScanned] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hidePasses, setHidePasses] = useState(true);
  const [tab, setTab] = useState<"picks" | "history">("picks");
  const [track, setTrack] = useState<TrackedPick[]>([]);
  const [aiCfg, setAiCfg] = useState<AiConfig | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResults, setAiResults] = useState<Record<string, AiVerdict>>({});
  const [draft, setDraft] = useState<AiConfig>({ provider: "gemini", baseUrl: AI_PRESETS[2].baseUrl, model: AI_PRESETS[2].model, apiKey: "" });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(GATE_KEY) === GATE_HASH) setUnlocked(true);
    } catch {}
    const cfg = loadAiCfg();
    if (cfg) {
      setAiCfg(cfg);
      setDraft(cfg);
    }
    setTrack(loadTrack());
  }, []);

  const tryUnlock = async () => {
    const h = await sha256Hex(code.trim());
    if (h === GATE_HASH) {
      try {
        localStorage.setItem(GATE_KEY, GATE_HASH);
      } catch {}
      setUnlocked(true);
      setGateError(false);
    } else {
      setGateError(true);
    }
  };

  const scan = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setFailed(false);
    try {
      const events: any[] = [];
      for (let page = 0; page < 3; page++) {
        const params = new URLSearchParams({
          limit: "100",
          offset: String(page * 100),
          active: "true",
          closed: "false",
          order: "volume24hr",
          ascending: "false",
        });
        const res = await fetch(`${API}?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = json?.data || [];
        events.push(...data);
        if (data.length < 100) break;
      }
      if (!events.length) throw new Error("empty");
      const sigs = computeProSignals(events);
      setSignals(sigs);
      setScanned(events.length);
      setUpdatedAt(new Date());
      setTrack(recordPicks(sigs));
      gradeTrack().then(setTrack).catch(() => {});
    } catch (err: any) {
      if (err?.name !== "AbortError") setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    scan();
    const interval = setInterval(scan, 120_000);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [unlocked, scan]);

  const visible = useMemo(
    () => (hidePasses ? signals.filter((s) => s.stance !== "PASS") : signals),
    [signals, hidePasses],
  );

  const counts = useMemo(() => {
    const c: Record<Stance, number> = { "LEAN YES": 0, "LEAN NO": 0, "SELL BOOK": 0, PASS: 0 };
    for (const s of signals) c[s.stance]++;
    return c;
  }, [signals]);

  const stats = useMemo(() => {
    const graded = track.filter((t) => t.status === "won" || t.status === "lost");
    const won = graded.filter((t) => t.status === "won").length;
    const byType: Record<string, { w: number; n: number }> = {};
    for (const t of graded) {
      byType[t.type] = byType[t.type] || { w: 0, n: 0 };
      byType[t.type].n++;
      if (t.status === "won") byType[t.type].w++;
    }
    return {
      graded: graded.length,
      won,
      lost: graded.length - won,
      rate: graded.length ? Math.round((won / graded.length) * 100) : 0,
      pending: track.filter((t) => t.status === "pending").length,
      voided: track.filter((t) => t.status === "void").length,
      byType,
    };
  }, [track]);

  const vetNow = async () => {
    if (!aiCfg) {
      setAiOpen(true);
      return;
    }
    const actionable = visible.filter((s) => s.stance !== "PASS").slice(0, 12);
    if (!actionable.length) return;
    setAiBusy(true);
    setAiError("");
    try {
      const res = await runAiVet(aiCfg, actionable);
      setAiResults((prev) => ({ ...prev, ...res }));
    } catch (e: any) {
      setAiError(String(e?.message || e).slice(0, 200));
    } finally {
      setAiBusy(false);
    }
  };

  const saveAi = () => {
    const cfg = { ...draft, baseUrl: draft.baseUrl.trim(), model: draft.model.trim(), apiKey: draft.apiKey.trim() };
    try {
      localStorage.setItem(AI_KEY, JSON.stringify(cfg));
    } catch {}
    setAiCfg(cfg.apiKey ? cfg : null);
    setAiOpen(false);
  };

  const clearHistory = () => {
    saveTrack([]);
    setTrack([]);
  };

  if (!unlocked) {
    return (
      <div className="page-transition min-h-[70vh] flex items-center justify-center bg-[#0B1426] px-4">
        <SEO title="Radar Pro" description="Internal tools." path="/radar-pro" noindex />
        <div className="glassmorphism neon-border rounded-2xl p-8 max-w-sm w-full text-center">
          <Lock className="h-8 w-8 text-accent mx-auto mb-4" />
          <h1 className="font-['Orbitron'] text-xl font-bold text-white mb-2">Radar Pro</h1>
          <p className="text-[#8888A8] text-sm mb-5">Internal access only. Enter the passcode.</p>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()}
            className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-3 text-white text-center tracking-widest focus:outline-none focus:border-accent mb-3"
            placeholder="••••••"
            autoFocus
          />
          {gateError && <p className="text-red-400 text-xs mb-3">Wrong passcode.</p>}
          <Button variant="neon-filled" rounded="full" className="w-full font-['Orbitron']" onClick={tryUnlock}>
            UNLOCK
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition bg-[#0B1426] min-h-screen">
      <SEO title="Radar Pro — Internal Picks" description="Internal tools." path="/radar-pro" noindex />

      {/* AI settings modal */}
      {aiOpen && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-label="AI settings">
          <div className="absolute inset-0 bg-black/70" onClick={() => setAiOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md glassmorphism neon-border rounded-2xl bg-[#12122A] p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Orbitron'] text-white font-bold">AI Analyst — Bring Your Own Key</h3>
              <button aria-label="Close" onClick={() => setAiOpen(false)} className="text-[#8888A8] p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block text-xs text-[#8888A8] mb-1">Provider</label>
            <select
              value={draft.provider}
              onChange={(e) => {
                const p = AI_PRESETS.find((x) => x.id === e.target.value)!;
                setDraft((d) => ({ ...d, provider: p.id, baseUrl: p.baseUrl || d.baseUrl, model: p.model || d.model }));
              }}
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-accent [&>option]:bg-[#12122A]"
            >
              {AI_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <label className="block text-xs text-[#8888A8] mb-1">API key (stored only in this browser)</label>
            <input
              type="password"
              value={draft.apiKey}
              onChange={(e) => setDraft((d) => ({ ...d, apiKey: e.target.value }))}
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-accent"
              placeholder="sk-…"
            />
            <label className="block text-xs text-[#8888A8] mb-1">Model</label>
            <input
              value={draft.model}
              onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))}
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2.5 text-white text-sm mb-3 focus:outline-none focus:border-accent"
            />
            <label className="block text-xs text-[#8888A8] mb-1">Base URL</label>
            <input
              value={draft.baseUrl}
              onChange={(e) => setDraft((d) => ({ ...d, baseUrl: e.target.value }))}
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2.5 text-white text-sm mb-4 focus:outline-none focus:border-accent"
              placeholder="https://api.example.com/v1"
            />
            <p className="text-[10px] text-[#8888A8] mb-4">
              Your key is saved in this browser's localStorage only — it never touches our servers or code. Calls go
              straight from your device to the provider. Groq and Gemini have free tiers.
            </p>
            <div className="flex gap-3">
              <Button variant="neon-filled" rounded="full" className="flex-1 font-['Orbitron']" onClick={saveAi}>
                SAVE
              </Button>
              {aiCfg && (
                <Button
                  variant="neon"
                  rounded="full"
                  className="font-['Orbitron']"
                  onClick={() => {
                    try {
                      localStorage.removeItem(AI_KEY);
                    } catch {}
                    setAiCfg(null);
                    setDraft((d) => ({ ...d, apiKey: "" }));
                    setAiOpen(false);
                  }}
                >
                  REMOVE KEY
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="relative cyberpunk-bg overflow-hidden py-10">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white">
                Radar <span className="text-accent neon-text-accent">Pro</span>
                <span className="ml-3 align-middle rounded bg-amber-400/15 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Internal
                </span>
              </h1>
              <p className="text-xs text-[#8888A8] mt-2">
                {loading && !signals.length
                  ? "Scanning…"
                  : failed && !signals.length
                    ? "Scanner offline"
                    : `${scanned} events · ${counts["LEAN YES"] + counts["LEAN NO"] + counts["SELL BOOK"]} picks / ${counts.PASS} passes · ${updatedAt ? updatedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—"} · auto-refresh 2 min`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAiOpen(true)}
                className="rounded-full p-2.5 bg-white/5 border border-white/10 text-[#B8B8D0] hover:text-accent transition-colors"
                aria-label="AI settings"
              >
                <Settings className="h-4 w-4" />
              </button>
              <Button
                variant="neon"
                rounded="full"
                className="font-['Orbitron']"
                onClick={vetNow}
                disabled={aiBusy || tab !== "picks"}
              >
                <Sparkles className={`mr-2 h-4 w-4 ${aiBusy ? "animate-pulse" : ""}`} />
                {aiBusy ? "VETTING…" : aiCfg ? "AI VET" : "AI VET (ADD KEY)"}
              </Button>
              <Button variant="neon-filled" rounded="full" className="font-['Orbitron']" onClick={scan} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                SCAN NOW
              </Button>
            </div>
          </div>

          {aiError && <p className="text-red-400 text-xs mt-3">AI error: {aiError}</p>}

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={() => setTab("picks")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold border transition-all ${
                tab === "picks" ? "glassmorphism neon-border text-accent" : "bg-white/5 border-white/10 text-[#B8B8D0]"
              }`}
            >
              PICKS
            </button>
            <button
              onClick={() => setTab("history")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold border transition-all ${
                tab === "history" ? "glassmorphism neon-border text-accent" : "bg-white/5 border-white/10 text-[#B8B8D0]"
              }`}
            >
              <History className="h-3.5 w-3.5" />
              TRACK RECORD
              {stats.graded > 0 && (
                <span className="text-[10px] opacity-80">
                  {stats.won}-{stats.lost}
                </span>
              )}
            </button>
            {tab === "picks" && (
              <button
                onClick={() => setHidePasses((v) => !v)}
                className="rounded-full px-4 py-1.5 text-xs font-medium border bg-white/5 border-white/10 text-[#B8B8D0] hover:text-white transition-all"
              >
                {hidePasses ? "Showing picks only" : "Showing everything"}
              </button>
            )}
          </div>

          {tab === "picks" && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(Object.keys(counts) as Stance[]).map((st) => {
                const Meta = STANCE_META[st];
                return (
                  <span key={st} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${Meta.bg} ${Meta.color}`}>
                    <Meta.icon className="h-3.5 w-3.5" />
                    {st}: {counts[st]}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {tab === "history" ? (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Record", value: `${stats.won}W – ${stats.lost}L` },
                  { label: "Hit rate", value: stats.graded ? `${stats.rate}%` : "—" },
                  { label: "Pending", value: String(stats.pending) },
                  { label: "Logged total", value: String(track.length) },
                ].map((s) => (
                  <div key={s.label} className="glassmorphism rounded-xl p-4 border border-white/5 text-center">
                    <p className="text-[#8888A8] text-[10px] uppercase tracking-wider font-bold">{s.label}</p>
                    <p className="text-white font-['Orbitron'] text-xl font-bold mt-1">{s.value}</p>
                  </div>
                ))}
              </div>

              {Object.keys(stats.byType).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(stats.byType).map(([t, v]) => (
                    <span key={t} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-[#B8B8D0]">
                      {t}: {v.w}/{v.n} ({Math.round((v.w / v.n) * 100)}%)
                    </span>
                  ))}
                </div>
              )}

              {track.length === 0 ? (
                <div className="glassmorphism rounded-xl p-8 text-center text-[#8888A8]">
                  No picks logged yet. Every LEAN YES / LEAN NO from the Picks tab is recorded automatically at its
                  first-seen price, then graded when the market resolves.
                </div>
              ) : (
                <div className="space-y-2">
                  {[...track]
                    .sort((a, b) => (a.status === "pending" ? 1 : 0) - (b.status === "pending" ? 1 : 0) || (b.gradedTs || b.ts) - (a.gradedTs || a.ts))
                    .slice(0, 100)
                    .map((t) => {
                      const Meta = STANCE_META[t.stance];
                      return (
                        <div key={t.key + t.ts} className="glassmorphism rounded-xl p-4 border border-white/5 flex items-center gap-3">
                          <span
                            className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                              t.status === "won"
                                ? "bg-emerald-400/10 border-emerald-400/40 text-emerald-400"
                                : t.status === "lost"
                                  ? "bg-red-400/10 border-red-400/40 text-red-400"
                                  : t.status === "void"
                                    ? "bg-white/5 border-white/10 text-[#8888A8]"
                                    : "bg-amber-400/10 border-amber-400/40 text-amber-400"
                            }`}
                          >
                            {t.status.toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">
                              {t.event}
                              {t.market && t.market !== t.event ? ` — ${t.market}` : ""}
                            </p>
                            <p className="text-[#8888A8] text-xs mt-0.5">
                              <span className={Meta.color}>{t.stance}</span> · {t.confidence}% conf · {t.type} · entry{" "}
                              {t.entryYes >= 0 ? `${Math.round(t.entryYes * 100)}%` : "—"}
                              {t.finalYes !== undefined ? ` → resolved ${Math.round(t.finalYes * 100)}%` : ""} ·{" "}
                              {new Date(t.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {track.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs text-[#8888A8] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear history
                </button>
              )}
              <p className="mt-6 text-[11px] text-[#8888A8]">
                History is stored on this device. Grading is automatic: a pick wins if the market resolves on its side
                (≥95% / ≤5%); ambiguous resolutions are marked VOID and excluded from the record.
              </p>
            </div>
          ) : failed && !signals.length ? (
            <div className="max-w-xl mx-auto text-center glassmorphism rounded-xl p-8">
              <p className="text-[#B8B8D0] mb-4">Couldn't reach live market data.</p>
              <Button variant="neon" rounded="full" className="font-['Orbitron']" onClick={scan}>
                <RefreshCw className="mr-2 h-4 w-4" />
                RETRY
              </Button>
            </div>
          ) : loading && !signals.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glassmorphism rounded-xl p-5 border border-white/5 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {visible.slice(0, 40).map((s, i) => {
                const Meta = STANCE_META[s.stance];
                const TypeIcon = TYPE_ICON[s.type];
                const ai = aiResults[sigKey(s)];
                const AiIcon = ai ? VERDICT_META[ai.verdict].icon : null;
                return (
                  <motion.a
                    key={sigKey(s)}
                    href={DASHBOARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group glassmorphism rounded-xl p-5 border border-white/5 hover:border-accent/50 transition-all duration-300 flex flex-col"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: (i % 6) * 0.03 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${Meta.bg} ${Meta.color}`}>
                        <Meta.icon className="h-3.5 w-3.5" />
                        {s.stance}
                        {s.stance !== "PASS" && <span className="opacity-80">· {s.confidence}%</span>}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#8888A8] text-[10px] uppercase tracking-wider font-bold">
                        <TypeIcon className="h-3 w-3" />
                        {s.type}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      {s.image ? (
                        <img
                          src={s.image}
                          alt=""
                          loading="lazy"
                          className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.outerHTML =
                              '<div class="h-9 w-9 rounded-lg bg-gradient-to-r from-primary to-accent flex-shrink-0"></div>';
                          }}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-primary to-accent flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-accent transition-colors">
                          {s.event}
                        </h3>
                        {s.market && s.market !== s.event && (
                          <p className="text-[#B8B8D0] text-xs mt-0.5 truncate">{s.market}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-white text-sm mt-3">{s.detail}</p>
                    <p className={`text-xs mt-2 flex-1 ${s.stance === "PASS" ? "text-[#8888A8]" : Meta.color}`}>{s.why}</p>
                    {ai && AiIcon && (
                      <p className={`text-xs mt-2 inline-flex items-start gap-1.5 ${VERDICT_META[ai.verdict].color}`}>
                        <AiIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>
                          AI {ai.verdict}: {ai.reason}
                        </span>
                      </p>
                    )}
                    <p className="text-[#8888A8] text-[10px] mt-3 inline-flex items-center gap-1">
                      Open on dashboard <ExternalLink className="h-3 w-3" />
                    </p>
                  </motion.a>
                );
              })}
            </div>
          )}

          {tab === "picks" && !loading && !failed && visible.length === 0 && signals.length > 0 && (
            <p className="text-center text-[#8888A8] mt-8">
              Every current signal is a PASS — no statistical edge right now. That honesty is the feature.
            </p>
          )}

          {tab === "picks" && (
            <p className="mt-10 text-[11px] text-[#8888A8] max-w-2xl mx-auto text-center">
              Internal experimental tool. Leans are statistical heuristics (favorite-longshot bias, overshoot/drift
              patterns, book arithmetic), not guarantees. AI vetting uses your own API key and adds a second opinion —
              still not financial advice. Every lean is logged and graded on the Track Record tab.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default RadarPro;
