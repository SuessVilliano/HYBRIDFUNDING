import React from "react";
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
  /** True when rendered inside OBS browser source */
  obsMode?: boolean;
}

const BattleLayout: React.FC<BattleLayoutProps> = ({
  mode,
  leftTraders,
  rightTraders,
  leftTeamName,
  rightTeamName,
  elapsed,
  obsMode = false,
}) => {
  const leftTeam = {
    name: leftTeamName,
    traders: leftTraders.map((t) => ({ name: t.name, stats: t.stats })),
    side: "left" as const,
  };
  const rightTeam = {
    name: rightTeamName,
    traders: rightTraders.map((t) => ({ name: t.name, stats: t.stats })),
    side: "right" as const,
  };

  const compact = mode !== "1v1";

  // ── 1v1: two panes side-by-side with center stats ─────────────────────────
  if (mode === "1v1") {
    const left = leftTraders[0];
    const right = rightTraders[0];
    return (
      <div className="flex h-full w-full gap-0">
        {/* Left trader */}
        <div className="flex-1 p-2">
          {left ? (
            <ParticipantTile
              traderName={left.name}
              stats={left.stats}
              videoTrack={left.videoTrack}
              isMuted={left.isMuted}
              isScreenSharing={left.isScreenSharing}
              side="left"
              className="h-full"
            />
          ) : (
            <EmptySlot label="Trader 1" side="left" />
          )}
        </div>

        {/* Center stats */}
        <StatsPanel
          mode={mode}
          leftTeam={leftTeam}
          rightTeam={rightTeam}
          elapsed={elapsed}
          compact={false}
        />

        {/* Right trader */}
        <div className="flex-1 p-2">
          {right ? (
            <ParticipantTile
              traderName={right.name}
              stats={right.stats}
              videoTrack={right.videoTrack}
              isMuted={right.isMuted}
              isScreenSharing={right.isScreenSharing}
              side="right"
              className="h-full"
            />
          ) : (
            <EmptySlot label="Trader 2" side="right" />
          )}
        </div>
      </div>
    );
  }

  // ── 2v2: two-column grids either side of center stats ─────────────────────
  if (mode === "2v2") {
    return (
      <div className="flex h-full w-full gap-0">
        {/* Left 2 traders in a column */}
        <div className="flex-1 flex flex-col gap-1 p-1">
          {[0, 1].map((i) => {
            const t = leftTraders[i];
            return t ? (
              <ParticipantTile
                key={t.id}
                traderName={t.name}
                stats={t.stats}
                videoTrack={t.videoTrack}
                isMuted={t.isMuted}
                isScreenSharing={t.isScreenSharing}
                side="team-left"
                compact
                className="flex-1"
              />
            ) : (
              <EmptySlot key={i} label={`Team A — Trader ${i + 1}`} side="left" compact />
            );
          })}
        </div>

        {/* Center stats */}
        <StatsPanel
          mode={mode}
          leftTeam={leftTeam}
          rightTeam={rightTeam}
          elapsed={elapsed}
          compact
        />

        {/* Right 2 traders in a column */}
        <div className="flex-1 flex flex-col gap-1 p-1">
          {[0, 1].map((i) => {
            const t = rightTraders[i];
            return t ? (
              <ParticipantTile
                key={t.id}
                traderName={t.name}
                stats={t.stats}
                videoTrack={t.videoTrack}
                isMuted={t.isMuted}
                isScreenSharing={t.isScreenSharing}
                side="team-right"
                compact
                className="flex-1"
              />
            ) : (
              <EmptySlot key={i} label={`Team B — Trader ${i + 1}`} side="right" compact />
            );
          })}
        </div>
      </div>
    );
  }

  // ── 3v3: three rows on each side, center column of stats ──────────────────
  // Layout: [left-col] [center-stats] [right-col]
  return (
    <div className="flex h-full w-full gap-0">
      {/* Left 3 traders */}
      <div className="flex-1 flex flex-col gap-1 p-1">
        {[0, 1, 2].map((i) => {
          const t = leftTraders[i];
          return t ? (
            <ParticipantTile
              key={t.id}
              traderName={t.name}
              stats={t.stats}
              videoTrack={t.videoTrack}
              isMuted={t.isMuted}
              isScreenSharing={t.isScreenSharing}
              side="team-left"
              compact
              className="flex-1"
            />
          ) : (
            <EmptySlot key={i} label={`Team A — Trader ${i + 1}`} side="left" compact />
          );
        })}
      </div>

      {/* Center stats */}
      <StatsPanel
        mode={mode}
        leftTeam={leftTeam}
        rightTeam={rightTeam}
        elapsed={elapsed}
        compact
      />

      {/* Right 3 traders */}
      <div className="flex-1 flex flex-col gap-1 p-1">
        {[0, 1, 2].map((i) => {
          const t = rightTraders[i];
          return t ? (
            <ParticipantTile
              key={t.id}
              traderName={t.name}
              stats={t.stats}
              videoTrack={t.videoTrack}
              isMuted={t.isMuted}
              isScreenSharing={t.isScreenSharing}
              side="team-right"
              compact
              className="flex-1"
            />
          ) : (
            <EmptySlot key={i} label={`Team B — Trader ${i + 1}`} side="right" compact />
          );
        })}
      </div>
    </div>
  );
};

// ── Empty seat placeholder ─────────────────────────────────────────────────────
const EmptySlot: React.FC<{ label: string; side: "left" | "right"; compact?: boolean }> = ({
  label,
  side,
  compact,
}) => (
  <div
    className={`flex-1 rounded-xl border-2 border-dashed flex items-center justify-center ${
      side === "left" ? "border-[#7B2FBE]/30" : "border-[#00FFFF]/30"
    } bg-[#0B1426]/50`}
  >
    <span className={`text-[#4A5568] font-['Orbitron'] ${compact ? "text-xs" : "text-sm"}`}>{label}</span>
  </div>
);

export default BattleLayout;
