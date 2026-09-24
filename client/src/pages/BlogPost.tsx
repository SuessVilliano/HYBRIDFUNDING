import type { ComponentType } from "react";
import AffiliateProgramExpansionJune2025 from "./blog-posts/affiliate-program-expansion-june-2025";
import AiMarketRadarLaunchJuly2026 from "./blog-posts/ai-market-radar-launch-july-2026";
import BundlesCustomerCreditRapidPayoutCart from "./blog-posts/bundles-customer-credit-rapid-payout-cart";
import FreeTrainingWebinarLaunch from "./blog-posts/free-training-webinar-launch";
import FuturesPropFirmRules from "./blog-posts/futures-prop-firm-rules";
import GoalSummerPromotion2026 from "./blog-posts/goal-summer-promotion-2026";
import HowToPassA1StepForexChallenge from "./blog-posts/how-to-pass-a-1-step-forex-challenge";
import HybridFundingPwaLaunch from "./blog-posts/hybrid-funding-pwa-launch";
import HybridFundingVsOtherPropFirms from "./blog-posts/hybrid-funding-vs-other-prop-firms";
import InstantFundingLiteLaunch from "./blog-posts/instant-funding-lite-launch";
import InstantFundingVsEvaluation from "./blog-posts/instant-funding-vs-evaluation";
import PlatformFoundationMay2025 from "./blog-posts/platform-foundation-may-2025";
import PredictiveMarketsLaunchJuly2026 from "./blog-posts/predictive-markets-launch-july-2026";
import September2026LeafEvent from "./blog-posts/september-2026-leaf-event";
import SingleSessionEquitiesExplained from "./blog-posts/single-session-equities-explained";
import SingleSessionEquitiesLaunch from "./blog-posts/single-session-equities-launch";
import SunnySummerPromotion2026 from "./blog-posts/sunny-summer-promotion-2026";
import TradehouseBattlesFirstPreview from "./blog-posts/tradehouse-battles-first-preview";
import TradehouseLiveArenaLaunch from "./blog-posts/tradehouse-live-arena-launch";
import TraderDnaTestLaunch from "./blog-posts/trader-dna-test-launch";
import TraderPlaybookLaunch from "./blog-posts/trader-playbook-launch";
import Unity20PromotionJune2026 from "./blog-posts/unity20-promotion-june-2026";
import { Link } from "wouter";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { breadcrumbSchema, articleSchema } from "@/lib/jsonLd";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { Calendar, Clock, ArrowRight, ChevronLeft } from "lucide-react";
import A2PCompliantOptInForm from "@/components/A2PCompliantOptInForm";

const postComponents: Record<string, ComponentType> = {
  "affiliate-program-expansion-june-2025": AffiliateProgramExpansionJune2025,
  "ai-market-radar-launch-july-2026": AiMarketRadarLaunchJuly2026,
  "bundles-customer-credit-rapid-payout-cart": BundlesCustomerCreditRapidPayoutCart,
  "free-training-webinar-launch": FreeTrainingWebinarLaunch,
  "futures-prop-firm-rules": FuturesPropFirmRules,
  "goal-summer-promotion-2026": GoalSummerPromotion2026,
  "how-to-pass-a-1-step-forex-challenge": HowToPassA1StepForexChallenge,
  "hybrid-funding-pwa-launch": HybridFundingPwaLaunch,
  "hybrid-funding-vs-other-prop-firms": HybridFundingVsOtherPropFirms,
  "instant-funding-lite-launch": InstantFundingLiteLaunch,
  "instant-funding-vs-evaluation": InstantFundingVsEvaluation,
  "platform-foundation-may-2025": PlatformFoundationMay2025,
  "predictive-markets-launch-july-2026": PredictiveMarketsLaunchJuly2026,
  "september-2026-leaf-event": September2026LeafEvent,
  "single-session-equities-explained": SingleSessionEquitiesExplained,
  "single-session-equities-launch": SingleSessionEquitiesLaunch,
  "sunny-summer-promotion-2026": SunnySummerPromotion2026,
  "tradehouse-battles-first-preview": TradehouseBattlesFirstPreview,
  "tradehouse-live-arena-launch": TradehouseLiveArenaLaunch,
  "trader-dna-test-launch": TraderDnaTestLaunch,
  "trader-playbook-launch": TraderPlaybookLaunch,
  "unity20-promotion-june-2026": Unity20PromotionJune2026,
};

const formatLongDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

interface BlogPostProps {
  slug: string;
}

const BlogPost: React.FC<BlogPostProps> = ({ slug }) => {
  const meta = getPostBySlug(slug);

  if (!meta) {
    return (
      <section className="py-32 cyberpunk-bg page-transition text-center">
        <SEO title="Post not found" description="This post doesn't exist." path={`/blog/${slug}`} noindex />
        <h1 className="font-['Orbitron'] text-3xl text-white mb-4">Post not found</h1>
        <Link href="/blog" className="text-accent underline">Back to Updates</Link>
      </section>
    );
  }

  const PostBody = postComponents[slug] ?? null;

  const related = getRelatedPosts(slug, 3);

  return (
    <article className="py-20 cyberpunk-bg page-transition">
      <SEO
        title={meta.title}
        description={meta.description}
        path={`/blog/${slug}`}
        type="article"
        publishedTime={meta.publishedAt}
        modifiedTime={meta.updatedAt}
        jsonLd={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "News & Updates", path: "/blog" },
            { name: meta.title, path: `/blog/${slug}` },
          ]),
          articleSchema({
            title: meta.title,
            description: meta.description,
            path: `/blog/${slug}`,
            publishedTime: meta.publishedAt,
            modifiedTime: meta.updatedAt,
          }),
        ]}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          className="max-w-3xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/blog" className="inline-flex items-center gap-1 text-[#B8B8D0] hover:text-accent text-sm mb-6">
            <ChevronLeft className="h-4 w-4" /> Back to Updates
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            {meta.tags.map((t) => (
              <span key={t} className="text-[10px] font-['Orbitron'] uppercase tracking-wide bg-accent/15 text-accent border border-accent/30 rounded-full px-2 py-0.5">
                {t}
              </span>
            ))}
          </div>
          {meta.archive && meta.historicalEventDate && (
            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-[#B8B8D0]">
              <span className="font-['Orbitron'] text-xs font-bold uppercase tracking-wider text-primary">Product History</span>
              <p className="mt-1">
                Originally shipped <strong className="text-white">{formatLongDate(meta.historicalEventDate)}</strong>. This archive entry was added to the newsroom on {formatLongDate(meta.publishedAt)} from verified repository history.
              </p>
            </div>
          )}
          <h1 className="font-['Orbitron'] text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {meta.title}
          </h1>
          <p className="text-[#B8B8D0] text-lg mb-4">{meta.description}</p>
          <div className="flex items-center gap-4 text-[#6F6F8A] text-sm">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatLongDate(meta.publishedAt)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {meta.readingMinutes} min read</span>
          </div>
        </motion.header>

        <div className="max-w-3xl mx-auto glassmorphism rounded-xl p-6 md:p-10 prose-content">
          {PostBody ? <PostBody /> : <p className="text-[#B8B8D0]">Article content unavailable.</p>}
        </div>

        {/* Inline lead-magnet — capture readers at high intent */}
        <div className="max-w-3xl mx-auto mt-12 glassmorphism rounded-xl p-6 md:p-8 border border-accent/30">
          <p className="text-accent font-['Orbitron'] uppercase tracking-widest text-xs mb-2">Get the playbook</p>
          <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-2">
            Want our full Trader Playbook (PDF) — free?
          </h3>
          <p className="text-[#B8B8D0] mb-4">
            We'll text you the download link plus current Hybrid Funding offers and product updates.
          </p>
          <A2PCompliantOptInForm showResourceLinks={false} compactMode />
        </div>

        {related.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16">
            <h3 className="font-['Orbitron'] text-2xl font-bold text-white mb-6 text-center">
              Related reading
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="glassmorphism rounded-xl p-5 hover:scale-[1.02] transition-transform">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] font-['Orbitron'] uppercase tracking-wide bg-accent/15 text-accent border border-accent/30 rounded-full px-2 py-0.5">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h4 className="font-['Orbitron'] text-base font-bold text-white mb-2 leading-snug">{p.title}</h4>
                  <span className="inline-flex items-center gap-1 text-accent text-sm">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogPost;
