/**
 * BattleRoom — live Trade House arena.
 *
 * Quick Battle room links carry the same verified Hybrid roster/baselines used
 * by the OBS stage. That lets account stats populate before a trader turns on
 * camera or screen share.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams, useSearch } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  ParticipantsAudio,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  hasAudio,
  hasVideo,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  Columns2,
  LogOut,
  Mic,
  MicOff,
  Monitor,
  ShieldCheck,
  TrendingUp,
  Video,
  VideoOff,
  X,
} from "lucide-react";

import BattleLayout from "@/components/battles/BattleLayout";
import BrandRibbon from "@/components/battles/BrandRibbon";
import HouseChat from "@/components/battles/HouseChat";
import ProducerConsole from "@/components/battles/ProducerConsole";
import SeatLayoutPicker from "@/components/battles/SeatLayoutPicker";
import type { Trader } from "@/components/battles/BattleLayout";
import type { SeatLayoutMode, TraderStats } from "@/components/battles/ParticipantTile";
import type { BattleMode } from "@/components/battles/StatsPanel";
import {
  decodeQuickRoster,
  type QuickBattleEntry,
  type Standing,
} from "@/lib/tradehouse-feed";
import { battleClock, parseBattleRules, type BattleRuleConfig } from "@/lib/tradehouse-rules";

interface RoomConfig {
  mode: BattleMode;
  myName: string;
  side: "left" | "right";
  slot: number;
  obsMode: boolean;
  roomId: string;
  quickRoster: QuickBattleEntry[];
  quickKey: string;
  seatId: string;
  seasonName: string;
  rule: BattleRuleConfig;
  promoText: string;
  sponsorName: string;
  sponsorUrl: string;
  musicUrl: string;
  producerMode: boolean;
}

type SeatState = QuickBattleEntry & {
  side: "left" | "right";
  slot: number;
  userId?: string;
  stats: TraderStats;
};

type ManualStatField = "pnl" | "wins" | "losses" | "biggestWin" | "tradeCount";

const DEFAULT_STATS: TraderStats = {
  pnl: 0,
  wins: 0,
  losses: 0,
  biggestWin: 0,
  tradeCount: 0,
};

const seatKey = (side: "left" | "right", slot: number) => `${side}:${slot}`;

const entryStats = (entry?: QuickBattleEntry): TraderStats => ({
  ...DEFAULT_STATS,
  dashboardUrl: entry?.dashboardUrl,
  division: entry?.division,
  platform: entry?.platform,
});

const standingToStats = (standing: Standing): TraderStats => ({
  pnl: standing.pnl,
  wins: standing.wins,
  losses: standing.losses,
  biggestWin: standing.biggestWin,
  tradeCount: standing.tradeCount,
  balance: standing.balance,
  equity: standing.equity,
  returnPct: standing.returnPct,
  openPositionCount: standing.openPositionCount,
  verified: standing.verified,
  dashboardUrl: standing.dashboardUrl,
  division: standing.division,
  platform: standing.platform,
});

const MediaStreamVideo: React.FC<{
  stream: MediaStream | null | undefined;
  screen?: boolean;
}> = ({ stream, screen = false }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.srcObject = stream ?? null;
    if (stream) void ref.current.play().catch(() => undefined);
    return () => {
      if (ref.current) ref.current.srcObject = null;
    };
  }, [stream]);

  if (!stream) return null;

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted
      className="h-full w-full"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: screen ? "contain" : "cover",
        background: "#03070d",
      }}
    />
  );
};

async function fetchBattleToken(userId: string, userName: string, roomId: string) {
  const res = await fetch("/api/battle-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, userName, roomId }),
  });
  if (!res.ok) throw new Error("Token fetch failed");
  return res.json() as Promise<{ token: string; apiKey: string }>;
}

const StatsEditor: React.FC<{
  stats: TraderStats;
  onChange: (stats: TraderStats) => void;
  onClose: () => void;
}> = ({ stats, onChange, onClose }) => {
  const [draft, setDraft] = useState(stats);

  const Field = ({ label, field }: { label: string; field: ManualStatField }) => (
    <label className="flex flex-col gap-1">
      <span className="font-['Orbitron'] text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
      <input
        type="number"
        value={draft[field] ?? 0}
        onChange={(event) =>
          setDraft((current) => ({
            ...current,
            [field]: Number.parseFloat(event.target.value) || 0,
          }))
        }
        className="rounded-lg border border-white/10 bg-[#07101b] px-3 py-2 font-mono text-white outline-none focus:border-cyan-300/40"
      />
    </label>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      className="absolute bottom-16 right-0 z-50 w-60 rounded-xl border border-white/10 bg-[#0b1320]/95 p-4 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="font-['Orbitron'] text-xs font-black tracking-wider text-white">MANUAL FALLBACK</span>
          <div className="mt-1 text-[9px] text-slate-600">Only used when no Hybrid dashboard is attached.</div>
        </div>
        <button onClick={onClose} className="text-slate-600 hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      <div className="space-y-3">
        <Field label="Net P&L ($)" field="pnl" />
        <Field label="Wins" field="wins" />
        <Field label="Losses" field="losses" />
        <Field label="Biggest Win ($)" field="biggestWin" />
        <Field label="Trade Count" field="tradeCount" />
      </div>
      <button
        onClick={() => {
          onChange(draft);
          onClose();
        }}
        className="mt-4 w-full rounded-lg bg-cyan-300 py-2 font-['Orbitron'] text-xs font-black uppercase tracking-widest text-slate-950"
      >
        Save fallback stats
      </button>
    </motion.div>
  );
};

const BottomBar: React.FC<{
  myName: string;
  myStats: TraderStats;
  isMicMuted: boolean;
  isCameraOff: boolean;
  isSharingScreen: boolean;
  canScreenShare: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreen: () => void;
  onHangUp: () => void;
  showStatsEditor: boolean;
  onToggleStatsEditor: () => void;
  onStatsChange: (stats: TraderStats) => void;
  layoutMode: SeatLayoutMode;
  onLayoutModeChange: (mode: SeatLayoutMode) => void;
  chatControl?: React.ReactNode;
}> = ({
  myName,
  myStats,
  isMicMuted,
  isCameraOff,
  isSharingScreen,
  canScreenShare,
  onToggleMic,
  onToggleCamera,
  onToggleScreen,
  onHangUp,
  showStatsEditor,
  onToggleStatsEditor,
  onStatsChange,
  layoutMode,
  onLayoutModeChange,
  chatControl,
}) => {
  const [showLayouts, setShowLayouts] = useState(false);
  const pnlPositive = myStats.pnl >= 0;
  const pnlStr = pnlPositive
    ? `+$${myStats.pnl.toLocaleString()}`
    : `-$${Math.abs(myStats.pnl).toLocaleString()}`;

  const controlStyle = (active: boolean, danger = false) => ({
    background: danger
      ? "rgba(255,59,92,0.16)"
      : active
        ? "rgba(0,255,255,0.12)"
        : "rgba(255,255,255,0.05)",
    border: danger
      ? "1px solid rgba(255,59,92,0.45)"
      : active
        ? "1px solid rgba(0,255,255,0.42)"
        : "1px solid rgba(255,255,255,0.1)",
    color: danger ? "#ff3b5c" : active ? "#67e8f9" : "#64748b",
  });

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex h-14 items-center justify-between gap-1 px-2 sm:gap-4 sm:px-5"
      style={{
        background: "rgba(4,10,18,0.96)",
        backdropFilter: "blur(14px)",
        borderTop: "1px solid rgba(103,232,249,0.09)",
      }}
    >
      <div className="hidden min-w-0 items-center gap-3 sm:flex">
        <span className="truncate font-['Orbitron'] text-sm font-black text-white">{myName}</span>
        <span
          className="font-mono text-sm font-bold"
          style={{
            color: pnlPositive ? "#00ff87" : "#ff3b5c",
            textShadow: pnlPositive
              ? "0 0 8px rgba(0,255,135,0.35)"
              : "0 0 8px rgba(255,59,92,0.35)",
          }}
        >
          {pnlStr}
        </span>
        {myStats.verified && (
          <span className="hidden items-center gap-1 rounded-full border border-cyan-300/15 bg-cyan-300/[0.05] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-cyan-200 sm:flex">
            <ShieldCheck className="h-3 w-3" /> verified
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center gap-1.5 sm:flex-none sm:gap-2">
        <button onClick={onToggleMic} className="flex h-9 w-9 items-center justify-center rounded-full transition-all" style={controlStyle(!isMicMuted, isMicMuted)} title={isMicMuted ? "Unmute microphone" : "Mute microphone"}>
          {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <button onClick={onToggleCamera} className="flex h-9 w-9 items-center justify-center rounded-full transition-all" style={controlStyle(!isCameraOff)} title={isCameraOff ? "Turn camera on" : "Turn camera off"}>
          {isCameraOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </button>
        <button onClick={onToggleScreen} disabled={!canScreenShare} className="flex h-9 w-9 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-30" style={controlStyle(isSharingScreen)} title={canScreenShare ? (isSharingScreen ? "Stop sharing screen" : "Share screen") : "Screen sharing is unavailable in this mobile browser"}>
          <Monitor className="h-4 w-4" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowLayouts((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
            style={controlStyle(showLayouts)}
            title="Change seat layout"
          >
            <Columns2 className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {showLayouts && (
              <SeatLayoutPicker
                value={layoutMode}
                onChange={(mode) => {
                  onLayoutModeChange(mode);
                  setShowLayouts(false);
                }}
              />
            )}
          </AnimatePresence>
        </div>
        {chatControl}
        <button onClick={onHangUp} className="flex h-9 w-9 items-center justify-center rounded-full transition-all" style={controlStyle(false, true)} title="Leave battle">
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <div className="relative hidden flex-shrink-0 sm:block">
        {myStats.dashboardUrl ? (
          <a
            href={myStats.dashboardUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/[0.05] px-3 py-1.5 font-['Orbitron'] text-[9px] font-bold uppercase tracking-wider text-cyan-200"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Public stats
          </a>
        ) : (
          <>
            <button
              onClick={onToggleStatsEditor}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-['Orbitron'] text-[9px] font-bold uppercase tracking-wider text-slate-500"
            >
              <TrendingUp className="h-3.5 w-3.5" /> Fallback stats
            </button>
            <AnimatePresence>
              {showStatsEditor && (
                <StatsEditor stats={myStats} onChange={onStatsChange} onClose={onToggleStatsEditor} />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

const LiveControls: React.FC<{
  myStats: TraderStats;
  myName: string;
  showStatsEditor: boolean;
  onToggleStatsEditor: () => void;
  onStatsChange: (stats: TraderStats) => void;
  seatId: string;
  layoutMode: SeatLayoutMode;
  onLayoutModeChange: (mode: SeatLayoutMode) => void;
}> = ({ myStats, myName, showStatsEditor, onToggleStatsEditor, onStatsChange, seatId, layoutMode, onLayoutModeChange }) => {
  const call = useCall();
  const {
    useCameraState,
    useMicrophoneState,
    useScreenShareState,
  } = useCallStateHooks();
  const { camera, isMute: isCameraOff } = useCameraState();
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { screenShare, status: screenShareStatus } = useScreenShareState();
  const isSharingScreen = screenShareStatus === "enabled";
  const canScreenShare = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia);
  const [, navigate] = useLocation();

  const toggleMic = useCallback(async () => {
    try {
      await microphone.toggle();
    } catch (error) {
      console.error("[tradehouse] microphone toggle failed", error);
    }
  }, [microphone]);

  const toggleCamera = useCallback(async () => {
    try {
      await camera.toggle();
    } catch (error) {
      console.error("[tradehouse] camera toggle failed", error);
    }
  }, [camera]);

  const toggleScreenShare = useCallback(async () => {
    if (!canScreenShare) return;
    try {
      if (isSharingScreen) await screenShare.disable();
      else await screenShare.enable();
    } catch (error) {
      console.error("[tradehouse] screen share toggle failed", error);
    }
  }, [canScreenShare, isSharingScreen, screenShare]);

  const enableCameraAndMic = useCallback(async () => {
    try {
      await Promise.all([camera.enable(), microphone.enable()]);
    } catch (error) {
      console.error("[tradehouse] camera/mic enable failed", error);
    }
  }, [camera, microphone]);

  const changeLayout = useCallback((mode: SeatLayoutMode) => {
    onLayoutModeChange(mode);
    void call?.sendCustomEvent({ type: "seat_layout", seatId, layout: mode }).catch((error: unknown) => {
      console.error("[tradehouse] seat layout sync failed", error);
    });
  }, [call, onLayoutModeChange, seatId]);

  const hangUp = useCallback(async () => {
    try {
      await call?.leave();
    } catch (error) {
      console.error("[tradehouse] leave failed", error);
    }
    navigate("/battles/lobby");
  }, [call, navigate]);

  return (
    <>
      <BottomBar
        myName={myName}
        myStats={myStats}
        isMicMuted={isMicMuted}
        isCameraOff={isCameraOff}
        isSharingScreen={isSharingScreen}
        canScreenShare={canScreenShare}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleScreen={toggleScreenShare}
        onHangUp={hangUp}
        showStatsEditor={showStatsEditor}
        onToggleStatsEditor={onToggleStatsEditor}
        onStatsChange={onStatsChange}
        layoutMode={layoutMode}
        onLayoutModeChange={changeLayout}
        chatControl={<HouseChat myName={myName} />}
      />
      {(isCameraOff || isMicMuted) && (
        <button
          onClick={enableCameraAndMic}
          className="absolute bottom-[4.5rem] left-1/2 z-30 -translate-x-1/2 rounded-lg border border-cyan-300/35 bg-[#040a12]/90 px-3 py-2 font-['Orbitron'] text-[9px] font-bold tracking-wider text-cyan-200"
        >
          ENABLE CAMERA + MIC
        </button>
      )}
      {!canScreenShare && (
        <div className="absolute bottom-[4.35rem] left-2 z-30 rounded-lg border border-violet-400/15 bg-[#040a12]/90 px-2 py-1.5 text-[8px] text-violet-200 sm:hidden">
          Mobile browser: camera and verified stats work; device screen sharing is unavailable here.
        </div>
      )}
    </>
  );
};

const ArenaInner: React.FC<{
  config: RoomConfig;
  seats: Record<string, SeatState>;
  myStats: TraderStats;
  elapsed: number;
  showStatsEditor: boolean;
  onToggleStatsEditor: () => void;
  onStatsChange: (stats: TraderStats) => void;
  seatLayouts: Record<string, SeatLayoutMode>;
  onSeatLayoutChange: (seatId: string, mode: SeatLayoutMode) => void;
}> = ({
  config,
  seats,
  myStats,
  elapsed,
  showStatsEditor,
  onToggleStatsEditor,
  onStatsChange,
  seatLayouts,
  onSeatLayoutChange,
}) => {
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const [showProducer, setShowProducer] = useState(false);
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  const buildTraders = (side: "left" | "right"): Trader[] => {
    const count = config.mode === "1v1" ? 1 : config.mode === "2v2" ? 2 : config.mode === "3v3" ? 3 : 4;

    return Array.from({ length: count }, (_, slot) => {
      const seat = seats[seatKey(side, slot)];
      if (!seat) return null;

      const isLocal = !config.producerMode && config.side === side && config.slot === slot && Boolean(localParticipant);
      const streamParticipant = isLocal
        ? localParticipant
        : participants.find((participant) => participant.userId === seat.userId);

      const screenStream = streamParticipant?.screenShareStream;
      const cameraStream = streamParticipant?.videoStream;
      const isScreenSharing = Boolean(screenStream);
      const isMuted = streamParticipant ? !hasAudio(streamParticipant) : true;
      const isCameraOff = streamParticipant ? !hasVideo(streamParticipant) : true;
      return {
        id: seat.id,
        name: seat.name,
        avatarUrl: seat.avatarUrl,
        stats: seat.stats,
        cameraTrack: cameraStream ? (
          <MediaStreamVideo stream={cameraStream} />
        ) : null,
        screenTrack: screenStream ? (
          <MediaStreamVideo stream={screenStream} screen />
        ) : null,
        layoutMode: seatLayouts[seat.id] || "screen-stats",
        isMuted,
        isCameraOff,
        isScreenSharing,
      };
    }).filter(Boolean) as Trader[];
  };

  const leftTraders = buildTraders("left");
  const rightTraders = buildTraders("right");

  return (
    <>
      <ParticipantsAudio />
      <BattleLayout
        mode={config.mode}
        leftTraders={leftTraders}
        rightTraders={rightTraders}
        leftTeamName={config.mode === "1v1" ? (leftTraders[0]?.name ?? "Team A") : "TEAM A"}
        rightTeamName={config.mode === "1v1" ? (rightTraders[0]?.name ?? "Team B") : "TEAM B"}
        elapsed={elapsed}
        rule={config.rule}
        obsMode={config.obsMode}
      />
      {!config.obsMode && !config.producerMode && (
        <LiveControls
          myStats={myStats}
          myName={config.myName}
          showStatsEditor={showStatsEditor}
          onToggleStatsEditor={onToggleStatsEditor}
          onStatsChange={onStatsChange}
          seatId={seats[seatKey(config.side, config.slot)]?.id || config.seatId || seatKey(config.side, config.slot)}
          layoutMode={seatLayouts[seats[seatKey(config.side, config.slot)]?.id || config.seatId || seatKey(config.side, config.slot)] || "screen-stats"}
          onLayoutModeChange={(mode) => {
            const id = seats[seatKey(config.side, config.slot)]?.id || config.seatId || seatKey(config.side, config.slot);
            onSeatLayoutChange(id, mode);
          }}
        />
      )}
      {!config.obsMode && config.producerMode && (
        <>
          <button
            onClick={() => setShowProducer((value) => !value)}
            className="absolute right-2 top-2 z-[80] rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-2 font-['Orbitron'] text-[8px] font-black uppercase tracking-[0.12em] text-cyan-200 sm:right-4 sm:top-3 sm:px-4 sm:text-[9px]"
          >
            PRODUCER CONTROL
          </button>
          {showProducer && <ProducerConsole musicUrl={config.musicUrl} onClose={() => setShowProducer(false)} />}
        </>
      )}
    </>
  );
};

const DemoArena: React.FC<{
  config: RoomConfig;
  seats: Record<string, SeatState>;
  myStats: TraderStats;
  elapsed: number;
  showStatsEditor: boolean;
  onToggleStatsEditor: () => void;
  onStatsChange: (stats: TraderStats) => void;
  seatLayouts: Record<string, SeatLayoutMode>;
  onSeatLayoutChange: (seatId: string, mode: SeatLayoutMode) => void;
}> = ({
  config,
  seats,
  myStats,
  elapsed,
  showStatsEditor,
  onToggleStatsEditor,
  onStatsChange,
  seatLayouts,
  onSeatLayoutChange,
}) => {
  const [, navigate] = useLocation();
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState("");
  const streamsRef = useRef<Array<MediaStream | null>>([]);
  const isSharingScreen = Boolean(screenStream);
  const canScreenShare = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia);

  const enableMicAndCamera = useCallback(async () => {
    try {
      setMediaError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setCameraStream(stream);
      setMicStream(stream);
      setIsMicMuted(false);
      setIsCameraOff(false);
    } catch (error: any) {
      setMediaError(
        error?.name === "NotAllowedError"
          ? "Camera and microphone permission was blocked. Allow access in the browser, then try again."
          : "Camera and microphone could not be opened on this device.",
      );
    }
  }, []);

  const toggleMic = useCallback(async () => {
    if (!micStream) {
      await enableMicAndCamera();
      return;
    }
    const nextMuted = !isMicMuted;
    micStream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMicMuted(nextMuted);
  }, [enableMicAndCamera, isMicMuted, micStream]);

  const toggleCamera = useCallback(async () => {
    if (!cameraStream) {
      await enableMicAndCamera();
      return;
    }
    const nextOff = !isCameraOff;
    cameraStream.getVideoTracks().forEach((track) => {
      track.enabled = !nextOff;
    });
    setIsCameraOff(nextOff);
  }, [cameraStream, enableMicAndCamera, isCameraOff]);

  const toggleScreen = useCallback(async () => {
    if (!canScreenShare) {
      setMediaError("This mobile browser cannot share the device screen. Camera + verified Hybrid stats still work.");
      return;
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      return;
    }
    try {
      setMediaError("");
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      stream.getVideoTracks()[0]?.addEventListener("ended", () => setScreenStream(null), { once: true });
      setScreenStream(stream);
    } catch (error: any) {
      setMediaError(
        error?.name === "NotAllowedError"
          ? "Screen sharing was cancelled. Choose a screen or window when prompted."
          : "Screen sharing is unavailable in this browser.",
      );
    }
  }, [canScreenShare, screenStream]);

  useEffect(() => {
    streamsRef.current = [cameraStream, micStream, screenStream];
  }, [cameraStream, micStream, screenStream]);

  useEffect(
    () => () => {
      streamsRef.current.forEach((stream) =>
        stream?.getTracks().forEach((track) => track.stop()),
      );
    },
    [],
  );

  const makeDemo = (side: "left" | "right"): Trader[] => {
    const count = config.mode === "1v1" ? 1 : config.mode === "2v2" ? 2 : config.mode === "3v3" ? 3 : 4;
    return Array.from({ length: count }, (_, slot) => {
      const seat = seats[seatKey(side, slot)];
      if (!seat) return null;
      const isLocal = config.side === side && config.slot === slot;
      return {
        id: seat.id,
        name: seat.name,
        stats: seat.stats,
        cameraTrack: isLocal && cameraStream ? <MediaStreamVideo stream={cameraStream} /> : null,
        screenTrack: isLocal && screenStream ? <MediaStreamVideo stream={screenStream} screen /> : null,
        layoutMode: seatLayouts[seat.id] || "screen-stats",
        isMuted: isLocal ? isMicMuted : true,
        isCameraOff: isLocal ? isCameraOff : true,
        isScreenSharing: isLocal ? isSharingScreen : false,
      };
    }).filter(Boolean) as Trader[];
  };

  const leftTraders = makeDemo("left");
  const rightTraders = makeDemo("right");

  return (
    <>
      <BattleLayout
        mode={config.mode}
        leftTraders={leftTraders}
        rightTraders={rightTraders}
        leftTeamName={config.mode === "1v1" ? (leftTraders[0]?.name ?? "TEAM A") : "TEAM A"}
        rightTeamName={config.mode === "1v1" ? (rightTraders[0]?.name ?? "TEAM B") : "TEAM B"}
        elapsed={elapsed}
        rule={config.rule}
        obsMode={config.obsMode}
      />
      {!config.obsMode && (
        <>
          <BottomBar
            myName={config.myName}
            myStats={myStats}
            isMicMuted={isMicMuted}
            isCameraOff={isCameraOff}
            isSharingScreen={isSharingScreen}
            canScreenShare={canScreenShare}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onToggleScreen={toggleScreen}
            onHangUp={() => navigate("/battles/lobby")}
            showStatsEditor={showStatsEditor}
            onToggleStatsEditor={onToggleStatsEditor}
            onStatsChange={onStatsChange}
            layoutMode={seatLayouts[seats[seatKey(config.side, config.slot)]?.id || config.seatId || seatKey(config.side, config.slot)] || "screen-stats"}
            onLayoutModeChange={(mode) => {
              const id = seats[seatKey(config.side, config.slot)]?.id || config.seatId || seatKey(config.side, config.slot);
              onSeatLayoutChange(id, mode);
            }}
          />
          {(isCameraOff || isMicMuted) && (
            <div className="absolute bottom-[4.5rem] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
              <button
                onClick={enableMicAndCamera}
                className="rounded-lg border border-cyan-300/35 bg-black/80 px-3 py-2 font-['Orbitron'] text-[9px] font-bold tracking-wider text-cyan-200"
              >
                ENABLE CAMERA + MIC
              </button>
              {mediaError && (
                <span className="max-w-xs rounded-lg border border-rose-300/30 bg-black/80 px-3 py-2 text-[9px] text-rose-200">
                  {mediaError}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

const BattleRoom: React.FC = () => {
  const params = useParams<{ roomId: string }>();
  const search = useSearch();
  const [, navigate] = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  const config: RoomConfig = useMemo(() => {
    const quickKey = qs.get("quick") || "";
    return {
      mode: (qs.get("mode") as BattleMode) || "1v1",
      myName: qs.get("name") || "Trader",
      side:
        (qs.get("side") as "left" | "right") ||
        (qs.get("join") === "1" ? "right" : "left"),
      slot: Number.parseInt(qs.get("slot") || "0", 10),
      obsMode: qs.get("obs") === "1",
      roomId: params.roomId || "default",
      quickRoster: decodeQuickRoster(quickKey),
      quickKey,
      seatId: qs.get("seat") || "",
      seasonName: qs.get("season") || "Quick Battle",
      rule: parseBattleRules(qs),
      promoText: qs.get("promo") || "Instant Funding · Trade House · Verified Hybrid performance",
      sponsorName: qs.get("sponsor") || "",
      sponsorUrl: qs.get("sponsorUrl") || "",
      musicUrl: qs.get("music") || "",
      producerMode: qs.get("producer") === "1",
    };
  }, [qs, params.roomId]);

  const [streamClient, setStreamClient] = useState<StreamVideoClient | null>(null);
  const [streamCall, setStreamCall] = useState<any | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "demo" | "error">("connecting");
  const [errorMsg, setErrorMsg] = useState("");
  const [manualStats, setManualStats] = useState<TraderStats>(DEFAULT_STATS);
  const [showStatsEditor, setShowStatsEditor] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [seats, setSeats] = useState<Record<string, SeatState>>({});
  const [seatLayouts, setSeatLayouts] = useState<Record<string, SeatLayoutMode>>({});
  const seatLayoutsRef = useRef<Record<string, SeatLayoutMode>>({});
  const startRef = useRef(Date.now());

  useEffect(() => {
    seatLayoutsRef.current = seatLayouts;
  }, [seatLayouts]);

  const mySeatKey = seatKey(config.side, config.slot);
  const myStats = seats[mySeatKey]?.stats ?? manualStats;

  useEffect(() => {
    setSeats((current) => {
      const next = { ...current };

      if (config.quickRoster.length > 0) {
        config.quickRoster.slice(0, 8).forEach((entry, index) => {
          const side = index % 2 === 0 ? "left" : "right";
          const slot = Math.floor(index / 2);
          const key = seatKey(side, slot);
          const existing = next[key];
          next[key] = {
            ...entry,
            side,
            slot,
            userId: existing?.userId,
            stats:
              existing?.id === entry.id
                ? existing.stats
                : entryStats(entry),
          };
        });
      } else if (!next[mySeatKey]) {
        const fallbackEntry: QuickBattleEntry = {
          id: config.seatId || `seat-${config.side}-${config.slot}`,
          name: config.myName,
          dashboardUrl: "",
          division: "trading",
          platform: "other",
        };
        next[mySeatKey] = {
          ...fallbackEntry,
          side: config.side,
          slot: config.slot,
          stats: entryStats(fallbackEntry),
        };
      }

      return next;
    });
  }, [
    config.quickKey,
    config.myName,
    config.side,
    config.slot,
    config.seatId,
    mySeatKey,
  ]);

  const scoringKey = useMemo(
    () =>
      JSON.stringify(
        Object.values(seats)
          .filter((seat) => seat.dashboardUrl)
          .map((seat) => ({
            id: seat.id,
            name: seat.name,
            dashboardUrl: seat.dashboardUrl,
            startingBalance: seat.startingBalance,
            division: seat.division,
            platform: seat.platform,
          })),
      ),
    [seats],
  );

  useEffect(() => {
    if (!scoringKey || scoringKey === "[]") return;

    const entries = JSON.parse(scoringKey) as QuickBattleEntry[];
    let active = true;
    let timer: number | undefined;

    const load = async () => {
      try {
        const response = await fetch("/api/tradehouse/quick-leaderboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entries, seasonName: config.seasonName }),
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Verified room feed unavailable");
        const payload = await response.json();
        const standings = (payload.standings || []) as Standing[];

        if (active) {
          setSeats((current) => {
            const next = { ...current };
            for (const standing of standings) {
              const key = Object.keys(next).find((candidate) => next[candidate]?.id === standing.id);
              if (!key) continue;
              next[key] = {
                ...next[key],
                stats: standingToStats(standing),
              };
            }
            return next;
          });
        }
      } catch (error) {
        console.error("[tradehouse/room] verified stats refresh failed", error);
      } finally {
        if (active) timer = window.setTimeout(load, 15000);
      }
    };

    void load();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [scoringKey, config.seasonName]);

  useEffect(() => {
    const id = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (config.obsMode) {
      document.body.style.overflow = "hidden";
      document.body.style.background = "#03070d";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.background = "";
    };
  }, [config.obsMode]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let joinedCall: any;
    let client: StreamVideoClient | undefined;

    const ownEntry =
      config.quickRoster.find((entry) => entry.id === config.seatId) ||
      config.quickRoster.find((entry) => entry.name === config.myName);

    const userId = `${(config.seatId || config.myName).replace(/\s+/g, "_")}_${Math.random().toString(36).slice(2, 8)}`;
    const apiKey = (import.meta as any).env?.VITE_STREAM_KEY as string | undefined;

    if (!apiKey) {
      setStatus("demo");
      return;
    }

    const meta = {
      userId,
      name: config.myName,
      side: config.producerMode ? undefined : config.side,
      slot: config.producerMode ? undefined : config.slot,
      seatId: ownEntry?.id || config.seatId || userId,
      avatarUrl: ownEntry?.avatarUrl || "",
      dashboardUrl: ownEntry?.dashboardUrl || "",
      startingBalance: ownEntry?.startingBalance,
      division: ownEntry?.division || "trading",
      platform: ownEntry?.platform || "other",
      layout: seatLayoutsRef.current[ownEntry?.id || config.seatId || userId] || "screen-stats",
    };

    const writeMeta = (data: any) => {
      if (!data?.side || data?.slot === undefined) return;
      const side = data.side as "left" | "right";
      const slot = Number(data.slot);
      const key = seatKey(side, slot);
      setSeats((current) => {
        const existing = current[key];
        const entry: QuickBattleEntry = {
          id: data.seatId || existing?.id || data.userId,
          name: data.name || existing?.name || "Trader",
          dashboardUrl: data.dashboardUrl || existing?.dashboardUrl || "",
          avatarUrl: data.avatarUrl || existing?.avatarUrl,
          startingBalance: data.startingBalance ?? existing?.startingBalance,
          division: data.division || existing?.division || "trading",
          platform: data.platform || existing?.platform || "other",
        };
        if (data.layout && data.seatId) {
          setSeatLayouts((layouts) => ({ ...layouts, [data.seatId]: data.layout as SeatLayoutMode }));
        }
        return {
          ...current,
          [key]: {
            ...entry,
            side,
            slot,
            userId: data.userId || existing?.userId,
            stats: existing?.stats || entryStats(entry),
          },
        };
      });
    };

    void (async () => {
      try {
        const { token } = await fetchBattleToken(userId, config.myName, config.roomId);
        client = new StreamVideoClient({
          apiKey,
          user: { id: userId, name: config.myName },
          token,
        });
        const call = client.call("default", config.roomId);
        joinedCall = call;
        await call.join({ create: true });

        const sendMeta = async () => {
          await call.sendCustomEvent({ type: "participant_meta", data: meta });
        };

        unsubscribe = call.on("custom", (event: any) => {
          const custom = event.custom;
          if (custom?.type === "participant_meta") {
            writeMeta(custom.data);
          } else if (custom?.type === "participant_meta_request") {
            void sendMeta();
          } else if (custom?.type === "seat_layout" && custom.seatId && custom.layout) {
            setSeatLayouts((layouts) => ({ ...layouts, [custom.seatId]: custom.layout as SeatLayoutMode }));
          }
        });

        writeMeta(meta);
        await sendMeta();
        await call.sendCustomEvent({ type: "participant_meta_request" });

        if (!cancelled) {
          setStreamClient(client);
          setStreamCall(call);
          setStatus("connected");
        }
      } catch (error: any) {
        if (!cancelled) {
          setErrorMsg(error?.message || "Failed to connect.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (joinedCall) void joinedCall.leave().catch(() => undefined);
      if (client) void client.disconnectUser().catch(() => undefined);
    };
  }, [
    config.roomId,
    config.myName,
    config.side,
    config.slot,
    config.seatId,
    config.quickKey,
    config.producerMode,
  ]);

  const onManualStatsChange = (stats: TraderStats) => {
    setManualStats(stats);
    if (!seats[mySeatKey]?.dashboardUrl) {
      setSeats((current) => ({
        ...current,
        [mySeatKey]: {
          ...(current[mySeatKey] || {
            id: config.seatId || mySeatKey,
            name: config.myName,
            dashboardUrl: "",
            division: "trading",
            platform: "other",
            side: config.side,
            slot: config.slot,
          }),
          stats,
        } as SeatState,
      }));
    }
  };

  const commonProps = {
    config,
    seats,
    myStats,
    elapsed,
    showStatsEditor,
    onToggleStatsEditor: () => setShowStatsEditor((value) => !value),
    onStatsChange: onManualStatsChange,
    seatLayouts,
    onSeatLayoutChange: (seatId: string, mode: SeatLayoutMode) =>
      setSeatLayouts((layouts) => ({ ...layouts, [seatId]: mode })),
  };

  if (status === "connecting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#03070d]">
        <div className="text-center">
          <div
            className="mx-auto mb-6 h-16 w-16 rounded-full"
            style={{
              border: "3px solid rgba(255,255,255,0.05)",
              borderTop: "3px solid #22d3ee",
              animation: "spin 1s linear infinite",
              boxShadow: "0 0 24px rgba(34,211,238,0.25)",
            }}
          />
          <p className="font-['Orbitron'] text-lg font-bold text-white">Entering Trade House…</p>
          <p className="mt-2 font-mono text-[13px] text-cyan-300">{config.roomId}</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#03070d] px-4">
        <div className="max-w-md text-center">
          <p className="mb-4 font-['Orbitron'] text-xl font-black text-rose-400">Connection failed</p>
          <p className="mb-6 font-mono text-[13px] text-slate-500">{errorMsg}</p>
          <button
            onClick={() => navigate("/battles/lobby")}
            className="rounded-xl bg-rose-500/20 px-6 py-3 font-['Orbitron'] text-sm font-black uppercase tracking-wider text-rose-300"
          >
            ← Back to lobby
          </button>
        </div>
      </div>
    );
  }

  const clock = battleClock(config.rule, elapsed);
  const obsStyle: React.CSSProperties = config.obsMode
    ? { width: "1920px", height: "1080px" }
    : {};

  return (
    <div
      className={config.obsMode ? "relative overflow-hidden" : "relative h-screen w-screen overflow-hidden"}
      style={{ background: "#03070d", color: "white", ...obsStyle }}
    >
      {config.obsMode && (
        <div
          className="pointer-events-none absolute inset-0 z-50"
          style={{ boxShadow: "inset 0 0 100px rgba(0,0,0,.55)" }}
        />
      )}

      {!config.obsMode && (
        <div
          className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5"
          style={{
            height: "48px",
            background: "rgba(3,7,13,0.97)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(103,232,249,0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="rounded border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 font-['Orbitron'] text-xs font-black text-cyan-200">
              {config.producerMode ? "PRODUCER" : config.mode}
            </span>
            <span className="font-mono text-xs text-slate-800">|</span>
            <span className="font-mono text-xs font-bold text-cyan-300">{config.roomId}</span>
            {config.quickRoster.length > 0 && (
              <span className="hidden rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-violet-300 md:inline-flex">
                {config.quickRoster.length} verified seats
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-rose-400 shadow-[0_0_7px_#fb7185]" />
            <div className="text-right">
              <span className="block font-mono text-base font-bold tracking-[0.1em] text-white">
                {String(Math.floor(clock.seconds / 60)).padStart(2, "0")}:
                {String(clock.seconds % 60).padStart(2, "0")}
              </span>
              <span className="block font-['Orbitron'] text-[7px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {clock.label}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/battles/lobby")}
            className="flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-400/[0.08] px-3 py-1.5 font-['Orbitron'] text-xs font-black uppercase tracking-wider text-rose-300"
          >
            <LogOut className="h-3.5 w-3.5" /> End battle
          </button>
        </div>
      )}

      <div
        className="absolute left-0 right-0"
        style={{
          top: config.obsMode ? 0 : "48px",
          bottom: config.obsMode ? "28px" : "80px",
        }}
      >
        {status === "connected" && streamClient && streamCall ? (
          <StreamVideo client={streamClient}>
            <StreamCall call={streamCall}>
              <ArenaInner {...commonProps} />
            </StreamCall>
          </StreamVideo>
        ) : (
          <DemoArena {...commonProps} />
        )}
      </div>

      <BrandRibbon
        promoText={config.promoText}
        sponsorName={config.sponsorName}
        sponsorUrl={config.sponsorUrl}
        obsMode={config.obsMode}
      />
    </div>
  );
};

export default BattleRoom;
