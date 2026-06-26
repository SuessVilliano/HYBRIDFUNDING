import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Monitor, Mic, MicOff, TrendingUp, TrendingDown } from "lucide-react";

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
  /** Stream Video track element to render, or null for placeholder */
  videoTrack?: React.ReactNode | null;
  isMuted?: boolean;
  isScreenSharing?: boolean;
  side: "left" | "right" | "team-left" | "team-right";
  /** compact = smaller font for 2v2/3v3 layouts */
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
  const isPnlPositive = stats.pnl >= 0;

  const sideAccent =
    side === "left" || side === "team-left"
      ? "border-[#7B2FBE] shadow-[0_0_20px_rgba(123,47,190,0.4)]"
      : "border-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.4)]";

  const pnlColor = isPnlPositive ? "text-green-400" : "text-red-400";
  const PnlIcon = isPnlPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-xl overflow-hidden border-2 ${sideAccent} bg-[#0B1426] flex flex-col ${className}`}
    >
      {/* Screen share / video area */}
      <div className="flex-1 relative bg-[#050D1A] flex items-center justify-center min-h-0">
        {videoTrack ? (
          <div className="absolute inset-0">{videoTrack}</div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-[#4A5568]">
            <Monitor className={compact ? "w-10 h-10" : "w-16 h-16"} />
            <span className={`font-['Orbitron'] ${compact ? "text-xs" : "text-sm"}`}>
              Waiting for screen share…
            </span>
          </div>
        )}

        {/* Screen sharing badge */}
        {isScreenSharing && (
          <div className="absolute top-2 left-2 bg-green-500/20 border border-green-500/50 rounded-full px-2 py-0.5 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-[10px] font-bold">LIVE</span>
          </div>
        )}
      </div>

      {/* Bottom HUD */}
      <div className="bg-[#0B1426]/95 backdrop-blur-sm border-t border-white/10 px-3 py-2 flex items-center justify-between gap-2">
        {/* Trader name + mute */}
        <div className="flex items-center gap-2 min-w-0">
          {isMuted ? (
            <MicOff className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
          )}
          <span
            className={`font-['Orbitron'] font-bold truncate ${
              compact ? "text-xs" : "text-sm"
            } text-white`}
          >
            {traderName}
          </span>
        </div>

        {/* Mini P&L */}
        <div className={`flex items-center gap-1 flex-shrink-0 ${pnlColor}`}>
          <PnlIcon className="w-3.5 h-3.5" />
          <span className={`font-bold font-['Orbitron'] ${compact ? "text-xs" : "text-sm"}`}>
            {isPnlPositive ? "+" : ""}
            {stats.pnl >= 0
              ? `$${stats.pnl.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
              : `-$${Math.abs(stats.pnl).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ParticipantTile;
