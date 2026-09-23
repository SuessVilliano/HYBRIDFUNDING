export type BrainDecision = "QUALIFIED" | "WATCH" | "PASS";

export type BrainLiveMarket = {
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

export type BrainSignal = {
  type: string;
  stance: string;
  confidence: number;
  event: string;
  market: string;
  vol24: number;
  endDate?: string;
  yesPrice?: number;
  bestBid?: number;
  bestAsk?: number;
  spread?: number;
  liq?: number;
  yesTokenId?: string;
  noTokenId?: string;
};

export type BrainTrack = {
  type: string;
  stance: string;
  status: string;
};

export type BrainPick = BrainSignal & {
  side: "YES" | "NO";
  entryPrice: number;
  brainScore: number;
  decision: BrainDecision;
  calibratedHitRate: number;
  sampleSize: number;
  reason: string;
  live?: BrainLiveMarket;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const hoursTo = (iso?: string): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return (t - Date.now()) / 3_600_000;
};

const fmtMoney = (v = 0) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}m`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}k`;
  return `$${Math.round(v)}`;
};

const calibratedRate = (track: BrainTrack[], signal: BrainSignal) => {
  const graded = track.filter(
    (t) =>
      (t.status === "won" || t.status === "lost") &&
      t.type === signal.type &&
      t.stance === signal.stance,
  );
  const wins = graded.filter((t) => t.status === "won").length;

  // Bayesian shrinkage: start every rule family at a modest 55% prior so a
  // tiny sample never swings the score wildly.
  const priorN = 8;
  const priorRate = 0.55;
  const rate = (wins + priorRate * priorN) / (graded.length + priorN);
  return { rate, n: graded.length };
};

const liveFor = (s: BrainSignal, liveByToken: Record<string, BrainLiveMarket>) => {
  const tokenId = s.stance === "LEAN YES" ? s.yesTokenId : s.stance === "LEAN NO" ? s.noTokenId : undefined;
  return tokenId ? liveByToken[tokenId] : undefined;
};

const entryFor = (
  s: BrainSignal,
  live?: BrainLiveMarket,
): { side: "YES" | "NO"; price: number } | null => {
  if (s.stance === "LEAN YES") {
    const price = live?.bestAsk && live.bestAsk > 0 ? live.bestAsk : s.bestAsk && s.bestAsk > 0 ? s.bestAsk : s.yesPrice;
    return typeof price === "number" && price >= 0 ? { side: "YES", price } : null;
  }
  if (s.stance === "LEAN NO") {
    if (live?.bestAsk && live.bestAsk > 0) return { side: "NO", price: live.bestAsk };
    const price =
      s.bestBid && s.bestBid > 0
        ? 1 - s.bestBid
        : typeof s.yesPrice === "number"
          ? 1 - s.yesPrice
          : undefined;
    return typeof price === "number" && price >= 0 ? { side: "NO", price } : null;
  }
  return null;
};

const scoreSignal = (
  s: BrainSignal,
  track: BrainTrack[],
  liveByToken: Record<string, BrainLiveMarket>,
): BrainPick | null => {
  const live = liveFor(s, liveByToken);
  const entry = entryFor(s, live);
  if (!entry) return null;

  const spread =
    typeof live?.spread === "number" && live.spread >= 0
      ? live.spread
      : typeof live?.bestAsk === "number" &&
          typeof live?.bestBid === "number" &&
          live.bestAsk >= live.bestBid
        ? live.bestAsk - live.bestBid
        : typeof s.spread === "number" && s.spread >= 0
          ? s.spread
          : typeof s.bestAsk === "number" &&
              typeof s.bestBid === "number" &&
              s.bestAsk >= s.bestBid
            ? s.bestAsk - s.bestBid
            : -1;

  const liq = Math.max(0, s.liq || 0);
  const vol = Math.max(0, s.vol24 || 0);
  const endh = hoursTo(s.endDate);
  const hist = calibratedRate(track, s);

  const gateReasons: string[] = [];
  if (entry.price < 0.2 || entry.price > 0.8) gateReasons.push("outside the $0.20–$0.80 opening band");
  if (vol < 10_000) gateReasons.push("24h volume under $10k");
  if (liq <= 0 && !live) gateReasons.push("no verified liquidity");
  if (liq > 0 && liq < 5_000) gateReasons.push("liquidity under $5k");
  if (live && live.askDepth <= 0) gateReasons.push("no live asks on selected side");
  if (spread >= 0 && spread > 0.06) gateReasons.push(`spread too wide (${Math.round(spread * 100)}¢)`);
  if (endh !== null && endh <= 0) gateReasons.push("market end time has passed");

  let score = s.confidence;
  score += clamp((Math.log10(Math.max(vol, 10)) - 4) * 5, 0, 10);
  if (liq > 0) score += clamp((Math.log10(Math.max(liq, 10)) - 3.7) * 6, 0, 10);
  if (spread >= 0) score += clamp((0.05 - spread) * 120, -8, 6);

  if (endh !== null) {
    if (endh < 1) score -= 6;
    else if (endh < 3) score -= 2;
    else if (endh <= 72) score += 5;
    else if (endh <= 336) score += 2;
    else if (endh > 720) score -= 4;
  }

  if (live) {
    const bookTotal = live.bidDepth + live.askDepth;
    if (bookTotal > 0) {
      const bookImbalance = live.bidDepth / bookTotal;
      score += clamp((bookImbalance - 0.5) * 12, -5, 5);
    }
    const tradeTotal = live.tradeBuyVolume + live.tradeSellVolume;
    if (live.tradeCount >= 2 && tradeTotal >= 25) {
      const tradeImbalance = live.tradeBuyVolume / tradeTotal;
      score += clamp((tradeImbalance - 0.5) * 8, -3, 3);
    }
    const ageMs = Date.now() - live.updatedAt;
    if (ageMs < 15_000) score += 3;
    else if (ageMs < 30_000) score += 2;
  }

  const historyWeight = clamp(hist.n / 10, 0, 1);
  score += clamp((hist.rate - 0.55) * 40, -8, 8) * historyWeight;

  if (entry.price >= 0.3 && entry.price <= 0.7) score += 2;
  else score -= 1;

  if (s.type === "DECISION") score += 2;
  if (s.type === "MOVER") score += 1;

  score = clamp(Math.round(score), 0, 100);

  const decision: BrainDecision =
    gateReasons.length > 0 ? "PASS" : score >= 73 ? "QUALIFIED" : score >= 64 ? "WATCH" : "PASS";

  const positives = [
    `${Math.round(entry.price * 100)}¢ ${entry.side} entry`,
    `${fmtMoney(vol)} 24h volume`,
    liq ? `${fmtMoney(liq)} liquidity` : null,
    spread >= 0 ? `${Math.round(spread * 100)}¢ spread` : null,
    live
      ? `LIVE CLOB book ${Math.round(live.bidDepth)}/${Math.round(live.askDepth)} bid/ask · 5m executed trades ${Math.round(live.tradeBuyVolume)}/${Math.round(live.tradeSellVolume)} BUY/SELL across ${live.tradeCount} trades`
      : "waiting for live CLOB",
    hist.n ? `${Math.round(hist.rate * 100)}% calibrated hit rate across ${hist.n} graded ${s.type.toLowerCase()} ${entry.side} picks` : "no graded history yet",
  ].filter(Boolean);

  const reason =
    decision === "PASS" && gateReasons.length
      ? `Filtered: ${gateReasons.join("; ")}.`
      : `${positives.join(" · ")}. One pick per event to respect the aggregated event cap.`;

  return {
    ...s,
    side: entry.side,
    entryPrice: entry.price,
    brainScore: score,
    decision,
    calibratedHitRate: hist.rate,
    sampleSize: hist.n,
    reason,
    live,
  };
};

export function buildBrainQueue(
  signals: BrainSignal[],
  track: BrainTrack[],
  limit = 10,
  liveByToken: Record<string, BrainLiveMarket> = {},
): BrainPick[] {
  const ranked = signals
    .filter((s) => s.stance === "LEAN YES" || s.stance === "LEAN NO")
    .map((s) => scoreSignal(s, track, liveByToken))
    .filter((s): s is BrainPick => Boolean(s))
    .sort((a, b) => {
      const decisionRank: Record<BrainDecision, number> = { QUALIFIED: 2, WATCH: 1, PASS: 0 };
      return decisionRank[b.decision] - decisionRank[a.decision] || b.brainScore - a.brainScore || b.vol24 - a.vol24;
    });

  // Hybrid Funding's prediction rules aggregate max profit by event. Keep only
  // the strongest candidate per event so the queue does not accidentally stack
  // several correlated outcomes from the same event.
  const seenEvents = new Set<string>();
  const distinct: BrainPick[] = [];
  for (const pick of ranked) {
    const eventKey = pick.event.trim().toLowerCase();
    if (seenEvents.has(eventKey)) continue;
    seenEvents.add(eventKey);
    distinct.push(pick);
    if (distinct.length >= limit) break;
  }
  return distinct;
}
