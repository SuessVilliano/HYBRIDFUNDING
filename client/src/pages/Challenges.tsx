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
        { tier: "5K", price: 48, profitTarget: 10, maxDrawdown: 6, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 88, profitTarget: 10, maxDrawdown: 6, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 228, profitTarget: 10, maxDrawdown: 6, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 428, profitTarget: 10, maxDrawdown: 6, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 858, profitTarget: 10, maxDrawdown: 6, label: "Professional", bestValue: false, delay: 4 },
        { tier: "200K", price: 1738, profitTarget: 10, maxDrawdown: 6, label: "Expert", bestValue: false, delay: 5 },
        { tier: "250K", price: 2128, profitTarget: 10, maxDrawdown: 6, label: "Elite", bestValue: false, delay: 6 },
        { tier: "500K", price: 4828, profitTarget: 10, maxDrawdown: 6, label: "Master", bestValue: false, delay: 7 }
      ],
      "two-step": [
        { tier: "5K", price: 68, profitTarget: 10, maxDrawdown: 8, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 118, profitTarget: 10, maxDrawdown: 8, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 268, profitTarget: 10, maxDrawdown: 8, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 508, profitTarget: 10, maxDrawdown: 8, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 1028, profitTarget: 10, maxDrawdown: 8, label: "Professional", bestValue: false, delay: 4 },
        { tier: "200K", price: 1828, profitTarget: 10, maxDrawdown: 8, label: "Expert", bestValue: false, delay: 5 },
        { tier: "250K", price: 2228, profitTarget: 10, maxDrawdown: 8, label: "Elite", bestValue: false, delay: 6 },
        { tier: "500K", price: 4358, profitTarget: 10, maxDrawdown: 8, label: "Master", bestValue: false, delay: 7 }
      ],
      "three-step": [
        { tier: "5K", price: 48, profitTarget: 5, maxDrawdown: 5, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 78, profitTarget: 5, maxDrawdown: 5, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 188, profitTarget: 5, maxDrawdown: 5, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 338, profitTarget: 5, maxDrawdown: 5, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 728, profitTarget: 5, maxDrawdown: 5, label: "Professional", bestValue: false, delay: 4 },
        { tier: "200K", price: 1388, profitTarget: 5, maxDrawdown: 5, label: "Expert", bestValue: false, delay: 5 },
        { tier: "250K", price: 1708, profitTarget: 5, maxDrawdown: 5, label: "Elite", bestValue: false, delay: 6 },
        { tier: "500K", price: 3988, profitTarget: 5, maxDrawdown: 5, label: "Master", bestValue: false, delay: 7 }
      ],
      "instant": [
        { tier: "5K", price: 218, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: false, delay: 0 },
        { tier: "10K", price: 428, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: false, delay: 1 },
        { tier: "25K", price: 1198, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: true, delay: 2 },
        { tier: "50K", price: 2588, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: false, delay: 3 },
        { tier: "100K", price: 5198, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: false, delay: 4 }
      ]
    },
    crypto: {
      "one-step": [
        { tier: "5K", price: 58, profitTarget: 9, maxDrawdown: 6, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 98, profitTarget: 9, maxDrawdown: 6, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 258, profitTarget: 9, maxDrawdown: 6, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 538, profitTarget: 9, maxDrawdown: 6, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 1078, profitTarget: 9, maxDrawdown: 6, label: "Professional", bestValue: false, delay: 4 },
        { tier: "200K", price: 2178, profitTarget: 9, maxDrawdown: 6, label: "Expert", bestValue: false, delay: 5 }
      ],
      "two-step": [
        { tier: "5K", price: 48, profitTarget: 6, maxDrawdown: 9, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 88, profitTarget: 6, maxDrawdown: 9, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 238, profitTarget: 6, maxDrawdown: 9, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 458, profitTarget: 6, maxDrawdown: 9, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 938, profitTarget: 6, maxDrawdown: 9, label: "Professional", bestValue: false, delay: 4 },
        { tier: "200K", price: 2088, profitTarget: 6, maxDrawdown: 9, label: "Expert", bestValue: false, delay: 5 }
      ],
      "three-step": [
        { tier: "5K", price: 38, profitTarget: 5, maxDrawdown: 9, label: "Starter", bestValue: false, delay: 0 },
        { tier: "10K", price: 78, profitTarget: 5, maxDrawdown: 9, label: "Popular", bestValue: false, delay: 1 },
        { tier: "25K", price: 198, profitTarget: 5, maxDrawdown: 9, label: "Recommended", bestValue: true, delay: 2 },
        { tier: "50K", price: 398, profitTarget: 5, maxDrawdown: 9, label: "Advanced", bestValue: false, delay: 3 },
        { tier: "100K", price: 848, profitTarget: 5, maxDrawdown: 9, label: "Professional", bestValue: false, delay: 4 }
      ],
      "instant": [
        { tier: "5K", price: 190, profitTarget: 0, maxDrawdown: 7, label: "Instant", bestValue: false, delay: 0 },
        { tier: "10K", price: 380, profitTarget: 0, maxDrawdown: 7, label: "Instant", bestValue: false, delay: 1 },
        { tier: "25K", price: 950, profitTarget: 0, maxDrawdown: 7, label: "Instant", bestValue: true, delay: 2 },
        { tier: "50K", price: 1900, profitTarget: 0, maxDrawdown: 7, label: "Instant", bestValue: false, delay: 3 }
      ]
    },
    futures: {
      "one-step": [
        { tier: "25K", price: 285, profitTarget: 8, maxDrawdown: 10, label: "Recommended", bestValue: true, delay: 0 },
        { tier: "50K", price: 570, profitTarget: 8, maxDrawdown: 10, label: "Advanced", bestValue: false, delay: 1 },
        { tier: "100K", price: 1085, profitTarget: 8, maxDrawdown: 10, label: "Professional", bestValue: false, delay: 2 },
        { tier: "150K", price: 1735, profitTarget: 8, maxDrawdown: 10, label: "Expert", bestValue: false, delay: 3 }
      ],
      "two-step": [
        { tier: "25K", price: 250, profitTarget: 7, maxDrawdown: 12, label: "Recommended", bestValue: true, delay: 0 },
        { tier: "50K", price: 500, profitTarget: 7, maxDrawdown: 12, label: "Advanced", bestValue: false, delay: 1 },
        { tier: "100K", price: 950, profitTarget: 7, maxDrawdown: 12, label: "Professional", bestValue: false, delay: 2 },
        { tier: "150K", price: 1500, profitTarget: 7, maxDrawdown: 12, label: "Expert", bestValue: false, delay: 3 }
      ],
      "three-step": [
        { tier: "25K", price: 220, profitTarget: 5, maxDrawdown: 15, label: "Recommended", bestValue: true, delay: 0 },
        { tier: "50K", price: 440, profitTarget: 5, maxDrawdown: 15, label: "Advanced", bestValue: false, delay: 1 },
        { tier: "100K", price: 875, profitTarget: 5, maxDrawdown: 15, label: "Professional", bestValue: false, delay: 2 },
        { tier: "150K", price: 1400, profitTarget: 5, maxDrawdown: 15, label: "Expert", bestValue: false, delay: 3 }
      ],
      "instant": [
        { tier: "25K", price: 875, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: true, delay: 0 },
        { tier: "50K", price: 1750, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: false, delay: 1 },
        { tier: "100K", price: 3500, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: false, delay: 2 }
      ]
    }
  };

  // Challenge type descriptions
  const challengeTypeDescriptions = {
    "one-step": "A single phase evaluation with a 10% equity growth target and 6% maximum drawdown. Requires consistent trading discipline and strong risk management.",
    "two-step": "A two-phase evaluation with 10% (Phase 1) and 5% (Phase 2) equity growth targets and 8% maximum drawdown. Provides a more structured path to funding.",
    "three-step": "A three-phase evaluation with 5% equity growth target per phase and 5% maximum drawdown. Designed for methodical traders who prefer smaller, consistent gains.",
    "instant": "Start trading with funded capital immediately. Trading rules apply with 8% maximum drawdown. KYC verification required before withdrawal. Higher entry fee with quicker access to trading."
  };

  // Asset class descriptions
  const assetClassDescriptions = {
    "forex": "Trade major, minor and exotic currency pairs with up to 1:50 leverage. All positions must be closed by Friday 3:45pm EST unless you purchase the weekend holding add-on.",
    "crypto": "Trade Bitcoin, Ethereum and other cryptocurrencies with up to 5:1 leverage for BTC/ETH and 2:1 for others. Trading available 24/7 including weekends.",
    "futures": "Trade indices, commodities, and more with specific leverage ratios per instrument. Our risk management system enforces consistent trading discipline."
  };

  const faqs = [
    {
      question: "How does the evaluation work?",
      answer: "Our evaluation measures your trading discipline and consistency. You need to reach the equity growth target without violating the maximum drawdown and daily loss limits. Each challenge type (1-step, 2-step, 3-step) has specific rules tailored to different trading styles."
    },
    {
      question: "What's the difference between challenge types?",
      answer: "The 1-step program has a 10% equity growth target with 6% maximum drawdown. The 2-step program requires 10% growth in Phase 1 and 5% in Phase 2 with 8% maximum drawdown. The 3-step program has 5% targets per phase with 5% maximum drawdown. Instant funding provides immediate access to trading capital with ongoing risk parameters."
    },
    {
      question: "When can I withdraw gains after funding?",
      answer: "You can request your first withdrawal at any time. Thereafter, you can request withdrawals every 30 days. The minimum withdrawal amount is the greater of $100 or 1% of the account's starting balance. Your maximum drawdown limit locks in at your starting balance after a withdrawal."
    },
    {
      question: "What happens if I violate the rules?",
      answer: "Rule violations are categorized as soft breaches or hard breaches. Soft breaches (like weekend positions) result in position closure but allow continued trading. Hard breaches (maximum drawdown, daily loss limit, or inactivity) will result in account termination. If your funded account is terminated with gains, you'll still receive your share of those gains."
    },
    {
      question: "What trading platforms do you support?",
      answer: "We support DXtrade, MatchTrader and cTrader platforms. Our technology is integrated with these platforms to monitor your trading performance in real-time."
    },
    {
      question: "Do I need to complete KYC verification?",
      answer: "For standard evaluation programs, you must complete KYC verification before receiving your funded account. For Instant Funding, you can begin trading immediately, but must complete KYC verification before requesting any withdrawals."
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
