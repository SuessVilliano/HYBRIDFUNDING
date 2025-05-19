import { motion } from "framer-motion";

const Terms = () => {
  const sections = [
    {
      title: "Refund Policy",
      content: [
        "We offer a strict no-refund policy on all challenge purchases. Once you have begun your evaluation, no refunds will be issued.",
        "If you experience technical issues that prevent you from accessing your challenge, please contact our support team within 24 hours of purchase."
      ]
    },
    {
      title: "Evaluation Terms",
      content: [
        "All traders must adhere to our evaluation rules, which include profit targets, maximum drawdown limits, and trading windows.",
        "Any violation of these rules will result in the termination of your evaluation without refund or recourse."
      ]
    },
    {
      title: "KYC Requirements",
      content: [
        "For standard evaluation programs (One-Step, Two-Step, Three-Step), you must complete KYC verification before receiving your funded account.",
        "For Instant Funding accounts, you can begin trading immediately, but must complete KYC verification before requesting any withdrawals.",
        "The KYC process includes providing a valid government-issued ID, proof of address dated within the last 3 months, and any additional documentation required by regulatory compliance.",
        "If you do not pass the KYC process when requesting a withdrawal, the withdrawal will be rejected, and your account may be closed."
      ]
    },
    {
      title: "Risk Disclosure",
      content: [
        "Trading financial instruments involves substantial risk of loss and is not suitable for all investors.",
        "Past performance is not indicative of future results, and you should never trade with capital you cannot afford to lose.",
        "The gains distribution from funded trading is based on account performance and is not guaranteed.",
        "Funded accounts use notional funding, which means the equity in your account may differ from the nominal account size that establishes your initial account value and level of trading."
      ]
    },
    {
      title: "Geographic Restrictions",
      content: [
        "Subject to compliance with applicable laws and regulations, traders from all countries, excluding OFAC-listed countries, can participate in our program.",
        "We reserve the right to limit participation from any region at our discretion based on regulatory requirements or risk management policies.",
        "You must be at least 18 years of age, or the applicable minimum legal age in your country, to participate in our funding program."
      ]
    }
  ];

  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-4xl mx-auto glassmorphism rounded-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              Terms & <span className="text-accent neon-text-accent">Policies</span>
            </h2>
            <p className="text-[#B8B8D0] max-w-2xl mx-auto">
              Please review our terms and policies before using our services.
            </p>
          </div>
          
          <div className="space-y-10">
            {sections.map((section, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index + 0.2 }}
              >
                <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-4">{section.title}</h3>
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-[#B8B8D0] mb-4">{paragraph}</p>
                ))}
              </motion.div>
            ))}
            
            <motion.div 
              className="border-t border-accent/20 pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <p className="text-[#B8B8D0] text-center font-medium">
                By using Hybrid Funding, you agree to our trading rules and evaluation terms.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Terms;
