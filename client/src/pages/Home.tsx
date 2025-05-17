import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import { Zap, CheckCircle, Users, DollarSign } from "lucide-react";

const Home = () => {
  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center cyberpunk-bg overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
            alt="Cyberpunk digital background" 
            className="w-full h-full object-cover" 
          />
        </div>
        
        {/* Grid overlay for cyberpunk effect */}
        <div className="absolute inset-0 grid-pattern opacity-20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <motion.div 
              className="w-full lg:w-1/2 mb-10 lg:mb-0"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-['Orbitron'] text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                <span className="text-white">Empowering </span>
                <span className="text-accent neon-text-accent">Traders.</span><br />
                <span className="text-primary neon-text-primary">Funding </span>
                <span className="text-white">Potential.</span>
              </h1>
              
              <p className="text-[#B8B8D0] text-lg md:text-xl max-w-lg mb-8">
                Hybrid Funding is a modern prop firm built by traders, for traders. Our mission is to fund talent and democratize capital access.
              </p>
              
              <Link href="/challenges">
                <a>
                  <Button 
                    variant="neon-filled" 
                    size="xl" 
                    rounded="full"
                    className="font-['Orbitron'] shadow-glow-accent"
                  >
                    CHOOSE YOUR CHALLENGE
                  </Button>
                </a>
              </Link>
            </motion.div>
            
            <motion.div 
              className="w-full lg:w-1/2 flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* A futuristic 3D visualization of trading data with neon highlights */}
              <div className="glassmorphism rounded-xl relative overflow-hidden w-full max-w-lg neon-border">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Futuristic trading dashboard" 
                  className="w-full h-auto rounded-xl" 
                />
                
                <div className="absolute bottom-0 left-0 right-0 glassmorphism p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-accent font-['Orbitron']">PROFIT TARGET</p>
                      <p className="text-white font-bold text-2xl">+8%</p>
                    </div>
                    <div className="h-12 w-px bg-accent/30"></div>
                    <div>
                      <p className="text-accent font-['Orbitron']">MAX DRAWDOWN</p>
                      <p className="text-white font-bold text-2xl">-5%</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Animated arrow for scrolling */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Zap className="h-10 w-10 text-accent" />
        </motion.div>
      </section>
      
      {/* Features Summary */}
      <section className="py-20 bg-[#1A1A2E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              Our Platform <span className="text-accent neon-text-accent">Features</span>
            </h2>
            <p className="text-[#B8B8D0] max-w-2xl mx-auto">
              Experience the next generation of prop trading with our innovative platform features designed for trader success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Zap}
              title="Fast Funding"
              description="Pass our challenge and get funded quickly with no delays or complicated processes."
              delay={0}
            />
            
            <FeatureCard 
              icon={CheckCircle}
              title="Fair Rules"
              description="Our evaluation rules are designed to be fair and achievable for disciplined traders."
              delay={1}
            />
            
            <FeatureCard 
              icon={Users}
              title="Affiliate Opportunities"
              description="Earn significant commissions by referring new traders to our platform."
              delay={2}
            />
            
            <FeatureCard 
              icon={DollarSign}
              title="Community Empowerment"
              description="Join a supportive community of traders on the path to financial freedom."
              delay={3}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
