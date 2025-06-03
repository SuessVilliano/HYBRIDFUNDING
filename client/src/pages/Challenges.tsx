import { motion } from "framer-motion";
import { useState } from "react";
import ChallengeCard from "@/components/ChallengeCard";
import AccordionItem from "@/components/AccordionItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const Challenges = () => {
  const [selectedAssetClass, setSelectedAssetClass] = useState("forex");
  const [selectedChallengeType, setSelectedChallengeType] = useState("one-step");

  // Challenge data based on actual Hybrid Funding offerings per documentation
  const challengeData = {
    forex: {
      "one-step": [
        { tier: "5K", price: 48, profitTarget: 10, maxDrawdown: 6, label: "Starter", bestValue: false, delay: 0, hasTrailingDD: true },
        { tier: "10K", price: 88, profitTarget: 10, maxDrawdown: 6, label: "Popular", bestValue: false, delay: 1, hasTrailingDD: true },
        { tier: "25K", price: 228, profitTarget: 10, maxDrawdown: 6, label: "Recommended", bestValue: true, delay: 2, hasTrailingDD: true },
        { tier: "50K", price: 428, profitTarget: 10, maxDrawdown: 6, label: "Advanced", bestValue: false, delay: 3, hasTrailingDD: true },
        { tier: "100K", price: 858, profitTarget: 10, maxDrawdown: 6, label: "Professional", bestValue: false, delay: 4, hasTrailingDD: true }
      ],
      "two-step": [
        { tier: "5K", price: 68, profitTarget: 10, maxDrawdown: 8, label: "Starter", bestValue: false, delay: 0, hasTrailingDD: false },
        { tier: "10K", price: 118, profitTarget: 10, maxDrawdown: 8, label: "Popular", bestValue: false, delay: 1, hasTrailingDD: false },
        { tier: "25K", price: 268, profitTarget: 10, maxDrawdown: 8, label: "Recommended", bestValue: true, delay: 2, hasTrailingDD: false },
        { tier: "50K", price: 508, profitTarget: 10, maxDrawdown: 8, label: "Advanced", bestValue: false, delay: 3, hasTrailingDD: false },
        { tier: "100K", price: 1028, profitTarget: 10, maxDrawdown: 8, label: "Professional", bestValue: false, delay: 4, hasTrailingDD: false }
      ],
      "three-step": [
        { tier: "5K", price: 48, profitTarget: 5, maxDrawdown: 5, label: "Starter", bestValue: false, delay: 0, hasTrailingDD: true },
        { tier: "10K", price: 78, profitTarget: 5, maxDrawdown: 5, label: "Popular", bestValue: false, delay: 1, hasTrailingDD: true },
        { tier: "25K", price: 188, profitTarget: 5, maxDrawdown: 5, label: "Recommended", bestValue: true, delay: 2, hasTrailingDD: true },
        { tier: "50K", price: 338, profitTarget: 5, maxDrawdown: 5, label: "Advanced", bestValue: false, delay: 3, hasTrailingDD: true },
        { tier: "100K", price: 728, profitTarget: 5, maxDrawdown: 5, label: "Professional", bestValue: false, delay: 4, hasTrailingDD: true }
      ],
      "instant": [
        { tier: "5K", price: 218, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: false, delay: 0, hasTrailingDD: true },
        { tier: "10K", price: 428, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: false, delay: 1, hasTrailingDD: true },
        { tier: "25K", price: 1198, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: true, delay: 2, hasTrailingDD: true },
        { tier: "50K", price: 2588, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: false, delay: 3, hasTrailingDD: true },
        { tier: "100K", price: 5198, profitTarget: 0, maxDrawdown: 8, label: "Instant", bestValue: false, delay: 4, hasTrailingDD: true }
      ]
    },
    crypto: {
      "one-step": [
        { tier: "5K", price: 58, profitTarget: 9, maxDrawdown: 6, label: "Starter", bestValue: false, delay: 0, hasTrailingDD: false },
        { tier: "10K", price: 98, profitTarget: 9, maxDrawdown: 6, label: "Popular", bestValue: false, delay: 1, hasTrailingDD: false },
        { tier: "25K", price: 258, profitTarget: 9, maxDrawdown: 6, label: "Recommended", bestValue: true, delay: 2, hasTrailingDD: false },
        { tier: "50K", price: 538, profitTarget: 9, maxDrawdown: 6, label: "Advanced", bestValue: false, delay: 3, hasTrailingDD: false },
        { tier: "100K", price: 1078, profitTarget: 9, maxDrawdown: 6, label: "Professional", bestValue: false, delay: 4, hasTrailingDD: false }
      ],
      "two-step": [
        { tier: "5K", price: 48, profitTarget: 6, maxDrawdown: 9, label: "Starter", bestValue: false, delay: 0, hasTrailingDD: false },
        { tier: "10K", price: 88, profitTarget: 6, maxDrawdown: 9, label: "Popular", bestValue: false, delay: 1, hasTrailingDD: false },
        { tier: "25K", price: 238, profitTarget: 6, maxDrawdown: 9, label: "Recommended", bestValue: true, delay: 2, hasTrailingDD: false },
        { tier: "50K", price: 458, profitTarget: 6, maxDrawdown: 9, label: "Advanced", bestValue: false, delay: 3, hasTrailingDD: false },
        { tier: "100K", price: 938, profitTarget: 6, maxDrawdown: 9, label: "Professional", bestValue: false, delay: 4, hasTrailingDD: false }
      ]
    },
    futures: {
      "one-step": [
        { tier: "25K", price: 298, profitTarget: 9, maxDrawdown: 6, label: "Recommended", bestValue: true, delay: 0, hasTrailingDD: false },
        { tier: "50K", price: 598, profitTarget: 9, maxDrawdown: 6, label: "Advanced", bestValue: false, delay: 1, hasTrailingDD: false },
        { tier: "100K", price: 1098, profitTarget: 9, maxDrawdown: 6, label: "Professional", bestValue: false, delay: 2, hasTrailingDD: false },
        { tier: "150K", price: 1758, profitTarget: 9, maxDrawdown: 6, label: "Expert", bestValue: false, delay: 3, hasTrailingDD: false }
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

  // Common FAQ questions across all asset classes
  const commonFaqs = [
    {
      question: "How does the evaluation work?",
      answer: "Our evaluation measures your trading discipline and consistency. You need to reach the equity growth target without violating the maximum drawdown limits. Each challenge type (1-step, 2-step, 3-step) has specific rules tailored to different trading styles. The specific rules vary by asset class (Forex, Crypto, or Futures)."
    },
    {
      question: "When can I withdraw gains after funding?",
      answer: "You can request your first withdrawal at any time. Thereafter, you can request withdrawals every 30 days. The minimum withdrawal amount is the greater of $100 or 1% of the account's starting balance. Your maximum drawdown limit locks in at your starting balance after a withdrawal."
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

  // Forex specific FAQ questions
  const forexFaqs = [
    {
      question: "What are the specific rules for Forex trading?",
      answer: "For Forex One-Step: 10% profit target with 6% max drawdown. For Two-Step: 10% Phase 1 and 5% Phase 2 with 8% max drawdown and 4% daily loss limit. For Three-Step: 5% profit target per phase with 5% max drawdown. For Instant Funding: 8% max drawdown, 5% daily loss limit, and 80% profit share (can be increased to 90% with add-on)."
    },
    {
      question: "What leverage is available for Forex accounts?",
      answer: "Our Forex accounts offer leverage of 1:20 for One-Step and Three-Step programs, 1:30 for the Two-Step program, and 1:50 for Instant Funding accounts."
    },
    {
      question: "Can I hold Forex positions over the weekend?",
      answer: "All Forex positions must be closed by 3:45 PM EST on Friday. Any open positions will be automatically closed. This is considered a soft breach, and you can continue trading when markets reopen. You can purchase the Weekend Hold add-on (10% additional cost) to hold positions over the weekend."
    },
    {
      question: "What constitutes a lot size in Forex trading?",
      answer: "In Forex trading, 1 lot equals $100,000 notional value."
    }
  ];

  // Crypto specific FAQ questions
  const cryptoFaqs = [
    {
      question: "What are the specific rules for Crypto trading?",
      answer: "For Crypto One-Step: 9% profit target with 6% max drawdown. For Two-Step: 6% profit target in Phase 1 and 9% in Phase 2 with 9% max drawdown for both phases. Both programs have a 3% daily cap limit and 90% profit share after funding."
    },
    {
      question: "What leverage is available for Crypto accounts?",
      answer: "For Crypto trading, leverage is 5:1 for BTC and ETH, and 2:1 for all other cryptocurrencies."
    },
    {
      question: "What is the Daily Cap Limit in Crypto trading?",
      answer: "The Daily Cap Limit is 3% of your starting balance and applies to both upward and downward movements. If your account moves more than 3% in either direction from the previous day's equity, positions will be closed and your account will be locked until the start of the next trading day (5 PM EST)."
    },
    {
      question: "Can I hold Crypto positions over the weekend?",
      answer: "Yes, you can hold cryptocurrency positions over the weekend without any additional add-ons."
    }
  ];

  // Futures specific FAQ questions
  const futuresFaqs = [
    {
      question: "What are the specific rules for Futures trading?",
      answer: "Our Funded Futures Plan has four phases, each with a 9% profit target and 5% maximum trailing loss. There's a 25% consistency requirement to ensure disciplined trading. After completing Phase 4, you move to a Live Funded account with 90% profit split."
    },
    {
      question: "What is the Consistency Requirement in Futures trading?",
      answer: "The 25% consistency requirement means your best trading day's profit cannot exceed 25% of your total profit. This ensures you generate profits consistently rather than through a few lucky trades. For example, with a 25% consistency requirement, you need at least 4 trading days (100% ÷ 25% = 4) to reach your profit target."
    },
    {
      question: "How is the Maximum Trailing Loss calculated for Futures?",
      answer: "The Maximum Trailing Loss trails using End of Day Balance. If your starting balance is $100,000 with a 5% Max Trailing Loss, you can drawdown to $95,000. If your end of day balance increases to $102,000, your new Max Trailing Loss would be $97,000. Once you generate a 5% return, the Max Loss will lock at your starting balance."
    },
    {
      question: "What contract limits apply to Futures trading?",
      answer: "Contract limits vary by account size. For $25K accounts: 1 standard/15 micro contracts. For $50K: 3 standard/30 micro. For $100K: 6 standard/60 micro. For $150K: 9 standard/90 micro contracts."
    },
    {
      question: "What are the payout phases for Futures trading?",
      answer: "Futures trading includes payouts at each phase: Phase 1 ($500 for $25K account), Phase 2 ($750), Phase 3 ($750), and Phase 4 ($1,500). These amounts scale with account size. After Phase 4, you transition to a Live Funded account with the size being a portion of your evaluation account."
    }
  ];

  // Select which FAQs to display based on asset class
  const getFaqsByAssetClass = () => {
    switch(selectedAssetClass) {
      case "forex":
        return [...commonFaqs, ...forexFaqs];
      case "crypto":
        return [...commonFaqs, ...cryptoFaqs];
      case "futures":
        return [...commonFaqs, ...futuresFaqs];
      default:
        return commonFaqs;
    }
  };

  const faqs = getFaqsByAssetClass();

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
