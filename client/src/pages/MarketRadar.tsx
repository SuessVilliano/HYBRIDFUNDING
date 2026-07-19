import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";
import {
  Radar,
  TrendingUp,
  Activity,
  Timer,
  Scale,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/**
 * AI Market Radar — scans live prediction markets and surfaces candidate
 * opportunities using mechanical signals computed in the browser:
 *
 *   MOVER      big 24h probability swings on liquid markets
 *   VOL SPIKE  unusual 24h volume vs. book depth without a price move
 *   DECISION   resolving within 72h while still genuinely uncertain
 *   BOOK CHECK mutually exclusive outcomes priced to >100% combined
 *
 * Signals are research candidates, not trade recommendations.
 */

const DASHBOARD_URL = "https://hybridfundingdashboard.propaccount.com/en/prediction";
const API = "https://gamma-api.polymarket.com/events/pagination";

type SignalType = "MOVER" | "VOL SPIKE" | "DECISION" | "BOOK CHECK";

type Signal = {
  type: SignalType;
  score: number;
  event: string;
  market: string;
  detail: string;
  note: string;
  image?: string;
  vol24: number;
  endDate?: string;
};

const TYPE_META: Record<SignalType, { icon: typeof Radar; label: string; desc: string }> = {
  "BOOK CHECK": {
    icon: Scale,
    label: "Book Check",
    desc: "Mutually exclusive outcomes priced above 100% combined — structural mispricing you can research without an opinion on the outcome.",
  },
  MOVER: {
    icon: TrendingUp,
    label: "Movers",
    desc: "Big 24-hour probability swings on markets with real volume. Did news justify the move, or did the market overreact?",
  },
  "VOL SPIKE": {
    icon: Activity,
    label: "Volume Spikes",
    desc: "Heavy trading without a price move — the market is disagreeing hard. Often precedes a break once one side wins.",
  },
  DECISION: {
    icon: Timer,
    label: "Decision Windows",
    desc: "Resolving within 72 hours while still genuinely uncertain (20–80%). Fresh research has the most edge per hour here.",
  },
};

const TYPE_ORDER: SignalType[] = ["BOOK CHECK", "MOVER", "VOL SPIKE", "DECISION"];

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

const fmtEnd = (iso?: string): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const hoursTo = (iso?: string): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return null;
  return (t - Date.now()) / 3_600_000;
};

function computeSignals(events: any[]): Signal[] {
  const signals: Signal[] = [];

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
      // MOVER
      if (Math.abs(m.chg) >= 0.1 && m.vol24 >= 25_000 && m.yes >= 0.03 && m.yes <= 0.97) {
        signals.push({
          type: "MOVER",
          score: Math.abs(m.chg) * Math.log10(Math.max(m.vol24, 10)),
          event: title,
          market: m.q,
          detail: `Yes moved ${m.chg > 0 ? "+" : ""}${Math.round(m.chg * 100)} pts in 24h to ${Math.round(m.yes * 100)}% on ${fmtVol(m.vol24)} volume`,
          note: "Research the catalyst — justified move or overreaction?",
          image,
          vol24: m.vol24,
          endDate,
        });
      }
      // VOL SPIKE
      if (
        m.vol24 >= 100_000 &&
        m.liq > 0 &&
        m.vol24 / m.liq >= 8 &&
        Math.abs(m.chg) < 0.05 &&
        m.yes >= 0.05 &&
        m.yes <= 0.95
      ) {
        signals.push({
          type: "VOL SPIKE",
          score: (m.vol24 / m.liq) * 0.5,
          event: title,
          market: m.q,
          detail: `${fmtVol(m.vol24)} traded in 24h vs ${fmtVol(m.liq)} book — price barely moved (${Math.round(m.yes * 100)}%)`,
          note: "Two-way flow without a move = disagreement. Watch for the break.",
          image,
          vol24: m.vol24,
          endDate,
        });
      }
      // DECISION
      if (endh !== null && endh > 0 && endh <= 72 && m.yes >= 0.2 && m.yes <= 0.8 && m.vol24 >= 10_000) {
        signals.push({
          type: "DECISION",
          score: ((72 - endh) / 72) * 3 + Math.log10(Math.max(m.vol24, 10)),
          event: title,
          market: m.q,
          detail: `Resolves in ~${Math.max(1, Math.round(endh))}h, still at ${Math.round(m.yes * 100)}% (${fmtVol(m.vol24)} 24h vol)`,
          note: "The market can't make up its mind near resolution — prime research window.",
          image,
          vol24: m.vol24,
          endDate,
        });
      }
    }

    // BOOK CHECK — use BID prices so wide spreads on longshot-heavy books
    // don't create phantom signals; a bid sum above 100% is real overpricing.
    if (ms.length >= 3 && e?.negRisk) {
      const bidSum = ms.reduce((s: number, m: any) => s + m.bid, 0);
      if (bidSum >= 1.03 && num(e?.volume24hr) >= 25_000) {
        signals.push({
          type: "BOOK CHECK",
          score: (bidSum - 1) * 20,
          event: title,
          market: `${ms.length} outcomes`,
          detail: `Bid prices sum to ${Math.round(bidSum * 100)}% across ${ms.length} mutually exclusive outcomes`,
          note: "Real structural overpricing — the whole book can't be right.",
          image,
          vol24: num(e?.volume24hr),
          endDate,
        });
      }
    }
  }

  // dedupe + rank
  const seen = new Set<string>();
  return signals
    .sort((a, b) => b.score - a.score)
    .filter((s) => {
      const k = `${s.type}|${s.event}|${s.market}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

const MarketRadar = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [scanned, setScanned] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<SignalType | "ALL">("ALL");
  const abortRef = useRef<AbortController | null>(null);

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
      setSignals(computeSignals(events));
      setScanned(events.length);
      setUpdatedAt(new Date());
    } catch (err: any) {
      if (err?.name !== "AbortError") setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    scan();
    const interval = setInterval(scan, 120_000);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [scan]);

  const visible = useMemo(
    () => (filter === "ALL" ? signals : signals.filter((s) => s.type === filter)),
    [signals, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of signals) c[s.type] = (c[s.type] || 0) + 1;
    return c;
  }, [signals]);

  return (
    <div className="page-transition">
      <SEO
        title="AI Market Radar — Live Prediction Market Signals | Hybrid Funding"
        description="Our engine scans hundreds of live prediction markets for big movers, volume spikes, closing decision windows and mispriced books — refreshed every two minutes."
        path="/market-radar"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Predictive Markets", path: "/predictive-markets" },
            { name: "AI Market Radar", path: "/market-radar" },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="relative cyberpunk-bg overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 rounded-full glassmorphism neon-border px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent font-['Orbitron']">
              <Sparkles className="h-3.5 w-3.5" />
              Hybrid AI — Beta
            </span>
            <h1 className="font-['Orbitron'] text-4xl md:text-5xl font-bold mt-5 mb-4">
              <span className="text-white">AI Market </span>
              <span className="text-accent neon-text-accent">Radar</span>
            </h1>
            <p className="text-[#B8B8D0] text-lg max-w-2xl mx-auto mb-4">
              Our engine scans hundreds of live prediction markets and flags where the
              action is — big moves, unusual flow, closing decision windows, and books
              that don't add up. Do the research, then trade it funded.
            </p>
            <p className="text-xs text-[#8888A8]">
              {loading && !signals.length
                ? "Scanning live markets…"
                : failed && !signals.length
                  ? "Scanner offline — retry below"
                  : `Scanned ${scanned} live events · ${signals.length} signals · Updated ${updatedAt ? updatedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—"} · Auto-refreshes every 2 min`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Signals */}
      <section className="py-12 bg-[#0B1426] min-h-[50vh]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setFilter("ALL")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                filter === "ALL"
                  ? "glassmorphism neon-border text-accent"
                  : "bg-white/5 text-[#B8B8D0] hover:text-white hover:bg-white/10"
              }`}
            >
              All Signals{signals.length ? ` (${signals.length})` : ""}
            </button>
            {TYPE_ORDER.map((t) => {
              const Meta = TYPE_META[t];
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    filter === t
                      ? "glassmorphism neon-border text-accent"
                      : "bg-white/5 text-[#B8B8D0] hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Meta.icon className="h-4 w-4" />
                  {Meta.label}
                  {counts[t] ? ` (${counts[t]})` : ""}
                </button>
              );
            })}
          </div>

          {/* Active filter explainer */}
          {filter !== "ALL" && (
            <p className="text-center text-[#8888A8] text-sm max-w-2xl mx-auto mb-8">{TYPE_META[filter].desc}</p>
          )}

          {failed && !signals.length ? (
            <div className="max-w-xl mx-auto text-center glassmorphism rounded-xl p-8">
              <p className="text-[#B8B8D0] mb-4">
                The radar couldn't reach live market data. See every market on the dashboard instead.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
                  <Button variant="neon-filled" rounded="full" className="font-['Orbitron']">
                    OPEN LIVE MARKETS
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Button variant="neon" rounded="full" className="font-['Orbitron']" onClick={scan}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  RETRY
                </Button>
              </div>
            </div>
          ) : loading && !signals.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glassmorphism rounded-xl p-5 border border-white/5 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-1/4 mb-4" />
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-white/10 rounded w-full mb-2" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {visible.slice(0, 30).map((s, i) => {
                const Meta = TYPE_META[s.type];
                return (
                  <motion.a
                    key={`${s.type}|${s.event}|${s.market}`}
                    href={DASHBOARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group glassmorphism rounded-xl p-5 border border-white/5 hover:border-accent/50 hover:shadow-[0_0_12px_rgba(0,255,255,0.25)] transition-all duration-300 flex flex-col"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: (i % 6) * 0.04 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded bg-gradient-to-r from-primary/30 to-accent/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent font-['Orbitron']">
                        <Meta.icon className="h-3 w-3" />
                        {Meta.label}
                      </span>
                      <span className="text-[#8888A8] text-xs">
                        {fmtVol(s.vol24)} 24h{fmtEnd(s.endDate) ? ` · ends ${fmtEnd(s.endDate)}` : ""}
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
                    <p className="text-[#8888A8] text-xs mt-1.5 flex-1">{s.note}</p>
                  </motion.a>
                );
              })}
            </div>
          )}

          {!loading && !failed && visible.length === 0 && signals.length > 0 && (
            <p className="text-center text-[#8888A8] mt-8">No {filter !== "ALL" ? TYPE_META[filter as SignalType].label : ""} signals right now — check back soon.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 cyberpunk-bg relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white mb-3">
            Spot An Edge? Trade It Funded.
          </h2>
          <p className="text-[#B8B8D0] mb-6 max-w-xl mx-auto">
            Get a funded prediction market account from $98 — hit a 10% target once and keep up to 90%.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/predictive-markets">
              <Button variant="neon-filled" size="xl" rounded="full" className="font-['Orbitron'] shadow-glow-accent">
                GET A PREDICTION ACCOUNT
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="neon" size="xl" rounded="full" className="font-['Orbitron']">
                OPEN LIVE MARKETS
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
          <p className="mt-8 text-[11px] text-[#8888A8] max-w-2xl mx-auto">
            Signals are mechanically generated research candidates, not trade recommendations or financial
            advice. Markets are efficient — most signals will not be profitable edges. No guarantee of results.
          </p>
        </div>
      </section>
    </div>
  );
};

export default MarketRadar;
