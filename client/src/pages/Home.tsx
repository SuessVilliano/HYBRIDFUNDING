import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import A2PCompliantOptInForm from "@/components/A2PCompliantOptInForm";
import SEO from "@/components/SEO";
import SocialProof from "@/components/SocialProof";
import { organizationSchema, websiteSchema } from "@/lib/jsonLd";
import { Zap, CheckCircle, Users, DollarSign, Calendar, BarChart3, BookOpen, Newspaper, Star, Quote, Trophy, Crown } from "lucide-react";

const Home = () => {
  return (
    <div className="page-transition">
      <SEO
        title="Hybrid Funding — Get Funded for Forex, Crypto, Futures & Single Session Equities"
        description="Hybrid Funding is a modern prop firm. Pass our evaluation, trade firm capital, and keep up to 90% of your profits across Forex, Crypto, Futures and Single Session Equities."
        path="/"
        jsonLd={[organizationSchema, websiteSchema]}
      />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center cyberpunk-bg overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
            alt="Hybrid Funding cyberpunk trading background"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
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
                <Button 
                  variant="neon-filled" 
                  size="xl" 
                  rounded="full"
                  className="font-['Orbitron'] shadow-glow-accent"
                >
                  CHOOSE YOUR CHALLENGE
                </Button>
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
                  alt="Hybrid Funding trading dashboard preview showing profit target and drawdown metrics"
                  className="w-full h-auto rounded-xl"
                  loading="lazy"
                  decoding="async"
                  width="800"
                  height="600"
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



      <SocialProof />

      {/* A2P Compliant Opt-In Form Section */}
      <section className="py-20 bg-gradient-to-b from-[#0B1426] to-[#1A1A2E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <A2PCompliantOptInForm showResourceLinks={true} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trading Tools Section */}
      <section className="py-20 bg-[#0B1426]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              Built-In Tools to Help You <span className="text-primary neon-text-primary">Win</span>
            </h2>
            <p className="text-[#B8B8D0] max-w-3xl mx-auto mb-8">
              At Hybrid Funding, we believe serious traders deserve serious tools. Every trader gains access to professional-grade tools built directly into your trading experience—so you can focus on execution, not admin.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Calendar,
                color: "text-accent",
                title: "Real-Time Economic Calendar",
                desc: "Stay ahead of market-moving events with trade-impacting alerts and economic data releases.",
              },
              {
                icon: BarChart3,
                color: "text-primary",
                title: "Performance Dashboards",
                desc: "Track your P&L, drawdown, win rate, and consistency metrics in real-time with detailed analytics.",
              },
              {
                icon: DollarSign,
                color: "text-accent",
                title: "Live Drawdown Tracker",
                desc: "Always know exactly where your trailing max drawdown sits — never breach by surprise.",
              },
              {
                icon: BookOpen,
                color: "text-primary",
                title: "Trade Journal & Replay",
                desc: "Auto-capture every trade with chart context, tags, and notes. Review what worked and what didn't.",
              },
              {
                icon: Newspaper,
                color: "text-accent",
                title: "AI Trade Insights",
                desc: "Pattern detection, consistency scoring, and personalized coaching from our AI trade agent.",
              },
              {
                icon: Zap,
                color: "text-primary",
                title: "Multi-Platform Access",
                desc: "Trade on MatchTrader, DXtrade, cTrader, Tradovate, Volumetrica, DXtrade Futures, and GooeyPro.",
              },
            ].map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="glassmorphism rounded-xl p-6"
                >
                  <Icon className={`h-10 w-10 ${t.color} mb-3`} />
                  <h3 className="text-white font-bold mb-2">{t.title}</h3>
                  <p className="text-[#B8B8D0] text-sm">{t.desc}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/challenges">
              <Button
                variant="neon-filled"
                size="lg"
                rounded="full"
                className="font-['Orbitron'] font-semibold"
              >
                Start a Challenge
              </Button>
            </Link>
            <Link href="/playbook">
              <Button
                variant="neon"
                size="lg"
                rounded="full"
                className="font-['Orbitron'] font-semibold"
              >
                Get the Free Playbook
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* TradeHouse Battles Highlight */}
      <section className="py-20 bg-gradient-to-r from-primary/20 via-[#1A1A2E] to-accent/20 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 mb-10 lg:mb-0"
            >
              <div className="flex items-center mb-4">
                <Crown className="h-8 w-8 text-accent mr-3" />
                <span className="text-accent font-['Orbitron'] font-bold text-sm tracking-wider">NEW FEATURE</span>
              </div>
              
              <h2 className="font-['Orbitron'] text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                <span className="text-white">Enter the </span>
                <span className="text-primary neon-text-primary">Battle</span><br />
                <span className="text-accent neon-text-accent">Arena</span>
              </h2>
              
              <p className="text-[#B8B8D0] text-lg mb-6">
                Compete against traders worldwide in real-time tournaments. Climb leaderboards, win exclusive prizes, 
                and earn funded accounts worth up to $100,000+. Every battle is your shot at proving you're elite.
              </p>
              
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-white text-sm">Live Tournaments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-accent" />
                  <span className="text-white text-sm">Exclusive Rewards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-white text-sm">Global Leaderboards</span>
                </div>
              </div>
              
              <Link href="/battles">
                <Button 
                  variant="neon-filled" 
                  size="xl" 
                  rounded="full"
                  className="font-['Orbitron'] shadow-glow-accent"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  JOIN THE BATTLE
                </Button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-1/2"
            >
              <div className="glassmorphism rounded-xl p-6 relative">
                <div className="bg-gradient-to-r from-primary/30 to-accent/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-['Orbitron'] font-bold">LIVE BATTLE</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                      <span className="text-accent text-sm">LIVE</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded p-3 text-center">
                      <p className="text-accent text-xs mb-1">TOP TRADER</p>
                      <p className="text-white font-bold">+$12,500</p>
                      <p className="text-[#B8B8D0] text-xs">Alex_Trader</p>
                    </div>
                    <div className="bg-black/30 rounded p-3 text-center">
                      <p className="text-primary text-xs mb-1">PRIZE POOL</p>
                      <p className="text-white font-bold">$50K Fund</p>
                      <p className="text-[#B8B8D0] text-xs">147 Traders</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-accent" />
                    <span className="text-white">24 Active Battles</span>
                  </div>
                  <div className="h-4 w-px bg-white/20"></div>
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <span className="text-white">Elite Rewards</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
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

      {/* Disclaimer Section */}
      <section className="py-12 bg-[#0F0F1A]/80 border-t border-accent/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-6 text-center">
              Important Disclaimer
            </h3>
            <div className="glassmorphism rounded-xl p-6">
              <p className="text-[#B8B8D0] text-sm leading-relaxed text-center">
                <strong className="text-white">DISCLAIMER:</strong> Hybrid Funding is an affiliate of Prop Account, LLC. All funding assessments are provided by Prop Account, LLC and all assessment fees are paid to Prop Account, LLC. If you qualify for a Funded Account, you will be required to enter into a Trader Agreement with Prop Account LC. Neither Prop Account, LLC nor Prop Account LC provides any trading education or other services. All such services are provided by Hybrid Funding. For complete terms and conditions, please visit our{" "}
                <a 
                  href="https://dashboardanalytix.com/client-terms-and-policies/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:text-primary transition-colors underline"
                >
                  Terms and Conditions
                </a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
