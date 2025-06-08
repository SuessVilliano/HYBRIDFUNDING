import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getSupportEmail } from "@/lib/utils";
import Loading from "@/components/ui/loading";
import { useState } from "react";

const TraderPortal = () => {
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isLoadingSupport, setIsLoadingSupport] = useState(false);

  const instructions = [
    "After purchase, you'll receive login credentials by email.",
    `If not received in 30 minutes, check spam or contact ${getSupportEmail()}`
  ];

  const handleDashboardAccess = async () => {
    setIsLoadingDashboard(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.open("https://hybridfundingdashboard.propaccount.com/", "_blank");
    setIsLoadingDashboard(false);
  };

  const handleContactSupport = async () => {
    setIsLoadingSupport(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.href = `mailto:${getSupportEmail()}`;
    setIsLoadingSupport(false);
  };

  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto glassmorphism rounded-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              Trader <span className="text-accent neon-text-accent">Portal</span>
            </h2>
            <p className="text-[#B8B8D0] max-w-2xl mx-auto">Access your funded account and trading dashboard.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-6">Access Instructions</h3>
              
              <div className="space-y-4 mb-8">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-3 mt-1 text-accent">
                      <Check className="h-5 w-5" />
                    </div>
                    <p className="text-[#B8B8D0]">{instruction}</p>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="neon-filled"
                size="xl"
                rounded="full"
                onClick={handleDashboardAccess}
                disabled={isLoadingDashboard}
                className="font-['Orbitron'] font-semibold shadow-glow-accent"
              >
                {isLoadingDashboard ? (
                  <div className="flex items-center gap-3">
                    <Loading variant="matrix" size="sm" text="" />
                    <span>CONNECTING TO PORTAL...</span>
                  </div>
                ) : (
                  "ACCESS DASHBOARD"
                )}
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* A futuristic login interface illustration */}
              <div className="relative rounded-xl overflow-hidden neon-border">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Futuristic login interface" 
                  className="w-full h-auto" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F1A] to-transparent flex items-end">
                  <div className="p-6 w-full">
                    <div className="bg-[#1A1A2E]/80 backdrop-blur-sm p-4 rounded-lg">
                      <p className="text-accent font-['Orbitron'] font-semibold">TRADING PLATFORM ACCESS</p>
                      <p className="text-white text-sm">Rithmic • MatchTrader • DXTrade • cTrader</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TraderPortal;
