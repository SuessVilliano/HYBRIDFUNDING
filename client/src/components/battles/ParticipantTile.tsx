import React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ExternalLink,
  Mic,
  MicOff,
  Monitor,
  ShieldCheck,
  Video,
  VideoOff,
} from "lucide-react";

export interface TraderStats {
  pnl: number;
  wins: number;
  losses: number;
  biggestWin: number;
  tradeCount: number;
  balance?: number;
  equity?: number;
  returnPct?: number;
  openPositionCount?: number;
  verified?: boolean;
  dashboardUrl?: string;
  division?: string;
  platform?: string;
}

interface ParticipantTileProps {
  traderName: string;
  stats: TraderStats;
  videoTrack?: React.ReactNode | null;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isScreenSharing?: boolean;
  side: "left" | "right" | "team-left" | "team-right";
  compact?: boolean;
  className?: string;
}

const money = (value?: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value ?? 0);

const ParticipantTile: React.FC<ParticipantTileProps> = ({
  traderName,
  stats,
  videoTrack,
  isMuted = false,
  isCameraOff = true,
  isScreenSharing = false,
  side,
  compact = false,
  className = "",
}) => {
  const isLeft = side === "left" || side === "team-left";
  const isPnlPositive = stats.pnl >= 0;
  const hasDashboard = Boolean(stats.dashboardUrl);
  const hasLiveStats =
    hasDashboard ||
    Boolean(stats.verified) ||
    stats.balance !== undefined ||
    stats.equity !== undefined ||
    stats.returnPct !== undefined;

  const borderColor = isLeft ? "rgba(0,255,135,0.4)" : "rgba(255,59,92,0.4)";
  const glowColor = isLeft ? "rgba(0,255,135,0.12)" : "rgba(255,59,92,0.12)";
  const pnlColor = isPnlPositive ? "#00ff87" : "#ff3b5c";
  const pnlGlow = isPnlPositive ? "rgba(0,255,135,0.4)" : "rgba(255,59,92,0.4)";
  const accent = isLeft ? "#00ff87" : "#ff3b5c";

  const formattedPnl = isPnlPositive
    ? `+${money(stats.pnl)}`
    : `-${money(Math.abs(stats.pnl))}`;

  const winRate =
    stats.wins + stats.losses > 0
      ? Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
      : 0;

  const statRows = [
    ["Balance", money(stats.balance)],
    ["Equity", money(stats.equity)],
    ["Net P&L", formattedPnl],
    ["Return", `${(stats.returnPct ?? 0) >= 0 ? "+" : ""}${(stats.returnPct ?? 0).toFixed(2)}%`],
    ["Trades", String(stats.tradeCount)],
    ["Win rate", `${winRate}%`],
    ...(compact ? [] : [["Best trade", money(stats.biggestWin)], ["Open", String(stats.openPositionCount ?? 0)]]),
  ] as [string, string][];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28 }}
      className={`relative rounded-xl overflow-hidden flex flex-col ${className}`}
      style={{
        background: "#07101b",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 24px ${glowColor}, inset 0 0 24px rgba(0,0,0,0.32)`,
      }}
    >
      <div
        className="px-3 py-2 flex items-center justify-between flex-shrink-0"
        style={{ background: "rgba(2,7,15,0.92)", borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="min-w-0">
          <span
            className="font-['Orbitron'] font-black uppercase tracking-wider truncate block"
            style={{ color: "#fff", fontSize: compact ? "10px" : "13px" }}
          >
            {traderName}
          </span>
          {hasDashboard && (
            <span className="mt-0.5 block truncate font-mono text-[8px] uppercase tracking-[0.12em] text-slate-500">
              {(stats.division || "trading").toUpperCase()} · {(stats.platform || "hybrid").toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(videoTrack || isScreenSharing) && (
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: accent, boxShadow: `0 0 7px ${accent}`, animation: "pulse 1.5s ease-in-out infinite" }}
              />
              <span className="font-['Orbitron'] font-bold text-[8px]" style={{ color: accent }}>LIVE</span>
            </div>
          )}
          {isCameraOff ? (
            <VideoOff className="text-slate-600" style={{ width: compact ? 11 : 13, height: compact ? 11 : 13 }} />
          ) : (
            <Video className="text-cyan-300" style={{ width: compact ? 11 : 13, height: compact ? 11 : 13 }} />
          )}
          {isMuted ? (
            <MicOff className="text-[#ff3b5c]" style={{ width: compact ? 11 : 13, height: compact ? 11 : 13 }} />
          ) : (
            <Mic className="text-[#00ff87]" style={{ width: compact ? 11 : 13, height: compact ? 11 : 13 }} />
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex" style={{ background: "#03070d" }}>
        <div className={`relative min-w-0 ${hasLiveStats ? "flex-[1.9]" : "flex-1"}`}>
          {videoTrack ? (
            <div className="absolute inset-0 overflow-hidden">{videoTrack}</div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ color: "#273244" }}>
              <Monitor style={{ width: compact ? 30 : 46, height: compact ? 30 : 46 }} />
              <span className="font-['Orbitron'] text-center px-4" style={{ fontSize: compact ? "8px" : "10px" }}>
                Waiting for camera or screen share…
              </span>
            </div>
          )}
          <div
            className="absolute top-0 left-0 w-10 h-10 pointer-events-none"
            style={{ background: `linear-gradient(135deg, ${borderColor} 0%, transparent 64%)`, opacity: 0.6 }}
          />
          <div
            className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none"
            style={{ background: `linear-gradient(315deg, ${borderColor} 0%, transparent 64%)`, opacity: 0.6 }}
          />
        </div>

        {hasLiveStats && (
          <aside
            className={`min-w-[150px] border-l border-cyan-300/10 bg-[linear-gradient(180deg,rgba(10,22,38,.98),rgba(5,11,20,.98))] ${compact ? "w-[34%] p-2" : "w-[32%] p-3"}`}
          >
            <div className="flex items-start justify-between gap-2 border-b border-white/[0.07] pb-2">
              <div>
                <div className="flex items-center gap-1.5 font-['Orbitron'] text-[8px] font-black uppercase tracking-[0.14em] text-cyan-200">
                  <Activity className="h-3 w-3" />
                  Live stats
                </div>
                <div className="mt-1 flex items-center gap-1 text-[8px] text-slate-500">
                  {stats.verified && <ShieldCheck className="h-3 w-3 text-cyan-300" />}
                  Hybrid public
                </div>
              </div>
              {stats.dashboardUrl && (
                <a
                  href={stats.dashboardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-white/10 p-1 text-slate-500 transition-colors hover:border-cyan-300/30 hover:text-cyan-200"
                  title="Open public Hybrid dashboard"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="mt-1 divide-y divide-white/[0.055]">
              {statRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-2 py-[5px]">
                  <span className="truncate text-[8px] uppercase tracking-[0.08em] text-slate-500">{label}</span>
                  <span
                    className="truncate font-mono text-[9px] font-bold"
                    style={{ color: label === "Net P&L" || label === "Return" ? pnlColor : "#e7f2ff" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {!stats.verified && (
              <div className="mt-2 rounded-md border border-violet-400/15 bg-violet-400/[0.05] px-2 py-1.5 text-[7px] uppercase tracking-[0.08em] text-violet-200">
                Connecting verified feed…
              </div>
            )}
          </aside>
        )}
      </div>

      <div
        className="px-3 py-2 flex items-center justify-between flex-shrink-0"
        style={{ background: "rgba(2,7,15,0.93)", backdropFilter: "blur(8px)", borderTop: `1px solid ${borderColor}` }}
      >
        <span className="text-[9px] font-['Orbitron'] font-bold uppercase tracking-widest" style={{ color: "#475569" }}>
          P&L {stats.verified ? "· VERIFIED" : ""}
        </span>
        <motion.span
          key={stats.pnl}
          initial={{ scale: 1.12, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-mono font-bold"
          style={{ color: pnlColor, textShadow: `0 0 12px ${pnlGlow}`, fontSize: compact ? "12px" : "15px" }}
        >
          {formattedPnl}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default ParticipantTile;
