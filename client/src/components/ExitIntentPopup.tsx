import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import A2PCompliantOptInForm from "@/components/A2PCompliantOptInForm";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "exitIntentShown";

const ExitIntentPopup: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const onMouseLeave = (e: MouseEvent) => {
      // Only fire when cursor leaves out the top of the viewport (intent to close)
      if (e.clientY <= 0 && !sessionStorage.getItem(STORAGE_KEY)) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        setOpen(true);
        trackEvent("exit_intent_shown");
      }
    };

    // Mobile fallback: trigger after 25s of inactivity / on visibility change
    let inactivityTimer: number | undefined;
    const armInactivity = () => {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(() => {
        if (!sessionStorage.getItem(STORAGE_KEY)) {
          sessionStorage.setItem(STORAGE_KEY, "1");
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
  }, []);

  const close = () => {
    setOpen(false);
    trackEvent("exit_intent_dismissed");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
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
              className="absolute top-3 right-3 z-10 text-[#B8B8D0] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="p-6 md:p-8">
              <div className="text-center mb-5">
                <p className="text-accent font-['Orbitron'] uppercase tracking-widest text-xs mb-2">
                  Wait — before you go
                </p>
                <h2 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white mb-2">
                  Lock in <span className="text-accent">20% off</span> your first challenge
                </h2>
                <p className="text-[#B8B8D0]">
                  Drop your number and we'll text you the discount code plus our trader playbook PDF.
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
