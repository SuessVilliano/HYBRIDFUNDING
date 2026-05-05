import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ChallengeCard from "@/components/ChallengeCard";
import AccordionItem from "@/components/AccordionItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { breadcrumbSchema, faqPageSchema, productSchema } from "@/lib/jsonLd";

const Challenges = () => {
  const [selectedAssetClass, setSelectedAssetClass] = useState("forex");
  const [selectedChallengeType, setSelectedChallengeType] = useState("one-step");

  // Auto-redirect to first available challenge type when asset class changes
  useEffect(() => {
    const assetData = (challengeData as any)[selectedAssetClass];
    if (assetData) {
      const availableTypes = ["one-step", "two-step", "three-step", "four-phase", "instant", "instant-lite"].filter(
        type => assetData[type] && assetData[type].length > 0
      );
      if (availableTypes.length > 0 && !availableTypes.includes(selectedChallengeType)) {
        setSelectedChallengeType(availableTypes[0]);
      }
    }
  }, [selectedAssetClass, selectedChallengeType]);

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
      ],
      "instant-lite": [
        { tier: "5K", price: 70, profitTarget: 0, maxDrawdown: 5, label: "IF Lite", bestValue: false, delay: 0, hasTrailingDD: true },
        { tier: "10K", price: 120, profitTarget: 0, maxDrawdown: 5, label: "IF Lite", bestValue: false, delay: 1, hasTrailingDD: true },
        { tier: "25K", price: 225, profitTarget: 0, maxDrawdown: 5, label: "IF Lite", bestValue: true, delay: 2, hasTrailingDD: true },
        { tier: "50K", price: 350, profitTarget: 0, maxDrawdown: 5, label: "IF Lite", bestValue: false, delay: 3, hasTrailingDD: true },
        { tier: "100K", price: 650, profitTarget: 0, maxDrawdown: 5, label: "IF Lite", bestValue: false, delay: 4, hasTrailingDD: true }
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
      ],
      "instant": [],
      "instant-lite": []
    },
    futures: {
      "four-phase": [
        { tier: "25K", price: 298, profitTarget: 9, maxDrawdown: 5, label: "Recommended", bestValue: true, delay: 0, hasTrailingDD: true },
        { tier: "50K", price: 598, profitTarget: 9, maxDrawdown: 5, label: "Advanced", bestValue: false, delay: 1, hasTrailingDD: true },
        { tier: "100K", price: 1098, profitTarget: 9, maxDrawdown: 5, label: "Professional", bestValue: false, delay: 2, hasTrailingDD: true },
        { tier: "150K", price: 1758, profitTarget: 9, maxDrawdown: 5, label: "Expert", bestValue: false, delay: 3, hasTrailingDD: true }
      ],
      "one-step": [],
      "two-step": [],
      "three-step": [],
      "instant": [],
      "instant-lite": []
    },
    equities: {
      "one-step": [
        { tier: "5K", price: 48, profitTarget: 10, maxDrawdown: 3, label: "Starter", bestValue: false, delay: 0, hasTrailingDD: true },
        { tier: "10K", price: 88, profitTarget: 10, maxDrawdown: 3, label: "Popular", bestValue: false, delay: 1, hasTrailingDD: true },
        { tier: "25K", price: 228, profitTarget: 10, maxDrawdown: 3, label: "Recommended", bestValue: true, delay: 2, hasTrailingDD: true },
        { tier: "50K", price: 428, profitTarget: 10, maxDrawdown: 3, label: "Advanced", bestValue: false, delay: 3, hasTrailingDD: true },
        { tier: "100K", price: 858, profitTarget: 10, maxDrawdown: 3, label: "Professional", bestValue: false, delay: 4, hasTrailingDD: true },
        { tier: "200K", price: 1828, profitTarget: 10, maxDrawdown: 3, label: "Expert", bestValue: false, delay: 5, hasTrailingDD: true }
      ],
      "two-step": [],
      "three-step": [],
      "four-phase": [],
      "instant": [],
      "instant-lite": []
    }
  };

  // Challenge type descriptions
  const challengeTypeDescriptions = {
    "one-step": "A single phase evaluation with a 10% equity growth target and 6% maximum drawdown. Requires consistent trading discipline and strong risk management.",
    "two-step": "A two-phase evaluation with 10% (Phase 1) and 5% (Phase 2) equity growth targets and 8% maximum drawdown. Provides a more structured path to funding.",
    "three-step": "A three-phase evaluation with 5% equity growth target per phase and 5% maximum drawdown. Designed for methodical traders who prefer smaller, consistent gains.",
    "four-phase": "A four-phase evaluation with 9% equity growth target per phase and 5% maximum drawdown. Includes early payouts starting from Phase 1 and consistency requirements. Designed for futures trading with structured progression.",
    "instant": "Start trading with funded capital immediately. Trading rules apply with 8% maximum drawdown. KYC verification required before withdrawal. Higher entry fee with quicker access to trading.",
    "instant-lite": "Instant Funding Lite: Fast, affordable funding with 3% Daily DD, 5% Max Trailing DD, and 25% consistency rule. Features 80% profit split (90% add-on available), 3% non-withdrawable profit buffer, up to 50:1 leverage, first payout on demand (14-day subsequent), and payout on breach up to profit buffer when consistency is satisfied. Daily DD based on EOD balance."
  };

  // Asset class descriptions
  const assetClassDescriptions = {
    "forex": "Trade major, minor and exotic currency pairs with up to 1:50 leverage. All positions must be closed by Friday 3:45pm EST unless you purchase the weekend holding add-on.",
    "crypto": "Trade Bitcoin, Ethereum and other cryptocurrencies with up to 5:1 leverage for BTC/ETH and 2:1 for others. Trading available 24/7 including weekends.",
    "futures": "Trade indices, commodities, and more with specific leverage ratios per instrument. Our risk management system enforces consistent trading discipline. Choose your platform: Tradovate, Volumetrica, or DXtrade Futures.",
    "equities": "Single Session Equities — trade S&P 100 equity products with 2:1 leverage on the GooeyPro platform. All positions open and close within the same session (09:30–15:55 ET); no overnight or weekend holds."
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
      answer: "Forex traders use MatchTrader, DXtrade, or cTrader (cTrader is for international Forex traders). Futures traders can choose between Tradovate, Volumetrica, and DXtrade Futures. Single Session Equities runs exclusively on GooeyPro. Our technology integrates with each platform to monitor your trading performance in real-time."
    },
    {
      question: "Do I need to complete KYC verification?",
      answer: "For standard evaluation programs, you must complete KYC verification before receiving your funded account. For Instant Funding and Instant Funding Lite, you can begin trading immediately, but must complete KYC verification before requesting any withdrawals."
    },
    {
      question: "What is the consistency requirement in IF Lite?",
      answer: "Instant Funding Lite includes a 25% consistency rule, meaning no single day's profit can exceed 25% of your total profit. This ensures balanced trading performance and prevents over-reliance on a single trading day. You must satisfy this consistency requirement to be eligible for payouts."
    },
    {
      question: "What is the profit buffer in IF Lite?",
      answer: "IF Lite includes a 3% non-withdrawable profit buffer. This buffer protects your account and allows for payout on breach situations. If you breach the Daily DD or Max Trailing DD limits, you can still receive a payout up to the profit buffer amount, provided you've satisfied the consistency requirement. However, the account will be locked upon payout."
    }
  ];

  // Forex specific FAQ questions
  const forexFaqs = [
    {
      question: "What are the specific rules for Forex trading?",
      answer: "For Forex One-Step: 10% profit target with 6% max drawdown. For Two-Step: 10% Phase 1 and 5% Phase 2 with 8% max drawdown and 4% daily loss limit. For Three-Step: 5% profit target per phase with 5% max drawdown. For Instant Funding: 8% max drawdown, 5% daily loss limit, and 80% profit share (90% with add-on). For Instant Funding Lite: 3% Daily DD (EOD Balance), 5% Max Trailing DD, 25% consistency rule, 3% non-withdrawable profit buffer, 80% profit split (90% add-on), up to 50:1 leverage, first payout on demand (14-day subsequent)."
    },
    {
      question: "What's the difference between Instant Funding and Instant Funding Lite?",
      answer: "Instant Funding Lite offers a more affordable entry point ($70-$650 vs $218-$5,198) with tighter risk management: 3% Daily DD and 5% Max Trailing DD (vs 8% for regular IF), plus a 25% consistency requirement and 3% non-withdrawable profit buffer. Both offer immediate funded account access, but IF Lite has stricter drawdown rules and includes a consistency safeguard. IF Lite allows payout on breach up to the profit buffer when consistency is satisfied, with account lock upon payout."
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

  // Single Session Equities specific FAQ questions
  const equitiesFaqs = [
    {
      question: "What is Single Session Equities trading?",
      answer: "Single Session Equities trading is designed for traders who intend to open and close all positions within the same Trading Session. Positions may not be carried beyond 15:55 ET."
    },
    {
      question: "What products can I trade in Single Session Equities?",
      answer: "You may trade any S&P 100 equity products made available on the platform for this program."
    },
    {
      question: "What platform is available for Single Session Equities trading?",
      answer: "Single Session Equities trading is available via the GooeyPro trading platform only."
    },
    {
      question: "What leverage is available for Single Session Equities?",
      answer: "Single Session Equities trading is offered with 2:1 leverage."
    },
    {
      question: "How is a trading session defined?",
      answer: "For Single Session Equities, the permitted Trading Session is 09:30 ET through 15:55 ET only. Although U.S. equities may trade during Pre-Market, Regular Market, and Extended Hours sessions, trading outside of this permitted window is not allowed. All Single Session Equities positions must be fully closed by 15:55 ET."
    },
    {
      question: "What happens if I still have an open position at 15:55 ET?",
      answer: "The platform will attempt to automatically close positions at 15:55 ET. However, it is the responsibility of the trader to ensure all positions are closed on or before this time. If a position remains open past that cutoff, it will be treated as a violation of the Prohibited Practices and result in a hard breach."
    },
    {
      question: "What commissions apply to Single Session Equities?",
      answer: "Commissions are $0.02 per share per side, subject to a minimum commission of $0.50 per transaction."
    },
    {
      question: "Where do liquidity, pricing, and execution come from?",
      answer: "Liquidity, pricing, and execution are sourced and provided directly from Nasdaq."
    },
    {
      question: "What is the Profit Target for Single Session Equities?",
      answer: "You must achieve 10% returns in the Evaluation phase to progress to the Funded phase, assuming the minimum profitable trading days requirement is also met."
    },
    {
      question: "What is the Max Drawdown for Single Session Equities?",
      answer: "The Max Drawdown is a 3.0% Maximum Trailing Drawdown based on closed balance only, not equity. It begins 3.0% below your starting balance and trails upward as your closed balance reaches new highs. Once the account reaches a 3.0% return, the Max Drawdown stops trailing and is permanently locked at the starting balance. A violation is a hard breach."
    },
    {
      question: "What is the Daily Loss Limit?",
      answer: "The Daily Loss Limit is the maximum amount an account may lose on a single trading day. A violation is a hard breach. The Daily Loss Limit is an intraday trailing drawdown that trails the greater of the daily balance high water mark and the daily equity high water mark. Example: On a $100,000 account with a 2.5% Daily Loss Limit, the starting breach level is $97,500. If equity reaches $102,000 during the day, the new breach threshold becomes $99,450 (2.5% below $102,000)."
    },
    {
      question: "What is the Daily Profit Cap (Evaluation only)?",
      answer: "The Daily Profit Cap applies during the Evaluation phase only. A violation is a daily pause: open trades are closed, open orders are cancelled, and the account is disabled for the remainder of the session. The account is re-enabled on the next trading day. It's calculated as a fixed value from the day's starting equity."
    },
    {
      question: "What are the minimum profitable trading day requirements?",
      answer: "To proceed to the next phase or become eligible for a payout, you must generate at least 0.5% profit per day over three separate trading days in both the Evaluation and Funded phases."
    },
    {
      question: "What is the minimum hold time for positions?",
      answer: "All trades must be held for at least 1 minute. Any trade held for less than that will be deemed a violation, and any profits generated from that trade will be forfeited."
    },
    {
      question: "What is the Consistency Rule (Funded phase only)?",
      answer: "Funded phases are subject to a 25% consistency requirement: no more than 25% of total profits may be generated on a single trading day to qualify for a payout. Optional add-ons are available at checkout for higher consistency thresholds (33% or 50%)."
    },
    {
      question: "What is the Profit Split and how often can I request payouts?",
      answer: "Funded accounts get an 80/20 profit split (trader keeps 80%). The first payout may be requested after 14 days in the Funded phase, and subsequent payouts every 14 days, provided all program rules are satisfied. The minimum withdrawal amount is $100."
    },
    {
      question: "What is the Payout Protector add-on?",
      answer: "Payout Protector is an optional point-of-sale add-on for an additional 25%. It protects a trader's eligible profit share in a Funded account in the event of a hard breach."
    },
    {
      question: "What is Lock Upon Payout?",
      answer: "Lock Upon Payout is enabled by default. Once a payout is processed, your Max Drawdown is permanently locked at the original starting balance — the balance may not fall below it without breaching. Traders may purchase a Lock-Upon-Payout Waiver add-on at checkout for an additional 25% to disable this feature."
    },
    {
      question: "Can I hold Single Session Equities positions overnight?",
      answer: "No. All positions must be fully closed by 15:55 ET. Overnight and weekend holds are not allowed."
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
      case "equities":
        return [...commonFaqs, ...equitiesFaqs];
      default:
        return commonFaqs;
    }
  };

  const faqs = getFaqsByAssetClass();

  // Get current challenges based on selections - using type assertion to handle dynamic access
  const currentChallenges = (() => {
    const assetData = (challengeData as any)[selectedAssetClass];
    if (!assetData) return [];
    return assetData[selectedChallengeType] || [];
  })();

  // Build JSON-LD: FAQPage from current visible FAQs + Product offers from current asset class
  const allOffers = Object.entries(challengeData).flatMap(([assetClass, types]) =>
    Object.entries(types as Record<string, Array<{ tier: string; price: number }>>).flatMap(
      ([challengeType, tiers]) =>
        tiers.map((t) => ({ tier: t.tier, price: t.price, assetClass, challengeType }))
    )
  );

  const seoTitle = "Prop Firm Challenges — Forex, Crypto, Futures & Single Session Equities";
  const seoDescription =
    "Pick from 1-Step, 2-Step, 3-Step, 4-Phase, Instant Funding, and Instant Funding Lite challenges across Forex, Crypto, Futures, and Single Session Equities. Account sizes $5K–$200K, up to 90% profit splits.";

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        path="/challenges"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Challenges", path: "/challenges" },
          ]),
          productSchema({
            name: "Hybrid Funding Trading Challenges",
            description:
              "Evaluation challenges across Forex, Crypto, Futures, and Single Session Equities. Pass and trade with firm capital.",
            url: "/challenges",
            offers: allOffers,
          }),
          faqPageSchema(faqs),
        ]}
      />
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-[#0F0F1A] border border-accent/30 py-2 h-auto">
              <TabsTrigger value="forex" className="font-['Orbitron']">FOREX</TabsTrigger>
              <TabsTrigger value="crypto" className="font-['Orbitron']">CRYPTO</TabsTrigger>
              <TabsTrigger value="futures" className="font-['Orbitron']">FUTURES</TabsTrigger>
              <TabsTrigger value="equities" className="font-['Orbitron']">EQUITIES</TabsTrigger>
            </TabsList>

            <TabsContent value="forex" className="mt-4">
              <p className="text-[#B8B8D0]">{assetClassDescriptions.forex}</p>
            </TabsContent>
            <TabsContent value="crypto" className="mt-4">
              <p className="text-[#B8B8D0]">{assetClassDescriptions.crypto}</p>
            </TabsContent>
            <TabsContent value="futures" className="mt-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-['Orbitron'] uppercase tracking-wide bg-[#171728] border border-accent/30 text-[#B8B8D0] rounded-full px-3 py-1">
                  Tradovate
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-['Orbitron'] uppercase tracking-wide bg-[#171728] border border-accent/30 text-[#B8B8D0] rounded-full px-3 py-1">
                  Volumetrica
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-['Orbitron'] uppercase tracking-wide bg-[#171728] border border-accent/30 text-[#B8B8D0] rounded-full px-3 py-1">
                  DXtrade Futures
                </span>
              </div>
              <p className="text-[#B8B8D0]">{assetClassDescriptions.futures}</p>
            </TabsContent>
            <TabsContent value="equities" className="mt-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-['Orbitron'] uppercase tracking-wide bg-primary/15 border border-primary/40 text-primary rounded-full px-3 py-1">
                  Single Session Equities
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-['Orbitron'] uppercase tracking-wide bg-[#171728] border border-accent/30 text-[#B8B8D0] rounded-full px-3 py-1">
                  GooeyPro Platform
                </span>
              </div>
              <p className="text-[#B8B8D0]">{assetClassDescriptions.equities}</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["one-step", "two-step", "three-step", "four-phase", "instant", "instant-lite"].map((type) => {
              const assetData = (challengeData as any)[selectedAssetClass];
              const isAvailable = assetData && assetData[type] && assetData[type].length > 0;
              
              return (
                <motion.div 
                  key={type}
                  whileHover={isAvailable ? { y: -5 } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant={selectedChallengeType === type ? "neon-filled" : "neon"}
                    className={`w-full font-['Orbitron'] font-semibold ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => isAvailable && setSelectedChallengeType(type)}
                    disabled={!isAvailable}
                  >
                    {type === "one-step" ? "1-STEP" : 
                     type === "two-step" ? "2-STEP" : 
                     type === "three-step" ? "3-STEP" : 
                     type === "four-phase" ? "4-PHASE" : 
                     type === "instant" ? "INSTANT FUNDING" : "IF LITE"}
                    {!isAvailable && <span className="ml-2 text-xs">(N/A)</span>}
                  </Button>
                </motion.div>
              );
            })}
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
    </>
  );
};

export default Challenges;
