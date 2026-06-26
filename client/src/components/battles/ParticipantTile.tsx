import React from "react";
import { motion } from "framer-motion";
import { Monitor, Mic, MicOff } from "lucide-react";

export interface TraderStats {
  pnl: number;
  wins: number;
  losses: number;
  biggestWin: number;
  tradeCount: number;
}

interface ParticipantTileProps {
  traderName: string;
  stats: TraderStats;
  videoTrack?: React.ReactNode | null;
  isMuted?: boolean;
  isScreenSharing?: boolean;
  side: "left" | "right" | "team-left" | "team-right";
  compact?: boolean;
  className?: string;
}

const ParticipantTile: React.FC<ParticipantTileProps> = ({
  traderName,
  stats,
  videoTrack,
  isMuted = false,
  isScreenSharing = false,
  side,
  compact = false,
  className = "",
}) => {
  const isLeft = side === "left" || side === "team-left";
  const isPnlPositive = stats.pnl >= 0;

  const borderColor = isLeft ? "rgba(0,255,135,0.35)" : "rgba(255,59,92,0.35)";
  const glowColor = isLeft ? "rgba(0,255,135,0.12)" : "rgba(255,59,92,0.12)";
  const pnlColor = isPnlPositive ? "#00ff87" : "#ff3b5c";
  const pnlGlow = isPnlPositive ? "rgba(0,255,135,0.4)" : "rgba(255,59,92,0.4)";

  const formattedPnl = isPnlPositive
    ? `+$${stats.pnl.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    : `-$${Math.abs(stats.pnl).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-xl overflow-hidden flex flex-col ${className}`}
      style={{
        background: "#0d0d14",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 20px ${glowColor}, inset 0 0 20px rgba(0,0,0,0.3)`,
      }}
    >
      <div
        className="px-3 py-2 flex items-center justify-between flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.4)", borderBottom: `1px solid ${borderColor}` }}
      >
        <span
          className="font-['Orbitron'] font-black uppercase tracking-wider truncate"
          style={{ color: "#fff", fontSize: compact ? "11px" : "13px" }}
        >
          {traderName}
        </span>
        <div className="flex items-center gap-1.5">
          {isScreenSharing && (
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#00ff87", boxShadow: "0 0 6px #00ff87", animation: "pulse 1.5s ease-in-out infinite" }}
              />
              <span className="font-['Orbitron'] font-bold text-[9px]" style={{ color: "#00ff87" }}>LIVE</span>
            </div>
          )}
          {isMuted ? (
            <MicOff className="text-[#ff3b5c]" style={{ width: compact ? 12 : 14, height: compact ? 12 : 14 }} />
          ) : (
            <Mic className="text-[#00ff87]" style={{ width: compact ? 12 : 14, height: compact ? 12 : 14 }} />
          )}
        </div>
      </div>

      <div className="flex-1 relative min-h-0" style={{ background: "#060609" }}>
        {videoTrack ? (
          <div className="absolute inset-0">{videoTrack}</div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ color: "#2a2a2a" }}>
            <Monitor style={{ width: compact ? 32 : 48, height: compact ? 32 : 48 }} />
            <span className="font-['Orbitron'] text-center px-4" style={{ fontSize: compact ? "9px" : "11px" }}>
              Waiting for screen share…
            </span>
          </div>
        )}
        <div
          className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${borderColor} 0%, transparent 60%)`, opacity: 0.6 }}
        />
        <div
          className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
          style={{ background: `linear-gradient(315deg, ${borderColor} 0%, transparent 60%)`, opacity: 0.6 }}
        />
      </div>

      <div
        className="px-3 py-2 flex items-center justify-between flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", borderTop: `1px solid ${borderColor}` }}
      >
        <span className="text-[10px] font-['Orbitron'] font-bold uppercase tracking-widest" style={{ color: "#444" }}>P&L</span>
        <motion.span
          key={stats.pnl}
          initial={{ scale: 1.15, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-mono font-bold"
          style={{ color: pnlColor, textShadow: `0 0 12px ${pnlGlow}`, fontSize: compact ? "13px" : "16px" }}
        >
          {formattedPnl}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default ParticipantTile;
