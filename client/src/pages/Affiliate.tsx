import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart3, Users, BookOpen, LayoutTemplate, ShieldCheck } from "lucide-react";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";

const Affiliate = () => {
  const features = [
    {
      icon: <LineChart className="h-5 w-5 text-accent" />,
      title: "Trackable affiliate links",
      description: "Track referrals and conversions through your partner dashboard."
    },
    {
      icon: <LayoutTemplate className="h-5 w-5 text-accent" />,
      title: "Partner marketing kit",
      description: "Use approved website modules, campaign angles, social copy, email/SMS templates, and creative briefs instead of starting from a blank page."
    },
    {
      icon: <BookOpen className="h-5 w-5 text-accent" />,
      title: "Education-first funnel",
      description: "Lead with the Trader Playbook, Trader DNA, market education, and product walkthroughs before asking for a purchase."
    },
    {
      icon: <Users className="h-5 w-5 text-accent" />,
      title: "Build a Trade House",
      description: "Organize a trader community around market specialization, accountability, education, and Trade House Battles."
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-accent" />,
      title: "Five market paths",
      description: "Create campaigns around Forex, Crypto, Futures, Single Session Equities, and Prediction Markets."
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-accent" />,
      title: "Clear promotion standards",
      description: "Approved disclosures and claim guardrails help partners promote responsibly and keep messaging consistent."
    }
  ];

  const commissionTiers = [
    { tier: "Tier 1", description: "First 1-9 sales", percentage: "5%" },
    { tier: "Tier 2", description: "10-49 sales", percentage: "10%" },
    { tier: "Tier 3", description: "50-100 sales", percentage: "15%" },
    { tier: "Tier 4", description: "100+ sales", percentage: "20%" }
  ];

  return (
    <section className="py-20 cyberpunk-bg page-transition">
      <SEO
        title="Hybrid Funding Partner Program — Build a Trade House"
        description="Partner with Hybrid Funding using trackable referrals, tiered commissions, education-first campaigns, website placements, and a Trade House community model."
        path="/affiliate"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Affiliate", path: "/affiliate" },
        ])}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex rounded-full bg-accent/10 border border-accent/30 text-accent px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              Partner Growth Program
            </span>
            <h1 className="font-['Orbitron'] text-3xl md:text-5xl font-bold text-white mb-4">
              Don't Just Share a Link. <span className="text-accent neon-text-accent">Build a Trade House.</span>
            </h1>
            <p className="text-[#B8B8D0] max-w-3xl mx-auto text-lg">
              Build an audience or trader community with useful education, five-market access, approved marketing assets,
              and tracked referrals. Give traders a reason to trust you before asking them to buy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="glassmorphism rounded-xl p-8">
                <h2 className="font-['Orbitron'] text-2xl font-bold text-white mb-6">Partner Infrastructure</h2>
                <div className="space-y-6">
                  {features.map((feature) => (
                    <div key={feature.title} className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">{feature.title}</h3>
                        <p className="text-[#B8B8D0]">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="neon-filled"
                    size="xl"
                    rounded="full"
                    onClick={() => window.open("https://hybridfundingdashboard.propaccount.com/en/sign-in", "_blank")}
                    className="font-['Orbitron'] font-semibold shadow-glow-accent"
                  >
                    APPLY TO JOIN
                  </Button>
                  <Button
                    variant="neon"
                    size="xl"
                    rounded="full"
                    onClick={() => window.location.href = "/playbook"}
                    className="font-['Orbitron'] font-semibold"
                  >
                    SEE THE PLAYBOOK
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="glassmorphism rounded-xl p-8 neon-border">
                <h2 className="font-['Orbitron'] text-2xl font-bold text-white mb-2">Current Public Commission Tiers</h2>
                <p className="text-[#B8B8D0] mb-6">
                  The public program currently lists tiered commissions and weekly payouts. Your partner dashboard and agreement govern if terms change.
                </p>

                <div className="space-y-4">
                  {commissionTiers.map((tier, index) => (
                    <motion.div
                      key={tier.tier}
                      className="flex justify-between items-center p-4 border border-accent/20 rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index + 0.5 }}
                    >
                      <div>
                        <h3 className="text-white font-semibold">{tier.tier}</h3>
                        <p className="text-[#B8B8D0] text-sm">{tier.description}</p>
                      </div>
                      <div className="text-accent font-['Orbitron'] font-bold text-2xl">{tier.percentage}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 rounded-lg border border-white/10 bg-white/5 p-5">
                  <h3 className="font-['Orbitron'] text-lg font-bold text-white mb-2">The partner standard</h3>
                  <p className="text-[#B8B8D0] text-sm leading-relaxed">
                    Be useful without the sale. Disclose the affiliate relationship clearly. Never promise funding,
                    profitability, or payouts. Use current rules and describe AI Market Radar as a research tool, not a prediction guarantee.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Affiliate;
