import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = { name: string; path: string; isNew?: boolean };

const primaryLinks: NavItem[] = [
  { name: "Challenges", path: "/challenges" },
  { name: "Predictive Markets", path: "/predictive-markets" },
  { name: "Playbook", path: "/playbook" },
  { name: "Affiliate", path: "/affiliate" },
  { name: "Updates", path: "/blog" },
];

const moreLinks: NavItem[] = [
  { name: "AI Radar", path: "/market-radar", isNew: true },
  { name: "Battles", path: "/battles" },
  { name: "Trader DNA", path: "/dna-test" },
  { name: "Free Training", path: "/webinar" },
  { name: "About", path: "/about" },
  { name: "FAQ", path: "/faq" },
  { name: "Contact", path: "/contact" },
];

const mobileLinks = [
  { name: "Home", path: "/" },
  ...primaryLinks,
  ...moreLinks,
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const closeMenu = () => setIsOpen(false);
  const isActive = (path: string) =>
    path === "/" ? location === "/" : location === path || location.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-50 glassmorphism shadow-lg pt-[env(safe-area-inset-top)]">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center space-x-2" onClick={closeMenu}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent">
              <span className="font-['Orbitron'] text-sm font-bold text-white">HF</span>
            </div>
            <span className="hidden font-['Orbitron'] text-lg font-bold text-white sm:inline xl:text-xl">
              HYBRID<span className="text-accent">FUNDING</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {primaryLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`nav-link inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors xl:px-3 ${
                  isActive(link.path) ? "bg-white/5 text-accent" : "text-white hover:bg-white/5 hover:text-accent"
                }`}
              >
                {link.name}
                {link.isNew && (
                  <span className="rounded bg-accent px-1 py-px font-['Orbitron'] text-[8px] font-bold text-[#0F0F1A]">
                    NEW
                  </span>
                )}
              </Link>
            ))}

            <details className="group relative">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5 hover:text-accent [&::-webkit-details-marker]:hidden">
                More <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0F0F1A]/98 p-2 shadow-2xl backdrop-blur-xl">
                {moreLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive(link.path) ? "bg-white/5 text-accent" : "text-[#B8B8D0] hover:bg-white/5 hover:text-accent"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {link.name}
                      {link.isNew && (
                        <span className="rounded bg-accent px-1 py-px font-['Orbitron'] text-[8px] font-bold text-[#0F0F1A]">
                          NEW
                        </span>
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </details>

            <Link href="/trader-portal">
              <Button variant="neon" size="lg" rounded="full" className="ml-1 font-['Orbitron'] text-xs font-semibold xl:text-sm">
                TRADER PORTAL
              </Button>
            </Link>
          </div>

          <a
            href="/#choose-program"
            className="absolute left-1/2 -translate-x-1/2 lg:hidden"
            aria-label="Get started with a Hybrid Funding challenge"
          >
            <Button
              variant="neon-filled"
              size="sm"
              rounded="full"
              className="h-9 px-4 font-['Orbitron'] text-[10px] font-bold shadow-glow-accent sm:px-5 sm:text-xs"
            >
              GET STARTED
            </Button>
          </a>

          <div className="flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle mobile menu"
              onClick={() => setIsOpen((v) => !v)}
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
            className="border-t border-white/5 bg-[#0F0F1A]/98 lg:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-4 py-3">
              {mobileLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive(link.path) ? "bg-white/5 text-accent" : "text-white hover:bg-white/5 hover:text-accent"
                  }`}
                  onClick={closeMenu}
                >
                  <span>{link.name}</span>
                  {"isNew" in link && link.isNew && (
                    <span className="rounded bg-accent px-1.5 py-0.5 font-['Orbitron'] text-[9px] font-bold text-[#0F0F1A]">
                      NEW
                    </span>
                  )}
                </Link>
              ))}
              <Link href="/trader-portal" className="mt-2 block" onClick={closeMenu}>
                <Button variant="neon" size="lg" rounded="full" className="w-full font-['Orbitron'] font-semibold">
                  TRADER PORTAL
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
