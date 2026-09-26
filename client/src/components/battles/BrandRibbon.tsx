import React from "react";
import { ExternalLink, Megaphone } from "lucide-react";

export default function BrandRibbon({
  promoText,
  sponsorName,
  sponsorUrl,
  obsMode = false,
}: {
  promoText?: string;
  sponsorName?: string;
  sponsorUrl?: string;
  obsMode?: boolean;
}) {
  const sponsor = sponsorName?.trim();
  const promo = promoText?.trim() || "HYBRID FUNDING · TRADE HOUSE · VERIFIED DASHBOARD FEEDS";
  const href = sponsorUrl?.trim();

  const content = (
    <div className="flex min-w-0 items-center justify-between gap-4 px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="font-['Orbitron'] text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
          HYBRID FUNDING
        </span>
        <span className="hidden text-slate-700 sm:inline">•</span>
        <span className="truncate text-[9px] font-medium tracking-wide text-slate-400">{promo}</span>
      </div>
      {sponsor && (
        <div className="flex flex-shrink-0 items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[0.05] px-3 py-1">
          <Megaphone className="h-3 w-3 text-violet-300" />
          <span className="font-['Orbitron'] text-[8px] font-black uppercase tracking-[0.12em] text-violet-200">
            Presented by {sponsor}
          </span>
          {href && <ExternalLink className="h-3 w-3 text-violet-400" />}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`absolute left-0 right-0 z-30 flex items-center border-y border-cyan-300/10 bg-[#050c16]/95 backdrop-blur-xl ${obsMode ? "bottom-0 h-7" : "bottom-14 h-6"}`}
    >
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="w-full">
          {content}
        </a>
      ) : content}
    </div>
  );
}
