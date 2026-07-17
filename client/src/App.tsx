import { Switch, Route, Router } from "wouter";
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

function AppRouter() {
  return (
    <Switch>
      {/* ── Trader Battles arena routes (no Layout wrapper — full-screen) ── */}
      <Route path="/battles/lobby" component={() => <BattleLobby />} />
      <Route path="/battles/room/:roomId" component={() => <BattleRoom />} />

      {/* ── Homepage uses the GetFunded conversion page (no navbar, own footer) ──
          Restored from fc1b85f — this was accidentally reverted to Home in the
          June 26 battles rewrite (248e492). ── */}
      <Route path="/" component={() => <GetFunded />} />
      <Route path="/get-funded" component={() => <GetFunded />} />

      {/* ── Main site routes with Layout ── */}
      <Route>
        {() => (
          <Layout>
            <AnimatePresence mode="wait">
              <Switch>
                <Route path="/home" component={() => <PageTransition><Home /></PageTransition>} />
                <Route path="/challenges" component={() => <PageTransition><Challenges /></PageTransition>} />
                <Route path="/predictive-markets" component={() => <PageTransition><PredictiveMarkets /></PageTransition>} />
                <Route path="/about" component={() => <PageTransition><About /></PageTransition>} />
                <Route path="/affiliate" component={() => <PageTransition><Affiliate /></PageTransition>} />
                <Route path="/trader-portal" component={() => <PageTransition><TraderPortal /></PageTransition>} />
                <Route path="/contact" component={() => <PageTransition><Contact /></PageTransition>} />
                <Route path="/terms" component={() => <PageTransition><Terms /></PageTransition>} />
                <Route path="/thank-you" component={() => <PageTransition><ThankYou /></PageTransition>} />
                <Route path="/faq" component={() => <PageTransition><FAQ /></PageTransition>} />
                <Route path="/battles" component={() => <PageTransition><Battles /></PageTransition>} />
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
        <CyberpunkLoadingScreen isLoading={isInitialLoading} />
        <Router>
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
