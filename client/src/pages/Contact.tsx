import { motion } from "framer-motion";
import ContactForm from "@/components/ContactForm";
import { Mail, Users } from "lucide-react";
import SocialIcon from "@/components/SocialIcon";
import { getSupportEmail } from "@/lib/utils";

const Contact = () => {
  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-['Orbitron'] text-3xl md:text-4xl font-bold text-white mb-4">
              Contact <span className="text-accent neon-text-accent">Us</span>
            </h2>
            <p className="text-[#B8B8D0] max-w-2xl mx-auto">
              Get in touch with our support team for any questions or assistance.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glassmorphism rounded-xl p-8"
            >
              <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-6">Send Message</h3>
              <ContactForm />
            </motion.div>
            
            <div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glassmorphism rounded-xl p-8 mb-8"
              >
                <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="mr-4 text-accent">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Email</p>
                      <a 
                        href={`mailto:${getSupportEmail()}`} 
                        className="text-accent hover:underline"
                      >
                        {getSupportEmail()}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-4 text-accent">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Social</p>
                      <div className="flex space-x-4 mt-2">
                        <SocialIcon type="telegram" />
                        <SocialIcon type="discord" />
                        <SocialIcon type="twitter" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glassmorphism rounded-xl p-8"
              >
                <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">How quickly will I receive a response?</h4>
                    <p className="text-[#B8B8D0]">We typically respond to all inquiries within 24 hours during business days.</p>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-semibold mb-2">What if I need urgent help?</h4>
                    <p className="text-[#B8B8D0]">For urgent matters, please include "URGENT" in your email subject line for priority handling.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
