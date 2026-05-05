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
          className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center bg-black/85 p-3 sm:p-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label="Book a Hybrid Funding appointment"
        >
          <motion.div
            className="relative w-full max-w-5xl my-4 sm:my-8"
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
          >
            <div className="rounded-xl overflow-hidden border border-primary/40 shadow-2xl shadow-primary/30 bg-white">
              <div className="flex items-center justify-between bg-[#0F0F1A] text-white px-4 py-2.5 border-b border-primary/30">
                <span className="font-['Orbitron'] text-sm font-semibold tracking-wide">Book a Call</span>
                <button
                  onClick={onClose}
                  aria-label="Close booking"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <iframe
                title="Hybrid Funding Booking Calendar"
                src={BOOKING_URL}
                id="008KqUmzv7u3pCdhgqDg_modal"
                className="w-full block min-h-[720px] sm:min-h-[780px] lg:min-h-[840px]"
                style={{ border: "none" }}
                scrolling="yes"
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
