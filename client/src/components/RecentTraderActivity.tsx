import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowRight } from "lucide-react";

type ActivityEvent = {
  type: string;
  label: string;
  source?: string;
  at?: string | null;
};

type Region = {
  state: string;
  count: number;
};

export default function RecentTraderActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/activity", { headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const body = await res.json();
        if (!active) return;
        setEvents(Array.isArray(body?.events) ? body.events : []);
        setRegions(Array.isArray(body?.regions) ? body.regions : []);
      } catch {
        // The fallback below stays visible if CRM activity is unavailable.
      }
    };

    load();
    const refresh = window.setInterval(load, 120_000);
    return () => {
      active = false;
      window.clearInterval(refresh);
    };
  }, []);

  const messages = useMemo(() => {
    const items = events.slice(0, 6).map((event) => ({
      key: `${event.at || ""}-${event.source || ""}`,
      text: event.label || "New trader joined the Hybrid Funding community",
      detail: event.source ? `via ${event.source}` : "recently",
    }));

    for (const region of regions.slice(0, 3)) {
      items.push({
        key: `region-${region.state}`,
        text: "Hybrid Funding is growing",
        detail: `${region.count}+ new community joins from ${region.state} this month`,
      });
    }
    return items;
  }, [events, regions]);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), 4200);
    return () => window.clearInterval(id);
  }, [messages.length]);

  const current = messages.length ? messages[index % messages.length] : null;

  return (
    <div className="border-b border-white/5 bg-[#0B1426] py-3">
      <div className="container mx-auto px-4 sm:px-6">
        {current ? (
          <div className="flex min-h-7 items-center justify-center gap-2 text-center">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
            </span>
            <AnimatePresence mode="wait">
              <motion.p
                key={current.key}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-[#B8B8D0] sm:text-sm"
              >
                <strong className="text-white">{current.text}</strong>
                <span className="mx-1.5 text-white/20">•</span>
                {current.detail}
              </motion.p>
            </AnimatePresence>
          </div>
        ) : (
          <Link href="/dna-test" className="flex items-center justify-center gap-2 text-center text-xs sm:text-sm">
            <Activity className="h-4 w-4 text-accent" />
            <span className="text-[#B8B8D0]">
              Find your Trader DNA in 2 minutes — get your personalized funding path.
            </span>
            <ArrowRight className="h-4 w-4 text-accent" />
          </Link>
        )}
      </div>
    </div>
  );
}
