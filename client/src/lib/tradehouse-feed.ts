import { useEffect, useMemo, useState } from "react";

export type TradeHouseDivision = "trading" | "prediction" | "hybrid";
export type TradeHousePlatform = "matchtrader" | "ctrader" | "dxtrade" | "dxfutures" | "tickblaze" | "other";

export type QuickBattleEntry = {
  id: string;
  name: string;
  dashboardUrl: string;
  avatarUrl?: string;
  startingBalance?: number;
  division?: TradeHouseDivision;
  platform?: TradeHousePlatform;
};

export type Standing = {
  id: string;
  name: string;
  rank: number;
  source?: "hybrid";
  sourceLabel?: string;
  division?: TradeHouseDivision;
  platform?: TradeHousePlatform;
  accountId?: string;
  dashboardUrl: string;
  avatarUrl?: string;
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
  verified: boolean;
  status: "live" | "flat" | "unavailable";
};

export type LeaderboardPayload = {
  season: {
    name: string;
    status: "forming" | "live" | "complete";
    accountType: "simulated";
    refreshSeconds: number;
    endsAt: string | null;
    dataPolicy?: string;
  };
  standings: Standing[];
  updatedAt: string;
};

export function rehearsalFeed(): LeaderboardPayload {
  return {
    season: { name: "Battle rehearsal", status: "forming", accountType: "simulated", refreshSeconds: 15, endsAt: null },
    updatedAt: new Date().toISOString(),
    standings: [1240, 980, 725, 410, 180, -95, -240, -480].map((pnl, i) => ({
      id: `demo-${i + 1}`,
      name: `Trader ${String(i + 1).padStart(2, "0")}`,
      rank: i + 1,
      source: "hybrid" as const,
      sourceLabel: "Hybrid Funding",
      division: "trading" as const,
      platform: "other" as const,
      dashboardUrl: "",
      startingBalance: 50000,
      balance: 50000 + pnl,
      equity: 50000 + pnl,
      pnl,
      returnPct: pnl / 500,
      tradeCount: 12 - i,
      wins: 7 - Math.floor(i / 2),
      losses: 5 - Math.ceil(i / 2),
      biggestWin: 320,
      openPositionCount: i % 2,
      verified: false,
      status: i % 2 ? "live" as const : "flat" as const,
    })),
  };
}

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(text: string) {
  const normalized = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeQuickRoster(entries: QuickBattleEntry[]) {
  return toBase64Url(JSON.stringify(entries.slice(0, 8)));
}

export function decodeQuickRoster(encoded: string | null | undefined): QuickBattleEntry[] {
  if (!encoded) return [];
  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 8).filter((entry: any) =>
      entry &&
      typeof entry.id === "string" &&
      typeof entry.name === "string" &&
      typeof entry.dashboardUrl === "string",
    );
  } catch {
    return [];
  }
}

export function useTradeHouseFeed(demo = false, quickEntries: QuickBattleEntry[] = [], seasonName = "Quick Battle") {
  const [data, setData] = useState<LeaderboardPayload | null>(demo ? rehearsalFeed() : null);
  const [state, setState] = useState<"loading" | "fresh" | "stale" | "demo">(demo ? "demo" : "loading");
  const quickKey = useMemo(() => JSON.stringify(quickEntries), [quickEntries]);

  useEffect(() => {
    if (demo) {
      setData(rehearsalFeed());
      setState("demo");
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let controller: AbortController;
    setData(null);
    setState("loading");

    const load = async () => {
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const hasQuickRoster = quickEntries.length > 0;
        const response = await fetch(
          hasQuickRoster ? "/api/tradehouse/quick-leaderboard" : "/api/tradehouse/leaderboard",
          hasQuickRoster
            ? {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ entries: quickEntries, seasonName }),
                cache: "no-store",
                signal: controller.signal,
              }
            : { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Feed unavailable");
        const next = await response.json();
        if (!Array.isArray(next.standings) || !next.season || !Number.isFinite(Date.parse(next.updatedAt))) {
          throw new Error("Invalid feed");
        }
        if (active) {
          setData(next);
          setState(Date.now() - Date.parse(next.updatedAt) > 45000 ? "stale" : "fresh");
        }
      } catch {
        if (active) setState("stale");
      } finally {
        clearTimeout(timeout);
        if (active) timer = setTimeout(load, 15000);
      }
    };

    load();
    return () => {
      active = false;
      clearTimeout(timer);
      controller?.abort();
    };
  }, [demo, quickKey, seasonName]);

  return { data, state };
}
