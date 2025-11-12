import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import A2PCompliantOptInForm from "@/components/A2PCompliantOptInForm";

interface EarlyAccessPopupProps {
  delayInSeconds?: number;
}

const EarlyAccessPopup: React.FC<EarlyAccessPopupProps> = ({ 
  delayInSeconds = 3 
}) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleSuccess = () => {
    setTimeout(() => {
      closePopup();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && closePopup()}
        >
          <motion.div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-[#0F0F1A] border border-accent/40 rounded-xl shadow-2xl shadow-accent/20"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 z-10 text-[#B8B8D0] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              data-testid="button-close-popup"
            >
              <X size={20} />
            </button>

            <div className="p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-r from-primary to-accent rounded-full mx-auto flex items-center justify-center mb-4">
                  <span className="font-['Orbitron'] font-bold text-white text-xl">HF</span>
                </div>
                <h2 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white mb-2">
                  Unlock VIP Rewards
                </h2>
                <div className="h-1 w-16 bg-accent mx-auto mb-4"></div>
                <p className="text-[#B8B8D0] mb-4">
                  Join our exclusive community and get access to <span className="text-accent font-bold">giveaways, discounts,</span> and more! 
                  Don't miss out on rewards worth thousands.
                </p>

                <div className="bg-[#171728] p-4 rounded-lg text-white mb-6">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center justify-center">
                      <span className="text-accent mr-2">🎁</span> Monthly funded account giveaways
                    </li>
                    <li className="flex items-center justify-center">
                      <span className="text-accent mr-2">💰</span> Exclusive flash discounts & promo codes
                    </li>
                    <li className="flex items-center justify-center">
                      <span className="text-accent mr-2">🏆</span> TradeHouse Battles prize alerts
                    </li>
                    <li className="flex items-center justify-center">
                      <span className="text-accent mr-2">⚡</span> VIP access to new features first
                    </li>
                    <li className="flex items-center justify-center">
                      <span className="text-accent mr-2">📊</span> Premium trading insights & tips
                    </li>
                  </ul>
                </div>
              </div>

              <A2PCompliantOptInForm onSuccess={handleSuccess} showResourceLinks={false} compactMode={true} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EarlyAccessPopup;
