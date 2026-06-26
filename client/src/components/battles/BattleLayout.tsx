import React from "react";
import { motion, LayoutGroup } from "framer-motion";
import ParticipantTile from "./ParticipantTile";
import StatsPanel from "./StatsPanel";
import type { TraderStats } from "./ParticipantTile";
import type { BattleMode } from "./StatsPanel";

export interface Trader {
  id: string;
  name: string;
  stats: TraderStats;
  videoTrack?: React.ReactNode | null;
  isMuted?: boolean;
  isScreenSharing?: boolean;
}

interface BattleLayoutProps {
  mode: BattleMode;
  leftTraders: Trader[];
  rightTraders: Trader[];
  leftTeamName: string;
  rightTeamName: string;
  elapsed: number;
  obsMode?: boolean;
}

const EmptySlot: React.FC<{ label: string; side: "left" | "right"; compact?: boolean }> = ({ label, side, compact }) => (
  <div
    className="flex-1 rounded-xl flex items-center justify-center"
    style={{
      border: `1px dashed ${side === "left" ? "rgba(0,255,135,0.15)" : "rgba(255,59,92,0.15)"}`,
      background: "rgba(10,10,15,0.5)",
    }}
  >
    <span className="font-['Orbitron']" style={{ color: "#2a2a2a", fontSize: compact ? "9px" : "11px" }}>{label}</span>
  </div>
);

const BattleLayout: React.FC<BattleLayoutProps> = ({ mode, leftTraders, rightTraders, leftTeamName, rightTeamName, elapsed }) => {
  const leftTeam = { name: leftTeamName, traders: leftTraders.map((t) => ({ name: t.name, stats: t.stats })), side: "left" as const };
  const rightTeam = { name: rightTeamName, traders: rightTraders.map((t) => ({ name: t.name, stats: t.stats })), side: "right" as const };
  const compact = mode !== "1v1";
  const count = mode === "1v1" ? 1 : mode === "2v2" ? 2 : 3;

  return (
    <LayoutGroup>
      <motion.div layout className="flex h-full w-full" style={{ gap: 0 }}>
        <motion.div layout className="flex-1 flex flex-col min-w-0" style={{ padding: compact ? "4px" : "6px", gap: compact ? "4px" : "6px" }}>
          {Array.from({ length: count }, (_, i) => {
            const t = leftTraders[i];
            return t ? (
              <ParticipantTile key={t.id} traderName={t.name} stats={t.stats} videoTrack={t.videoTrack} isMuted={t.isMuted} isScreenSharing={t.isScreenSharing} side={mode === "1v1" ? "left" : "team-left"} compact={compact} className="flex-1 min-h-0" />
            ) : (
              <EmptySlot key={i} label={mode === "1v1" ? "Trader 1" : `Team A · Trader ${i + 1}`} side="left" compact={compact} />
            );
          })}
        </motion.div>
        <StatsPanel mode={mode} leftTeam={leftTeam} rightTeam={rightTeam} elapsed={elapsed} compact={compact} />
        <motion.div layout className="flex-1 flex flex-col min-w-0" style={{ padding: compact ? "4px" : "6px", gap: compact ? "4px" : "6px" }}>
          {Array.from({ length: count }, (_, i) => {
            const t = rightTraders[i];
            return t ? (
              <ParticipantTile key={t.id} traderName={t.name} stats={t.stats} videoTrack={t.videoTrack} isMuted={t.isMuted} isScreenSharing={t.isScreenSharing} side={mode === "1v1" ? "right" : "team-right"} compact={compact} className="flex-1 min-h-0" />
            ) : (
              <EmptySlot key={i} label={mode === "1v1" ? "Trader 2" : `Team B · Trader ${i + 1}`} side="right" compact={compact} />
            );
          })}
        </motion.div>
      </motion.div>
    </LayoutGroup>
  );
};

export default BattleLayout;
