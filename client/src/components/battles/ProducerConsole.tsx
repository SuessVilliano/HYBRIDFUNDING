import React, { useMemo, useRef, useState } from "react";
import { Headphones, MicOff, MonitorOff, Music2, Radio, UserX, VideoOff, Volume2, X } from "lucide-react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";

export default function ProducerConsole({
  musicUrl,
  onClose,
}: {
  musicUrl?: string;
  onClose: () => void;
}) {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [message, setMessage] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.12);
  const audioRef = useRef<HTMLAudioElement>(null);

  const rows = useMemo(
    () => participants.filter((participant) => !participant.isLocalParticipant),
    [participants],
  );

  const run = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      setMessage(label);
    } catch (error) {
      console.error("[tradehouse/producer]", label, error);
      setMessage("Moderator permission required for that action.");
    }
    window.setTimeout(() => setMessage(""), 1800);
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio || !musicUrl) return;
    audio.volume = musicVolume;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
      return;
    }
    try {
      await audio.play();
      setMusicPlaying(true);
    } catch (error) {
      console.error("[tradehouse/producer] music playback failed", error);
      setMessage("Music could not start. Check the audio URL/browser permission.");
    }
  };

  return (
    <div className="absolute right-4 top-14 z-[90] flex max-h-[calc(100vh-9rem)] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#07101b]/97 shadow-[0_30px_100px_rgba(0,0,0,.65)] backdrop-blur-xl">
      <audio ref={audioRef} src={musicUrl || undefined} loop onEnded={() => setMusicPlaying(false)} />
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <div className="flex items-center gap-2 font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
            <Radio className="h-4 w-4" /> Producer Control
          </div>
          <div className="mt-1 text-[9px] text-slate-500">Moderation actions are enforced by Stream permissions.</div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
      </div>

      <div className="border-b border-white/10 p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => call && void run("Everyone else muted.", () => call.muteOthers("audio"))}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-['Orbitron'] text-[9px] font-bold text-slate-300"
          >
            MUTE OTHERS
          </button>
          <button
            onClick={() => call && void run("Call ended.", () => call.endCall())}
            className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 font-['Orbitron'] text-[9px] font-bold text-rose-300"
          >
            END FOR ALL
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-violet-400/15 bg-violet-400/[0.04] p-3">
          <div className="flex items-center gap-2 font-['Orbitron'] text-[9px] font-black text-violet-200">
            <Music2 className="h-3.5 w-3.5" /> HOUSE MUSIC
          </div>
          {musicUrl ? (
            <>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => void toggleMusic()}
                  className="rounded-lg border border-violet-400/20 px-3 py-1.5 text-[9px] font-bold text-violet-200"
                >
                  {musicPlaying ? "PAUSE" : "PLAY"}
                </button>
                <Volume2 className="h-3.5 w-3.5 text-slate-500" />
                <input
                  type="range"
                  min={0}
                  max={0.4}
                  step={0.01}
                  value={musicVolume}
                  onChange={(event) => {
                    const volume = Number(event.target.value);
                    setMusicVolume(volume);
                    if (audioRef.current) audioRef.current.volume = volume;
                  }}
                  className="min-w-0 flex-1"
                />
                <span className="w-8 text-right font-mono text-[9px] text-slate-500">{Math.round(musicVolume * 100)}%</span>
              </div>
              <div className="mt-2 text-[8px] leading-relaxed text-slate-600">
                Plays only in the producer browser. Capture this browser/program audio in OBS; do not send music through trader microphones.
              </div>
            </>
          ) : (
            <div className="mt-2 text-[9px] text-slate-600">Add a music URL in Broadcast Studio to enable the House Music bus.</div>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {rows.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-600">No remote traders in the room yet.</div>
        ) : rows.map((participant) => (
          <div key={participant.sessionId} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-['Orbitron'] text-[10px] font-black text-white">
                  {participant.name || participant.userId}
                </div>
                <div className="mt-0.5 truncate font-mono text-[8px] text-slate-600">{participant.userId}</div>
              </div>
              <button
                onClick={() => call && void run("Trader removed from room.", () => call.kickUser({ user_id: participant.userId }))}
                className="rounded-lg border border-rose-400/15 p-2 text-rose-300"
                title="Remove trader"
              >
                <UserX className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={() => call && void run("Trader microphone muted.", () => call.muteUser(participant.userId, "audio"))}
                className="flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-[8px] font-bold text-slate-400"
              >
                <MicOff className="h-3 w-3" /> MIC
              </button>
              <button
                onClick={() => call && void run("Trader camera stopped.", () => call.muteUser(participant.userId, "video"))}
                className="flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-[8px] font-bold text-slate-400"
              >
                <VideoOff className="h-3 w-3" /> CAM
              </button>
              <button
                onClick={() => call && void run("Trader screen share stopped.", () => call.muteUser(participant.userId, "screenshare"))}
                className="flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-[8px] font-bold text-slate-400"
              >
                <MonitorOff className="h-3 w-3" /> SHARE
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Headphones className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-[8px] uppercase tracking-wider text-slate-600">Producer monitor</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                defaultValue={1}
                onChange={(event) => {
                  const volume = Number(event.target.value);
                  try {
                    call?.speaker.setParticipantVolume(participant.sessionId, volume);
                  } catch (error) {
                    console.error("[tradehouse/producer] participant volume failed", error);
                  }
                }}
                className="min-w-0 flex-1"
              />
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className="border-t border-white/10 bg-cyan-300/[0.04] px-4 py-2 text-center text-[9px] font-bold text-cyan-200">
          {message}
        </div>
      )}
    </div>
  );
}
