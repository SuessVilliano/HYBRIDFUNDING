import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Challenges", path: "/challenges" },
    { name: "Battles", path: "/battles" },
    { name: "About", path: "/about" },
    { name: "Affiliate", path: "/affiliate" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close mobile menu when navigation happens
  const closeMenu = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const isActive = (path: string) => {
    return location === path ? "active" : "";
  };

  return (
    <header className="sticky top-0 z-50 glassmorphism shadow-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <span className="font-['Orbitron'] font-bold text-white">HF</span>
              </div>
              <span className="font-['Orbitron'] font-bold text-white text-xl">
                HYBRID<span className="text-accent">FUNDING</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path} className={`nav-link text-white hover:text-accent font-medium ${isActive(link.path)}`} onClick={closeMenu}>
                  {link.name}
                </Link>
              ))}
              <Link href="/trader-portal" onClick={closeMenu}>
                <Button variant="neon" size="lg" rounded="full" className="font-['Orbitron'] font-semibold">
                  TRADER PORTAL
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle mobile menu"
              onClick={toggleMenu}
              className="text-white hover:text-accent focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden glassmorphism"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path} className="block px-3 py-2 rounded-md text-white hover:bg-primary/20 hover:text-accent" onClick={closeMenu}>
                  {link.name}
                </Link>
              ))}
              <Link href="/trader-portal" className="block px-3 py-2 rounded-md text-accent hover:bg-primary/20" onClick={closeMenu}>
                Trader Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
