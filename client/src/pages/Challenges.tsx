import { motion } from "framer-motion";
import { useState } from "react";
import ChallengeCard from "@/components/ChallengeCard";
import AccordionItem from "@/components/AccordionItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Challenges = () => {
  const [selectedAssetClass, setSelectedAssetClass] = useState("forex");
  const [selectedChallengeType, setSelectedChallengeType] = useState("one-step");

  // Challenge data for different asset classes and challenge types
  const challengeData = {
    forex: {
      "one-step": [
        { tier: "5K", price: 49, profitTarget: 8, maxDrawdown: 8, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 89, profitTarget: 8, maxDrawdown: 8, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 139, profitTarget: 8, maxDrawdown: 8, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 199, profitTarget: 8, maxDrawdown: 8, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 299, profitTarget: 8, maxDrawdown: 8, label: "Professional", bestValue: false, delay: 4 },
        { tier: "200K", price: 499, profitTarget: 8, maxDrawdown: 8, label: "Expert", bestValue: false, delay: 5 }
      ],
      "two-step": [
        { tier: "5K", price: 59, profitTarget: 6, maxDrawdown: 10, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 99, profitTarget: 6, maxDrawdown: 10, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 149, profitTarget: 6, maxDrawdown: 10, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 209, profitTarget: 6, maxDrawdown: 10, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 309, profitTarget: 6, maxDrawdown: 10, label: "Professional", bestValue: false, delay: 4 },
        { tier: "200K", price: 519, profitTarget: 6, maxDrawdown: 10, label: "Expert", bestValue: false, delay: 5 }
      ],
      "three-step": [
        { tier: "5K", price: 69, profitTarget: 4, maxDrawdown: 12, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 109, profitTarget: 4, maxDrawdown: 12, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 159, profitTarget: 4, maxDrawdown: 12, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 219, profitTarget: 4, maxDrawdown: 12, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 329, profitTarget: 4, maxDrawdown: 12, label: "Professional", bestValue: false, delay: 4 }
      ],
      "instant": [
        { tier: "5K", price: 119, profitTarget: 0, maxDrawdown: 5, label: "Instant", bestValue: false, delay: 0 },
        { tier: "10K", price: 189, profitTarget: 0, maxDrawdown: 5, label: "Instant", bestValue: false, delay: 1 },
        { tier: "25K", price: 289, profitTarget: 0, maxDrawdown: 5, label: "Instant", bestValue: true, delay: 2 },
        { tier: "50K", price: 389, profitTarget: 0, maxDrawdown: 5, label: "Instant", bestValue: false, delay: 3 }
      ]
    },
    crypto: {
      "one-step": [
        { tier: "5K", price: 59, profitTarget: 10, maxDrawdown: 10, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 99, profitTarget: 10, maxDrawdown: 10, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 149, profitTarget: 10, maxDrawdown: 10, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 219, profitTarget: 10, maxDrawdown: 10, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 329, profitTarget: 10, maxDrawdown: 10, label: "Professional", bestValue: false, delay: 4 }
      ],
      "two-step": [
        { tier: "5K", price: 69, profitTarget: 7, maxDrawdown: 12, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 109, profitTarget: 7, maxDrawdown: 12, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 159, profitTarget: 7, maxDrawdown: 12, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 229, profitTarget: 7, maxDrawdown: 12, label: "Advanced", bestValue: false, delay: 3 }
      ],
      "three-step": [
        { tier: "5K", price: 79, profitTarget: 5, maxDrawdown: 15, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 129, profitTarget: 5, maxDrawdown: 15, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 179, profitTarget: 5, maxDrawdown: 15, label: "Recommended", bestValue: true, delay: 2 }
      ],
      "instant": [
        { tier: "5K", price: 129, profitTarget: 0, maxDrawdown: 7, label: "Instant", bestValue: false, delay: 0 },
        { tier: "10K", price: 199, profitTarget: 0, maxDrawdown: 7, label: "Instant", bestValue: false, delay: 1 },
        { tier: "25K", price: 299, profitTarget: 0, maxDrawdown: 7, label: "Instant", bestValue: true, delay: 2 }
      ]
    },
    futures: {
      "one-step": [
        { tier: "5K", price: 54, profitTarget: 9, maxDrawdown: 9, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 94, profitTarget: 9, maxDrawdown: 9, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 144, profitTarget: 9, maxDrawdown: 9, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 209, profitTarget: 9, maxDrawdown: 9, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 309, profitTarget: 9, maxDrawdown: 9, label: "Professional", bestValue: false, delay: 4 },
        { tier: "200K", price: 509, profitTarget: 9, maxDrawdown: 9, label: "Expert", bestValue: false, delay: 5 }
      ],
      "two-step": [
        { tier: "5K", price: 64, profitTarget: 6.5, maxDrawdown: 11, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 104, profitTarget: 6.5, maxDrawdown: 11, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 154, profitTarget: 6.5, maxDrawdown: 11, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 219, profitTarget: 6.5, maxDrawdown: 11, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 319, profitTarget: 6.5, maxDrawdown: 11, label: "Professional", bestValue: false, delay: 4 }
      ],
      "three-step": [
        { tier: "5K", price: 74, profitTarget: 4.5, maxDrawdown: 13, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 114, profitTarget: 4.5, maxDrawdown: 13, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 164, profitTarget: 4.5, maxDrawdown: 13, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 229, profitTarget: 4.5, maxDrawdown: 13, label: "Advanced", bestValue: false, delay: 3 }
      ],
      "instant": [
        { tier: "5K", price: 124, profitTarget: 0, maxDrawdown: 6, label: "Instant", bestValue: false, delay: 0 },
        { tier: "10K", price: 194, profitTarget: 0, maxDrawdown: 6, label: "Instant", bestValue: false, delay: 1 },
        { tier: "25K", price: 294, profitTarget: 0, maxDrawdown: 6, label: "Instant", bestValue: true, delay: 2 }
      ]
    }
  };

  // Challenge type descriptions
  const challengeTypeDescriptions = {
    "one-step": "Complete a single phase evaluation with higher profit targets and tighter risk controls. Best for experienced traders.",
    "two-step": "A balanced two-phase evaluation with moderate targets and slightly relaxed drawdown limits. Popular option for most traders.",
    "three-step": "Three-phase evaluation with lower profit targets per phase and more flexible drawdown limits. Great for developing traders.",
    "instant": "Skip the evaluation and get funded instantly. Higher entry fee but immediate access to capital. Trading rules still apply post-funding."
  };

  // Asset class descriptions
  const assetClassDescriptions = {
    "forex": "Trade major, minor and exotic currency pairs with flexible lot sizes and competitive spreads.",
    "crypto": "Trade popular cryptocurrencies with leverage in a regulated environment.",
    "futures": "Trade futures contracts across indices, commodities, and more."
  };

  const faqs = [
    {
      question: "How does the evaluation work?",
      answer: "Our evaluation measures your trading discipline, consistency, and profitability over a set period. You need to reach the profit target without violating the maximum drawdown rules. Different challenge types (1-step, 2-step, 3-step) offer varying levels of difficulty and flexibility."
    },
    {
      question: "What's the difference between challenge types?",
      answer: "1-step challenges have a single phase with higher profit targets. 2-step and 3-step challenges break the evaluation into multiple phases with lower targets per phase, but the same overall objective. Instant funding skips the evaluation but comes with a higher entry fee."
    },
    {
      question: "When do I get paid after passing?",
      answer: "After passing the evaluation, you become eligible for your first payout 30 days later. Subsequent payouts occur bi-weekly."
    },
    {
      question: "What happens if I violate the rules?",
      answer: "If you violate the maximum drawdown or other rules during evaluation, your challenge will be terminated. In the funded phase, rule violations may result in account suspension or closure."
    },
    {
      question: "What trading platforms do you support?",
      answer: "We support multiple platforms including DXTrade, Match Trader, MetaTrader 5 (MT5), and cTrader to give you flexibility in your trading approach."
    }
  ];

  // Get current challenges based on selections
  const currentChallenges = challengeData[selectedAssetClass as keyof typeof challengeData][selectedChallengeType as keyof typeof challengeData[typeof selectedAssetClass]];

  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your <span className="text-accent neon-text-accent">Challenge</span>
          </h2>
          <p className="text-[#B8B8D0] max-w-2xl mx-auto">
            Select the perfect funding challenge based on your asset class, experience level and capital requirements.
          </p>
        </motion.div>

        {/* Asset Class Selector */}
        <motion.div
          className="glassmorphism rounded-xl p-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-4 text-center">
            Select Asset Class
          </h3>
          
          <Tabs 
            defaultValue="forex" 
            className="w-full" 
            onValueChange={(value) => setSelectedAssetClass(value)}
          >
            <TabsList className="grid w-full grid-cols-3 bg-[#0F0F1A] border border-accent/30 py-2">
              <TabsTrigger value="forex" className="font-['Orbitron']">FOREX</TabsTrigger>
              <TabsTrigger value="crypto" className="font-['Orbitron']">CRYPTO</TabsTrigger>
              <TabsTrigger value="futures" className="font-['Orbitron']">FUTURES</TabsTrigger>
            </TabsList>
            
            <TabsContent value="forex" className="mt-4">
              <p className="text-[#B8B8D0]">{assetClassDescriptions.forex}</p>
            </TabsContent>
            <TabsContent value="crypto" className="mt-4">
              <p className="text-[#B8B8D0]">{assetClassDescriptions.crypto}</p>
            </TabsContent>
            <TabsContent value="futures" className="mt-4">
              <p className="text-[#B8B8D0]">{assetClassDescriptions.futures}</p>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Challenge Type Selector */}
        <motion.div
          className="glassmorphism rounded-xl p-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-4 text-center">
            Select Challenge Type
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.keys(challengeData[selectedAssetClass as keyof typeof challengeData]).map((type) => (
              <motion.div 
                key={type}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  variant={selectedChallengeType === type ? "neon-filled" : "neon"}
                  className="w-full font-['Orbitron'] font-semibold"
                  onClick={() => setSelectedChallengeType(type)}
                >
                  {type === "one-step" ? "1-STEP" : 
                   type === "two-step" ? "2-STEP" : 
                   type === "three-step" ? "3-STEP" : "INSTANT FUNDING"}
                </Button>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4">
            <p className="text-[#B8B8D0]">{challengeTypeDescriptions[selectedChallengeType as keyof typeof challengeTypeDescriptions]}</p>
          </div>
        </motion.div>
        
        {/* Challenge Cards */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-6 text-center">
            Available Challenges
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentChallenges.map((challenge: any) => (
              <ChallengeCard
                key={`${selectedAssetClass}-${selectedChallengeType}-${challenge.tier}`}
                tier={challenge.tier}
                price={challenge.price}
                profitTarget={challenge.profitTarget}
                maxDrawdown={challenge.maxDrawdown}
                label={challenge.label}
                bestValue={challenge.bestValue}
                delay={challenge.delay}
                assetClass={selectedAssetClass}
                challengeType={selectedChallengeType}
              />
            ))}
          </div>
        </motion.div>
        
        {/* FAQ Section */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white text-center mb-10">
            Frequently Asked Questions
          </h3>
          
          <div className="glassmorphism rounded-xl p-6 max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Challenges;
