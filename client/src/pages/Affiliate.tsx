import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart, ArrowRight } from "lucide-react";

const Affiliate = () => {
  const features = [
    {
      icon: <LineChart className="h-5 w-5 text-accent" />,
      title: "Trackable affiliate links",
      description: "Monitor your referrals and conversions in real-time through an intuitive dashboard."
    },
    {
      icon: <BarChart className="h-5 w-5 text-accent" />,
      title: "Private dashboard access",
      description: "Access comprehensive analytics and insights to optimize your referral strategies."
    },
    {
      icon: <ArrowRight className="h-5 w-5 text-accent" />,
      title: "No cap on earnings",
      description: "Unlimited earning potential with our tiered commission structure."
    }
  ];

  const commissionTiers = [
    { tier: "Tier 1", description: "Starting Level", percentage: "10%" },
    { tier: "Tier 2", description: "After 50 referrals", percentage: "15%" },
    { tier: "Tier 3", description: "After 200 referrals", percentage: "20%" }
  ];

  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              Affiliate <span className="text-accent neon-text-accent">Program</span>
            </h2>
            <p className="text-[#B8B8D0] max-w-2xl mx-auto">
              Earn commissions by referring new traders to Hybrid Funding. Up to 20% per signup. Weekly payouts.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div 
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="glassmorphism rounded-xl p-8">
                <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-6">Program Features</h3>
                
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">{feature.title}</h4>
                        <p className="text-[#B8B8D0]">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <Button 
                    variant="neon-filled"
                    size="xl"
                    rounded="full"
                    onClick={() => window.open("https://forms.google.com/affiliate-signup", "_blank")}
                    className="font-['Orbitron'] font-semibold shadow-glow-accent"
                  >
                    APPLY TO JOIN
                  </Button>
                </div>
              </div>
              
              <div className="glassmorphism rounded-xl p-8 mt-8">
                <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-6">Commission Structure</h3>
                
                <div className="space-y-4">
                  {commissionTiers.map((tier, index) => (
                    <motion.div 
                      key={index}
                      className="flex justify-between items-center p-4 border border-accent/20 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index + 0.5 }}
                    >
                      <div>
                        <h4 className="text-white font-semibold">{tier.tier}</h4>
                        <p className="text-[#B8B8D0] text-sm">{tier.description}</p>
                      </div>
                      <div className="text-accent font-['Orbitron'] font-bold text-2xl">{tier.percentage}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* A futuristic dashboard showing affiliate analytics */}
              <div className="glassmorphism rounded-xl overflow-hidden neon-border h-full">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=1200" 
                  alt="Futuristic dashboard interface" 
                  className="w-full h-auto" 
                />
                
                <div className="p-6">
                  <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-4">Affiliate Dashboard</h3>
                  <p className="text-[#B8B8D0] mb-4">Track your performance and earnings in real-time with our advanced affiliate dashboard.</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#0F0F1A]/50 p-4 rounded-lg">
                      <p className="text-[#B8B8D0] text-sm">Monthly Earnings</p>
                      <p className="text-accent font-['Orbitron'] font-bold text-2xl">$8,450</p>
                    </div>
                    
                    <div className="bg-[#0F0F1A]/50 p-4 rounded-lg">
                      <p className="text-[#B8B8D0] text-sm">Total Referrals</p>
                      <p className="text-accent font-['Orbitron'] font-bold text-2xl">142</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Affiliate;
