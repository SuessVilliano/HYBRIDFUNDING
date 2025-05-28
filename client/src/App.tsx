import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";

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
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/challenges" component={Challenges} />
        <Route path="/about" component={About} />
        <Route path="/affiliate" component={Affiliate} />
        <Route path="/trader-portal" component={TraderPortal} />
        <Route path="/contact" component={Contact} />
        <Route path="/terms" component={Terms} />
        <Route path="/thank-you" component={ThankYou} />
        <Route path="/faq" component={FAQ} />
        <Route path="/battles" component={Battles} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AppRouter />
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
