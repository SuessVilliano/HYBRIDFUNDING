import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import { Zap, CheckCircle, Users, DollarSign, Calendar, BarChart3, BookOpen, Newspaper, Star, Quote, Trophy, Crown } from "lucide-react";

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

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-[#0B1426] to-[#1A1A2E]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              What Our <span className="text-accent neon-text-accent">Traders</span> Are Saying
            </h2>
            <p className="text-[#B8B8D0] max-w-2xl mx-auto">
              Real success stories from traders who've transformed their careers with Hybrid Funding.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 - Forex Trader */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glassmorphism rounded-xl p-6 relative"
            >
              <Quote className="absolute top-4 left-4 h-8 w-8 text-accent opacity-30" />
              <div className="pt-8">
                <p className="text-[#B8B8D0] mb-6 italic">
                  "Passing the Hybrid Funding 2-Step Challenge changed everything for me. I scaled to a $100K funded account in under 30 days, and within my first payout window, I made $8,400. Their support team, rule transparency, and roadmap to funding gave me total confidence to go full-time."
                </p>
                <div className="flex items-center space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-accent fill-current" />
                  ))}
                </div>
                <div className="border-t border-accent/20 pt-4">
                  <p className="text-white font-semibold">Malik T.</p>
                  <p className="text-[#B8B8D0] text-sm">Atlanta, GA | Full-Time Forex Trader</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 2 - Futures Trader */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glassmorphism rounded-xl p-6 relative"
            >
              <Quote className="absolute top-4 left-4 h-8 w-8 text-accent opacity-30" />
              <div className="pt-8">
                <p className="text-[#B8B8D0] mb-6 italic">
                  "The futures challenge was straightforward, and I loved the phase payouts. I got paid $2,500 during Phase 3 and eventually graduated to a $250K funded account. This model helped me go from trading small to managing real capital."
                </p>
                <div className="flex items-center space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-accent fill-current" />
                  ))}
                </div>
                <div className="border-t border-accent/20 pt-4">
                  <p className="text-white font-semibold">Alicia R.</p>
                  <p className="text-[#B8B8D0] text-sm">Chicago, IL | Funded Futures Trader</p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial 3 - Crypto Trader */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glassmorphism rounded-xl p-6 relative"
            >
              <Quote className="absolute top-4 left-4 h-8 w-8 text-accent opacity-30" />
              <div className="pt-8">
                <p className="text-[#B8B8D0] mb-6 italic">
                  "I chose Hybrid's Instant Funding model and was live the same day. I hit my first $5K withdrawal after just 12 trading days. It's rare to find a prop firm with this level of speed and trust."
                </p>
                <div className="flex items-center space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-accent fill-current" />
                  ))}
                </div>
                <div className="border-t border-accent/20 pt-4">
                  <p className="text-white font-semibold">Devonte L.</p>
                  <p className="text-[#B8B8D0] text-sm">Miami, FL | Crypto Day Trader</p>
                </div>
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Economic Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glassmorphism rounded-xl p-6 text-center"
            >
              <Calendar className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-white font-bold mb-3">Real-Time Economic Calendar</h3>
              <p className="text-[#B8B8D0] text-sm">
                Stay ahead of market-moving events with trade-impacting alerts and economic data releases.
              </p>
            </motion.div>

            {/* Performance Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glassmorphism rounded-xl p-6 text-center"
            >
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-white font-bold mb-3">Performance Dashboards</h3>
              <p className="text-[#B8B8D0] text-sm">
                Track your P&L, drawdown, win rate, and consistency metrics in real-time with detailed analytics.
              </p>
            </motion.div>

            {/* Trade Journal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glassmorphism rounded-xl p-6 text-center"
            >
              <BookOpen className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-white font-bold mb-3">Integrated Trade Journals</h3>
              <p className="text-[#B8B8D0] text-sm">
                Analyze and refine your trading edge with built-in journaling tools and performance insights.
              </p>
            </motion.div>

            {/* News Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glassmorphism rounded-xl p-6 text-center"
            >
              <Newspaper className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-white font-bold mb-3">Market News Feed</h3>
              <p className="text-[#B8B8D0] text-sm">
                Keep updated on what moves the market with curated news and analysis from trusted sources.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <Link href="/trader-portal">
              <a>
                <Button 
                  variant="neon" 
                  size="lg" 
                  rounded="full"
                  className="font-['Orbitron'] font-semibold"
                >
                  Explore Tools
                </Button>
              </a>
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
                <a>
                  <Button 
                    variant="neon-filled" 
                    size="xl" 
                    rounded="full"
                    className="font-['Orbitron'] shadow-glow-accent"
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    JOIN THE BATTLE
                  </Button>
                </a>
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
    </div>
  );
};

export default Home;
