import React from "react";
import { motion, LayoutGroup } from "framer-motion";
import ParticipantTile from "./ParticipantTile";
import StatsPanel from "./StatsPanel";
import type { TraderStats, SeatLayoutMode } from "./ParticipantTile";
import type { BattleMode } from "./StatsPanel";
import type { BattleRuleConfig } from "@/lib/tradehouse-rules";

export interface Trader {
  id: string;
  name: string;
  avatarUrl?: string;
  stats: TraderStats;
  cameraTrack?: React.ReactNode | null;
  screenTrack?: React.ReactNode | null;
  layoutMode?: SeatLayoutMode;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isScreenSharing?: boolean;
}

interface BattleLayoutProps {
  mode: BattleMode;
  leftTraders: Trader[];
  rightTraders: Trader[];
  leftTeamName: string;
  rightTeamName: string;
  elapsed: number;
  rule?: BattleRuleConfig;
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

const BattleLayout: React.FC<BattleLayoutProps> = ({ mode, leftTraders, rightTraders, leftTeamName, rightTeamName, elapsed, rule }) => {
  const leftTeam = { name: leftTeamName, traders: leftTraders.map((t) => ({ name: t.name, stats: t.stats })), side: "left" as const };
  const rightTeam = { name: rightTeamName, traders: rightTraders.map((t) => ({ name: t.name, stats: t.stats })), side: "right" as const };
  const compact = mode !== "1v1";
  const count = mode === "1v1" ? 1 : mode === "2v2" ? 2 : mode === "3v3" ? 3 : 4;

  return (
    <LayoutGroup>
      <motion.div layout className="flex h-full w-full flex-col overflow-y-auto overscroll-contain md:flex-row md:overflow-hidden" style={{ gap: 0 }}>
        <motion.div layout className="flex min-w-0 flex-none flex-col md:flex-1" style={{ padding: compact ? "4px" : "6px", gap: compact ? "4px" : "6px" }}>
          {Array.from({ length: count }, (_, i) => {
            const t = leftTraders[i];
            return t ? (
              <ParticipantTile key={t.id} traderName={t.name} avatarUrl={t.avatarUrl} stats={t.stats} cameraTrack={t.cameraTrack} screenTrack={t.screenTrack} layoutMode={t.layoutMode} isMuted={t.isMuted} isCameraOff={t.isCameraOff} isScreenSharing={t.isScreenSharing} side={mode === "1v1" ? "left" : "team-left"} compact={compact} className="min-h-[260px] flex-1 sm:min-h-[320px] md:min-h-0" />
            ) : (
              <EmptySlot key={i} label={mode === "1v1" ? "Trader 1" : `Team A · Trader ${i + 1}`} side="left" compact={compact} />
            );
          })}
        </motion.div>
        <div className="order-first w-full md:order-none md:w-auto"><StatsPanel mode={mode} leftTeam={leftTeam} rightTeam={rightTeam} elapsed={elapsed} rule={rule} compact={compact} /></div>
        <motion.div layout className="flex min-w-0 flex-none flex-col md:flex-1" style={{ padding: compact ? "4px" : "6px", gap: compact ? "4px" : "6px" }}>
          {Array.from({ length: count }, (_, i) => {
            const t = rightTraders[i];
            return t ? (
              <ParticipantTile key={t.id} traderName={t.name} avatarUrl={t.avatarUrl} stats={t.stats} cameraTrack={t.cameraTrack} screenTrack={t.screenTrack} layoutMode={t.layoutMode} isMuted={t.isMuted} isCameraOff={t.isCameraOff} isScreenSharing={t.isScreenSharing} side={mode === "1v1" ? "right" : "team-right"} compact={compact} className="min-h-[260px] flex-1 sm:min-h-[320px] md:min-h-0" />
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
