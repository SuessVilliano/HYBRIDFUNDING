import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import PageTransition, { CyberpunkLoadingScreen } from "@/components/ui/page-transition";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

// Pages
import Home from "@/pages/Home";
import Challenges from "@/pages/Challenges";
import About from "@/pages/About";
import Affiliate from "@/pages/Affiliate";
import TraderPortal from "@/pages/TraderPortal";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import ThankYou from "@/pages/ThankYou";
import FAQ from "@/pages/FAQ";
import Battles from "@/pages/Battles";

function AppRouter() {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Switch>
          <Route path="/" component={() => <PageTransition><Home /></PageTransition>} />
          <Route path="/challenges" component={() => <PageTransition><Challenges /></PageTransition>} />
          <Route path="/about" component={() => <PageTransition><About /></PageTransition>} />
          <Route path="/affiliate" component={() => <PageTransition><Affiliate /></PageTransition>} />
          <Route path="/trader-portal" component={() => <PageTransition><TraderPortal /></PageTransition>} />
          <Route path="/contact" component={() => <PageTransition><Contact /></PageTransition>} />
          <Route path="/terms" component={() => <PageTransition><Terms /></PageTransition>} />
          <Route path="/thank-you" component={() => <PageTransition><ThankYou /></PageTransition>} />
          <Route path="/faq" component={() => <PageTransition><FAQ /></PageTransition>} />
          <Route path="/battles" component={() => <PageTransition><Battles /></PageTransition>} />
          <Route component={() => <PageTransition><NotFound /></PageTransition>} />
        </Switch>
      </AnimatePresence>
    </Layout>
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
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
