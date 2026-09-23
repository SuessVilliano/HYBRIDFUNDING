import { useEffect, useMemo, useRef, useState } from "react";

const CLOB_WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market";
const TRADE_WINDOW_MS = 5 * 60 * 1000;
const MAX_TRADES_PER_TOKEN = 500;

export type ClobLiveMarket = {
  tokenId: string;
  bestBid?: number;
  bestAsk?: number;
  spread?: number;
  bidDepth: number;
  askDepth: number;
  tradeBuyVolume: number;
  tradeSellVolume: number;
  tradeCount: number;
  lastTradePrice?: number;
  lastTradeSize?: number;
  lastTradeSide?: "BUY" | "SELL";
  updatedAt: number;
};

type LiveMap = Record<string, ClobLiveMarket>;
type TradeSample = {
  key: string;
  ts: number;
  size: number;
  side: "BUY" | "SELL";
};

const n = (v: unknown): number | undefined => {
  const x = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(x) ? x : undefined;
};

const tokenIdOf = (x: any) =>
  String(x?.asset_id ?? x?.token_id ?? x?.tokenId ?? "");

const topDepth = (levels: any[], side: "bid" | "ask") => {
  const parsed = (Array.isArray(levels) ? levels : [])
    .map((l) => ({ price: n(l?.price) ?? 0, size: n(l?.size) ?? 0 }))
    .filter((l) => l.price > 0 && l.size > 0)
    .sort((a, b) => (side === "bid" ? b.price - a.price : a.price - b.price));

  return {
    best: parsed[0]?.price,
    depth: parsed.slice(0, 5).reduce((sum, l) => sum + l.size, 0),
  };
};

export function usePolymarketClob(rawTokenIds: string[]) {
  const tokenKey = useMemo(
    () =>
      Array.from(new Set(rawTokenIds.filter(Boolean)))
        .slice(0, 100)
        .sort()
        .join(","),
    [rawTokenIds],
  );
  const tokenIds = useMemo(() => (tokenKey ? tokenKey.split(",") : []), [tokenKey]);

  const [liveByToken, setLiveByToken] = useState<LiveMap>({});
  const [connected, setConnected] = useState(false);
  const [lastMessageAt, setLastMessageAt] = useState<number | null>(null);

  const liveRef = useRef<LiveMap>({});
  const tradesRef = useRef<Record<string, TradeSample[]>>({});
  const flushRef = useRef<number | null>(null);
  const lastAtRef = useRef<number | null>(null);

  useEffect(() => {
    const allowed = new Set(tokenIds);

    // Drop stale token state whenever the subscribed candidate set changes.
    liveRef.current = Object.fromEntries(
      Object.entries(liveRef.current).filter(([tokenId]) => allowed.has(tokenId)),
    );
    tradesRef.current = Object.fromEntries(
      Object.entries(tradesRef.current).filter(([tokenId]) => allowed.has(tokenId)),
    );
    setLiveByToken({ ...liveRef.current });

    if (!tokenIds.length) {
      setConnected(false);
      setLastMessageAt(null);
      return;
    }

    let stopped = false;
    let socket: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let reconnect: ReturnType<typeof setTimeout> | null = null;

    const flush = () => {
      if (flushRef.current !== null) return;
      flushRef.current = window.setTimeout(() => {
        flushRef.current = null;
        setLiveByToken({ ...liveRef.current });
        setLastMessageAt(lastAtRef.current);
      }, 250);
    };

    const update = (tokenId: string, patch: Partial<ClobLiveMarket>) => {
      if (!tokenId || !allowed.has(tokenId)) return;
      const prev = liveRef.current[tokenId] || {
        tokenId,
        bidDepth: 0,
        askDepth: 0,
        tradeBuyVolume: 0,
        tradeSellVolume: 0,
        tradeCount: 0,
        updatedAt: 0,
      };

      liveRef.current[tokenId] = {
        ...prev,
        ...patch,
        tokenId,
        updatedAt: Date.now(),
      };
      lastAtRef.current = Date.now();
      flush();
    };

    const recordTrade = (tokenId: string, raw: any) => {
      if (!tokenId || !allowed.has(tokenId)) return;

      const size = n(raw?.size) ?? 0;
      const sideRaw = String(raw?.side || "").toUpperCase();
      if (size <= 0 || (sideRaw !== "BUY" && sideRaw !== "SELL")) return;
      const side = sideRaw as "BUY" | "SELL";
      const now = Date.now();
      const tsRaw = raw?.timestamp;
      const ts =
        typeof tsRaw === "number"
          ? tsRaw
          : typeof tsRaw === "string" && /^\d+$/.test(tsRaw)
            ? Number(tsRaw)
            : typeof tsRaw === "string" && !Number.isNaN(Date.parse(tsRaw))
              ? Date.parse(tsRaw)
              : now;
      const tx = String(raw?.transaction_hash ?? raw?.transactionHash ?? "");
      const price = n(raw?.price) ?? 0;
      const key = tx || `${ts}|${price}|${size}|${side}`;

      const cutoff = now - TRADE_WINDOW_MS;
      const current = (tradesRef.current[tokenId] || []).filter((t) => t.ts >= cutoff);
      if (!current.some((t) => t.key === key)) current.push({ key, ts, size, side });
      const recent = current.slice(-MAX_TRADES_PER_TOKEN);
      tradesRef.current[tokenId] = recent;

      let tradeBuyVolume = 0;
      let tradeSellVolume = 0;
      for (const t of recent) {
        if (t.side === "BUY") tradeBuyVolume += t.size;
        else tradeSellVolume += t.size;
      }

      update(tokenId, {
        tradeBuyVolume,
        tradeSellVolume,
        tradeCount: recent.length,
        lastTradePrice: price || undefined,
        lastTradeSize: size,
        lastTradeSide: side,
      });
    };

    const handleOne = (msg: any) => {
      if (!msg || typeof msg !== "object") return;

      // Support both the raw websocket envelope and the current SDK-style payload.
      const type = msg.event_type || msg.type;
      const payload = msg.payload || msg;

      if (type === "book") {
        const tokenId = tokenIdOf(payload);
        const bids = topDepth(payload.bids, "bid");
        const asks = topDepth(payload.asks, "ask");
        const bestBid = bids.best;
        const bestAsk = asks.best;

        update(tokenId, {
          bestBid,
          bestAsk,
          spread:
            typeof bestBid === "number" &&
            typeof bestAsk === "number" &&
            bestAsk >= bestBid
              ? bestAsk - bestBid
              : undefined,
          bidDepth: bids.depth,
          askDepth: asks.depth,
          lastTradePrice: n(payload.last_trade_price ?? payload.lastTradePrice),
        });
        return;
      }

      if (type === "best_bid_ask") {
        const tokenId = tokenIdOf(payload);
        update(tokenId, {
          bestBid: n(payload.best_bid ?? payload.bestBid),
          bestAsk: n(payload.best_ask ?? payload.bestAsk),
          spread: n(payload.spread),
        });
        return;
      }

      if (type === "price_change") {
        const changes = payload.price_changes ?? payload.priceChanges ?? [];
        for (const change of Array.isArray(changes) ? changes : []) {
          const tokenId = tokenIdOf(change);
          const prev = liveRef.current[tokenId];
          const bestBid = n(change?.best_bid ?? change?.bestBid);
          const bestAsk = n(change?.best_ask ?? change?.bestAsk);

          // Price-change events are order-book changes, not executed trades.
          update(tokenId, {
            bestBid: bestBid ?? prev?.bestBid,
            bestAsk: bestAsk ?? prev?.bestAsk,
            spread:
              typeof bestBid === "number" && typeof bestAsk === "number"
                ? Math.max(0, bestAsk - bestBid)
                : prev?.spread,
          });
        }
        return;
      }

      if (type === "last_trade_price") {
        const tokenId = tokenIdOf(payload);
        recordTrade(tokenId, payload);
      }
    };

    const connect = () => {
      if (stopped) return;
      setConnected(false);
      socket = new WebSocket(CLOB_WS_URL);

      socket.onopen = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(
          JSON.stringify({
            assets_ids: tokenIds,
            type: "market",
            custom_feature_enabled: true,
          }),
        );
        setConnected(true);

        heartbeat = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) socket.send("PING");
        }, 10_000);
      };

      socket.onmessage = (event) => {
        if (event.data === "PONG") return;
        try {
          const parsed = JSON.parse(String(event.data));
          if (Array.isArray(parsed)) parsed.forEach(handleOne);
          else handleOne(parsed);
        } catch {
          // Ignore non-JSON control frames.
        }
      };

      socket.onerror = () => {
        setConnected(false);
      };

      socket.onclose = () => {
        setConnected(false);
        if (heartbeat) clearInterval(heartbeat);
        heartbeat = null;
        if (!stopped) reconnect = setTimeout(connect, 2_000);
      };
    };

    connect();

    return () => {
      stopped = true;
      if (heartbeat) clearInterval(heartbeat);
      if (reconnect) clearTimeout(reconnect);
      if (flushRef.current !== null) {
        clearTimeout(flushRef.current);
        flushRef.current = null;
      }
      if (socket && socket.readyState <= WebSocket.OPEN) socket.close();
    };
  }, [tokenKey]);

  const liveCount = tokenIds.reduce(
    (count, tokenId) => count + (liveByToken[tokenId] ? 1 : 0),
    0,
  );

  return {
    liveByToken,
    connected,
    subscribed: tokenIds.length,
    liveCount,
    lastMessageAt,
  };
}
