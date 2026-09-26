import React from "react";
import { Activity, Columns2, Monitor, UserRound } from "lucide-react";
import type { SeatLayoutMode } from "./ParticipantTile";

const OPTIONS: { value: SeatLayoutMode; label: string; icon: React.ReactNode }[] = [
  { value: "face", label: "Face", icon: <UserRound className="h-3.5 w-3.5" /> },
  { value: "screen", label: "Screen", icon: <Monitor className="h-3.5 w-3.5" /> },
  { value: "stats", label: "Stats", icon: <Activity className="h-3.5 w-3.5" /> },
  { value: "face-screen", label: "Face + Screen", icon: <Columns2 className="h-3.5 w-3.5" /> },
  { value: "screen-stats", label: "Screen + Stats", icon: <Columns2 className="h-3.5 w-3.5" /> },
  { value: "face-stats", label: "Face + Stats", icon: <Columns2 className="h-3.5 w-3.5" /> },
];

export default function SeatLayoutPicker({
  value,
  onChange,
}: {
  value: SeatLayoutMode;
  onChange: (value: SeatLayoutMode) => void;
}) {
  return (
    <div className="absolute bottom-12 left-1/2 z-[75] w-[330px] -translate-x-1/2 rounded-2xl border border-cyan-300/20 bg-[#07101b]/95 p-3 shadow-[0_22px_80px_rgba(0,0,0,.55)] backdrop-blur-xl">
      <div className="mb-2 px-1 font-['Orbitron'] text-[9px] font-black uppercase tracking-[0.15em] text-cyan-200">
        Seat layout
      </div>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all"
              style={{
                borderColor: active ? "rgba(34,211,238,.45)" : "rgba(255,255,255,.07)",
                background: active ? "rgba(34,211,238,.08)" : "rgba(255,255,255,.025)",
                color: active ? "#a5f3fc" : "#64748b",
              }}
            >
              {option.icon}
              <span className="font-['Orbitron'] text-[9px] font-bold">{option.label}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 px-1 text-[8px] leading-relaxed text-slate-600">
        Verified return and P&amp;L remain visible in the center scoreboard even when the seat is full camera or full screen.
      </p>
    </div>
  );
}
