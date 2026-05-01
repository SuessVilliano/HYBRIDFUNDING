import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import GetStartedForm from "@/components/GetStartedForm";

interface EarlyAccessPopupProps {
  delayInSeconds?: number;
}

const EarlyAccessPopup: React.FC<EarlyAccessPopupProps> = ({
  delayInSeconds = 3,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const popupShown = localStorage.getItem("earlyAccessPopupShown");
      if (!popupShown) {
        setIsOpen(true);
      }
    }, delayInSeconds * 1000);

    return () => clearTimeout(timer);
  }, [delayInSeconds]);

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem("earlyAccessPopupShown", "true");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && closePopup()}
        >
          <motion.div
            className="relative max-w-md w-full mx-4 bg-[#0F0F1A] border border-accent/40 rounded-xl p-8 shadow-2xl shadow-accent/20 my-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <button
              onClick={closePopup}
              className="absolute top-3 right-3 text-[#B8B8D0] hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="font-['Orbitron'] font-bold text-white text-xl">HF</span>
              </div>
              <h2 className="font-['Orbitron'] text-2xl font-bold text-white mb-2">
                Get Started Today
              </h2>
              <div className="h-1 w-16 bg-accent mx-auto mb-4"></div>
              <p className="text-[#B8B8D0]">
                Join our early access list for{" "}
                <span className="text-accent font-bold">20% off</span> your first challenge,
                exclusive perks, and early account access.
              </p>
            </div>

            {!showForm ? (
              <div className="space-y-4">
                <div className="bg-[#171728] p-4 rounded-lg text-white">
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="text-accent mr-2">✓</span> 20% off your first challenge
                    </li>
                    <li className="flex items-center">
                      <span className="text-accent mr-2">✓</span> AI trade agent access
                    </li>
                    <li className="flex items-center">
                      <span className="text-accent mr-2">✓</span> Free prop account giveaways
                    </li>
                    <li className="flex items-center">
                      <span className="text-accent mr-2">✓</span> Priority platform access
                    </li>
                  </ul>
                </div>

                <Button
                  variant="neon-filled"
                  className="w-full py-3 font-semibold text-lg"
                  onClick={() => setShowForm(true)}
                >
                  Join Early Access
                </Button>
              </div>
            ) : (
              <GetStartedForm source="early-access-popup" />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EarlyAccessPopup;
