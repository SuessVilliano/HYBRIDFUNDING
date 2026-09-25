import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import A2PCompliantOptInForm from "@/components/A2PCompliantOptInForm";
import { trackEvent } from "@/lib/analytics";
import { getActivePromotion } from "@/config/promotions";

const ExitIntentPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const promotion = getActivePromotion(new Date(now));
  const storageKey = promotion ? `exitIntentShown:${promotion.name}` : "exitIntentShown:none";

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!promotion) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(storageKey)) return;

    const onMouseLeave = (e: MouseEvent) => {
      // Only fire when cursor leaves out the top of the viewport (intent to close)
      if (e.clientY <= 0 && !sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, "1");
        setOpen(true);
        trackEvent("exit_intent_shown");
      }
    };

    // Mobile fallback: trigger after 25s of inactivity / on visibility change
    let inactivityTimer: number | undefined;
    const armInactivity = () => {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => {
        if (!sessionStorage.getItem(storageKey)) {
          sessionStorage.setItem(storageKey, "1");
          setOpen(true);
          trackEvent("exit_intent_shown_inactivity");
        }
      }, 25000);
    };

    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("touchstart", armInactivity);
    document.addEventListener("scroll", armInactivity, { passive: true });
    armInactivity();

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("touchstart", armInactivity);
      document.removeEventListener("scroll", armInactivity);
      window.clearTimeout(inactivityTimer);
    };
  }, [promotion?.name, storageKey]);


  // Dismiss on Escape key
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trackEvent("exit_intent_dismissed");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    trackEvent("exit_intent_dismissed");
  };

  if (!promotion) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 pt-[max(calc(env(safe-area-inset-top)+1rem),1.5rem)] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            className="relative max-w-xl w-full bg-[#0F0F1A] border border-accent/40 rounded-xl shadow-2xl shadow-accent/30 my-auto"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 z-20 text-white bg-white/10 hover:bg-white/20 border border-white/20 p-2.5 rounded-full transition-colors"
            >
              <X size={22} />
            </button>
            <div className="p-6 md:p-8">
              <div className="text-center mb-5">
                <p className="text-accent font-['Orbitron'] uppercase tracking-widest text-xs mb-2">
                  Wait — before you go
                </p>
                <h2 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white mb-2">
                  {promotion.exitPopupHeadline ?? promotion.headline}
                </h2>
                <p className="text-[#B8B8D0]">
                  {promotion.exitPopupSubtext ?? promotion.subtext}
                </p>
              </div>
              <A2PCompliantOptInForm
                onSuccess={() => setTimeout(close, 1500)}
                showResourceLinks={false}
                compactMode={true}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
