/**
 * BattleRoom — the live Trader Battles arena.
 *
 * URL: /battles/room/:roomId
 * Query params:
 *   mode    "1v1" | "2v2" | "3v3"   (creator sets this)
 *   name    trader display name
 *   side    "left" | "right"
 *   slot    0-2  (position within the team)
 *   join    "1"  (set when joining an existing room)
 *   obs     "1"  (OBS Browser Source — hides chrome, fixed 1920x1080)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearch, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  useCall,
  useCallStateHooks,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Monitor, Mic, MicOff, TrendingUp, X, LogOut } from "lucide-react";
import BattleLayout from "@/components/battles/BattleLayout";
import type { Trader } from "@/components/battles/BattleLayout";
import type { TraderStats } from "@/components/battles/ParticipantTile";
import type { BattleMode } from "@/components/battles/StatsPanel";

interface RoomConfig {
  mode: BattleMode;
  myName: string;
  side: "left" | "right";
  slot: number;
  obsMode: boolean;
  roomId: string;
}

const DEFAULT_STATS: TraderStats = { pnl: 0, wins: 0, losses: 0, biggestWin: 0, tradeCount: 0 };

async function fetchBattleToken(userId: string, userName: string, roomId: string) {
  const res = await fetch("/api/battle-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, userName, roomId }),
  });
  if (!res.ok) throw new Error("Token fetch failed");
  return res.json() as Promise<{ token: string; apiKey: string }>;
}

const StatsEditor: React.FC<{ stats: TraderStats; onChange: (s: TraderStats) => void; onClose: () => void }> = ({ stats, onChange, onClose }) => {
  const [draft, setDraft] = useState(stats);
  const Field = ({ label, field }: { label: string; field: keyof TraderStats }) => (
    <label className="flex flex-col gap-1">
      <span className="font-['Orbitron'] text-[9px] font-bold tracking-widest uppercase" style={{ color: "#555" }}>{label}</span>
      <input
        type="number"
        value={draft[field]}
        onChange={(e) => setDraft((d) => ({ ...d, [field]: parseFloat(e.target.value) || 0 }))}
        className="rounded-lg px-3 py-2 font-mono text-white outline-none transition-all"
        style={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.08)", fontSize: "14px" }}
        onFocus={(e) => { e.target.style.border = "1px solid #00ff87"; e.target.style.boxShadow = "0 0 10px rgba(0,255,135,0.1)"; }}
        onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
      />
    </label>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }}
      className="absolute bottom-16 right-0 z-50 w-56 rounded-xl p-4 shadow-2xl"
      style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 40px rgba(0,0,0,0.8)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-['Orbitron'] font-black text-white text-xs tracking-wider">MY STATS</span>
        <button onClick={onClose} style={{ color: "#444" }} className="hover:text-white transition-colors"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-3">
        <Field label="Net P&L ($)" field="pnl" />
        <Field label="Wins" field="wins" />
        <Field label="Losses" field="losses" />
        <Field label="Biggest Win ($)" field="biggestWin" />
        <Field label="Trade Count" field="tradeCount" />
      </div>
      <button
        onClick={() => { onChange(draft); onClose(); }}
        className="mt-4 w-full py-2 rounded-lg font-['Orbitron'] font-black text-sm tracking-widest uppercase transition-all"
        style={{ background: "#00ff87", color: "#0a0a0f", boxShadow: "0 0 20px rgba(0,255,135,0.3)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(0,255,135,0.5)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,255,135,0.3)"; }}
      >
        Save Stats
      </button>
    </motion.div>
  );
};

const BottomBar: React.FC<{
  myName: string; myStats: TraderStats; isMicMuted: boolean; isSharingScreen: boolean;
  onToggleMic: () => void; onToggleScreen: () => void; onHangUp: () => void;
  showStatsEditor: boolean; onToggleStatsEditor: () => void; onStatsChange: (s: TraderStats) => void;
}> = ({ myName, myStats, isMicMuted, isSharingScreen, onToggleMic, onToggleScreen, onHangUp, showStatsEditor, onToggleStatsEditor, onStatsChange }) => {
  const pnlPositive = myStats.pnl >= 0;
  const pnlStr = pnlPositive ? `+$${myStats.pnl.toLocaleString()}` : `-$${Math.abs(myStats.pnl).toLocaleString()}`;
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 h-14 flex items-center justify-between px-5 gap-4"
      style={{ background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-['Orbitron'] font-black text-white truncate text-sm">{myName}</span>
        <span className="font-mono font-bold text-sm" style={{ color: pnlPositive ? "#00ff87" : "#ff3b5c", textShadow: pnlPositive ? "0 0 8px rgba(0,255,135,0.4)" : "0 0 8px rgba(255,59,92,0.4)" }}>{pnlStr}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onToggleMic} className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{ background: isMicMuted ? "rgba(255,59,92,0.15)" : "rgba(255,255,255,0.06)", border: isMicMuted ? "1px solid rgba(255,59,92,0.5)" : "1px solid rgba(255,255,255,0.1)", color: isMicMuted ? "#ff3b5c" : "#666" }}>
          {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <button onClick={onToggleScreen} className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{ background: isSharingScreen ? "rgba(0,255,135,0.15)" : "rgba(255,255,255,0.06)", border: isSharingScreen ? "1px solid rgba(0,255,135,0.5)" : "1px solid rgba(255,255,255,0.1)", color: isSharingScreen ? "#00ff87" : "#666" }}>
          <Monitor className="w-4 h-4" />
        </button>
        <button onClick={onHangUp} className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(255,59,92,0.2)", border: "1px solid rgba(255,59,92,0.5)", color: "#ff3b5c" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,59,92,0.35)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,59,92,0.2)"; }}>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
      <div className="relative flex-shrink-0">
        <button onClick={onToggleStatsEditor}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-['Orbitron'] font-bold tracking-wider uppercase transition-all"
          style={{ background: showStatsEditor ? "rgba(0,255,135,0.1)" : "rgba(255,255,255,0.04)", border: showStatsEditor ? "1px solid rgba(0,255,135,0.4)" : "1px solid rgba(255,255,255,0.08)", color: showStatsEditor ? "#00ff87" : "#555" }}>
          <TrendingUp className="w-3.5 h-3.5" /> Stats
        </button>
        <AnimatePresence>
          {showStatsEditor && <StatsEditor stats={myStats} onChange={onStatsChange} onClose={onToggleStatsEditor} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

const LiveControls: React.FC<{ myStats: TraderStats; myName: string; showStatsEditor: boolean; onToggleStatsEditor: () => void; onStatsChange: (s: TraderStats) => void }> = ({ myStats, myName, showStatsEditor, onToggleStatsEditor, onStatsChange }) => {
  const call = useCall();
  const { useMicrophoneState, useScreenShareState } = useCallStateHooks();
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { screenShare, status: screenShareStatus } = useScreenShareState();
  const isSharingScreen = screenShareStatus === "enabled";
  const [, navigate] = useLocation();
  const toggleMic = useCallback(async () => { try { if (isMicMuted) await microphone.enable(); else await microphone.disable(); } catch (e) { console.error(e); } }, [isMicMuted, microphone]);
  const toggleScreenShare = useCallback(async () => { try { if (isSharingScreen) await screenShare.disable(); else await screenShare.enable(); } catch (e) { console.error(e); } }, [isSharingScreen, screenShare]);
  const hangUp = useCallback(async () => { try { await call?.leave(); } catch (e) { console.error(e); } navigate("/battles/lobby"); }, [call, navigate]);
  return <BottomBar myName={myName} myStats={myStats} isMicMuted={isMicMuted} isSharingScreen={isSharingScreen} onToggleMic={toggleMic} onToggleScreen={toggleScreenShare} onHangUp={hangUp} showStatsEditor={showStatsEditor} onToggleStatsEditor={onToggleStatsEditor} onStatsChange={onStatsChange} />;
};

const ArenaInner: React.FC<{ config: RoomConfig; myStats: TraderStats; elapsed: number; participantData: Record<string, { name: string; stats: TraderStats; side: "left" | "right"; slot: number }>; showStatsEditor: boolean; onToggleStatsEditor: () => void; onStatsChange: (s: TraderStats) => void }> = ({ config, myStats, elapsed, participantData, showStatsEditor, onToggleStatsEditor, onStatsChange }) => {
  const { useParticipants, useLocalParticipant, useMicrophoneState, useScreenShareState } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const { isMute: isMicMuted } = useMicrophoneState();
  const { status: screenShareStatus } = useScreenShareState();
  const isSharingScreen = screenShareStatus === "enabled";
  const buildTraders = (side: "left" | "right"): Trader[] => {
    const count = config.mode === "1v1" ? 1 : config.mode === "2v2" ? 2 : 3;
    return Array.from({ length: count }, (_, slot) => {
      if (config.side === side && config.slot === slot && localParticipant) {
        return { id: localParticipant.sessionId, name: config.myName, stats: myStats, videoTrack: <ParticipantView participant={localParticipant} trackType="screenShareTrack" className="w-full h-full object-contain" />, isMuted: isMicMuted, isScreenSharing: isSharingScreen };
      }
      const entry = Object.entries(participantData).find(([, v]) => v.side === side && v.slot === slot);
      if (!entry) return null;
      const [userId, data] = entry;
      const streamP = participants.find((p) => p.userId === userId);
      return { id: userId, name: data.name, stats: data.stats, videoTrack: streamP ? <ParticipantView participant={streamP} trackType="screenShareTrack" className="w-full h-full object-contain" /> : null, isMuted: !streamP?.isSpeaking, isScreenSharing: !!streamP?.screenShareStream };
    }).filter(Boolean) as Trader[];
  };
  const leftTraders = buildTraders("left");
  const rightTraders = buildTraders("right");
  return (
    <>
      <BattleLayout mode={config.mode} leftTraders={leftTraders} rightTraders={rightTraders} leftTeamName={config.mode === "1v1" ? (leftTraders[0]?.name ?? "Team A") : "TEAM A"} rightTeamName={config.mode === "1v1" ? (rightTraders[0]?.name ?? "Team B") : "TEAM B"} elapsed={elapsed} obsMode={config.obsMode} />
      {!config.obsMode && <LiveControls myStats={myStats} myName={config.myName} showStatsEditor={showStatsEditor} onToggleStatsEditor={onToggleStatsEditor} onStatsChange={onStatsChange} />}
    </>
  );
};

const DemoArena: React.FC<{ config: RoomConfig; myStats: TraderStats; elapsed: number; showStatsEditor: boolean; onToggleStatsEditor: () => void; onStatsChange: (s: TraderStats) => void }> = ({ config, myStats, elapsed, showStatsEditor, onToggleStatsEditor, onStatsChange }) => {
  const [, navigate] = useLocation();
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const makeDemo = (side: "left" | "right"): Trader[] => {
    const names = side === "left" ? ["Trader A", "Trader B", "Trader C"] : ["Trader X", "Trader Y", "Trader Z"];
    const count = config.mode === "1v1" ? 1 : config.mode === "2v2" ? 2 : 3;
    return Array.from({ length: count }, (_, i) => ({ id: `demo-${side}-${i}`, name: config.side === side && config.slot === i ? config.myName : names[i], stats: config.side === side && config.slot === i ? myStats : DEFAULT_STATS, videoTrack: null, isScreenSharing: false }));
  };
  return (
    <>
      <BattleLayout mode={config.mode} leftTraders={makeDemo("left")} rightTraders={makeDemo("right")} leftTeamName={config.mode === "1v1" ? (makeDemo("left")[0]?.name ?? "TEAM A") : "TEAM A"} rightTeamName={config.mode === "1v1" ? (makeDemo("right")[0]?.name ?? "TEAM B") : "TEAM B"} elapsed={elapsed} obsMode={config.obsMode} />
      {!config.obsMode && <BottomBar myName={config.myName} myStats={myStats} isMicMuted={isMicMuted} isSharingScreen={isSharingScreen} onToggleMic={() => setIsMicMuted((v) => !v)} onToggleScreen={() => setIsSharingScreen((v) => !v)} onHangUp={() => navigate("/battles/lobby")} showStatsEditor={showStatsEditor} onToggleStatsEditor={onToggleStatsEditor} onStatsChange={onStatsChange} />}
    </>
  );
};

const BattleRoom: React.FC = () => {
  const params = useParams<{ roomId: string }>();
  const search = useSearch();
  const [, navigate] = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const config: RoomConfig = useMemo(() => ({
    mode: (qs.get("mode") as BattleMode) || "1v1",
    myName: qs.get("name") || "Trader",
    side: (qs.get("side") as "left" | "right") || (qs.get("join") === "1" ? "right" : "left"),
    slot: parseInt(qs.get("slot") || "0", 10),
    obsMode: qs.get("obs") === "1",
    roomId: params.roomId || "default",
  }), [qs, params.roomId]);

  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(null);
  const [streamCall, setStreamCall] = useState<any | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "demo" | "error">("connecting");
  const [errorMsg, setErrorMsg] = useState("");
  const [myStats, setMyStats] = useState<TraderStats>(DEFAULT_STATS);
  const [showStatsEditor, setShowStatsEditor] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const [participantData, setParticipantData] = useState<Record<string, { name: string; stats: TraderStats; side: "left" | "right"; slot: number }>>({});

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (config.obsMode) { document.body.style.overflow = "hidden"; document.body.style.background = "#0a0a0f"; }
    return () => { document.body.style.overflow = ""; document.body.style.background = ""; };
  }, [config.obsMode]);

  useEffect(() => {
    let cancelled = false;
    const userId = `${config.myName.replace(/\s+/g, "_")}_${Date.now()}`;
    const apiKey = (import.meta as any).env?.VITE_STREAM_KEY as string | undefined;
    if (!apiKey) { setStatus("demo"); return; }
    (async () => {
      try {
        const { token } = await fetchBattleToken(userId, config.myName, config.roomId);
        const c = new StreamVideoClient({ apiKey, user: { id: userId, name: config.myName }, token });
        const theCall = c.call("default", config.roomId);
        await theCall.join({ create: true });
        await theCall.sendCustomEvent({ type: "participant_meta", data: { userId, name: config.myName, side: config.side, slot: config.slot, stats: myStats } });
        theCall.on("custom", (event: any) => {
          if (event.custom?.type === "participant_meta") {
            const d = event.custom.data;
            setParticipantData((prev) => ({ ...prev, [d.userId]: { name: d.name, side: d.side, slot: d.slot, stats: d.stats } }));
          }
        });
        if (!cancelled) { setStreamClient(c); setStreamCall(theCall); setStatus("connected"); setParticipantData((prev) => ({ ...prev, [userId]: { name: config.myName, side: config.side, slot: config.slot, stats: myStats } })); }
      } catch (err: any) {
        if (!cancelled) { setErrorMsg(err?.message || "Failed to connect."); setStatus("error"); }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.roomId]);

  const commonProps = { config, myStats, elapsed, showStatsEditor, onToggleStatsEditor: () => setShowStatsEditor((v) => !v), onStatsChange: setMyStats };

  if (status === "connecting") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full" style={{ border: "3px solid rgba(255,255,255,0.05)", borderTop: "3px solid #00ff87", animation: "spin 1s linear infinite", boxShadow: "0 0 20px rgba(0,255,135,0.3)" }} />
          <p className="font-['Orbitron'] text-white text-lg font-bold">Entering battle room…</p>
          <p className="font-mono mt-2" style={{ color: "#ffd700", fontSize: "13px" }}>{config.roomId}</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0a0a0f" }}>
        <div className="text-center max-w-md">
          <p className="font-['Orbitron'] font-black text-xl mb-4" style={{ color: "#ff3b5c" }}>Connection Failed</p>
          <p className="mb-6 font-mono" style={{ color: "#555", fontSize: "13px" }}>{errorMsg}</p>
          <button onClick={() => navigate("/battles/lobby")} className="px-6 py-3 rounded-xl font-['Orbitron'] font-black text-sm tracking-wider uppercase" style={{ background: "#ff3b5c", color: "#fff", boxShadow: "0 0 20px rgba(255,59,92,0.3)" }}>← Back to Lobby</button>
        </div>
      </div>
    );
  }

  const obsStyle: React.CSSProperties = config.obsMode ? { width: "1920px", height: "1080px" } : {};

  return (
    <div className={config.obsMode ? "relative overflow-hidden" : "relative w-screen h-screen overflow-hidden"} style={{ background: "#0a0a0f", color: "white", ...obsStyle }}>
      {config.obsMode && (
        <div className="absolute inset-0 pointer-events-none z-50" style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,0.6), inset 0 0 200px rgba(0,0,0,0.3)" }} />
      )}
      {!config.obsMode && (
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5"
          style={{ height: "48px", background: "rgba(10,10,15,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded font-['Orbitron'] font-black text-xs" style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)", color: "#ffd700" }}>{config.mode}</span>
            <span className="font-mono text-xs" style={{ color: "#333" }}>|</span>
            <span className="font-mono font-bold text-xs" style={{ color: "#ffd700" }}>{config.roomId}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff3b5c", boxShadow: "0 0 6px #ff3b5c", animation: "pulse 1.2s infinite" }} />
            <span className="font-mono font-bold text-white" style={{ fontSize: "16px", letterSpacing: "0.1em" }}>
              {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
            </span>
          </div>
          <button onClick={() => navigate("/battles/lobby")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-['Orbitron'] font-black text-xs tracking-wider uppercase transition-all"
            style={{ background: "rgba(255,59,92,0.12)", border: "1px solid rgba(255,59,92,0.3)", color: "#ff3b5c" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,59,92,0.22)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,59,92,0.12)"; }}
          >
            <LogOut className="w-3.5 h-3.5" /> End Battle
          </button>
        </div>
      )}
      <div className="absolute left-0 right-0" style={{ top: config.obsMode ? 0 : "48px", bottom: config.obsMode ? 0 : "56px" }}>
        {status === "connected" && streamClient && streamCall ? (
          <StreamVideo client={streamClient}>
            <StreamCall call={streamCall}>
              <ArenaInner {...commonProps} participantData={participantData} />
            </StreamCall>
          </StreamVideo>
        ) : (
          <DemoArena {...commonProps} />
        )}
      </div>
      {config.obsMode && (
        <div className="absolute bottom-3 right-4 pointer-events-none" style={{ opacity: 0.2 }}>
          <span className="font-['Orbitron'] text-[10px] text-white">battles.hybridfunding.co</span>
        </div>
      )}
    </div>
  );
};

export default BattleRoom;
