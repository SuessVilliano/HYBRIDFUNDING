import React, { useEffect, useMemo, useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

type GateState = "checking" | "authorized" | "locked" | "unconfigured";

function cleanReturnPath() {
  if (typeof window === "undefined") return "/tradehouse/studio";
  const params = new URLSearchParams(window.location.search);
  params.delete("access");
  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ""}`;
}

export default function BetaAccessGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>("checking");
  const access = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("access") || "";
  }, []);

  useEffect(() => {
    let active = true;
    const params = access ? `?access=${encodeURIComponent(access)}` : "";
    fetch(`/api/tradehouse/beta/status${params}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.ok && body.authorized) setState("authorized");
        else if (body.configured === false) setState("unconfigured");
        else setState("locked");
      })
      .catch(() => {
        if (active) setState("locked");
      });
    return () => {
      active = false;
    };
  }, [access]);

  useEffect(() => {
    if (state === "authorized") return;
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
  }, [state]);

  if (state === "authorized") return <>{children}</>;

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050b14] px-4 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
          <p className="mt-4 font-['Orbitron'] text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
            Verifying private beta
          </p>
        </div>
      </div>
    );
  }

  const next = encodeURIComponent(cleanReturnPath());

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,.08),transparent_35%),#050b14] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-cyan-300/15 bg-[#07101b]/95 p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,.5)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06]">
          {state === "unconfigured" ? <LockKeyhole className="h-6 w-6 text-violet-300" /> : <ShieldCheck className="h-6 w-6 text-cyan-300" />}
        </div>
        <div className="mt-5 font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
          Hybrid Funding · Private Beta
        </div>
        <h1 className="mt-2 font-['Orbitron'] text-2xl font-black">
          {state === "unconfigured" ? "Beta lock is not configured" : "Admin access required"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          {state === "unconfigured"
            ? "This environment is intentionally closed until the server-side beta secret is configured."
            : "Trade House, Hybrid Live, producer tools, rooms, and broadcast sources are private while the system is being tested."}
        </p>
        {state !== "unconfigured" && (
          <Link
            href={`/admin/beta?next=${next}`}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-cyan-300 px-6 font-['Orbitron'] text-[10px] font-black uppercase tracking-[0.14em] text-[#06101a]"
          >
            Open admin gate
          </Link>
        )}
      </div>
    </div>
  );
}
