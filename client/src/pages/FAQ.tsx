import React, { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccordionItem from "@/components/AccordionItem";

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
      answer: "For standard evaluation programs, you must complete KYC verification before receiving your funded account. For Instant Funding accounts, you can begin trading immediately, but must complete KYC verification before requesting any withdrawals. This verification process helps ensure compliance with financial regulations."
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
      answer: "We support Rithmic, MatchTrader, DXtrade, and cTrader platforms. Our technology is integrated with these platforms to monitor your trading performance in real-time."
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
      answer: "We offer One-Step, Two-Step, Three-Step, and Instant Funding options for Forex. Each has different profit targets, drawdown limits, and time frames. One-Step is fastest to funding with a single 10% profit target. Two-Step has 10% and 5% targets. Three-Step has three consecutive 5% targets. Instant Funding provides immediate access to trading capital with ongoing risk parameters."
    },
    {
      question: "What are the specific rules for Forex trading?",
      answer: "For Forex One-Step: 10% profit target with 6% max drawdown. For Two-Step: 10% Phase 1 and 5% Phase 2 with 8% max drawdown and 4% daily loss limit. For Three-Step: 5% profit target per phase with 5% max drawdown. For Instant Funding: 8% max drawdown, 5% daily loss limit, and 80% profit share (can be increased to 90% with add-on)."
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
      question: "How do I complete the CME market data attestation for Futures trading?",
      answer: "You must complete the CME market data attestation using the R | Trader Pro desktop app. This cannot be done through mobile or web platforms. Once completed in R | Trader Pro, you'll be able to use mobile or web apps. You must attest as a non-professional user."
    }
  ];

  return (
    <Layout>
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
                <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-background/50 p-1">
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
                  {futuresFaqs.map((faq, index) => (
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