import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Trophy, Zap, BarChart2, Target } from "lucide-react";
import type { TraderStats } from "./ParticipantTile";

export type BattleMode = "1v1" | "2v2" | "3v3";

export interface TeamStats {
  name: string;
  traders: { name: string; stats: TraderStats }[];
  side: "left" | "right";
}

interface StatsPanelProps {
  mode: BattleMode;
  leftTeam: TeamStats;
  rightTeam: TeamStats;
  /** elapsed seconds */
  elapsed: number;
  compact?: boolean;
}

function aggregateTeam(team: TeamStats): TraderStats {
  return team.traders.reduce(
    (acc, t) => ({
      pnl: acc.pnl + t.stats.pnl,
      wins: acc.wins + t.stats.wins,
      losses: acc.losses + t.stats.losses,
      biggestWin: Math.max(acc.biggestWin, t.stats.biggestWin),
      tradeCount: acc.tradeCount + t.stats.tradeCount,
    }),
    { pnl: 0, wins: 0, losses: 0, biggestWin: 0, tradeCount: 0 }
  );
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatPnl(pnl: number) {
  const abs = Math.abs(pnl);
  const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return pnl >= 0 ? `+$${formatted}` : `-$${formatted}`;
}

const StatRow: React.FC<{
  label: string;
  leftVal: string | number;
  rightVal: string | number;
  leftBetter?: boolean;
  icon: React.ReactNode;
  compact?: boolean;
}> = ({ label, leftVal, rightVal, leftBetter, icon, compact }) => (
  <div className={`flex items-center gap-2 ${compact ? "py-1" : "py-2"}`}>
    <div
      className={`flex-1 text-right font-['Orbitron'] font-bold transition-colors ${compact ? "text-xs" : "text-sm"} ${
        leftBetter === true ? "text-[#7B2FBE]" : leftBetter === false ? "text-[#4A5568]" : "text-white"
      }`}
    >
      {leftVal}
    </div>
    <div className="flex flex-col items-center w-20 flex-shrink-0">
      <div className="text-[#B8B8D0] mb-0.5">{icon}</div>
      <span className={`text-[#B8B8D0] font-semibold text-center leading-tight ${compact ? "text-[9px]" : "text-[10px]"}`}>
        {label}
      </span>
    </div>
    <div
      className={`flex-1 text-left font-['Orbitron'] font-bold transition-colors ${compact ? "text-xs" : "text-sm"} ${
        leftBetter === false ? "text-[#00FFFF]" : leftBetter === true ? "text-[#4A5568]" : "text-white"
      }`}
    >
      {rightVal}
    </div>
  </div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ mode, leftTeam, rightTeam, elapsed, compact = false }) => {
  const leftAgg = aggregateTeam(leftTeam);
  const rightAgg = aggregateTeam(rightTeam);

  const leftWinning = leftAgg.pnl > rightAgg.pnl;
  const rightWinning = rightAgg.pnl > leftAgg.pnl;
  const tied = leftAgg.pnl === rightAgg.pnl;

  const leftWinRate =
    leftAgg.wins + leftAgg.losses > 0
      ? Math.round((leftAgg.wins / (leftAgg.wins + leftAgg.losses)) * 100)
      : 0;
  const rightWinRate =
    rightAgg.wins + rightAgg.losses > 0
      ? Math.round((rightAgg.wins / (rightAgg.wins + rightAgg.losses)) * 100)
      : 0;

  return (
    <div
      className={`flex flex-col bg-[#0B1426]/95 backdrop-blur-sm border-x border-white/10 relative ${
        compact ? "w-36" : "w-44"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1A1A2E] to-[#0B1426] border-b border-white/10 px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className={`text-red-400 font-['Orbitron'] font-bold ${compact ? "text-[9px]" : "text-[10px]"}`}>
            LIVE
          </span>
        </div>
        <div className={`font-['Orbitron'] font-bold text-white ${compact ? "text-base" : "text-lg"}`}>
          {formatTime(elapsed)}
        </div>
        <div className={`text-[#B8B8D0] font-semibold ${compact ? "text-[9px]" : "text-[10px]"}`}>
          {mode} BATTLE
        </div>
      </div>

      {/* VS Banner */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`font-['Orbitron'] font-bold truncate ${compact ? "text-[10px]" : "text-xs"} ${
              leftWinning ? "text-[#7B2FBE]" : "text-[#4A5568]"
            }`}
          >
            {leftTeam.name}
          </span>
          <span className={`font-['Orbitron'] font-bold text-white flex-shrink-0 ${compact ? "text-xs" : "text-sm"}`}>
            VS
          </span>
          <span
            className={`font-['Orbitron'] font-bold truncate ${compact ? "text-[10px]" : "text-xs"} ${
              rightWinning ? "text-[#00FFFF]" : "text-[#4A5568]"
            }`}
          >
            {rightTeam.name}
          </span>
        </div>
      </div>

      {/* Stats rows */}
      <div className="flex-1 flex flex-col justify-center px-3 divide-y divide-white/5">
        {/* P&L */}
        <div className={`flex flex-col items-center ${compact ? "py-2" : "py-3"}`}>
          <div className={`text-[#B8B8D0] font-semibold mb-1 ${compact ? "text-[9px]" : "text-[10px]"}`}>NET P&L</div>
          <div className="flex items-center justify-between w-full gap-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={leftAgg.pnl}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-['Orbitron'] font-bold ${compact ? "text-sm" : "text-base"} ${
                  leftAgg.pnl >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatPnl(leftAgg.pnl)}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div
                key={rightAgg.pnl}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-['Orbitron'] font-bold ${compact ? "text-sm" : "text-base"} ${
                  rightAgg.pnl >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatPnl(rightAgg.pnl)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* P&L progress bar */}
          <div className="w-full h-1.5 bg-[#1A1A2E] rounded-full mt-2 overflow-hidden">
            {leftAgg.pnl + rightAgg.pnl !== 0 ? (
              <>
                <div
                  className="h-full bg-gradient-to-r from-[#7B2FBE] to-[#00FFFF] rounded-full"
                  style={{
                    width: `${Math.max(
                      5,
                      Math.min(
                        95,
                        ((leftAgg.pnl + Math.abs(Math.min(leftAgg.pnl, rightAgg.pnl, 0))) /
                          (Math.abs(leftAgg.pnl) + Math.abs(rightAgg.pnl) || 1)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </>
            ) : (
              <div className="h-full w-1/2 bg-gradient-to-r from-[#7B2FBE] to-[#00FFFF] rounded-full" />
            )}
          </div>
        </div>

        <StatRow
          label="WIN RATE"
          leftVal={`${leftWinRate}%`}
          rightVal={`${rightWinRate}%`}
          leftBetter={leftWinRate !== rightWinRate ? leftWinRate > rightWinRate : undefined}
          icon={<Target className="w-3.5 h-3.5" />}
          compact={compact}
        />

        <StatRow
          label="TRADES"
          leftVal={leftAgg.tradeCount}
          rightVal={rightAgg.tradeCount}
          icon={<BarChart2 className="w-3.5 h-3.5" />}
          compact={compact}
        />

        <StatRow
          label="BEST TRADE"
          leftVal={`$${leftAgg.biggestWin.toLocaleString()}`}
          rightVal={`$${rightAgg.biggestWin.toLocaleString()}`}
          leftBetter={
            leftAgg.biggestWin !== rightAgg.biggestWin
              ? leftAgg.biggestWin > rightAgg.biggestWin
              : undefined
          }
          icon={<Zap className="w-3.5 h-3.5" />}
          compact={compact}
        />

        <StatRow
          label="W / L"
          leftVal={`${leftAgg.wins}/${leftAgg.losses}`}
          rightVal={`${rightAgg.wins}/${rightAgg.losses}`}
          icon={<Trophy className="w-3.5 h-3.5" />}
          compact={compact}
        />
      </div>

      {/* Winner glow footer */}
      {!tied && (
        <div
          className={`border-t border-white/10 py-2 px-3 text-center ${
            leftWinning
              ? "bg-[#7B2FBE]/10 text-[#7B2FBE]"
              : "bg-[#00FFFF]/10 text-[#00FFFF]"
          }`}
        >
          <span className={`font-['Orbitron'] font-bold ${compact ? "text-[9px]" : "text-[10px]"}`}>
            {leftWinning ? `${leftTeam.name} LEADING` : `${rightTeam.name} LEADING`}
          </span>
        </div>
      )}
      {tied && (
        <div className="border-t border-white/10 py-2 px-3 text-center bg-white/5">
          <span className={`font-['Orbitron'] font-bold text-white/60 ${compact ? "text-[9px]" : "text-[10px]"}`}>
            TIED
          </span>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
