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
 *   obs     "1"  (OBS Browser Source — hides chrome, fixed 1920×1080)
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
import { Monitor, Mic, MicOff, PhoneOff, TrendingUp, X } from "lucide-react";
import BattleLayout from "@/components/battles/BattleLayout";
import type { Trader } from "@/components/battles/BattleLayout";
import type { TraderStats } from "@/components/battles/ParticipantTile";
import type { BattleMode } from "@/components/battles/StatsPanel";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RoomConfig {
  mode: BattleMode;
  myName: string;
  side: "left" | "right";
  slot: number;
  obsMode: boolean;
  roomId: string;
}

const DEFAULT_STATS: TraderStats = {
  pnl: 0,
  wins: 0,
  losses: 0,
  biggestWin: 0,
  tradeCount: 0,
};

// ── Fetch Stream token from our API ──────────────────────────────────────────
async function fetchBattleToken(userId: string, userName: string, roomId: string) {
  const res = await fetch("/api/battle-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, userName, roomId }),
  });
  if (!res.ok) throw new Error("Token fetch failed");
  return res.json() as Promise<{ token: string; apiKey: string }>;
}

// ── Stats editor (slide-up panel) ────────────────────────────────────────────
const StatsEditor: React.FC<{
  stats: TraderStats;
  onChange: (s: TraderStats) => void;
  onClose: () => void;
}> = ({ stats, onChange, onClose }) => {
  const [draft, setDraft] = useState(stats);

  const NumField = ({
    label,
    field,
  }: {
    label: string;
    field: keyof TraderStats;
  }) => (
    <label className="flex flex-col gap-1">
      <span className="text-[#B8B8D0] text-xs font-['Orbitron']">{label}</span>
      <input
        type="number"
        value={draft[field]}
        onChange={(e) =>
          setDraft((d) => ({ ...d, [field]: parseFloat(e.target.value) || 0 }))
        }
        className="bg-[#1A1A2E] border border-white/20 rounded px-3 py-2 text-white font-['Orbitron'] text-sm focus:outline-none focus:border-[#00FFFF]"
      />
    </label>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-16 right-4 z-50 w-64 bg-[#0B1426] rounded-xl p-4 border border-white/20 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-['Orbitron'] font-bold text-white text-sm">MY STATS</span>
        <button onClick={onClose} className="text-[#B8B8D0] hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <NumField label="NET P&L ($)" field="pnl" />
        <NumField label="WINS" field="wins" />
        <NumField label="LOSSES" field="losses" />
        <NumField label="BIGGEST WIN ($)" field="biggestWin" />
        <NumField label="TRADE COUNT" field="tradeCount" />
      </div>
      <button
        onClick={() => {
          onChange(draft);
          onClose();
        }}
        className="mt-4 w-full bg-[#7B2FBE] hover:bg-[#7B2FBE]/80 text-white font-['Orbitron'] font-bold py-2 rounded-lg text-sm transition-colors"
      >
        SAVE STATS
      </button>
    </motion.div>
  );
};

// ── Live controls — must live inside <StreamCall> so hooks work ───────────────
const LiveControls: React.FC<{
  myStats: TraderStats;
  myName: string;
  showStatsEditor: boolean;
  onToggleStatsEditor: () => void;
  onStatsChange: (s: TraderStats) => void;
}> = ({ myStats, myName, showStatsEditor, onToggleStatsEditor, onStatsChange }) => {
  const call = useCall();
  const { useMicrophoneState, useScreenShareState } = useCallStateHooks();
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { screenShare, status: screenShareStatus } = useScreenShareState();
  const isSharingScreen = screenShareStatus === "enabled";
  const [, navigate] = useLocation();

  const toggleMic = useCallback(async () => {
    try {
      if (isMicMuted) await microphone.enable();
      else await microphone.disable();
    } catch (e) {
      console.error(e);
    }
  }, [isMicMuted, microphone]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (isSharingScreen) await screenShare.disable();
      else await screenShare.enable();
    } catch (e) {
      console.error(e);
    }
  }, [isSharingScreen, screenShare]);

  const hangUp = useCallback(async () => {
    try {
      await call?.leave();
    } catch (e) {
      console.error(e);
    }
    navigate("/battles/lobby");
  }, [call, navigate]);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 h-14 bg-[#0B1426]/90 backdrop-blur-sm border-t border-white/10 flex items-center justify-between px-6 gap-4">
      {/* My P&L */}
      <div className="flex items-center gap-2">
        <span className="text-[#B8B8D0] text-xs font-['Orbitron']">YOU:</span>
        <span className="text-white text-xs font-['Orbitron'] font-bold">{myName}</span>
        <span
          className={`text-xs font-['Orbitron'] font-bold ${
            myStats.pnl >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {myStats.pnl >= 0 ? "+" : ""}
          {myStats.pnl >= 0
            ? `$${myStats.pnl.toLocaleString()}`
            : `-$${Math.abs(myStats.pnl).toLocaleString()}`}
        </span>
      </div>

      {/* Center controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMic}
          title={isMicMuted ? "Unmute" : "Mute"}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
            isMicMuted
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : "border-white/20 bg-[#1A1A2E] text-[#B8B8D0] hover:border-white/50 hover:text-white"
          }`}
        >
          {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={toggleScreenShare}
          title={isSharingScreen ? "Stop sharing" : "Share screen"}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
            isSharingScreen
              ? "border-[#00FFFF] bg-[#00FFFF]/20 text-[#00FFFF]"
              : "border-white/20 bg-[#1A1A2E] text-[#B8B8D0] hover:border-white/50 hover:text-white"
          }`}
        >
          <Monitor className="w-4 h-4" />
        </button>

        <button
          onClick={hangUp}
          title="Leave battle"
          className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>

      {/* Stats editor trigger */}
      <div className="relative">
        <button
          onClick={onToggleStatsEditor}
          className="flex items-center gap-2 bg-[#1A1A2E] border border-white/20 hover:border-[#00FFFF] px-3 py-1.5 rounded-lg text-[#B8B8D0] hover:text-white transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-['Orbitron']">UPDATE STATS</span>
        </button>

        <AnimatePresence>
          {showStatsEditor && (
            <StatsEditor
              stats={myStats}
              onChange={onStatsChange}
              onClose={onToggleStatsEditor}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Arena inner — has Stream hooks available ──────────────────────────────────
const ArenaInner: React.FC<{
  config: RoomConfig;
  myStats: TraderStats;
  elapsed: number;
  participantData: Record<
    string,
    { name: string; stats: TraderStats; side: "left" | "right"; slot: number }
  >;
  showStatsEditor: boolean;
  onToggleStatsEditor: () => void;
  onStatsChange: (s: TraderStats) => void;
}> = ({
  config,
  myStats,
  elapsed,
  participantData,
  showStatsEditor,
  onToggleStatsEditor,
  onStatsChange,
}) => {
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const { useMicrophoneState, useScreenShareState } = useCallStateHooks();
  const { isMute: isMicMuted } = useMicrophoneState();
  const { status: screenShareStatus } = useScreenShareState();
  const isSharingScreen = screenShareStatus === "enabled";

  const buildTraders = (side: "left" | "right"): Trader[] => {
    const count = config.mode === "1v1" ? 1 : config.mode === "2v2" ? 2 : 3;
    return Array.from({ length: count }, (_, slot) => {
      // Is this our own slot?
      if (config.side === side && config.slot === slot && localParticipant) {
        return {
          id: localParticipant.sessionId,
          name: config.myName,
          stats: myStats,
          videoTrack: (
            <ParticipantView
              participant={localParticipant}
              trackType="screenShareTrack"
              className="w-full h-full object-contain"
            />
          ),
          isMuted: isMicMuted,
          isScreenSharing: isSharingScreen,
        };
      }

      // Find a remote participant for this slot
      const entry = Object.entries(participantData).find(
        ([, v]) => v.side === side && v.slot === slot
      );
      if (!entry) return null;

      const [userId, data] = entry;
      const streamP = participants.find((p) => p.userId === userId);
      return {
        id: userId,
        name: data.name,
        stats: data.stats,
        videoTrack: streamP ? (
          <ParticipantView
            participant={streamP}
            trackType="screenShareTrack"
            className="w-full h-full object-contain"
          />
        ) : null,
        isMuted: !streamP?.isSpeaking,
        isScreenSharing: !!streamP?.screenShareStream,
      };
    }).filter(Boolean) as Trader[];
  };

  const leftTraders = buildTraders("left");
  const rightTraders = buildTraders("right");
  const leftName =
    config.mode === "1v1" ? leftTraders[0]?.name ?? "Team A" : "TEAM A";
  const rightName =
    config.mode === "1v1" ? rightTraders[0]?.name ?? "Team B" : "TEAM B";

  return (
    <>
      <BattleLayout
        mode={config.mode}
        leftTraders={leftTraders}
        rightTraders={rightTraders}
        leftTeamName={leftName}
        rightTeamName={rightName}
        elapsed={elapsed}
        obsMode={config.obsMode}
      />
      {!config.obsMode && (
        <LiveControls
          myStats={myStats}
          myName={config.myName}
          showStatsEditor={showStatsEditor}
          onToggleStatsEditor={onToggleStatsEditor}
          onStatsChange={onStatsChange}
        />
      )}
    </>
  );
};

// ── Demo arena (no Stream key) ────────────────────────────────────────────────
const DemoArena: React.FC<{
  config: RoomConfig;
  myStats: TraderStats;
  elapsed: number;
  showStatsEditor: boolean;
  onToggleStatsEditor: () => void;
  onStatsChange: (s: TraderStats) => void;
}> = ({ config, myStats, elapsed, showStatsEditor, onToggleStatsEditor, onStatsChange }) => {
  const [, navigate] = useLocation();

  const makeDemo = (side: "left" | "right"): Trader[] => {
    const names =
      side === "left"
        ? ["Trader A", "Trader B", "Trader C"]
        : ["Trader X", "Trader Y", "Trader Z"];
    const count = config.mode === "1v1" ? 1 : config.mode === "2v2" ? 2 : 3;
    return Array.from({ length: count }, (_, i) => ({
      id: `demo-${side}-${i}`,
      name:
        config.side === side && config.slot === i ? config.myName : names[i],
      stats:
        config.side === side && config.slot === i ? myStats : DEFAULT_STATS,
      videoTrack: null,
      isScreenSharing: false,
    }));
  };

  const leftTraders = makeDemo("left");
  const rightTraders = makeDemo("right");

  return (
    <>
      <BattleLayout
        mode={config.mode}
        leftTraders={leftTraders}
        rightTraders={rightTraders}
        leftTeamName={config.mode === "1v1" ? leftTraders[0].name : "TEAM A"}
        rightTeamName={config.mode === "1v1" ? rightTraders[0].name : "TEAM B"}
        elapsed={elapsed}
        obsMode={config.obsMode}
      />
      {!config.obsMode && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-14 bg-[#0B1426]/90 backdrop-blur-sm border-t border-white/10 flex items-center justify-between px-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#B8B8D0] text-xs font-['Orbitron']">YOU:</span>
            <span className="text-white text-xs font-['Orbitron'] font-bold">{config.myName}</span>
            <span className={`text-xs font-['Orbitron'] font-bold ${myStats.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              {myStats.pnl >= 0 ? "+" : ""}{myStats.pnl >= 0 ? `$${myStats.pnl.toLocaleString()}` : `-$${Math.abs(myStats.pnl).toLocaleString()}`}
            </span>
          </div>
          <span className="text-[#4A5568] text-xs font-['Orbitron']">
            DEMO MODE — Add VITE_STREAM_KEY for live video
          </span>
          <div className="relative">
            <button
              onClick={onToggleStatsEditor}
              className="flex items-center gap-2 bg-[#1A1A2E] border border-white/20 hover:border-[#00FFFF] px-3 py-1.5 rounded-lg text-[#B8B8D0] hover:text-white transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-['Orbitron']">UPDATE STATS</span>
            </button>
            <AnimatePresence>
              {showStatsEditor && (
                <StatsEditor
                  stats={myStats}
                  onChange={onStatsChange}
                  onClose={onToggleStatsEditor}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
};

// ── Main BattleRoom page ──────────────────────────────────────────────────────
const BattleRoom: React.FC = () => {
  const params = useParams<{ roomId: string }>();
  const search = useSearch();
  const [, navigate] = useLocation();

  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const config: RoomConfig = useMemo(
    () => ({
      mode: (qs.get("mode") as BattleMode) || "1v1",
      myName: qs.get("name") || "Trader",
      side:
        (qs.get("side") as "left" | "right") ||
        (qs.get("join") === "1" ? "right" : "left"),
      slot: parseInt(qs.get("slot") || "0", 10),
      obsMode: qs.get("obs") === "1",
      roomId: params.roomId || "default",
    }),
    [qs, params.roomId]
  );

  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(null);
  const [streamCall, setStreamCall] = useState<any | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "demo" | "error">(
    "connecting"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [myStats, setMyStats] = useState<TraderStats>(DEFAULT_STATS);
  const [showStatsEditor, setShowStatsEditor] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  const [participantData, setParticipantData] = useState<
    Record<string, { name: string; stats: TraderStats; side: "left" | "right"; slot: number }>
  >({});

  // Elapsed timer
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  // OBS body overrides
  useEffect(() => {
    if (config.obsMode) {
      document.body.style.overflow = "hidden";
      document.body.style.background = "#050D1A";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.background = "";
    };
  }, [config.obsMode]);

  // Connect to Stream
  useEffect(() => {
    let cancelled = false;
    const userId = `${config.myName.replace(/\s+/g, "_")}_${Date.now()}`;
    const apiKey = (import.meta as any).env?.VITE_STREAM_KEY as string | undefined;

    if (!apiKey) {
      setStatus("demo");
      return;
    }

    (async () => {
      try {
        const { token } = await fetchBattleToken(userId, config.myName, config.roomId);
        const c = new StreamVideoClient({
          apiKey,
          user: { id: userId, name: config.myName },
          token,
        });
        const theCall = c.call("default", config.roomId);
        await theCall.join({ create: true });

        // Broadcast our presence
        await theCall.sendCustomEvent({
          type: "participant_meta",
          data: {
            userId,
            name: config.myName,
            side: config.side,
            slot: config.slot,
            stats: myStats,
          },
        });

        // Listen for remote participants
        theCall.on("custom", (event: any) => {
          if (event.custom?.type === "participant_meta") {
            const d = event.custom.data;
            setParticipantData((prev) => ({
              ...prev,
              [d.userId]: {
                name: d.name,
                side: d.side,
                slot: d.slot,
                stats: d.stats,
              },
            }));
          }
        });

        if (!cancelled) {
          setStreamClient(c);
          setStreamCall(theCall);
          setStatus("connected");
          setParticipantData((prev) => ({
            ...prev,
            [userId]: {
              name: config.myName,
              side: config.side,
              slot: config.slot,
              stats: myStats,
            },
          }));
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || "Failed to connect.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.roomId]);

  const commonProps = {
    config,
    myStats,
    elapsed,
    showStatsEditor,
    onToggleStatsEditor: () => setShowStatsEditor((v) => !v),
    onStatsChange: setMyStats,
  };

  // ── Screens ─────────────────────────────────────────────────────────────────
  if (status === "connecting") {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-[#7B2FBE] border-t-[#00FFFF] rounded-full animate-spin" />
          <p className="font-['Orbitron'] text-white text-lg">Connecting to Battle Room…</p>
          <p className="text-[#B8B8D0] mt-2 text-sm">
            Room: <strong className="text-[#00FFFF]">{config.roomId}</strong>
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#0B1426] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="font-['Orbitron'] text-red-400 text-xl mb-4">Connection Error</p>
          <p className="text-[#B8B8D0] mb-6">{errorMsg}</p>
          <button
            onClick={() => navigate("/battles/lobby")}
            className="bg-[#7B2FBE] text-white font-['Orbitron'] px-6 py-3 rounded-lg hover:bg-[#7B2FBE]/80 transition-colors"
          >
            BACK TO LOBBY
          </button>
        </div>
      </div>
    );
  }

  const wrapperClass = config.obsMode
    ? "relative bg-[#050D1A] text-white overflow-hidden"
    : "relative bg-[#050D1A] text-white w-screen h-screen overflow-hidden";

  const wrapperStyle = config.obsMode
    ? { width: "1920px", height: "1080px" }
    : undefined;

  return (
    <div className={wrapperClass} style={wrapperStyle}>
      {/* Top bar (not in OBS) */}
      {!config.obsMode && (
        <div className="absolute top-0 left-0 right-0 z-20 h-10 bg-[#0B1426]/90 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7B2FBE] to-[#00FFFF] flex items-center justify-center">
              <span className="font-['Orbitron'] font-bold text-white text-[8px]">HF</span>
            </div>
            <span className="font-['Orbitron'] font-bold text-white text-sm">
              TRADER BATTLES
            </span>
            <span className="text-[#B8B8D0] text-xs">|</span>
            <span className="text-[#00FFFF] font-['Orbitron'] text-xs font-bold">
              {config.roomId}
            </span>
            <span className="text-[#B8B8D0] text-xs">|</span>
            <span className="text-[#B8B8D0] font-['Orbitron'] text-xs">
              {config.mode}
            </span>
          </div>
          <button
            onClick={() => navigate("/battles/lobby")}
            className="text-[#B8B8D0] hover:text-white text-xs font-['Orbitron'] transition-colors"
          >
            ← LOBBY
          </button>
        </div>
      )}

      {/* Main arena area */}
      <div
        className={`absolute left-0 right-0 ${
          config.obsMode ? "top-0 bottom-0" : "top-10 bottom-14"
        }`}
      >
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

      {/* OBS watermark */}
      {config.obsMode && (
        <div className="absolute bottom-3 right-4 opacity-30 pointer-events-none">
          <span className="font-['Orbitron'] text-[10px] text-white">
            battles.hybridfunding.co
          </span>
        </div>
      )}
    </div>
  );
};

export default BattleRoom;
