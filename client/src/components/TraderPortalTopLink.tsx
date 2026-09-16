import { Link } from "wouter";
import { LogIn } from "lucide-react";

export default function TraderPortalTopLink() {
  return (
    <Link href="/trader-portal">
      <span className="hidden sm:inline-flex items-center gap-2 font-['Orbitron'] text-[11px] font-bold px-4 py-2 rounded-full border border-cyan-300/70 text-cyan-200 bg-cyan-400/5 hover:bg-cyan-300 hover:text-[#061019] transition-all cursor-pointer whitespace-nowrap shadow-[0_0_20px_rgba(34,211,238,.10)]">
        <LogIn className="h-3.5 w-3.5" /> TRADER PORTAL
      </span>
    </Link>
  );
}
