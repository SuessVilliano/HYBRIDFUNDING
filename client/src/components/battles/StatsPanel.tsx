import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Target, BarChart2, Zap, Trophy, TrendingUp } from "lucide-react";
import type { TraderStats } from "./ParticipantTile";
import { battleClock, battleObjective, type BattleRuleConfig } from "@/lib/tradehouse-rules";

export type BattleMode = "1v1" | "2v2" | "3v3" | "4v4";

export interface TeamStats {
  name: string;
  traders: { name: string; stats: TraderStats }[];
  side: "left" | "right";
}

interface StatsPanelProps {
  mode: BattleMode;
  leftTeam: TeamStats;
  rightTeam: TeamStats;
  elapsed: number;
  rule?: BattleRuleConfig;
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

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function shortPnl(pnl: number) {
  const abs = Math.abs(pnl);
  if (abs >= 1000) return (pnl >= 0 ? "+" : "-") + "$" + (abs / 1000).toFixed(1) + "k";
  return (pnl >= 0 ? "+" : "-") + "$" + abs.toLocaleString();
}

const AnimatedNumber: React.FC<{ value: string | number; color?: string }> = ({ value, color }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={String(value)}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
      className="font-mono font-bold"
      style={{ color }}
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ mode, leftTeam, rightTeam, elapsed, rule = { format: "spotlight", label: "Spotlight Session" }, compact = false }) => {
  const leftAgg = aggregateTeam(leftTeam);
  const rightAgg = aggregateTeam(rightTeam);

  const leftWinning = leftAgg.pnl > rightAgg.pnl;
  const rightWinning = rightAgg.pnl > leftAgg.pnl;
  const tied = leftAgg.pnl === rightAgg.pnl;

  const total = Math.abs(leftAgg.pnl) + Math.abs(rightAgg.pnl);
  const leftPct = total > 0 ? Math.max(5, Math.min(95, (Math.abs(leftAgg.pnl) / total) * 100)) : 50;
  const rightPct = 100 - leftPct;

  const leftWinRate = leftAgg.wins + leftAgg.losses > 0
    ? Math.round((leftAgg.wins / (leftAgg.wins + leftAgg.losses)) * 100) : 0;
  const rightWinRate = rightAgg.wins + rightAgg.losses > 0
    ? Math.round((rightAgg.wins / (rightAgg.wins + rightAgg.losses)) * 100) : 0;

  const fs = compact ? "9px" : "10px";
  const clock = battleClock(rule, elapsed);
  const objective = battleObjective(rule);
  const averageReturn = (team: TeamStats) => {
    const values = team.traders.map((t) => t.stats.returnPct).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  };
  const leftReturn = averageReturn(leftTeam);
  const rightReturn = averageReturn(rightTeam);

  const mobileStrip = (
    <div className="sticky top-0 z-20 flex w-full items-center justify-between gap-2 border-y border-white/[0.07] bg-[#070b12]/95 px-3 py-2 backdrop-blur-xl md:hidden">
      <div className="min-w-0 flex-1">
        <div className="truncate font-['Orbitron'] text-[8px] font-black uppercase tracking-[0.1em] text-cyan-200">{leftTeam.name}</div>
        <div className="mt-0.5 font-mono text-xs font-black" style={{ color: leftAgg.pnl >= 0 ? "#00ff87" : "#ff3b5c" }}>{shortPnl(leftAgg.pnl)} · {leftReturn >= 0 ? "+" : ""}{leftReturn.toFixed(2)}%</div>
      </div>
      <div className="flex-shrink-0 text-center">
        <div className="font-mono text-sm font-black text-white">{formatTime(clock.seconds)}</div>
        <div className="font-['Orbitron'] text-[6px] font-black uppercase tracking-[0.12em] text-slate-500">{clock.label}</div>
        <div className="mt-0.5 font-['Orbitron'] text-[7px] font-black text-violet-300">VS</div>
      </div>
      <div className="min-w-0 flex-1 text-right">
        <div className="truncate font-['Orbitron'] text-[8px] font-black uppercase tracking-[0.1em] text-violet-200">{rightTeam.name}</div>
        <div className="mt-0.5 font-mono text-xs font-black" style={{ color: rightAgg.pnl >= 0 ? "#00ff87" : "#ff3b5c" }}>{shortPnl(rightAgg.pnl)} · {rightReturn >= 0 ? "+" : ""}{rightReturn.toFixed(2)}%</div>
      </div>
    </div>
  );

  return (
    <>
      {mobileStrip}
    <div
      className="relative hidden flex-col md:flex"
      style={{
        width: compact ? "140px" : "164px",
        flexShrink: 0,
        background: "rgba(10,10,15,0.97)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="text-center py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}
      >
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff3b5c]" style={{ boxShadow: "0 0 6px #ff3b5c", animation: "pulse 1.2s infinite" }} />
          <span className="font-['Orbitron'] font-bold text-[#ff3b5c]" style={{ fontSize: "9px" }}>LIVE</span>
        </div>
        <motion.div
          key={elapsed}
          className="font-mono font-black text-white"
          style={{ fontSize: compact ? "18px" : "22px", textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
        >
          {formatTime(clock.seconds)}
        </motion.div>
        <div className="font-['Orbitron'] font-bold" style={{ color: clock.expired ? "#ff3b5c" : "#58677a", fontSize: "8px", marginTop: "2px", letterSpacing: "0.12em" }}>
          {clock.expired ? "TIME" : clock.label}
        </div>
        <div className="mt-1 font-['Orbitron'] font-bold" style={{ color: "#7c8da3", fontSize: "8px" }}>
          {rule.label.toUpperCase()} · {mode}
        </div>
      </div>

      <div className="px-2 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="mb-2 rounded-md border border-cyan-300/10 bg-cyan-300/[0.035] px-2 py-1.5 text-center font-['Orbitron'] text-[7px] font-bold uppercase leading-relaxed tracking-[0.08em] text-cyan-100/70">
          {objective}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-['Orbitron'] font-bold truncate" style={{ color: leftWinning ? "#00ff87" : "#333", fontSize: fs, maxWidth: "40%" }}>
            {leftTeam.name}
          </span>
          <span className="font-['Orbitron'] font-black text-white flex-shrink-0 mx-1" style={{ fontSize: compact ? "14px" : "16px", color: "#00ffff", textShadow: "0 0 12px rgba(0,255,255,0.5)" }}>
            VS
          </span>
          <span className="font-['Orbitron'] font-bold truncate text-right" style={{ color: rightWinning ? "#00ff87" : "#333", fontSize: fs, maxWidth: "40%" }}>
            {rightTeam.name}
          </span>
        </div>
        {!tied && (
          <motion.div
            key={leftWinning ? "left" : "right"}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2 flex items-center justify-center gap-1"
          >
            <Crown className="w-3 h-3" style={{ color: "#00ffff", filter: "drop-shadow(0 0 4px rgba(0,255,255,0.6))" }} />
            <span className="font-['Orbitron'] font-bold" style={{ color: "#00ffff", fontSize: "9px", textShadow: "0 0 8px rgba(0,255,255,0.4)" }}>
              {leftWinning ? leftTeam.name : rightTeam.name} LEADING
            </span>
          </motion.div>
        )}
        {tied && (
          <div className="mt-2 text-center font-['Orbitron'] font-bold" style={{ color: "#333", fontSize: "9px" }}>TIED</div>
        )}
      </div>

      <div className="px-2 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="font-['Orbitron'] font-bold text-center mb-2" style={{ color: "#444", fontSize: "9px", letterSpacing: "0.2em" }}>NET P&L</div>
        <div className="flex items-center justify-between mb-1.5">
          <AnimatedNumber value={shortPnl(leftAgg.pnl)} color={leftAgg.pnl >= 0 ? "#00ff87" : "#ff3b5c"} />
          <AnimatedNumber value={shortPnl(rightAgg.pnl)} color={rightAgg.pnl >= 0 ? "#00ff87" : "#ff3b5c"} />
        </div>
        <div className="relative h-2 rounded-full overflow-hidden flex" style={{ background: "#1a1a22" }}>
          <div className="flex-1 flex justify-end">
            <motion.div
              animate={{ width: `${leftPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-l-full"
              style={{
                background: leftAgg.pnl >= 0 ? "linear-gradient(90deg, transparent, #00ff87)" : "linear-gradient(90deg, transparent, #ff3b5c)",
                boxShadow: leftAgg.pnl >= 0 ? "0 0 8px rgba(0,255,135,0.5)" : "0 0 8px rgba(255,59,92,0.5)",
              }}
            />
          </div>
          <div className="w-px" style={{ background: "#0a0a0f", flexShrink: 0 }} />
          <div className="flex-1 flex justify-start">
            <motion.div
              animate={{ width: `${rightPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-r-full"
              style={{
                background: rightAgg.pnl >= 0 ? "linear-gradient(90deg, #00ff87, transparent)" : "linear-gradient(90deg, #ff3b5c, transparent)",
                boxShadow: rightAgg.pnl >= 0 ? "0 0 8px rgba(0,255,135,0.5)" : "0 0 8px rgba(255,59,92,0.5)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {[
          { label: "RETURN", icon: <TrendingUp style={{ width: 12, height: 12 }} />, leftVal: `${leftReturn >= 0 ? "+" : ""}${leftReturn.toFixed(2)}%`, rightVal: `${rightReturn >= 0 ? "+" : ""}${rightReturn.toFixed(2)}%`, leftBetter: leftReturn !== rightReturn ? leftReturn > rightReturn : undefined },
          { label: "WIN RATE", icon: <Target style={{ width: 12, height: 12 }} />, leftVal: `${leftWinRate}%`, rightVal: `${rightWinRate}%`, leftBetter: leftWinRate !== rightWinRate ? leftWinRate > rightWinRate : undefined },
          { label: "TRADES", icon: <BarChart2 style={{ width: 12, height: 12 }} />, leftVal: leftAgg.tradeCount, rightVal: rightAgg.tradeCount },
          { label: "BEST TRADE", icon: <Zap style={{ width: 12, height: 12 }} />, leftVal: `$${leftAgg.biggestWin.toLocaleString()}`, rightVal: `$${rightAgg.biggestWin.toLocaleString()}`, leftBetter: leftAgg.biggestWin !== rightAgg.biggestWin ? leftAgg.biggestWin > rightAgg.biggestWin : undefined },
          { label: "W / L", icon: <Trophy style={{ width: 12, height: 12 }} />, leftVal: `${leftAgg.wins}/${leftAgg.losses}`, rightVal: `${rightAgg.wins}/${rightAgg.losses}` },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-1 px-2" style={{ paddingTop: compact ? 5 : 7, paddingBottom: compact ? 5 : 7, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex-1 text-right">
              <AnimatedNumber value={row.leftVal} color={row.leftBetter === true ? "#00ff87" : row.leftBetter === false ? "#333" : "#666"} />
            </div>
            <div className="flex flex-col items-center w-16 flex-shrink-0">
              <span style={{ color: "#333" }}>{row.icon}</span>
              <span className="font-['Orbitron'] font-bold text-center leading-tight mt-0.5" style={{ color: "#2a2a2a", fontSize: "8px", letterSpacing: "0.1em" }}>{row.label}</span>
            </div>
            <div className="flex-1 text-left">
              <AnimatedNumber value={row.rightVal} color={row.leftBetter === false ? "#00ff87" : row.leftBetter === true ? "#333" : "#666"} />
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default StatsPanel;
