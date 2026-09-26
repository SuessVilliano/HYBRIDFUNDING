import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare, Send, Smile, X } from "lucide-react";
import { useCall } from "@stream-io/video-react-sdk";

type HouseMessage = {
  id: string;
  name: string;
  text: string;
  ts: number;
  reaction?: boolean;
};

const reactions = ["🔥", "🚀", "💎", "👏", "⚡"];

export default function HouseChat({ myName }: { myName: string }) {
  const call = useCall();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<HouseMessage[]>([]);

  const append = (message: HouseMessage) => {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) return current;
      return [...current.slice(-49), message];
    });
  };

  useEffect(() => {
    if (!call) return;
    const unsubscribe = call.on("custom", (event: any) => {
      const custom = event.custom;
      if (custom?.type !== "house_chat" && custom?.type !== "house_reaction") return;
      if (!custom.id || !custom.name || !custom.text) return;
      append({
        id: String(custom.id),
        name: String(custom.name),
        text: String(custom.text).slice(0, 280),
        ts: Number(custom.ts) || Date.now(),
        reaction: custom.type === "house_reaction",
      });
    });
    return () => unsubscribe();
  }, [call]);

  const send = async (text: string, reaction = false) => {
    const clean = text.trim().slice(0, 280);
    if (!clean || !call) return;
    const message: HouseMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: myName,
      text: clean,
      ts: Date.now(),
      reaction,
    };
    append(message);
    setDraft("");
    try {
      await call.sendCustomEvent({
        type: reaction ? "house_reaction" : "house_chat",
        ...message,
      });
    } catch (error) {
      console.error("[tradehouse/chat] send failed", error);
    }
  };

  const unreadLabel = useMemo(() => messages.length > 99 ? "99+" : String(messages.length), [messages.length]);

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-400 transition-all hover:border-cyan-300/30 hover:text-cyan-200"
        title="House chat"
      >
        <MessageSquare className="h-4 w-4" />
        {messages.length > 0 && !open && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-cyan-300 px-1 text-center font-mono text-[8px] font-black leading-4 text-slate-950">
            {unreadLabel}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-16 right-4 z-[70] flex h-[360px] w-[320px] flex-col overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#07101b]/95 shadow-[0_22px_80px_rgba(0,0,0,.55)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">House Chat</div>
              <div className="mt-0.5 text-[9px] text-slate-500">Battle-room only · keep it setup-focused</div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-xs text-slate-600">
                Share a quick setup note or reaction without leaving the chart.
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-['Orbitron'] text-[9px] font-black text-slate-300">{message.name}</span>
                    <span className="font-mono text-[8px] text-slate-600">{new Date(message.ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                  <div className={`mt-1 text-slate-200 ${message.reaction ? "text-2xl" : "text-xs leading-relaxed"}`}>{message.text}</div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Smile className="mr-1 h-3.5 w-3.5 text-slate-600" />
              {reactions.map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => send(reaction, true)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-sm hover:border-violet-400/30 hover:bg-violet-400/[0.08]"
                >
                  {reaction}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void send(draft);
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Setup note…"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-700 focus:border-cyan-300/30"
              />
              <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300 text-slate-950">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
