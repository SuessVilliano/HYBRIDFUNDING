import React, { useEffect, useMemo, useState } from "react";
import { decodeQuickRoster, useTradeHouseFeed, type Standing } from "@/lib/tradehouse-feed";
import { Radio, ShieldCheck, Trophy, TrendingUp, Zap } from "lucide-react";
import "./tradehybrid-tv.css";

type Segment = "open" | "board" | "battle" | "chart" | "news" | "prize";
const SEGMENTS: { id: Segment; label: string; seconds: number }[] = [
  { id: "open", label: "Opening Bell", seconds: 18 },
  { id: "board", label: "Trade House Board", seconds: 24 },
  { id: "battle", label: "Featured Battle", seconds: 28 },
  { id: "chart", label: "Market Desk", seconds: 30 },
  { id: "news", label: "News & Events", seconds: 20 },
  { id: "prize", label: "Battle Prize", seconds: 18 },
];
const headlines = [
  { kicker: "TRADE HYBRID TV", title: "Live markets. Real discipline. A new way to watch traders compete.", body: "Trade House is a public competition layer for Hybrid Funding accounts, built around verified dashboards and visible risk control." },
  { kicker: "MARKET DESK", title: "The screen is moving. The process is the story.", body: "TradingView analysis, event context, and battle standings rotate together so viewers always have a reason to stay." },
  { kicker: "UP NEXT", title: "Eight seats. One house. Every decision on the board.", body: "The next battle opens with a fixed starting balance, a published risk rule, and a score that updates from the account feed." },
];
const eventCards = [
  ["SUNDAY SCAN", "Weekly market scan", "NQ · Gold · EUR/USD"],
  ["MONDAY OPEN", "Opening bell live desk", "15-minute TradingView update"],
  ["WEDNESDAY HEAT", "Trade House battle", "Live matchups + leaderboard"],
];
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);

function StageFrame({ children, label, live = true }: { children: React.ReactNode; label: string; live?: boolean }) {
  return <div className="tv-frame"><div className="tv-frame-top"><div className="tv-logo">TRADE <span>HYBRID</span> TV</div><div className="tv-show-label">{label}</div><div className="tv-live">{live && <i />} {live ? "LIVE FEED" : "RECORDED"}</div></div>{children}<div className="tv-ticker"><span>HYBRID FUNDING</span><b>Trade House battles · verified dashboard feeds · risk first</b><em>TV.TRADEHYBRID.CLUB</em></div></div>;
}

function Board({ traders }: { traders: Standing[] }) {
  return <div className="tv-board"><div className="tv-board-head"><div><small>TRADE HOUSE</small><h1>THE HOUSE STANDINGS</h1></div><div className="tv-board-live"><Radio size={16} /> UPDATING EVERY 15 SEC</div></div><div className="tv-board-grid">{traders.slice(0, 8).map((t) => <div className="tv-board-row" key={t.id}><strong>#{t.rank}</strong><div className="tv-board-name"><span>{t.name}</span>{t.verified && <ShieldCheck size={14} /> }<small>{(t.division || "trading").toUpperCase()} · {(t.platform || "other").toUpperCase()} · {t.status === "live" ? "POSITION OPEN" : t.status.toUpperCase()} · {t.tradeCount} TRADES</small></div><div className={t.pnl >= 0 ? "tv-positive" : "tv-negative"}>{t.pnl >= 0 ? "+" : ""}{money(t.pnl)}<small>{t.returnPct >= 0 ? "+" : ""}{t.returnPct.toFixed(2)}%</small></div></div>)}</div></div>;
}
function Duel({ left, right }: { left?: Standing; right?: Standing }) {
  return <div className="tv-duel"><div className="tv-duel-card tv-cyan"><small>CHALLENGER A · {(left?.division || "trading").toUpperCase()} · RANK #{left?.rank || "—"}</small><h2>{left?.name || "OPEN SEAT"}</h2><div className={left && left.pnl < 0 ? "tv-negative" : "tv-positive"}>{left ? `${left.pnl >= 0 ? "+" : ""}${money(left.pnl)}` : "—"}<em>{left ? `${left.returnPct >= 0 ? "+" : ""}${left.returnPct.toFixed(2)}% RETURN` : "AWAITING FEED"}</em></div></div><div className="tv-vs">VS</div><div className="tv-duel-card tv-purple"><small>CHALLENGER B · {(right?.division || "trading").toUpperCase()} · RANK #{right?.rank || "—"}</small><h2>{right?.name || "OPEN SEAT"}</h2><div className={right && right.pnl < 0 ? "tv-negative" : "tv-positive"}>{right ? `${right.pnl >= 0 ? "+" : ""}${money(right.pnl)}` : "—"}<em>{right ? `${right.returnPct >= 0 ? "+" : ""}${right.returnPct.toFixed(2)}% RETURN` : "AWAITING FEED"}</em></div></div></div>;
}
function MarketDesk() { return <div className="tv-desk"><div className="tv-desk-copy"><small>TRADE HYBRID MARKET DESK</small><h1>THE CHART IS LIVE.<br /><em>THE PROCESS IS VISIBLE.</em></h1><p>Use this frame beside a TradingView browser capture. The broadcast stays useful while the producer switches between the live chart, the battle board, and trader screens.</p><div className="tv-desk-bullets"><span><TrendingUp size={17} /> TradingView indicators</span><span><Zap size={17} /> Event-aware updates</span><span><ShieldCheck size={17} /> Risk-first coverage</span></div></div><div className="tv-chart-placeholder"><div className="tv-chart-grid" /><div className="tv-chart-lines"><i /><i /><i /><i /><i /></div><div className="tv-chart-tag">TRADINGVIEW / PRODUCER SOURCE</div></div></div> }
function Headlines({ index }: { index: number }) { const card = headlines[index % headlines.length]; return <div className="tv-headline"><div className="tv-headline-mark">HYBRID<br /><span>WIRE</span></div><div><small>{card.kicker}</small><h1>{card.title}</h1><p>{card.body}</p></div></div> }
function PrizeCard() { return <div className="tv-prize"><Trophy size={58} /><small>TRADE HOUSE BATTLE PRIZE</small><h1>TRADE FOR THE<br /><em>HOUSE.</em></h1><p>Funded-account rewards, public performance, and a track record people can follow.</p><div className="tv-prize-pill">NEXT HEAT · WEDNESDAY · HYBRIDFUNDING.CO/BATTLES</div></div> }

export default function TradeHybridTV() {
  const params = useMemo(() => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search), []);
  const quickRoster = useMemo(() => decodeQuickRoster(params.get("quick")), [params]);
  const { data, state } = useTradeHouseFeed(params.get("demo") === "1", quickRoster, params.get("season") || "Quick Battle");
  const [segmentIndex, setSegmentIndex] = useState(0); const [elapsed, setElapsed] = useState(0);
  const [headlineIndex, setHeadlineIndex] = useState(0); const [chartUrl, setChartUrl] = useState("");
  const roster = data?.standings || []; const segment = SEGMENTS[segmentIndex];
  useEffect(() => { const id = window.setInterval(() => setElapsed((s) => s + 1), 1000); return () => window.clearInterval(id); }, []);
  useEffect(() => { if (elapsed >= segment.seconds) { setSegmentIndex((i) => (i + 1) % SEGMENTS.length); setElapsed(0); setHeadlineIndex((i) => i + 1); } }, [elapsed, segment.seconds]);
  const left = roster[0]; const right = roster.find((t) => t.id !== left?.id) || roster[1];
  const isDemo = state === "demo";
  const content = segment.id === "board" ? <Board traders={roster} /> : segment.id === "battle" ? <Duel left={left} right={right} /> : segment.id === "chart" ? <><MarketDesk />{chartUrl && <iframe className="tv-chart-embed" src={chartUrl} title="TradingView source" />}</> : segment.id === "news" ? <Headlines index={headlineIndex} /> : segment.id === "prize" ? <PrizeCard /> : <Headlines index={0} />;
  return <main className="tv-canvas"><StageFrame label={segment.label}><div className="tv-progress"><span style={{ width: `${Math.min(100, (elapsed / segment.seconds) * 100)}%` }} /></div><div className="tv-content">{content}</div><div className="tv-lower"><span>{isDemo ? "REHEARSAL MODE · SAMPLE DATA" : state === "stale" ? "DATA FEED INTERRUPTED · SCORES HIDDEN" : "VERIFIED TRADE HOUSE FEEDS"}</span><span>SEGMENT {segmentIndex + 1}/{SEGMENTS.length} · NEXT IN {Math.max(0, segment.seconds - elapsed)}S</span></div></StageFrame></main>;
}
