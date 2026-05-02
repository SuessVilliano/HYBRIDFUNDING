import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const YOUTUBE_ID = "1btvnorAx6A";

interface WebinarModalProps {
  open: boolean;
  onClose: () => void;
}

const WebinarModal: React.FC<WebinarModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    trackEvent("webinar_opened");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Hybrid Funding webinar"
        >
          <motion.div
            className="relative w-full max-w-4xl"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
          >
            <button
              onClick={onClose}
              aria-label="Close webinar"
              className="absolute -top-12 right-0 inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              <X size={18} /> Close
            </button>
            <div className="rounded-xl overflow-hidden border border-accent/40 shadow-2xl shadow-accent/30 bg-black aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1`}
                title="Hybrid Funding Webinar"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <p className="text-[#B8B8D0] text-center text-xs mt-3">
              Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/80">Esc</kbd> or click outside to close ·{" "}
              <a
                href={`https://youtu.be/${YOUTUBE_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Open on YouTube
              </a>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WebinarModal;
