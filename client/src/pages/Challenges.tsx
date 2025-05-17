import { motion } from "framer-motion";
import ChallengeCard from "@/components/ChallengeCard";
import AccordionItem from "@/components/AccordionItem";

const Challenges = () => {
  const challenges = [
    { tier: "5K", price: 49, profitTarget: 8, maxDrawdown: 8, label: "Starter", bestValue: false, delay: 0 },
    { tier: "10K", price: 89, profitTarget: 8, maxDrawdown: 8, label: "Popular", bestValue: false, delay: 1 },
    { tier: "25K", price: 139, profitTarget: 8, maxDrawdown: 8, label: "Recommended", bestValue: true, delay: 2 },
    { tier: "50K", price: 199, profitTarget: 8, maxDrawdown: 8, label: "Advanced", bestValue: false, delay: 3 },
    { tier: "100K", price: 299, profitTarget: 8, maxDrawdown: 8, label: "Professional", bestValue: false, delay: 4 },
    { tier: "200K", price: 499, profitTarget: 8, maxDrawdown: 8, label: "Expert", bestValue: false, delay: 5 }
  ];

  const faqs = [
    {
      question: "How does the evaluation work?",
      answer: "Our evaluation measures your trading discipline, consistency, and profitability over a set period. You need to reach the profit target without violating the maximum drawdown rules."
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

  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your <span className="text-accent neon-text-accent">Challenge</span>
          </h2>
          <p className="text-[#B8B8D0] max-w-2xl mx-auto">
            Select the perfect funding challenge based on your experience level and capital requirements.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.tier}
              tier={challenge.tier}
              price={challenge.price}
              profitTarget={challenge.profitTarget}
              maxDrawdown={challenge.maxDrawdown}
              label={challenge.label}
              bestValue={challenge.bestValue}
              delay={challenge.delay}
            />
          ))}
        </div>
        
        {/* FAQ Section */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
