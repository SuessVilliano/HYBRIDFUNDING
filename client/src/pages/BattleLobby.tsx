import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Trophy, Zap, Users, Shield, Copy, Check, ArrowRight, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BattleMode } from "@/components/battles/StatsPanel";

const MODES: { value: BattleMode; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: "1v1",
    label: "1v1",
    desc: "Head-to-head — one trader vs one trader",
    icon: <Swords className="w-6 h-6" />,
  },
  {
    value: "2v2",
    label: "2v2",
    desc: "Team battle — two traders per side",
    icon: <Users className="w-6 h-6" />,
  },
  {
    value: "3v3",
    label: "3v3",
    desc: "Full squad — three traders per side",
    icon: <Shield className="w-6 h-6" />,
  },
];

function generateRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const BattleLobby: React.FC = () => {
  const [, navigate] = useLocation();

  const [mode, setMode] = useState<BattleMode>("1v1");
  const [traderName, setTraderName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [tab, setTab] = useState<"create" | "join">("create");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateRoom = () => {
    setRoomId(generateRoomId());
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreateBattle = () => {
    if (!traderName.trim()) {
      setError("Please enter your trader name.");
      return;
    }
    if (!roomId) {
      setError("Please generate a Room ID first.");
      return;
    }
    setError("");
    const params = new URLSearchParams({
      mode,
      name: traderName.trim(),
      side: "left",
      slot: "0",
    });
    navigate(`/battles/room/${roomId}?${params.toString()}`);
  };

  const handleJoinBattle = () => {
    if (!traderName.trim()) {
      setError("Please enter your trader name.");
      return;
    }
    if (!joinRoomId.trim()) {
      setError("Please enter a Room ID to join.");
      return;
    }
    setError("");
    const params = new URLSearchParams({
      name: traderName.trim(),
      join: "1",
    });
    navigate(`/battles/room/${joinRoomId.trim().toUpperCase()}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0B1426] flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Trophy className="w-10 h-10 text-[#7B2FBE]" />
          <h1 className="font-['Orbitron'] text-4xl font-bold text-white">
            TRADER <span className="text-[#00FFFF]">BATTLES</span>
          </h1>
          <Trophy className="w-10 h-10 text-[#00FFFF]" />
        </div>
        <p className="text-[#B8B8D0] text-lg max-w-lg mx-auto">
          Set up your live stream battle arena. OBS captures the room at 1920×1080 for Trade Hybrid TV.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full max-w-xl"
      >
        {/* Trader name */}
        <div className="glassmorphism rounded-2xl p-6 mb-4 border border-white/10">
          <label className="block text-[#B8B8D0] text-sm font-semibold mb-2 font-['Orbitron']">
            YOUR TRADER NAME
          </label>
          <input
            type="text"
            value={traderName}
            onChange={(e) => setTraderName(e.target.value)}
            placeholder="e.g. HybridKing, ZeroLoss, NightTrader…"
            maxLength={24}
            className="w-full bg-[#1A1A2E] border border-white/20 rounded-lg px-4 py-3 text-white font-['Orbitron'] focus:outline-none focus:border-[#00FFFF] transition-colors placeholder:text-[#4A5568]"
          />
        </div>

        {/* Mode selector */}
        <div className="glassmorphism rounded-2xl p-6 mb-4 border border-white/10">
          <label className="block text-[#B8B8D0] text-sm font-semibold mb-4 font-['Orbitron']">
            BATTLE MODE
          </label>
          <div className="grid grid-cols-3 gap-3">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`flex flex-col items-center gap-2 rounded-xl p-4 border-2 transition-all ${
                  mode === m.value
                    ? "border-[#00FFFF] bg-[#00FFFF]/10 text-white"
                    : "border-white/10 bg-[#1A1A2E]/50 text-[#B8B8D0] hover:border-white/30"
                }`}
              >
                <div className={mode === m.value ? "text-[#00FFFF]" : ""}>{m.icon}</div>
                <span className="font-['Orbitron'] font-bold text-lg">{m.label}</span>
                <span className="text-[10px] text-center leading-tight opacity-70">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Create / Join tabs */}
        <div className="glassmorphism rounded-2xl p-6 border border-white/10">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("create")}
              className={`flex-1 py-2 rounded-lg font-['Orbitron'] font-bold text-sm transition-all ${
                tab === "create"
                  ? "bg-[#7B2FBE] text-white"
                  : "bg-[#1A1A2E] text-[#B8B8D0] hover:bg-[#1A1A2E]/80"
              }`}
            >
              CREATE ROOM
            </button>
            <button
              onClick={() => setTab("join")}
              className={`flex-1 py-2 rounded-lg font-['Orbitron'] font-bold text-sm transition-all ${
                tab === "join"
                  ? "bg-[#00FFFF]/20 border border-[#00FFFF] text-[#00FFFF]"
                  : "bg-[#1A1A2E] text-[#B8B8D0] hover:bg-[#1A1A2E]/80"
              }`}
            >
              JOIN ROOM
            </button>
          </div>

          {tab === "create" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[#B8B8D0] text-xs font-semibold mb-2 font-['Orbitron']">
                  ROOM ID
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#1A1A2E] border border-white/20 rounded-lg px-4 py-3 font-['Orbitron'] font-bold text-white text-lg tracking-widest">
                    {roomId || <span className="text-[#4A5568] text-sm font-normal">Generate a room ID…</span>}
                  </div>
                  {roomId && (
                    <button
                      onClick={handleCopyRoomId}
                      className="px-3 bg-[#1A1A2E] border border-white/20 rounded-lg text-[#B8B8D0] hover:text-white hover:border-[#00FFFF] transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-[#7B2FBE]/50 text-[#7B2FBE] hover:bg-[#7B2FBE]/10 font-['Orbitron']"
                onClick={handleGenerateRoom}
              >
                <Zap className="mr-2 w-4 h-4" />
                GENERATE ROOM ID
              </Button>

              {roomId && (
                <p className="text-[#B8B8D0] text-xs text-center">
                  Share this Room ID with your opponent(s) so they can join.
                </p>
              )}

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <Button
                variant="neon-filled"
                className="w-full font-['Orbitron'] font-bold"
                size="lg"
                onClick={handleCreateBattle}
              >
                START BATTLE
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[#B8B8D0] text-xs font-semibold mb-2 font-['Orbitron']">
                  ENTER ROOM ID
                </label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="e.g. AB12CD"
                  maxLength={8}
                  className="w-full bg-[#1A1A2E] border border-white/20 rounded-lg px-4 py-3 text-white font-['Orbitron'] font-bold text-lg tracking-widest focus:outline-none focus:border-[#00FFFF] transition-colors placeholder:text-[#4A5568] placeholder:font-normal placeholder:text-sm"
                />
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <Button
                className="w-full bg-[#00FFFF]/20 border border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF]/30 font-['Orbitron'] font-bold"
                size="lg"
                onClick={handleJoinBattle}
              >
                JOIN BATTLE
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* OBS tip */}
        <p className="text-[#4A5568] text-xs text-center mt-4">
          Add <code className="text-[#7B2FBE]">?obs=1</code> to the battle room URL as a Browser Source in OBS for a clean 1920×1080 capture.
        </p>
      </motion.div>
    </div>
  );
};

export default BattleLobby;
