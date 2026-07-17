import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  LayoutDashboard,
  TrendingUp,
  CandlestickChart,
  BookOpen,
  ExternalLink,
  X,
} from "lucide-react";

/**
 * App-style bottom tab bar, shown ONLY when the site is running as an
 * installed PWA (added to Home Screen / standalone display mode).
 * Regular browser visitors never see it — they keep the normal site menus.
 */

const DASHBOARD_URL = "https://hybridfundingdashboard.propaccount.com/";

// Platform launch links. Platforms without a universal web login route
// through the trader dashboard (where accounts + credentials live).
const PLATFORMS: { name: string; note: string; url: string }[] = [
  { name: "DXtrade", note: "Forex", url: DASHBOARD_URL },
  { name: "DXtrade Futures", note: "Futures", url: DASHBOARD_URL },
  { name: "cTrader", note: "Forex — web app", url: "https://app.ctrader.com/" },
  { name: "Match-Trader", note: "Forex", url: DASHBOARD_URL },
  { name: "Volumetrica", note: "Futures — order flow", url: DASHBOARD_URL },
  { name: "Tradovate", note: "Futures — web app", url: "https://trader.tradovate.com/" },
  { name: "GooeyPro", note: "Single Session Equities", url: DASHBOARD_URL },
];

const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if ((window.navigator as any).standalone === true) return true; // iOS Safari
  if (window.location.search.includes("source=pwa")) return true;
  try {
    if (sessionStorage.getItem("hf-pwa") === "1") return true;
  } catch {}
  return false;
};

const AppTabBar = () => {
  const [standalone, setStandalone] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const on = isStandalone();
    setStandalone(on);
    if (on) {
      try {
        sessionStorage.setItem("hf-pwa", "1");
      } catch {}
      // Keep page content clear of the fixed tab bar, and let CSS know
      // we're in installed-app mode (used to lift the chat widget etc.)
      document.documentElement.classList.add("hf-standalone");
      document.body.style.paddingBottom = "calc(68px + env(safe-area-inset-bottom))";
      return () => {
        document.documentElement.classList.remove("hf-standalone");
        document.body.style.paddingBottom = "";
      };
    }
  }, []);

  if (!standalone) return null;

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[10px] font-medium transition-colors ${
      active ? "text-accent" : "text-[#8888A8]"
    }`;

  return (
    <>
      {/* Platforms bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-label="Trading platforms">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSheetOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-white/10 bg-[#12122A] p-5 pb-[calc(84px+env(safe-area-inset-bottom))] max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Orbitron'] text-white font-bold">Trading Platforms</h3>
              <button aria-label="Close" onClick={() => setSheetOpen(false)} className="text-[#8888A8] p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {PLATFORMS.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 px-4 py-3 transition-colors"
                >
                  <span>
                    <span className="block text-white font-medium text-sm">{p.name}</span>
                    <span className="block text-[#8888A8] text-xs">{p.note}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-accent flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[60] border-t border-white/10 bg-[#0F0F1A]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
        aria-label="App navigation"
      >
        <div className="flex items-stretch max-w-lg mx-auto">
          <Link href="/">
            <span className={tabClass(location === "/") + " cursor-pointer"}>
              <Home className="h-5 w-5" />
              Home
            </span>
          </Link>
          <a
            href={DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={tabClass(false)}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </a>
          <Link href="/predictive-markets">
            <span className={tabClass(location === "/predictive-markets") + " cursor-pointer"}>
              <TrendingUp className="h-5 w-5" />
              Predictive
            </span>
          </Link>
          <button className={tabClass(sheetOpen)} onClick={() => setSheetOpen((v) => !v)}>
            <CandlestickChart className="h-5 w-5" />
            Platforms
          </button>
          <a
            href="https://hybridjournal.co"
            target="_blank"
            rel="noopener noreferrer"
            className={tabClass(false)}
          >
            <BookOpen className="h-5 w-5" />
            Journal
          </a>
        </div>
      </nav>
    </>
  );
};

export default AppTabBar;
