import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, getCheckoutUrl } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ChallengeCardProps {
  tier: string;
  price: number;
  profitTarget: number;
  maxDrawdown: number;
  label: string;
  bestValue?: boolean;
  delay?: number;
  assetClass?: string;
  challengeType?: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  tier,
  price,
  profitTarget,
  maxDrawdown,
  label,
  bestValue = false,
  delay = 0,
  assetClass = "forex",
  challengeType = "one-step",
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = () => {
    setIsLoading(true);
    // Simulate API interaction - this would connect to your backend payment processor
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Redirecting to payment provider",
        description: "You'll be redirected to complete your purchase",
      });
      // Redirect to the payment provider
      window.open(getCheckoutUrl(tier), "_blank");
      setIsDialogOpen(false);
    }, 1500);
  };

  const openCheckoutDialog = () => {
    setIsDialogOpen(true);
  };

  // Format the challenge type for display
  const formatChallengeType = (type: string) => {
    switch (type) {
      case "one-step": return "1-Step Challenge";
      case "two-step": return "2-Step Challenge";
      case "three-step": return "3-Step Challenge";
      case "instant": return "Instant Funding";
      default: return type;
    }
  };

  return (
    <>
      <motion.div
        className={`glassmorphism rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 relative`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay * 0.1 }}
      >
        {bestValue && (
          <div className="absolute -top-3 -right-3 z-10">
            <div className="bg-accent text-[#0F0F1A] px-4 py-1 rounded-full font-bold shadow-[0_0_8px_rgba(0,255,255,0.5)]">
              BEST VALUE
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-['Orbitron'] text-2xl font-bold text-white">${tier}</h3>
            <span className="bg-accent/20 text-accent py-1 px-3 rounded-full text-sm font-medium">
              {label}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            {profitTarget > 0 ? (
              <div className="flex justify-between items-center">
                <span className="text-[#B8B8D0]">Equity Growth Target</span>
                <span className="text-white font-semibold">{profitTarget}%</span>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-[#B8B8D0]">Funding Type</span>
                <span className="text-accent font-semibold">Instant</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#B8B8D0]">Max Drawdown</span>
              <span className="text-white font-semibold">{maxDrawdown}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#B8B8D0]">Entry Fee</span>
              <span className="text-white font-bold text-2xl">{formatCurrency(price)}</span>
            </div>
          </div>

          <Button
            variant={bestValue ? "neon-filled" : "gradient"}
            size="lg"
            className="w-full py-3 px-4 font-medium rounded-lg"
            onClick={openCheckoutDialog}
          >
            Purchase Now
          </Button>
        </div>
      </motion.div>

      {/* Checkout Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glassmorphism border-accent/40 text-white">
          <DialogHeader>
            <DialogTitle className="font-['Orbitron'] text-2xl text-center">${tier} Challenge</DialogTitle>
            <DialogDescription className="text-center text-[#B8B8D0]">
              {formatChallengeType(challengeType)} for {assetClass.toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="bg-[#0F0F1A]/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#B8B8D0]">Account Size</span>
                <span className="text-white font-semibold">${tier}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#B8B8D0]">Challenge Type</span>
                <span className="text-white font-semibold">{formatChallengeType(challengeType)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#B8B8D0]">Asset Class</span>
                <span className="text-white font-semibold uppercase">{assetClass}</span>
              </div>
              {profitTarget > 0 ? (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#B8B8D0]">Equity Growth Target</span>
                  <span className="text-white font-semibold">{profitTarget}%</span>
                </div>
              ) : null}
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#B8B8D0]">Max Drawdown</span>
                <span className="text-white font-semibold">{maxDrawdown}%</span>
              </div>
              <div className="border-t border-accent/20 pt-2 mt-2">
                <div className="flex justify-between items-center mb-0">
                  <span className="text-[#B8B8D0] font-bold">Total</span>
                  <span className="text-accent font-['Orbitron'] font-bold text-xl">{formatCurrency(price)}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-[#B8B8D0]">
                By proceeding, you agree to our <a href="/terms" className="text-accent underline">Terms & Conditions</a>
              </p>
            </div>
          </div>

          <DialogFooter className="flex sm:justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-accent/30 text-accent hover:bg-accent/10"
            >
              Cancel
            </Button>
            <Button 
              variant="neon-filled" 
              onClick={handleCheckout}
              className="font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChallengeCard;
