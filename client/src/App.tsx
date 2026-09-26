import { Switch, Route, Router, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Layout from "@/components/Layout";
import AppTabBar from "@/components/AppTabBar";
import NotFound from "@/pages/not-found";
import PageTransition, { CyberpunkLoadingScreen } from "@/components/ui/page-transition";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

// Pages
import Home from "@/pages/Home";
import Challenges from "@/pages/Challenges";
import PredictiveMarkets from "@/pages/PredictiveMarkets";
import MarketRadar from "@/pages/MarketRadar";
import RadarPro from "@/pages/RadarPro";
import Webinar from "@/pages/Webinar";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Playbook from "@/pages/Playbook";
import GetFunded from "@/pages/GetFunded";
import About from "@/pages/About";
import Affiliate from "@/pages/Affiliate";
import TraderPortal from "@/pages/TraderPortal";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import ThankYou from "@/pages/ThankYou";
import FAQ from "@/pages/FAQ";
import Battles from "@/pages/Battles";
import BattleLobby from "@/pages/BattleLobby";
import BattleRoom from "@/pages/BattleRoom";
import TradeHouse from "@/pages/TradeHouse";
import HybridLive from "@/pages/HybridLive";
import TradeHouseBroadcast from "@/pages/TradeHouseBroadcast";
import TradeHouseStage from "@/pages/TradeHouseStage";
import TradeHybridTV from "@/pages/TradeHybridTV";
import TradeHouseStudio from "@/pages/TradeHouseStudio";

function RouteScrollManager() {
  const [location] = useLocation();

  useEffect(() => {
    const scrollToTarget = () => {
      const hash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
      if (hash) {
        const target = document.getElementById(hash);
        if (target) {
          const headerOffset = 112;
          const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
          window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "smooth" });
          return;
        }
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const frame = window.requestAnimationFrame(scrollToTarget);
    const timer = window.setTimeout(scrollToTarget, 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [location]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
      if (!hash) return;
      const target = document.getElementById(hash);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return null;
}

function TraderDnaRedirect() {
  useEffect(() => {
    const target = `/dna-test/index.html${window.location.search}${window.location.hash}`;
    window.location.replace(target);
  }, []);

  return (
    <div className="min-h-[60vh] bg-[#0B1426] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="font-['Orbitron'] text-sm text-accent">OPENING TRADER DNA...</p>
      </div>
    </div>
  );
}

function AppRouter() {
  return (
    <Switch>
      {/* ── Trader Battles arena routes (no Layout wrapper — full-screen) ── */}
      <Route path="/battles/lobby" component={() => <BattleLobby />} />
      <Route path="/battles/room/:roomId" component={() => <BattleRoom />} />
      <Route path="/tradehouse/stage" component={() => <TradeHouseStage />} />
      <Route path="/tradehouse/tv" component={() => <TradeHybridTV />} />
      <Route path="/tradehouse/broadcast/:view" component={() => <TradeHouseBroadcast />} />

      {/* ── Homepage uses the same site shell as every public marketing page ── */}
      <Route path="/" component={() => <Layout><GetFunded /></Layout>} />
      <Route path="/get-funded" component={() => <Layout><GetFunded /></Layout>} />

      {/* ── Main site routes with Layout ── */}
      <Route>
        {() => (
          <Layout>
            <AnimatePresence mode="wait">
              <Switch>
                <Route path="/home" component={() => <PageTransition><Home /></PageTransition>} />
                <Route path="/challenges" component={() => <PageTransition><Challenges /></PageTransition>} />
                <Route path="/predictive-markets" component={() => <PageTransition><PredictiveMarkets /></PageTransition>} />
                <Route path="/market-radar" component={() => <PageTransition><MarketRadar /></PageTransition>} />
                <Route path="/radar-pro" component={() => <PageTransition><RadarPro /></PageTransition>} />
                <Route path="/about" component={() => <PageTransition><About /></PageTransition>} />
                <Route path="/affiliate" component={() => <PageTransition><Affiliate /></PageTransition>} />
                <Route path="/trader-portal" component={() => <PageTransition><TraderPortal /></PageTransition>} />
                <Route path="/contact" component={() => <PageTransition><Contact /></PageTransition>} />
                <Route path="/terms" component={() => <PageTransition><Terms /></PageTransition>} />
                <Route path="/thank-you" component={() => <PageTransition><ThankYou /></PageTransition>} />
                <Route path="/faq" component={() => <PageTransition><FAQ /></PageTransition>} />
                <Route path="/battles" component={() => <PageTransition><Battles /></PageTransition>} />
                <Route path="/tradehouse" component={() => <PageTransition><TradeHouse /></PageTransition>} />
                <Route path="/tradehouse/studio" component={() => <PageTransition><TradeHouseStudio /></PageTransition>} />
                <Route path="/live" component={() => <PageTransition><HybridLive /></PageTransition>} />
                <Route path="/dna-test" component={() => <PageTransition><TraderDnaRedirect /></PageTransition>} />
                <Route path="/webinar" component={() => <PageTransition><Webinar /></PageTransition>} />
                <Route path="/playbook" component={() => <PageTransition><Playbook /></PageTransition>} />
                <Route path="/blog" component={() => <PageTransition><Blog /></PageTransition>} />
                <Route path="/blog/:slug">
                  {(params) => <PageTransition><BlogPost slug={params.slug} /></PageTransition>}
                </Route>
                <Route component={() => <PageTransition><NotFound /></PageTransition>} />
              </Switch>
            </AnimatePresence>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Show initial loading screen for 2.5 seconds on first visit
    const hasVisited = localStorage.getItem("hybridFundingVisited");
    if (!hasVisited) {
      localStorage.setItem("hybridFundingVisited", "true");
      setTimeout(() => {
        setIsInitialLoading(false);
      }, 2500);
    } else {
      // Skip loading for returning visitors
      setIsInitialLoading(false);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CyberpunkLoadingScreen isLoading={isInitialLoading && !/^\/tradehouse\/(stage|broadcast|tv)(\/|$)/.test(window.location.pathname)} />
        <Router>
          <RouteScrollManager />
          <AppRouter />
          {/* Bottom tab bar — renders only when running as an installed PWA */}
          <AppTabBar />
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
