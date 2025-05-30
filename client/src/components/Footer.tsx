import { Link } from "wouter";
import SocialIcon from "./SocialIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Subscribe logic would go here in a real implementation
    toast({
      title: "Subscription successful!",
      description: "Thank you for subscribing to our newsletter",
    });
    setEmail("");
  };

  return (
    <footer className="bg-[#1A1A2E] py-12 border-t border-accent/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/">
              <a className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <span className="font-['Orbitron'] font-bold text-white">HF</span>
                </div>
                <span className="font-['Orbitron'] font-bold text-white text-xl">
                  HYBRID<span className="text-accent">FUNDING</span>
                </span>
              </a>
            </Link>

            <p className="text-[#B8B8D0] mb-6">Empowering Traders. Funding Potential.</p>

            <div className="flex space-x-4">
              <SocialIcon type="twitter" />
              <SocialIcon type="discord" />
              <SocialIcon type="telegram" />
            </div>
          </div>

          <div>
            <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-[#B8B8D0] hover:text-accent transition duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="text-[#B8B8D0] hover:text-accent transition duration-200">
                  Challenges
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#B8B8D0] hover:text-accent transition duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link href="/affiliate" className="text-[#B8B8D0] hover:text-accent transition duration-200">
                  Affiliate Program
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#B8B8D0] hover:text-accent transition duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://dashboardanalytix.com/client-terms-and-policies/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#B8B8D0] hover:text-accent transition duration-200"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a 
                  href="https://dashboardanalytix.com/client-terms-and-policies/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#B8B8D0] hover:text-accent transition duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="https://dashboardanalytix.com/client-terms-and-policies/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#B8B8D0] hover:text-accent transition duration-200"
                >
                  Refund Policy
                </a>
              </li>
              <li>
                <a 
                  href="https://dashboardanalytix.com/client-terms-and-policies/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#B8B8D0] hover:text-accent transition duration-200"
                >
                  KYC Requirements
                </a>
              </li>
              <li>
                <a 
                  href="https://dashboardanalytix.com/client-terms-and-policies/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#B8B8D0] hover:text-accent transition duration-200"
                >
                  Risk Disclosure
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-4">Subscribe</h3>
            <p className="text-[#B8B8D0] mb-4">Stay updated with our latest offerings and news.</p>

            <form className="flex" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0F0F1A] border border-primary/30 focus:border-accent rounded-r-none text-white focus:outline-none focus:ring-1 focus:ring-accent/50 transition duration-200 w-full"
              />
              <Button
                type="submit"
                variant="gradient"
                size="icon"
                className="rounded-l-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-accent/10 text-center">
          <p className="text-[#B8B8D0]">&copy; {new Date().getFullYear()} Hybrid Funding LLC. All rights reserved.</p>
        </div>
        
        {/* Chat Widget */}
        <div dangerouslySetInnerHTML={{ __html: `
          <script>(function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = 'https://api.anychat.one/widget/854ec014-677b-3467-be78-23cbdb44e178?r=' + encodeURIComponent(window.location);
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'contactus-jssdk'));</script>
        `}} />
      </div>
    </footer>
  );
};

export default Footer;
