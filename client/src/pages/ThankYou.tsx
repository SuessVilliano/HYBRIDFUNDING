import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mail, LogIn, Info, Clock } from "lucide-react";
import { getSupportEmail } from "@/lib/utils";

const ThankYou = () => {
  const nextSteps = [
    {
      icon: <Mail className="h-6 w-6" />,
      text: "Check your email inbox for login credentials (including spam/junk folders)."
    },
    {
      icon: <LogIn className="h-6 w-6" />,
      text: "Log into the Trader Portal with your new credentials."
    },
    {
      icon: <Info className="h-6 w-6" />,
      text: "Review the evaluation rules and trading parameters."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      text: "Begin trading and working toward your profit target."
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
            <motion.div 
              className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              Thank You for Your Purchase!
            </h2>
            <p className="text-[#B8B8D0] max-w-2xl mx-auto">
              You'll receive your login credentials shortly.
            </p>
          </div>
          
          <motion.div 
            className="bg-[#0F0F1A]/50 p-6 rounded-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-4">What's Next?</h3>
            
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                >
                  <div className="mr-3 text-accent">
                    {step.icon}
                  </div>
                  <p className="text-[#B8B8D0]">{step.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button 
              variant="neon-filled"
              size="xl"
              rounded="full"
              onClick={() => window.open("https://client.hybridfunding.club/login", "_blank")}
              className="font-['Orbitron'] font-semibold shadow-glow-accent"
            >
              ACCESS PORTAL
            </Button>
            
            <Link href="/contact">
              <a>
                <Button 
                  variant="neon"
                  size="xl"
                  rounded="full"
                  className="font-['Orbitron'] font-semibold shadow-glow-subtle w-full sm:w-auto"
                >
                  CONTACT SUPPORT
                </Button>
              </a>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ThankYou;
