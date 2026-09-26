import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink, LockKeyhole, LogOut, Radio, ShieldCheck, Swords, Tv2 } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";

type AccessState = "checking" | "locked" | "authorized" | "unconfigured";

export default function BetaAdmin() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const [state, setState] = useState<AccessState>("checking");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const next = useMemo(() => {
    const value = new URLSearchParams(search).get("next") || "";
    if (!value.startsWith("/") || value.startsWith("//")) return "/tradehouse/studio";
    return value;
  }, [search]);

  const refresh = async () => {
    try {
      const response = await fetch("/api/tradehouse/beta/status", {
        credentials: "include",
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body.authorized) setState("authorized");
      else if (body.configured === false) setState("unconfigured");
      else setState("locked");
    } catch {
      setState("locked");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    const previous = existing?.content;
    const meta = existing || document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow,noarchive";
    if (!existing) document.head.appendChild(meta);
    return () => {
      if (!existing) meta.remove();
      else if (previous != null) existing.content = previous;
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/tradehouse/beta/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error || "Access denied");
      navigate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Access denied");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = async () => {
    await fetch("/api/tradehouse/beta/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    setCode("");
    setState("locked");
  };

  if (state === "checking") {
    return <div className="min-h-screen bg-[#050b14]" />;
  }

  if (state === "authorized") {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.09),transparent_32%),#050b14] px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                <ShieldCheck className="h-4 w-4" /> Private Beta Admin
              </div>
              <h1 className="mt-3 font-['Orbitron'] text-3xl font-black sm:text-4xl">Hybrid Beta Console</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
                These tools are hidden from public navigation and require an authenticated beta session.
              </p>
            </div>
            <button onClick={() => void logout()} className="flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/[0.05] px-4 py-2 font-['Orbitron'] text-[9px] font-bold text-rose-300">
              <LogOut className="h-3.5 w-3.5" /> LOCK BETA
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { href: "/tradehouse/studio", title: "Broadcast Studio", body: "Build rosters, rules, participant links, producer controls and OBS sources.", icon: Radio },
              { href: "/tradehouse", title: "Trade House", body: "Preview the private competition product and leaderboards.", icon: Swords },
              { href: "/live", title: "Hybrid Live", body: "Preview the verified stats and proof layer before public launch.", icon: Tv2 },
              { href: "/radar-pro", title: "Radar Pro", body: "Open the separate internal prediction-market radar gate.", icon: ExternalLink },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition-all hover:border-cyan-300/25 hover:bg-cyan-300/[0.04]">
                  <Icon className="h-5 w-5 text-cyan-300" />
                  <div className="mt-4 font-['Orbitron'] text-sm font-black">{item.title}</div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.body}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,.08),transparent_35%),#050b14] px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-cyan-300/15 bg-[#07101b]/95 p-7 shadow-[0_30px_100px_rgba(0,0,0,.5)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06]">
          <LockKeyhole className="h-6 w-6 text-cyan-300" />
        </div>
        <div className="mt-5 text-center font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Admin / Beta</div>
        <h1 className="mt-2 text-center font-['Orbitron'] text-2xl font-black">Private access</h1>
        <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
          {state === "unconfigured"
            ? "This deployment is locked until the server-side beta code is configured."
            : "Enter the private beta code to open the internal Trade House workspace."}
        </p>

        {state !== "unconfigured" && (
          <>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Access code"
              className="mt-6 w-full rounded-xl border border-white/10 bg-[#040a12] px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-white outline-none focus:border-cyan-300/50"
            />
            {error && <div className="mt-3 text-center text-xs text-rose-300">{error}</div>}
            <button disabled={submitting || !code.trim()} className="mt-4 h-11 w-full rounded-xl bg-cyan-300 font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.14em] text-[#06101a] disabled:opacity-40">
              {submitting ? "VERIFYING…" : "UNLOCK PRIVATE BETA"}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
