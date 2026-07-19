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
} from "lucide-react";

/**
 * Radar Pro — INTERNAL, passcode-gated.
 *
 * Same scan engine as the public AI Market Radar, plus a pick layer that
 * takes a stance on every surviving signal:
 *
 *   LEAN YES / LEAN NO  directional lean with a confidence score
 *   SELL BOOK           structural overpricing — sell the rich outcomes
 *   PASS                no statistical edge; explicitly weeded out
 *
 * v1 leans are pure math (favorite-longshot bias, overshoot/drift
 * heuristics, bid-sum arithmetic). No API keys, no cost, runs in-browser.
 */

const DASHBOARD_URL = "https://hybridfundingdashboard.propaccount.com/en/prediction";
const API = "https://gamma-api.polymarket.com/events/pagination";
// SHA-256 of the access passcode (never stored in plaintext in the bundle)
const GATE_HASH = "070489c5d58234cafcbb2284b86305c07b09c1548febc5307157e632778ea285";
const GATE_KEY = "hf-radar-pro";

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
  confidence: number; // 50–80, honest heuristic scale
  why: string;
};

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
      const k = `${s.type}|${s.event}|${s.market}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

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
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(GATE_KEY) === GATE_HASH) setUnlocked(true);
    } catch {}
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
      setSignals(computeProSignals(events));
      setScanned(events.length);
      setUpdatedAt(new Date());
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHidePasses((v) => !v)}
                className={`rounded-full px-4 py-2 text-xs font-medium border transition-all ${
                  hidePasses
                    ? "glassmorphism neon-border text-accent"
                    : "bg-white/5 border-white/10 text-[#B8B8D0]"
                }`}
              >
                {hidePasses ? "Showing picks only" : "Showing everything"}
              </button>
              <Button variant="neon-filled" rounded="full" className="font-['Orbitron']" onClick={scan} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                SCAN NOW
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
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
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {failed && !signals.length ? (
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
                return (
                  <motion.a
                    key={`${s.type}|${s.event}|${s.market}`}
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
                    <p className="text-[#8888A8] text-[10px] mt-3 inline-flex items-center gap-1">
                      Open on dashboard <ExternalLink className="h-3 w-3" />
                    </p>
                  </motion.a>
                );
              })}
            </div>
          )}

          {!loading && !failed && visible.length === 0 && signals.length > 0 && (
            <p className="text-center text-[#8888A8] mt-8">
              Every current signal is a PASS — no statistical edge right now. That honesty is the feature.
            </p>
          )}

          <p className="mt-10 text-[11px] text-[#8888A8] max-w-2xl mx-auto text-center">
            Internal experimental tool. Leans are statistical heuristics (favorite-longshot bias, overshoot/drift
            patterns, book arithmetic), not guarantees — confidence numbers are honest and deliberately modest.
            Verify with research before trading. Track record logging comes next.
          </p>
        </div>
      </section>
    </div>
  );
};

export default RadarPro;
