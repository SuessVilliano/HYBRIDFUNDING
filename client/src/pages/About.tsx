import { motion } from "framer-motion";
import { Check } from "lucide-react";

const About = () => {
  const platforms = [
    { name: "DXTrade", description: "Web-based solution" },
    { name: "Match Trader", description: "Advanced order types" },
    { name: "MT5", description: "Multi-asset platform" },
    { name: "cTrader", description: "For scalpers & algos" }
  ];

  const coreValues = [
    "Integrity in all trader relations",
    "Financial education as a cornerstone",
    "Democratizing access to capital",
    "Community empowerment"
  ];

  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              About <span className="text-accent neon-text-accent">Hybrid Funding</span>
            </h2>
            <p className="text-[#B8B8D0]">Learn about our mission, values, and the team behind Hybrid Funding.</p>
          </motion.div>
          
          <motion.div 
            className="glassmorphism rounded-xl p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* A modern office space with futuristic trading setups */}
              <div className="w-full md:w-1/3">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200" 
                  alt="Modern office building" 
                  className="w-full h-auto rounded-lg shadow-[0_0_8px_rgba(0,255,255,0.3)]" 
                />
              </div>
              
              <div className="w-full md:w-2/3 space-y-6">
                <p className="text-[#B8B8D0] leading-relaxed">
                  Hybrid Funding is based in Delaware and focused on HUBZone and underserved community development. We are operated by real traders and partners who value financial education and performance-based opportunity.
                </p>
                
                <p className="text-[#B8B8D0] leading-relaxed">
                  Our team consists of experienced traders, fintech professionals, and educational experts who understand the challenges of accessing trading capital. We've built Hybrid Funding to provide a fair, transparent, and achievable path to funded trading.
                </p>
                
                <p className="text-[#B8B8D0] leading-relaxed">
                  Founded by Delaware natives and alumni of Caravel Academy, Hybrid Funding combines cutting-edge technology with a deep understanding of what traders need to succeed.
                </p>
                
                <div className="pt-6 border-t border-accent/20">
                  <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-4">Our Core Values</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coreValues.map((value, index) => (
                      <div key={index} className="flex items-start">
                        <div className="mr-3 mt-1">
                          <Check className="h-5 w-5 text-accent" />
                        </div>
                        <p className="text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Platforms Supported */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-4">Platforms We Support</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {platforms.map((platform, index) => (
                <motion.div
                  key={index}
                  className="glassmorphism rounded-xl p-4 text-center transform transition-all duration-300 hover:scale-105"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index + 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="font-['Orbitron'] text-xl font-bold text-accent">{platform.name}</div>
                  <p className="text-[#B8B8D0] text-sm mt-2">{platform.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
