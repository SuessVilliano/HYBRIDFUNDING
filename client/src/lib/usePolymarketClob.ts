import { useEffect, useMemo, useRef, useState } from "react";

const CLOB_WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market";

export type ClobLiveMarket = {
  tokenId: string;
  bestBid?: number;
  bestAsk?: number;
  spread?: number;
  bidDepth: number;
  askDepth: number;
  buyFlow: number;
  sellFlow: number;
  lastTradePrice?: number;
  lastTradeSize?: number;
  lastTradeSide?: "BUY" | "SELL";
  updatedAt: number;
};

type LiveMap = Record<string, ClobLiveMarket>;

const n = (v: unknown): number | undefined => {
  const x = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(x) ? x : undefined;
};

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
  const flushRef = useRef<number | null>(null);
  const lastAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!tokenIds.length) {
      setConnected(false);
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
      if (!tokenId) return;
      const prev = liveRef.current[tokenId] || {
        tokenId,
        bidDepth: 0,
        askDepth: 0,
        buyFlow: 0,
        sellFlow: 0,
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

    const handleOne = (msg: any) => {
      if (!msg || typeof msg !== "object") return;
      const type = msg.event_type;

      if (type === "book") {
        const tokenId = String(msg.asset_id || "");
        const bids = topDepth(msg.bids, "bid");
        const asks = topDepth(msg.asks, "ask");
        const bestBid = bids.best;
        const bestAsk = asks.best;
        update(tokenId, {
          bestBid,
          bestAsk,
          spread:
            typeof bestBid === "number" && typeof bestAsk === "number" && bestAsk >= bestBid
              ? bestAsk - bestBid
              : undefined,
          bidDepth: bids.depth,
          askDepth: asks.depth,
          lastTradePrice: n(msg.last_trade_price),
        });
        return;
      }

      if (type === "best_bid_ask") {
        const tokenId = String(msg.asset_id || "");
        update(tokenId, {
          bestBid: n(msg.best_bid),
          bestAsk: n(msg.best_ask),
          spread: n(msg.spread),
        });
        return;
      }

      if (type === "price_change") {
        for (const c of Array.isArray(msg.price_changes) ? msg.price_changes : []) {
          const tokenId = String(c?.asset_id || "");
          const size = n(c?.size) ?? 0;
          const side = String(c?.side || "").toUpperCase();
          const prev = liveRef.current[tokenId];
          update(tokenId, {
            bestBid: n(c?.best_bid) ?? prev?.bestBid,
            bestAsk: n(c?.best_ask) ?? prev?.bestAsk,
            spread:
              typeof n(c?.best_bid) === "number" && typeof n(c?.best_ask) === "number"
                ? Math.max(0, (n(c?.best_ask) as number) - (n(c?.best_bid) as number))
                : prev?.spread,
            buyFlow: (prev?.buyFlow || 0) * 0.985 + (side === "BUY" ? size : 0),
            sellFlow: (prev?.sellFlow || 0) * 0.985 + (side === "SELL" ? size : 0),
          });
        }
        return;
      }

      if (type === "last_trade_price") {
        const tokenId = String(msg.asset_id || "");
        const size = n(msg.size) ?? 0;
        const side = String(msg.side || "").toUpperCase() as "BUY" | "SELL";
        const prev = liveRef.current[tokenId];
        update(tokenId, {
          lastTradePrice: n(msg.price),
          lastTradeSize: size,
          lastTradeSide: side === "BUY" || side === "SELL" ? side : prev?.lastTradeSide,
          buyFlow: (prev?.buyFlow || 0) * 0.985 + (side === "BUY" ? size : 0),
          sellFlow: (prev?.sellFlow || 0) * 0.985 + (side === "SELL" ? size : 0),
        });
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

  return {
    liveByToken,
    connected,
    subscribed: tokenIds.length,
    liveCount: Object.keys(liveByToken).length,
    lastMessageAt,
  };
}
