import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Copy, Check, Swords, Users, Shield, Zap } from "lucide-react";
import type { BattleMode } from "@/components/battles/StatsPanel";

const MODES: { value: BattleMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "1v1", label: "1V1", desc: "Head-to-head duel", icon: <Swords className="w-8 h-8" /> },
  { value: "2v2", label: "2V2", desc: "Two traders per side", icon: <Users className="w-8 h-8" /> },
  { value: "3v3", label: "3V3", desc: "Full squad showdown", icon: <Shield className="w-8 h-8" /> },
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

  const handleGenerateRoom = () => setRoomId(generateRoomId());

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCreateBattle = () => {
    if (!traderName.trim()) { setError("Enter your trader name."); return; }
    if (!roomId) { setError("Generate a Room ID first."); return; }
    setError("");
    const p = new URLSearchParams({ mode, name: traderName.trim(), side: "left", slot: "0" });
    navigate(`/battles/room/${roomId}?${p.toString()}`);
  };

  const handleJoinBattle = () => {
    if (!traderName.trim()) { setError("Enter your trader name."); return; }
    if (!joinRoomId.trim()) { setError("Enter a Room ID to join."); return; }
    setError("");
    const p = new URLSearchParams({ name: traderName.trim(), join: "1" });
    navigate(`/battles/room/${joinRoomId.trim().toUpperCase()}?${p.toString()}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "#0a0a0f" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,135,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,135,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,255,135,0.05) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-center mb-10 relative z-10"
      >
        <h1
          className="font-['Orbitron'] font-black uppercase tracking-widest"
          style={{
            fontSize: "clamp(2rem, 6vw, 3.75rem)",
            background: "linear-gradient(135deg, #ffd700 0%, #ffe566 45%, #ffd700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 24px rgba(255,215,0,0.45))",
          }}
        >
          ⚔ TRADER BATTLES
        </h1>
        <p className="mt-3 text-xs font-['Orbitron'] tracking-[0.25em] uppercase" style={{ color: "#444" }}>
          Live stream your battle arena · Trade Hybrid TV
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="w-full max-w-xl relative z-10 space-y-4"
      >
        <div>
          <label className="block text-[10px] font-['Orbitron'] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#555" }}>
            Your Trader Name
          </label>
          <input
            type="text"
            value={traderName}
            onChange={(e) => setTraderName(e.target.value)}
            placeholder="e.g. HybridKing, ZeroLoss, NightTrader…"
            maxLength={24}
            className="w-full rounded-lg px-5 py-4 text-white font-['Orbitron'] text-lg outline-none transition-all placeholder:font-sans placeholder:text-base"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.07)", caretColor: "#00ff87" }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #00ff87";
              e.target.style.boxShadow = "0 0 0 3px rgba(0,255,135,0.07), 0 0 24px rgba(0,255,135,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid rgba(255,255,255,0.07)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div>
          <label className="block text-[10px] font-['Orbitron'] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#555" }}>
            Battle Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {MODES.map((m) => {
              const sel = mode === m.value;
              return (
                <motion.button
                  key={m.value}
                  onClick={() => setMode(m.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center gap-2 rounded-xl p-4 transition-colors"
                  style={{
                    background: sel ? "rgba(0,255,135,0.06)" : "#111118",
                    border: sel ? "1px solid #00ff87" : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: sel ? "0 0 24px rgba(0,255,135,0.12), inset 0 0 24px rgba(0,255,135,0.03)" : "none",
                  }}
                >
                  <span style={{ color: sel ? "#00ff87" : "#444" }}>{m.icon}</span>
                  <span className="font-['Orbitron'] font-black text-xl tracking-wider" style={{ color: sel ? "#00ff87" : "#555" }}>
                    {m.label}
                  </span>
                  <span className="text-[10px] font-['Orbitron'] text-center leading-tight" style={{ color: sel ? "rgba(0,255,135,0.6)" : "#383838" }}>
                    {m.desc}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {(["create", "join"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className="flex-1 py-3 font-['Orbitron'] font-bold text-xs tracking-[0.2em] uppercase transition-all"
                style={{
                  color: tab === t ? "#00ff87" : "#3a3a3a",
                  background: tab === t ? "rgba(0,255,135,0.04)" : "transparent",
                  borderBottom: tab === t ? "2px solid #00ff87" : "2px solid transparent",
                }}
              >
                {t === "create" ? "Create Room" : "Join Room"}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {tab === "create" ? (
                <motion.div key="create" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-['Orbitron'] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#444" }}>
                      Room ID
                    </label>
                    <div className="flex gap-2">
                      <div
                        className="flex-1 rounded-lg px-5 py-3 font-mono text-2xl font-bold tracking-[0.4em] flex items-center"
                        style={{
                          background: "#0a0a0f",
                          border: "1px solid rgba(255,255,255,0.07)",
                          color: roomId ? "#ffd700" : "#2a2a2a",
                          minHeight: "56px",
                          textShadow: roomId ? "0 0 20px rgba(255,215,0,0.4)" : "none",
                        }}
                      >
                        {roomId || (
                          <span className="font-['Orbitron'] font-normal text-sm tracking-normal" style={{ color: "#2a2a2a" }}>
                            Generate below…
                          </span>
                        )}
                      </div>
                      {roomId && (
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          onClick={handleCopyRoomId}
                          className="px-4 rounded-lg transition-all"
                          style={{
                            background: copied ? "rgba(0,255,135,0.1)" : "#0a0a0f",
                            border: copied ? "1px solid #00ff87" : "1px solid rgba(255,255,255,0.07)",
                            color: copied ? "#00ff87" : "#555",
                          }}
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </motion.button>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateRoom}
                    className="w-full py-3 rounded-lg font-['Orbitron'] font-bold text-sm tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all"
                    style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.18)", color: "#ffd700" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,215,0,0.09)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,215,0,0.05)"; }}
                  >
                    <Zap className="w-4 h-4" /> Generate Room ID
                  </motion.button>
                  {roomId && (
                    <p className="text-[#383838] text-[10px] text-center font-['Orbitron'] tracking-wider">
                      Share this ID with your opponent(s) so they can join
                    </p>
                  )}
                  {error && <p className="text-sm text-center font-['Orbitron']" style={{ color: "#ff3b5c" }}>{error}</p>}
                  <motion.button
                    whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(255,215,0,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateBattle}
                    className="w-full py-4 rounded-xl font-['Orbitron'] font-black text-base tracking-[0.2em] uppercase transition-all"
                    style={{ background: "linear-gradient(135deg, #ffd700 0%, #ffb800 100%)", color: "#0a0a0f", boxShadow: "0 0 30px rgba(255,215,0,0.25), 0 4px 20px rgba(0,0,0,0.5)" }}
                  >
                    ⚔ Enter the Arena
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div key="join" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-['Orbitron'] font-bold tracking-[0.2em] uppercase mb-2" style={{ color: "#444" }}>
                      Room ID
                    </label>
                    <input
                      type="text"
                      value={joinRoomId}
                      onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                      placeholder="A B C 1 2 3"
                      maxLength={8}
                      className="w-full rounded-lg px-5 py-3 font-mono text-2xl font-bold tracking-[0.4em] outline-none transition-all"
                      style={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.07)", color: "#ffd700", caretColor: "#ffd700" }}
                      onFocus={(e) => { e.target.style.border = "1px solid rgba(255,215,0,0.5)"; e.target.style.boxShadow = "0 0 20px rgba(255,215,0,0.08)"; }}
                      onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.07)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                  {error && <p className="text-sm text-center font-['Orbitron']" style={{ color: "#ff3b5c" }}>{error}</p>}
                  <motion.button
                    whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(255,215,0,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinBattle}
                    className="w-full py-4 rounded-xl font-['Orbitron'] font-black text-base tracking-[0.2em] uppercase transition-all"
                    style={{ background: "linear-gradient(135deg, #ffd700 0%, #ffb800 100%)", color: "#0a0a0f", boxShadow: "0 0 30px rgba(255,215,0,0.25), 0 4px 20px rgba(0,0,0,0.5)" }}
                  >
                    ⚔ Enter the Arena
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-[10px] text-center font-['Orbitron'] tracking-wider" style={{ color: "#2a2a2a" }}>
          Append <code className="px-1" style={{ color: "#ffd700" }}>?obs=1</code> to the room URL as Browser Source in OBS for 1920×1080 capture
        </p>
      </motion.div>
    </div>
  );
};

export default BattleLobby;
