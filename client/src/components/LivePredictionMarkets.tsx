import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Landmark,
  Trophy,
  Bitcoin,
  Globe2,
  Gamepad2,
  LineChart,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

/**
 * Live prediction market preview.
 * Pulls live event data from Polymarket's public Gamma API — the same
 * markets available inside the Hybrid Funding prediction dashboard —
 * and deep-links traders into the dashboard to trade them.
 */

const DASHBOARD_URL = "https://hybridfundingdashboard.propaccount.com/en/prediction";

type Category = {
  key: string;
  label: string;
  tagSlug: string | null;
  icon: typeof TrendingUp;
};

const CATEGORIES: Category[] = [
  { key: "trending", label: "Trending", tagSlug: null, icon: TrendingUp },
  { key: "politics", label: "Politics", tagSlug: "politics", icon: Landmark },
  { key: "sports", label: "Sports", tagSlug: "sports", icon: Trophy },
  { key: "crypto", label: "Crypto", tagSlug: "crypto", icon: Bitcoin },
  { key: "finance", label: "Finance", tagSlug: "business", icon: LineChart },
  { key: "world", label: "World", tagSlug: "geopolitics", icon: Globe2 },
  { key: "esports", label: "Esports", tagSlug: "esports", icon: Gamepad2 },
];

type Outcome = {
  label: string;
  yesPct: number;
  vol: number;
};

type LiveEvent = {
  id: string;
  title: string;
  image?: string;
  volume: number;
  endDate?: string;
  outcomes: Outcome[];
};

const formatVolume = (v: number): string => {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(2)}b Vol.`;
  if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}m Vol.`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}k Vol.`;
  return `$${Math.round(v)} Vol.`;
};

const formatEndDate = (iso?: string): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const safeParse = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const parseEvents = (data: any[]): LiveEvent[] => {
  const events: LiveEvent[] = [];
  for (const e of data || []) {
    const markets = (e?.markets || []).filter((m: any) => m && m.active && !m.closed);
    const outcomes: Outcome[] = [];

    if (markets.length > 1) {
      // Multi-outcome event (e.g. "World Cup Winner" → Spain, England, ...)
      // Show the two most likely outcomes (placeholder markets are
      // filtered out above via m.active).
      const parsed = markets
        .map((m: any) => {
          const prices = safeParse(m.outcomePrices);
          const yes = parseFloat(prices[0] ?? "");
          return {
            label: (m.groupItemTitle || m.question || "").trim(),
            yesPct: isNaN(yes) ? -1 : Math.round(yes * 100),
            vol: Number(m.volume ?? m.volume24hr ?? 0),
          };
        })
        .filter((o: Outcome) => o.label && o.yesPct >= 0)
        .sort((a: Outcome, b: Outcome) => b.yesPct - a.yesPct || b.vol - a.vol)
        .slice(0, 2);
      outcomes.push(...parsed);
    } else if (markets.length === 1) {
      // Single binary market → show Yes price
      const m = markets[0];
      const prices = safeParse(m.outcomePrices);
      const labels = safeParse(m.outcomes);
      prices.slice(0, 2).forEach((p: string, i: number) => {
        const val = parseFloat(p);
        if (!isNaN(val) && labels[i]) {
          outcomes.push({ label: labels[i], yesPct: Math.round(val * 100), vol: 0 });
        }
      });
    }

    if (!outcomes.length) continue;

    events.push({
      id: String(e.id ?? e.slug ?? e.title),
      title: (e.title || "").trim(),
      image: e.image || e.icon || undefined,
      volume: Number(e.volume24hr ?? e.volume ?? 0),
      endDate: e.endDate,
      outcomes,
    });
    if (events.length >= 6) break;
  }
  return events;
};

const LivePredictionMarkets = () => {
  const [active, setActive] = useState<string>("trending");
  const [cache, setCache] = useState<Record<string, LiveEvent[]>>({});
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (catKey: string, force = false) => {
      const cat = CATEGORIES.find((c) => c.key === catKey);
      if (!cat) return;

      setFailed(false);
      if (!force && cache[catKey]?.length) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      try {
        const params = new URLSearchParams({
          limit: "8",
          active: "true",
          closed: "false",
          order: "volume24hr",
          ascending: "false",
        });
        if (cat.tagSlug) params.set("tag_slug", cat.tagSlug);

        const res = await fetch(
          `https://gamma-api.polymarket.com/events/pagination?${params.toString()}`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const events = parseEvents(json?.data || []);
        if (!events.length) throw new Error("empty");
        setCache((prev) => ({ ...prev, [catKey]: events }));
      } catch (err: any) {
        if (err?.name !== "AbortError") setFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [cache],
  );

  useEffect(() => {
    load(active);
    // Refresh the visible tab every 60s so prices stay live
    const interval = setInterval(() => load(active, true), 60_000);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [active, load]);

  const events = cache[active] || [];

  return (
    <section id="live-markets" className="py-20 bg-gradient-to-b from-[#1A1A2E] to-[#0B1426]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full glassmorphism neon-border px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent font-['Orbitron']">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            Live Markets
          </span>
          <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mt-5 mb-4">
            What's Trading Right Now
          </h2>
          <p className="text-[#B8B8D0] text-lg">
            This is way more than stocks, futures, and crypto. Politics, sports, world
            events, finance, even esports — live odds from the same markets you'll trade
            inside your funded account.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((c) => {
            const isActive = c.key === active;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "glassmorphism neon-border text-accent shadow-[0_0_8px_rgba(0,255,255,0.4)]"
                    : "bg-white/5 text-[#B8B8D0] hover:text-white hover:bg-white/10"
                }`}
              >
                <c.icon className="h-4 w-4" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Market cards */}
        {failed && !events.length ? (
          <div className="max-w-xl mx-auto text-center glassmorphism rounded-xl p-8">
            <p className="text-[#B8B8D0] mb-4">
              Live market data is taking a breather. See every market live on the dashboard instead.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="neon-filled" rounded="full" className="font-['Orbitron']">
                  OPEN LIVE MARKETS
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <Button
                variant="neon"
                rounded="full"
                className="font-['Orbitron']"
                onClick={() => load(active, true)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                RETRY
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {(loading && !events.length ? Array.from({ length: 6 }) : events).map(
              (ev: any, i: number) =>
                ev ? (
                  <motion.a
                    key={ev.id}
                    href={DASHBOARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group glassmorphism rounded-xl p-5 border border-white/5 hover:border-accent/50 hover:shadow-[0_0_12px_rgba(0,255,255,0.25)] transition-all duration-300 flex flex-col"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      {ev.image ? (
                        <img
                          src={ev.image}
                          alt=""
                          loading="lazy"
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.outerHTML =
                              '<div class="h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-accent flex-shrink-0"></div>';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-accent flex-shrink-0" />
                      )}
                      <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                        {ev.title}
                      </h3>
                    </div>

                    <div className="space-y-2.5 flex-1">
                      {ev.outcomes.map((o: Outcome) => (
                        <div key={o.label} className="flex items-center justify-between gap-2">
                          <span className="text-[#B8B8D0] text-sm truncate">{o.label}</span>
                          <span className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-white font-bold text-sm">{o.yesPct}%</span>
                            <span className="rounded bg-green-500/15 text-green-400 text-xs font-semibold px-2 py-1">
                              Yes
                            </span>
                            <span className="rounded bg-red-500/15 text-red-400 text-xs font-semibold px-2 py-1">
                              No
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs text-[#B8B8D0]">
                      <span>{formatVolume(ev.volume)}</span>
                      {formatEndDate(ev.endDate) && <span>{formatEndDate(ev.endDate)}</span>}
                    </div>
                  </motion.a>
                ) : (
                  <div
                    key={`skeleton-${i}`}
                    className="glassmorphism rounded-xl p-5 border border-white/5 animate-pulse"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-white/10 flex-shrink-0" />
                      <div className="h-4 bg-white/10 rounded w-3/4 mt-1" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-white/10 rounded w-full" />
                      <div className="h-3 bg-white/10 rounded w-5/6" />
                    </div>
                    <div className="h-3 bg-white/10 rounded w-1/3 mt-5" />
                  </div>
                ),
            )}
          </div>
        )}

        <div className="text-center mt-10">
          <a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
            <Button
              variant="neon-filled"
              size="xl"
              rounded="full"
              className="font-['Orbitron'] shadow-glow-accent"
            >
              SEE ALL LIVE MARKETS
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </a>
          <p className="mt-4 text-xs text-[#B8B8D0]">
            Live odds refresh every 60 seconds. Log in to your trader dashboard to trade them.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LivePredictionMarkets;
