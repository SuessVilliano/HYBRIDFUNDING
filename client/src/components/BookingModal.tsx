import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const BOOKING_URL = "https://api.leadconnectorhq.com/widget/booking/008KqUmzv7u3pCdhgqDg";
const EMBED_SCRIPT = "https://link.msgsndr.com/js/form_embed.js";
const SCRIPT_ID = "ghl-form-embed";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;

    // Inject GHL form_embed.js once — handles iframe auto-resize via postMessage.
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = EMBED_SCRIPT;
      s.async = true;
      document.body.appendChild(s);
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    trackEvent("booking_opened");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/85 p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Book a Hybrid Funding appointment"
        >
          <motion.div
            className="relative w-full max-w-3xl my-8"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
          >
            <button
              onClick={onClose}
              aria-label="Close booking"
              className="absolute -top-12 right-0 inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              <X size={18} /> Close
            </button>
            <div className="rounded-xl overflow-hidden border border-primary/40 shadow-2xl shadow-primary/30 bg-white">
              <iframe
                title="Hybrid Funding Booking Calendar"
                src={BOOKING_URL}
                id="008KqUmzv7u3pCdhgqDg_modal"
                className="w-full block"
                style={{ minHeight: "720px", border: "none" }}
                scrolling="no"
              />
            </div>
            <p className="text-[#B8B8D0] text-center text-xs mt-3">
              Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/80">Esc</kbd> or click outside to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
