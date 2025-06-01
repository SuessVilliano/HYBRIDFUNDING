import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Target, Users, Star, Award, Gift, Crown } from "lucide-react";

const Battles: React.FC = () => {
  return (
    <Layout>
      <div className="page-transition">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center cyberpunk-bg overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
              alt="Trading battle arena background" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="absolute inset-0 grid-pattern opacity-20"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="font-['Orbitron'] text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-white">Join the </span>
                  <span className="text-primary neon-text-primary">Battle.</span><br />
                  <span className="text-accent neon-text-accent">Prove </span>
                  <span className="text-white">You're the Best.</span><br />
                  <span className="text-primary neon-text-primary">Get Funded.</span>
                </h1>
                
                <p className="text-[#B8B8D0] text-lg md:text-xl max-w-3xl mx-auto mb-8">
                  Welcome to <span className="text-accent font-bold">TradeHouse Battles</span> — the ultimate competitive trading arena built for serious traders. Compete in real-time tournaments, climb leaderboards, and win exclusive prizes including funded accounts worth up to $100,000+.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    variant="neon-filled" 
                    size="xl" 
                    rounded="full"
                    className="font-['Orbitron'] shadow-glow-primary"
                    onClick={() => document.getElementById('battles-arena')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Trophy className="mr-2 h-5 w-5" />
                    START BATTLING NOW
                  </Button>
                  
                  <Link href="/challenges">
                    <Button 
                      variant="neon" 
                      size="xl" 
                      rounded="full"
                      className="font-['Orbitron']"
                    >
                      Get Funded First
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-[#0B1426]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
                How <span className="text-accent neon-text-accent">Battles</span> Work
              </h2>
              <p className="text-[#B8B8D0] max-w-2xl mx-auto">
                Every battle is more than just a game — it's your shot at turning skill into capital.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glassmorphism rounded-xl p-6 text-center"
              >
                <Target className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-3">1. Choose Your Challenge</h3>
                <p className="text-[#B8B8D0]">
                  Select from daily, weekly, or seasonal trading tournaments. Each battle tests different skills and strategies.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glassmorphism rounded-xl p-6 text-center"
              >
                <Zap className="h-16 w-16 text-accent mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-3">2. Trade Live or Sim</h3>
                <p className="text-[#B8B8D0]">
                  Earn points based on performance, discipline, and risk management. Show your edge in real market conditions.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glassmorphism rounded-xl p-6 text-center"
              >
                <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-3">3. Win Exclusive Rewards</h3>
                <p className="text-[#B8B8D0]">
                  Top traders earn funded accounts, coaching sessions, automation tools, and get featured as elite traders.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Rewards Section */}
        <section className="py-20 bg-gradient-to-br from-[#1A1A2E] to-[#0B1426]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
                Win These <span className="text-primary neon-text-primary">Exclusive</span> Rewards
              </h2>
              <p className="text-[#B8B8D0] max-w-2xl mx-auto">
                Only Hybrid Funding traders can access premium prize pools and VIP challenges.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glassmorphism rounded-xl p-6 text-center border border-primary/30"
              >
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">Instant Funding</h3>
                <p className="text-[#B8B8D0] text-sm mb-3">
                  Win funded accounts up to $100,000+ for top performers
                </p>
                <div className="text-primary font-bold">$100,000+</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glassmorphism rounded-xl p-6 text-center border border-accent/30"
              >
                <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">Private Coaching</h3>
                <p className="text-[#B8B8D0] text-sm mb-3">
                  1-on-1 mentorship sessions with elite traders
                </p>
                <div className="text-accent font-bold">VIP Access</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glassmorphism rounded-xl p-6 text-center border border-primary/30"
              >
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">AI Trading Tools</h3>
                <p className="text-[#B8B8D0] text-sm mb-3">
                  Access to exclusive automation bots and strategies
                </p>
                <div className="text-primary font-bold">Premium</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glassmorphism rounded-xl p-6 text-center border border-accent/30"
              >
                <Star className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-white font-bold mb-2">Elite Status</h3>
                <p className="text-[#B8B8D0] text-sm mb-3">
                  Get featured as a top trader with merch and marketing
                </p>
                <div className="text-accent font-bold">Spotlight</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Launch Battles Arena */}
        <section id="battles-arena" className="py-20 bg-[#0B1426]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
                <span className="text-accent neon-text-accent">Live</span> Trading Arena
              </h2>
              <p className="text-[#B8B8D0] max-w-2xl mx-auto">
                Enter the battlefield and compete against traders worldwide in real-time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glassmorphism rounded-xl overflow-hidden max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-6 text-center border-b border-white/10">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Crown className="h-8 w-8 text-accent" />
                  <h3 className="text-white font-['Orbitron'] font-bold text-2xl">TRADEHOUSE BATTLES</h3>
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <p className="text-[#B8B8D0] mb-6">
                  Experience the full arena on our dedicated platform with enhanced performance and all features unlocked.
                </p>
              </div>
              
              <div className="p-12 text-center">
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <Trophy className="h-12 w-12 text-white" />
                  </div>
                  <h4 className="text-white font-bold text-xl mb-4">Ready to Battle?</h4>
                  <p className="text-[#B8B8D0] mb-8">
                    Click below to launch the full TradeHouse Battles platform and start competing for exclusive rewards.
                  </p>
                </div>

                <Button 
                  variant="neon-filled" 
                  size="xl" 
                  rounded="full"
                  className="font-['Orbitron'] shadow-glow-primary mb-4"
                  onClick={() => window.open('https://battles.hybridfunding.co', '_blank', 'noopener,noreferrer')}
                >
                  <Zap className="mr-2 h-6 w-6" />
                  LAUNCH BATTLES ARENA
                  <Trophy className="ml-2 h-6 w-6" />
                </Button>

                <p className="text-[#B8B8D0] text-sm">
                  Opens in a new window for the best experience
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to <span className="text-primary neon-text-primary">Dominate</span> the Arena?
              </h2>
              <p className="text-[#B8B8D0] text-lg max-w-2xl mx-auto mb-8">
                Join Hybrid Funding now to unlock full access to premium battles, exclusive rewards, and VIP challenges. 
                Turn your trading skills into real capital.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/challenges">
                  <a>
                    <Button 
                      variant="neon-filled" 
                      size="xl" 
                      rounded="full"
                      className="font-['Orbitron'] shadow-glow-primary"
                    >
                      <Gift className="mr-2 h-5 w-5" />
                      START YOUR CHALLENGE
                    </Button>
                  </a>
                </Link>
                
                <Link href="/contact">
                  <a>
                    <Button 
                      variant="neon" 
                      size="xl" 
                      rounded="full"
                      className="font-['Orbitron']"
                    >
                      Learn More
                    </Button>
                  </a>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Battles;