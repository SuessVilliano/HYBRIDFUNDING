import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const HIDDEN_PATHS = ["/thank-you", "/trader-portal", "/contact"];

const StickyCTA: React.FC = () => {
  const [loc] = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismiss = sessionStorage.getItem("stickyCtaDismissed");
    if (dismiss) setDismissed(true);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (dismissed) return null;
  if (HIDDEN_PATHS.some((p) => loc.startsWith(p))) return null;
  if (loc.startsWith("/blog/")) return null; // don't compete with article CTAs
  if (!visible) return null;

  const onClick = () => {
    trackEvent("sticky_cta_click", { from: loc });
  };
  const onDismiss = () => {
    sessionStorage.setItem("stickyCtaDismissed", "1");
    setDismissed(true);
    trackEvent("sticky_cta_dismiss", { from: loc });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="container mx-auto px-4 pb-3 flex justify-center">
        <div className="pointer-events-auto bg-gradient-to-r from-primary to-accent rounded-full px-2 py-2 pl-5 flex items-center gap-3 shadow-2xl shadow-accent/30 max-w-full">
          <Zap className="h-5 w-5 text-white shrink-0" />
          <p className="text-white font-semibold text-sm md:text-base hidden sm:block">
            Get funded with up to 90% profit splits.
          </p>
          <p className="text-white font-semibold text-sm sm:hidden">Get funded today</p>
          <Link href="/challenges" onClick={onClick}>
            <Button variant="secondary" size="sm" className="rounded-full font-['Orbitron'] font-bold whitespace-nowrap">
              Start Now
            </Button>
          </Link>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="text-white/70 hover:text-white p-1 rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyCTA;
