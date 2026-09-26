import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Link2,
  Megaphone,
  MousePointerClick,
  TrendingUp,
  Users,
} from "lucide-react";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";

const commissionTiers = [
  { tier: "Tier 1", description: "First 1–9 sales", percentage: "5%" },
  { tier: "Tier 2", description: "10–49 sales", percentage: "10%" },
  { tier: "Tier 3", description: "50–100 sales", percentage: "15%" },
  { tier: "Tier 4", description: "100+ sales", percentage: "20%" },
];

const storySteps = [
  {
    icon: Megaphone,
    title: "Create & Share",
    description:
      "Use your unique tracking link in content, communities, reviews, education, or direct referrals.",
  },
  {
    icon: Users,
    title: "Match Traders to a Path",
    description:
      "Give your audience more than one offer: Forex, Crypto, Futures, Single Session Equities, and Predictive Markets.",
  },
  {
    icon: TrendingUp,
    title: "Track & Grow",
    description:
      "Follow referral activity and conversions in your private dashboard, then grow into higher commission tiers.",
  },
];

const tools = [
  "Unique tracking links",
  "Private referral dashboard",
  "Conversion and performance reporting",
  "Marketing and campaign assets",
  "Five market paths to promote",
  "Performance tiers up to 20%",
];

const Affiliate = () => {
  const openPortal = () =>
    window.open("https://hybridfundingdashboard.propaccount.com/en/sign-in", "_blank", "noopener,noreferrer");

  return (
    <div className="min-h-screen cyberpunk-bg page-transition">
      <SEO
        title="Hybrid Funding Affiliate Program — Earn 5%–20% Commissions"
        description="Partner with Hybrid Funding, share five market paths with your audience, track referrals, and grow through performance-based commission tiers up to 20%."
        path="/affiliate"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Affiliate", path: "/affiliate" },
        ])}
      />

      <section id="affiliate-top" className="scroll-mt-28 border-b border-white/5 py-14 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
            >
              <span className="mb-4 inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-['Orbitron'] text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                Hybrid Funding Partners
              </span>
              <h1 className="font-['Orbitron'] text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Turn Your Audience Into
                <span className="block text-accent neon-text-accent">Trading Revenue.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#B8B8D0] sm:text-lg">
                Share Hybrid Funding with your community, connect traders to the market path that fits them,
                and build a referral business with trackable links, private reporting, and performance-based commissions.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {["5 market paths", "Up to 20% commission", "Private dashboard"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="neon-filled"
                  size="xl"
                  rounded="full"
                  onClick={openPortal}
                  className="font-['Orbitron'] font-semibold shadow-glow-accent"
                >
                  OPEN AFFILIATE PORTAL
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <a href="#commission-tiers">
                  <Button variant="neon" size="xl" rounded="full" className="w-full font-['Orbitron'] sm:w-auto">
                    SEE COMMISSION TIERS
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="relative"
            >
              <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-r from-accent/20 to-primary/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-[#101829] shadow-2xl">
                <img
                  src="/assets/affiliate-partner-story.webp"
                  alt="Hybrid Funding affiliate partner building content and reviewing referral performance"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="border-t border-white/10 bg-[#0B1426]/95 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <h2 className="font-['Orbitron'] text-lg font-bold text-white">Your Referral Business, In One View</h2>
                      <p className="mt-1 text-sm leading-relaxed text-[#B8B8D0]">
                        See what is converting, understand what your audience responds to, and use the data to improve the next campaign.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="affiliate-story" className="scroll-mt-28 border-b border-white/5 bg-[#0B1426] py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="font-['Orbitron'] text-xs uppercase tracking-[0.22em] text-accent">The Partner Story</span>
              <h2 className="mt-3 font-['Orbitron'] text-3xl font-bold text-white sm:text-4xl">
                Content → Trust → Referral → Commission
              </h2>
              <p className="mt-4 text-[#B8B8D0]">
                The strongest affiliates do more than post a link. They help traders understand the options, then make the next step easy.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {storySteps.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-[#171728] p-6"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/20">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="mb-2 font-['Orbitron'] text-xs text-primary">0{index + 1}</div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#B8B8D0]">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="commission-tiers" className="scroll-mt-28 py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-accent/20 bg-[#171728] p-6 sm:p-8">
              <span className="font-['Orbitron'] text-xs uppercase tracking-[0.22em] text-accent">Performance Ladder</span>
              <h2 className="mt-3 font-['Orbitron'] text-3xl font-bold text-white">Commission Structure</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#B8B8D0]">
                Your commission rate grows with production. The ladder is simple and visible.
              </p>

              <div className="mt-7 space-y-3">
                {commissionTiers.map((tier, index) => (
                  <motion.div
                    key={tier.tier}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="flex items-center justify-between rounded-xl border border-accent/20 bg-black/15 p-4"
                  >
                    <div>
                      <div className="font-semibold text-white">{tier.tier}</div>
                      <div className="text-sm text-[#B8B8D0]">{tier.description}</div>
                    </div>
                    <div className="font-['Orbitron'] text-2xl font-bold text-accent">{tier.percentage}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div id="affiliate-tools" className="scroll-mt-28 rounded-2xl border border-white/10 bg-[#171728] p-6 sm:p-8">
              <span className="font-['Orbitron'] text-xs uppercase tracking-[0.22em] text-primary">Partner Toolkit</span>
              <h2 className="mt-3 font-['Orbitron'] text-3xl font-bold text-white">Built to Help You Convert</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#B8B8D0]">
                One link should lead into an ecosystem, not a dead end. Give traders multiple ways to engage with Hybrid Funding.
              </p>

              <div className="mt-7 space-y-4">
                {tools.map((tool) => (
                  <div key={tool} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                    <span className="text-white">{tool}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Link href="/playbook">
                  <Button variant="neon" size="lg" rounded="full" className="w-full font-['Orbitron'] text-xs">
                    VIEW TRADER PLAYBOOK
                  </Button>
                </Link>
                <Link href="/predictive-markets">
                  <Button variant="neon" size="lg" rounded="full" className="w-full font-['Orbitron'] text-xs">
                    PREDICTIVE MARKETS
                  </Button>
                </Link>
              </div>

              <div className="mt-8 rounded-xl border border-accent/20 bg-accent/[0.05] p-4">
                <div className="flex gap-3">
                  <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-sm leading-relaxed text-[#B8B8D0]">
                    Share the page that best matches the trader. The Playbook educates, Trader DNA personalizes, and Challenges gives them the full program selector.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div id="affiliate-apply" className="scroll-mt-28 mx-auto mt-10 max-w-6xl rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-[#171728] to-accent/10 p-7 text-center sm:p-10">
            <MousePointerClick className="mx-auto h-8 w-8 text-accent" />
            <h2 className="mt-4 font-['Orbitron'] text-2xl font-bold text-white sm:text-3xl">Ready to Build With Hybrid Funding?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[#B8B8D0]">
              Open the affiliate portal to access your partner account and referral tools.
            </p>
            <Button
              variant="neon-filled"
              size="xl"
              rounded="full"
              onClick={openPortal}
              className="mt-6 font-['Orbitron'] font-semibold shadow-glow-accent"
            >
              OPEN AFFILIATE PORTAL
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Affiliate;
