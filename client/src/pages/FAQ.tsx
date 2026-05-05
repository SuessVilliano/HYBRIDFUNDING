import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccordionItem from "@/components/AccordionItem";
import SEO from "@/components/SEO";
import { breadcrumbSchema, faqPageSchema } from "@/lib/jsonLd";

const FAQ: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");

  // General FAQ Questions
  const generalFaqs = [
    {
      question: "What is Hybrid Funding?",
      answer: "Hybrid Funding is a proprietary trading firm that provides traders with access to capital. We offer evaluation programs across Forex, Crypto, and Futures markets, with various challenge types to suit different trading styles and experience levels."
    },
    {
      question: "How does the funding process work?",
      answer: "Our funding process typically involves passing an evaluation (challenge) to demonstrate your trading skills and discipline. Once you pass the evaluation, you receive a funded account where you can trade with our capital and keep a significant portion of the profits. For those seeking immediate trading access, we also offer Instant Funding options."
    },
    {
      question: "What's the difference between evaluations and funded accounts?",
      answer: "Evaluations (challenges) are assessment periods where you need to reach specific profit targets while adhering to risk management rules. Funded accounts are live trading accounts backed by our capital where you earn a percentage of the profits without specific profit targets, but still need to follow risk management guidelines."
    },
    {
      question: "Do I need to complete KYC verification?",
      answer: "For standard evaluation programs, you must complete KYC verification before receiving your funded account. For Instant Funding and Instant Funding Lite accounts, you can begin trading immediately, but must complete KYC verification before requesting any withdrawals. This verification process helps ensure compliance with financial regulations."
    },
    {
      question: "What is the profit split on funded accounts?",
      answer: "The standard profit split is typically 75-80% for traders. However, you can purchase a 90% profit split add-on (additional 20% cost) during checkout. The exact split may vary slightly between different asset classes and programs."
    },
    {
      question: "When can I withdraw gains after funding?",
      answer: "You can request your first withdrawal at any time. Thereafter, you can request withdrawals every 30 days. The minimum withdrawal amount is the greater of $100 or 1% of the account's starting balance. Note: This withdrawal minimum only applies to Instant Funding plans."
    },
    {
      question: "What happens if I breach the rules?",
      answer: "Rule violations are categorized as soft breaches or hard breaches. Soft breaches (like leaving positions open over the weekend) result in position closure but allow continued trading. Hard breaches (maximum drawdown, daily loss limit, or inactivity) will result in account termination. If your funded account is terminated with gains, you'll still receive your share of those gains."
    },
    {
      question: "What trading platforms do you support?",
      answer: "Forex traders use MatchTrader, DXtrade, or cTrader (cTrader is the platform we offer to international Forex traders). Futures traders can choose between Tradovate, Volumetrica, and DXtrade Futures. Single Session Equities trades exclusively on GooeyPro. Our technology is integrated with each platform to monitor your trading performance in real-time."
    },
    {
      question: "Are there any geographic restrictions?",
      answer: "Yes, we cannot provide services to residents of countries under OFAC sanctions and certain other jurisdictions due to regulatory requirements. Please refer to our Terms page for the complete list of restricted countries."
    }
  ];

  // Forex specific FAQ questions
  const forexFaqs = [
    {
      question: "What are the different Forex challenge types?",
      answer: "We offer One-Step, Two-Step, Three-Step, Instant Funding, and Instant Funding Lite options for Forex. Each has different profit targets, drawdown limits, and time frames. One-Step is fastest to funding with a single 10% profit target. Two-Step has 10% and 5% targets. Three-Step has three consecutive 5% targets. Instant Funding provides immediate access to trading capital with ongoing risk parameters. Instant Funding Lite offers a more affordable entry point with tighter risk management rules."
    },
    {
      question: "What's the difference between Instant Funding and Instant Funding Lite?",
      answer: "Instant Funding Lite offers a more affordable entry point with prices ranging from $70-$650 (compared to $218-$5,198 for regular Instant Funding). IF Lite has tighter risk management rules: 3% Daily DD (EOD Balance) and 5% Max Trailing DD (vs 8% max DD for regular IF). It includes a 25% consistency requirement (no single day can exceed 25% of total profit) and a 3% non-withdrawable profit buffer. Both programs offer immediate trading access and 80-90% profit splits, but IF Lite allows payout on breach up to the profit buffer when consistency is satisfied, with account lock upon payout."
    },
    {
      question: "What are the specific rules for Forex trading?",
      answer: "For Forex One-Step: 10% profit target with 6% max drawdown. For Two-Step: 10% Phase 1 and 5% Phase 2 with 8% max drawdown and 4% daily loss limit. For Three-Step: 5% profit target per phase with 5% max drawdown. For Instant Funding: 8% max drawdown, 5% daily loss limit, and 80% profit share (90% with add-on). For Instant Funding Lite: 3% Daily DD (EOD Balance), 5% Max Trailing DD, 25% consistency rule, 3% non-withdrawable profit buffer, 80% profit split (90% add-on), up to 50:1 leverage, first payout on demand (14-day subsequent)."
    },
    {
      question: "What is the consistency requirement in IF Lite?",
      answer: "Instant Funding Lite includes a 25% consistency rule, meaning no single day's profit can exceed 25% of your total profit. This ensures balanced trading performance and prevents over-reliance on a single trading day. You must satisfy this consistency requirement to be eligible for payouts."
    },
    {
      question: "What is the profit buffer in IF Lite?",
      answer: "IF Lite includes a 3% non-withdrawable profit buffer. This buffer protects your account and allows for payout on breach situations. If you breach the Daily DD or Max Trailing DD limits, you can still receive a payout up to the profit buffer amount, provided you've satisfied the consistency requirement. However, the account will be locked upon payout."
    },
    {
      question: "What leverage is available for Forex accounts?",
      answer: "Our Forex accounts offer leverage of 1:20 for One-Step and Three-Step programs, 1:30 for the Two-Step program, and 1:50 for Instant Funding accounts."
    },
    {
      question: "How is the daily loss limit calculated for Forex?",
      answer: "The daily loss limit (available on some programs) is calculated based on your previous day's end of day balance which resets at 5 PM EST. For example, if your prior day's balance was $100,000 and your daily loss limit is 4%, your account would violate the rule if your equity reached $96,000 during the day."
    },
    {
      question: "How is the maximum drawdown calculated for Forex?",
      answer: "For One-Step and Three-Step programs, the maximum drawdown trails using your closed balance until you achieve a 6% return (One-Step) or 5% return (Three-Step), at which point it locks at your starting balance. For Two-Step, it's a static 8%. For Instant Funding, the 8% maximum drawdown trails using your closed balance until you achieve an 8% return, at which point it locks at your starting balance."
    },
    {
      question: "Can I hold Forex positions over the weekend?",
      answer: "All Forex positions must be closed by 3:45 PM EST on Friday. Any open positions will be automatically closed. This is considered a soft breach, and you can continue trading when markets reopen. You can purchase the Weekend Hold add-on (10% additional cost) to hold positions over the weekend."
    },
    {
      question: "What constitutes a lot size in Forex trading?",
      answer: "In Forex trading, 1 lot equals $100,000 notional value."
    },
    {
      question: "Is there a requirement for minimum trading days?",
      answer: "No, there is no minimum trading days requirement. However, there is an inactivity rule that states you must place at least one trade every 30 days to avoid account termination."
    }
  ];

  // Crypto specific FAQ questions
  const cryptoFaqs = [
    {
      question: "What are the different Crypto challenge types?",
      answer: "We offer One-Step, Two-Step, and Instant Funding options for cryptocurrency trading. Each has different profit targets, drawdown limits, and risk parameters."
    },
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
      question: "How is the maximum drawdown calculated for Crypto?",
      answer: "For Crypto trading, the maximum drawdown is static (does not trail) and is set at 6% for One-Step and 9% for Two-Step programs. This means regardless of how high your account goes, your drawdown limit remains the same."
    },
    {
      question: "Can I hold Crypto positions over the weekend?",
      answer: "Yes, you can hold cryptocurrency positions over the weekend without any additional add-ons. Crypto markets operate 24/7, and our platform supports continuous trading."
    },
    {
      question: "What constitutes a lot size in Crypto trading?",
      answer: "In Crypto trading, 1 lot equals 1 coin of the cryptocurrency being traded."
    },
    {
      question: "Are there any restrictions on which cryptocurrencies I can trade?",
      answer: "You can trade all cryptocurrencies available on the platform, but please note that leverage differs: 5:1 for BTC and ETH, and 2:1 for all other cryptocurrencies."
    }
  ];

  // Futures specific FAQ questions
  const futuresFaqs = [
    {
      question: "How does the Funded Futures Plan work?",
      answer: "The Funded Futures Plan is a four-phase program with defined profit targets and payouts at each phase. Each phase has a 9% profit target and 5% maximum trailing loss. After completing all four phases, you transition to a Live Funded Futures account with 90% profit split."
    },
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
      answer: "The Maximum Trailing Loss trails using End of Day Balance. If your starting balance is $100,000 with a 5% Max Trailing Loss, you can drawdown to $95,000. If your end of day balance increases to $102,000, your new Max Trailing Loss would be $97,000. Once you generate a 5% return, the Max Loss will lock at your starting balance. End of day is defined as 1600 CST."
    },
    {
      question: "What contract limits apply to Futures trading?",
      answer: "Contract limits vary by account size. For $25K accounts: 1 standard/15 micro contracts. For $50K: 3 standard/30 micro. For $100K: 6 standard/60 micro. For $150K: 9 standard/90 micro contracts."
    },
    {
      question: "What are the payout phases for Futures trading?",
      answer: "Futures trading includes payouts at each phase: Phase 1 ($500 for $25K account), Phase 2 ($750), Phase 3 ($750), and Phase 4 ($1,500). These amounts scale with account size. After Phase 4, you transition to a Live Funded account with the size being a portion of your evaluation account."
    },
    {
      question: "Can I hold Futures positions over the weekend?",
      answer: "No. All positions must be closed and all open orders cancelled at 1510 CST each weekday. No positions can be held over the weekend."
    },
    {
      question: "What happens if I don't meet the Consistency Requirement?",
      answer: "You won't lose your account if you don't meet the consistency requirement. However, you won't be able to complete the phase and receive the payout until you achieve both the profit target and the consistency requirement."
    },
    {
      question: "Which platforms can I use for Futures trading?",
      answer: "Futures traders can choose from Tradovate (https://trader.tradovate.com/), Volumetrica (https://my.deepcharts.com/identity/account/login), and DXtrade Futures. All three are supported for Funded Futures Plan accounts."
    },
    {
      question: "How do I complete the CME market data attestation for Futures trading?",
      answer: "Complete the CME market data attestation through the desktop version of your chosen Futures platform (Tradovate, Volumetrica, or DXtrade Futures). You must attest as a non-professional user. Once completed on desktop, you'll be able to use mobile and web apps."
    }
  ];

  // Single Session Equities specific FAQ questions
  const equitiesFaqs = [
    {
      question: "What is Single Session Equities trading?",
      answer: "Single Session Equities trading is designed for traders who intend to open and close all positions within the same Trading Session. Positions may not be carried beyond 15:55 ET."
    },
    {
      question: "Do I have to close all positions before the session ends?",
      answer: "Yes. It is the responsibility of the trader to ensure that all positions are closed before 15:55 ET."
    },
    {
      question: "What happens if I still have an open position at 15:55 ET?",
      answer: "The platform will attempt to automatically close positions at 15:55 ET. However, it is the responsibility of the trader to ensure all positions are closed on or before this time. If a position remains open past that cutoff, it will be treated as a violation of the Prohibited Practices and result in a hard breach."
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
      question: "What commissions apply to Single Session Equities?",
      answer: "Commissions are $0.02 per share per side, subject to a minimum commission of $0.50 per transaction."
    },
    {
      question: "Where do liquidity, pricing, and execution come from?",
      answer: "Liquidity, pricing, and execution are sourced and provided directly from Nasdaq."
    },
    {
      question: "What is the Profit Target for Single Session Equities (Evaluation phase)?",
      answer: "You must achieve 10% returns in the Evaluation phase to progress to the Funded phase (assuming the minimum profitable trading days requirement is also met)."
    },
    {
      question: "What is the Max Drawdown for Single Session Equities (Evaluation and Funded phases)?",
      answer: "The Max Drawdown is a 3.0% Maximum Trailing Drawdown based on closed balance only, not equity. It begins 3.0% below your starting balance and trails upward as your closed balance reaches new highs. Once the account reaches a 3.0% return, the Max Drawdown stops trailing and is permanently locked at the starting balance. A violation of the Max Drawdown is considered a hard breach. Example: On a $100,000 account, the starting Max Drawdown threshold is $97,000. If your closed balance increases to $102,000, that becomes your new high-water mark and your Max Drawdown threshold moves up to $99,000. If your closed balance then increases to $103,000, the Max Drawdown threshold locks at your starting balance of $100,000 and no longer trails upward."
    },
    {
      question: "What is the Daily Loss Limit for Single Session Equities?",
      answer: "The Daily Loss Limit is the maximum amount an account may lose on a single trading day. A violation is a hard breach and the account will be terminated. The Daily Loss Limit follows an intraday trailing drawdown that trails the greater of the daily balance high water mark and the daily equity high water mark. Example: On a $100,000 account with a 2.5% Daily Loss Limit, the starting breach level is $97,500. If equity reaches $102,000 and balance reaches $101,000 during the day, $102,000 becomes the daily high-water mark and the new breach threshold is $99,450 (2.5% below $102,000). If equity falls below that, the account breaches. If the day ends with both balance and equity at $101,000, the next day starts with a new $98,475 threshold (2.5% below $101,000)."
    },
    {
      question: "What is the Daily Profit Cap for Single Session Equities (Evaluation phase only)?",
      answer: "The Daily Profit Cap applies during the Evaluation phase. A violation is a daily pause: open trades are closed, open orders are cancelled, and the account is disabled for the remainder of the session. The account is re-enabled on the next trading day. It's calculated as a fixed value from the day's starting equity. Example: On a $100,000 account with a 2.5% Daily Profit Cap, if the day begins with equity of $102,000, the day's profit cap is $104,500. If equity exceeds that amount, positions are closed and the account is paused for the rest of the day. The account may trade again the next trading day after 17:00 ET, with the new daily cap based on the new day's starting equity."
    },
    {
      question: "What is the Consistency Rule (Funded phase only)?",
      answer: "Funded phases are subject to a 25% consistency requirement. No more than 25% of total profits may be generated on a single trading day to qualify for a payout. Optional add-ons are available at checkout to allow for a higher consistency limit (33% or 50%)."
    },
    {
      question: "What are the minimum profitable trading day requirements?",
      answer: "To proceed to the next phase or become eligible for a payout, you must generate at least 0.5% profit per day over three separate trading days in both the Evaluation and Funded phases, in addition to meeting all other applicable requirements."
    },
    {
      question: "What is the minimum hold time for positions?",
      answer: "All trades must be held for at least 1 minute. Any trade held for less than that will be deemed a violation and any profits generated from that trade will be forfeited."
    },
    {
      question: "What is the Profit Split (Funded phase only)?",
      answer: "Funded accounts are eligible for an 80/20 profit split on gains: the trader receives 80% of eligible profits and the firm retains 20%. A 90% Profit Share Upgrade is available as an add-on at checkout."
    },
    {
      question: "What is the Payout Protector add-on?",
      answer: "Payout Protector is an optional point-of-sale add-on available for an additional 25% cost. It protects a trader's eligible profit share in a Funded account in the event of a hard breach."
    },
    {
      question: "How often can I request a payout?",
      answer: "The first payout may be requested after 14 days in the Funded phase. After that, payouts may be requested every 14 days, provided all applicable payout conditions and program rules have been satisfied."
    },
    {
      question: "What is Lock Upon Payout?",
      answer: "Lock Upon Payout is enabled by default on all plans. Once a payout is processed, your Max Drawdown is permanently locked at the original starting balance. Traders may purchase an add-on at checkout for an additional 25% of the plan price to disable this feature. Example: If a trader has a $100,000 account and grows the balance to $110,000, once a payout is processed the Max Drawdown is permanently locked at $100,000. From that point forward, the account balance may not fall below $100,000; if it does, the account is considered breached."
    },
    {
      question: "Is there a minimum withdrawal amount?",
      answer: "Yes. The minimum withdrawal amount is $100 when requesting a payout through the platform."
    },
    {
      question: "What add-ons are available for Single Session Equities?",
      answer: "Available add-ons: 90% Profit Share Upgrade, 33% Consistency Threshold, 50% Consistency Threshold, Payout Protector (25% of plan price), and Lock-Upon-Payout Waiver (25% of plan price)."
    },
    {
      question: "Can I hold Single Session Equities positions overnight or over the weekend?",
      answer: "No. All positions must be fully closed by 15:55 ET. Overnight and weekend holds are not allowed under the Single Session Equities program."
    }
  ];

  const allFaqs = [...generalFaqs, ...forexFaqs, ...cryptoFaqs, ...futuresFaqs, ...equitiesFaqs];

  return (
    <Layout>
      <SEO
        title="Hybrid Funding FAQ — Rules, Payouts, Leverage & Drawdown Explained"
        description="Answers about Hybrid Funding evaluations, profit splits, leverage, max drawdown, payouts, and platform-specific rules for Forex, Crypto, Futures, and Single Session Equities."
        path="/faq"
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
          faqPageSchema(allFaqs),
        ]}
      />
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-background/60 z-0"></div>
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="font-['Orbitron'] text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-[#B8B8D0] text-lg max-w-3xl mx-auto">
              Find answers to the most common questions about our trading programs, 
              account rules, and funding process.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-background/50 p-1 h-auto">
                  <TabsTrigger value="general" className="data-[state=active]:bg-primary">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="forex" className="data-[state=active]:bg-primary">
                    Forex
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="data-[state=active]:bg-primary">
                    Crypto
                  </TabsTrigger>
                  <TabsTrigger value="futures" className="data-[state=active]:bg-primary">
                    Futures
                  </TabsTrigger>
                  <TabsTrigger value="equities" className="data-[state=active]:bg-primary">
                    Equities
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="glassmorphism rounded-xl p-6 mb-10">
                <TabsContent value="general" className="space-y-6 mt-0">
                  {generalFaqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="forex" className="space-y-6 mt-0">
                  {forexFaqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="crypto" className="space-y-6 mt-0">
                  {cryptoFaqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="futures" className="space-y-6 mt-0">
                  <div className="flex flex-wrap gap-2 mb-2">
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
                  {futuresFaqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="equities" className="space-y-6 mt-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-['Orbitron'] uppercase tracking-wide bg-primary/15 border border-primary/40 text-primary rounded-full px-3 py-1">
                      Single Session Equities
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-['Orbitron'] uppercase tracking-wide bg-[#171728] border border-accent/30 text-[#B8B8D0] rounded-full px-3 py-1">
                      GooeyPro Platform
                    </span>
                  </div>
                  {equitiesFaqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <p className="text-[#B8B8D0] mb-6">
              Couldn't find the answer you were looking for?
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center h-10 px-6 font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;