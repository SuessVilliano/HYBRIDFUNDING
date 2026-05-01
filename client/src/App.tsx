import { Switch, Route, Router, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Layout from "@/components/Layout";
import PageTransition, { CyberpunkLoadingScreen } from "@/components/ui/page-transition";
import StickyCTA from "@/components/StickyCTA";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { lazy, Suspense, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { trackEvent } from "./lib/analytics";

// Route-level code splitting — each page becomes its own chunk
const Home = lazy(() => import("@/pages/Home"));
const Challenges = lazy(() => import("@/pages/Challenges"));
const About = lazy(() => import("@/pages/About"));
const Affiliate = lazy(() => import("@/pages/Affiliate"));
const TraderPortal = lazy(() => import("@/pages/TraderPortal"));
const Contact = lazy(() => import("@/pages/Contact"));
const Terms = lazy(() => import("@/pages/Terms"));
const ThankYou = lazy(() => import("@/pages/ThankYou"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Battles = lazy(() => import("@/pages/Battles"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Playbook = lazy(() => import("@/pages/Playbook"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageViewTracker() {
  const [loc] = useLocation();
  useEffect(() => {
    trackEvent("page_view", { path: loc });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [loc]);
  return null;
}

function AppRouter() {
  return (
    <Layout>
      <PageViewTracker />
      <Suspense fallback={<div className="min-h-screen" />}>
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
            <Route path="/playbook" component={() => <PageTransition><Playbook /></PageTransition>} />
            <Route path="/blog" component={() => <PageTransition><Blog /></PageTransition>} />
            <Route path="/blog/:slug">
              {(params) => <PageTransition><BlogPost slug={params.slug} /></PageTransition>}
            </Route>
            <Route component={() => <PageTransition><NotFound /></PageTransition>} />
          </Switch>
        </AnimatePresence>
      </Suspense>
      <StickyCTA />
      <ExitIntentPopup />
    </Layout>
  );
}

function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hybridFundingVisited");
    if (!hasVisited) {
      localStorage.setItem("hybridFundingVisited", "true");
      setTimeout(() => setIsInitialLoading(false), 2500);
    } else {
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
