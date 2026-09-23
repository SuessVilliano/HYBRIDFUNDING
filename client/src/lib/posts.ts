// Blog post manifest. Each post is authored as a TSX component lazily imported
// from /blog/<slug>. Add new posts here and create the matching component file.

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO
  updatedAt?: string;
  historicalEventDate?: string;
  archive?: boolean;
  readingMinutes: number;
  tags: string[];
  excerpt: string;
}

export const posts: PostMeta[] = [
  {
    slug: "bundles-customer-credit-rapid-payout-cart",
    title: "New at Hybrid Funding: Bundles, Customer Credit, Rapid Payout & Cart",
    description:
      "Four major Hybrid Funding checkout and payout upgrades are rolling out: challenge bundles, Customer Credit, Rapid Payout options, and a multi-item cart.",
    publishedAt: "2026-09-23",
    readingMinutes: 6,
    tags: ["Update", "New Features", "Payouts"],
    excerpt:
      "Buy multiple challenges together, turn payouts into higher-value account credit, choose faster payout frequencies, and check out multiple items at once.",
  },
  {
    slug: "september-2026-leaf-event",
    title: "September LEAF Event: 40% Off Evaluations & 25% Off Instant Funding",
    description:
      "Hybrid Funding's September 2026 LEAF Event: LEAF40 for eligible evaluation plans and LEAF25 for Instant Funding and Instant Funding Lite through September 30.",
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-23",
    readingMinutes: 2,
    tags: ["Promotion", "September", "Savings"],
    excerpt:
      "Two September codes, two plan groups: LEAF40 for eligible evaluations and LEAF25 for Instant Funding and IF Lite through September 30.",
  },
  {
    slug: "how-to-pass-a-1-step-forex-challenge",
    title: "How to Pass a 1-Step Forex Challenge (Hybrid Funding Edition)",
    description:
      "A practical, rule-by-rule walkthrough of passing a 1-Step Forex evaluation at Hybrid Funding, from position sizing to weekend rules and the trailing drawdown.",
    publishedAt: "2026-04-15",
    readingMinutes: 9,
    tags: ["Forex", "Strategy", "Evaluation"],
    excerpt:
      "Most 1-Step failures aren't from bad trades — they're from breaching the trailing max drawdown by half a percent on an otherwise green week. Here's how to never let that happen again.",
  },
  {
    slug: "single-session-equities-explained",
    title: "Single Session Equities Explained — A New Way to Trade S&P 100",
    description:
      "Hybrid Funding's Single Session Equities program lets traders day-trade S&P 100 names on GooeyPro with 2:1 leverage. Full rules, drawdown math, and a worked example.",
    publishedAt: "2026-04-22",
    readingMinutes: 7,
    tags: ["Equities", "GooeyPro", "Day Trading"],
    excerpt:
      "10% profit target. 3% trailing max drawdown. 09:30–15:55 ET window. $0.02 per share commission. Here's how Single Session Equities actually works.",
  },
  {
    slug: "instant-funding-vs-evaluation",
    title: "Instant Funding vs Evaluation Challenges — Which Should You Pick?",
    description:
      "A side-by-side breakdown of Instant Funding, Instant Funding Lite, and 1/2/3-Step evaluations at Hybrid Funding — when each makes sense and when it doesn't.",
    publishedAt: "2026-04-28",
    readingMinutes: 8,
    tags: ["Strategy", "Pricing", "Evaluation"],
    excerpt:
      "Instant Funding looks like a shortcut. Sometimes it is. Sometimes the cheaper 1-Step is the smarter spend. Here's the math.",
  },
  {
    slug: "futures-prop-firm-rules",
    title: "Futures Prop Firm Rules, Decoded — Platforms, Drawdown & Payouts",
    description:
      "Trailing drawdown, consistency requirements, contract limits, payout phases — what every futures trader needs to know before paying for a 4-Phase Funded Plan.",
    publishedAt: "2026-04-30",
    readingMinutes: 10,
    tags: ["Futures", "Tradovate", "Volumetrica", "DXtrade Futures", "Tickblaze"],
    excerpt:
      "Hybrid Funding's 4-Phase Funded Futures Plan has phase-by-phase payouts and a 25% consistency requirement, with multiple platform choices and Tickblaze joining the Futures lineup.",
  },
  {
    slug: "hybrid-funding-vs-other-prop-firms",
    title: "Hybrid Funding vs Other Prop Firms — Honest Comparison",
    description:
      "Profit splits, max drawdowns, payout cadence, supported platforms, and asset classes compared. Where Hybrid Funding stands among the major prop firms.",
    publishedAt: "2026-05-01",
    readingMinutes: 11,
    tags: ["Comparison", "Prop Firms"],
    excerpt:
      "We won't pretend we're the only prop firm. Here's an honest look at where Hybrid Funding fits — and where another firm might suit your style better.",
  },

  {
    slug: "platform-foundation-may-2025",
    title: "Hybrid Funding Platform Foundation: The First Public Build",
    description: "The earliest Hybrid Funding repository milestone: initial platform structure, challenge experience, and live support foundation.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2025-05-17",
    archive: true,
    readingMinutes: 5,
    tags: ["Product History","Platform","Archive"],
    excerpt: "The first public build established the foundation that later expanded across five market paths, education, Battles, and AI tools.",
  },
  {
    slug: "tradehouse-battles-first-preview",
    title: "TradeHouse Battles Enters the Hybrid Funding Experience",
    description: "Hybrid Funding's first TradeHouse Battles showcase introduced competitive trading as part of the platform experience.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2025-05-28",
    archive: true,
    readingMinutes: 3,
    tags: ["Product History","Battles","Archive"],
    excerpt: "Before the live arena, TradeHouse Battles first appeared as a competitive trading showcase built around skill and funded-account opportunities.",
  },
  {
    slug: "affiliate-program-expansion-june-2025",
    title: "Affiliate Program Expands With New Commission Tiers",
    description: "A June 2025 affiliate update formalized new commission tiers and expanded partner-program details.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2025-06-10",
    archive: true,
    readingMinutes: 3,
    tags: ["Product History","Affiliate","Archive"],
    excerpt: "Hybrid Funding expanded beyond trader acquisition by formalizing clearer affiliate commission tiers for creators and partners.",
  },
  {
    slug: "instant-funding-lite-launch",
    title: "Instant Funding Lite Launches",
    description: "Instant Funding Lite added a lower-cost no-evaluation path with tighter risk parameters.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2025-11-12",
    archive: true,
    readingMinutes: 4,
    tags: ["Product History","Instant Funding","Archive"],
    excerpt: "A new route for traders who wanted immediate funded access at a lower entry cost.",
  },
  {
    slug: "single-session-equities-launch",
    title: "Single Session Equities Joins Hybrid Funding",
    description: "Hybrid Funding added Single Session Equities, GooeyPro support, and a dedicated path for stock traders.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2026-05-01",
    archive: true,
    readingMinutes: 4,
    tags: ["Product History","Equities","Archive"],
    excerpt: "S&P 100 trading joined the lineup with a session-based equity program and dedicated platform support.",
  },
  {
    slug: "free-training-webinar-launch",
    title: "Hybrid Funding Launches the Free Training Webinar Funnel",
    description: "The free-training webinar created a dedicated education path for program rules, platform choices, and funded-account strategy.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2026-05-07",
    archive: true,
    readingMinutes: 3,
    tags: ["Product History","Education","Archive"],
    excerpt: "Education became a bigger part of the customer journey with a dedicated free-training funnel.",
  },
  {
    slug: "unity20-promotion-june-2026",
    title: "UNITY20 Promotion Added to Hybrid Funding",
    description: "UNITY20 was integrated directly into the site with visible code blocks and one-tap copying.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2026-06-09",
    archive: true,
    readingMinutes: 2,
    tags: ["Product History","Promotion","Archive"],
    excerpt: "Promotions moved from scattered messaging into the actual product experience.",
  },
  {
    slug: "goal-summer-promotion-2026",
    title: "GOAL40 / GOAL25 Summer Promotion Announced",
    description: "The GOAL summer campaign introduced separate codes for evaluation and Instant Funding plan groups.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2026-06-12",
    archive: true,
    readingMinutes: 3,
    tags: ["Product History","Promotion","Archive"],
    excerpt: "GOAL40 and GOAL25 introduced a two-code structure and helped drive centralized promotion management.",
  },
  {
    slug: "trader-playbook-launch",
    title: "The Hybrid Funding Trader Playbook Goes Live",
    description: "The full Trader Playbook launched as a long-form guide to rules, sizing, drawdown, payouts, and trader decision-making.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2026-06-17",
    archive: true,
    readingMinutes: 4,
    tags: ["Product History","Playbook","Archive"],
    excerpt: "One structured resource brought the core Hybrid Funding rules and strategy education together.",
  },
  {
    slug: "tradehouse-live-arena-launch",
    title: "TradeHouse Battles Launches Live 1v1, 2v2 & 3v3 Rooms",
    description: "TradeHouse Battles advanced into a live arena with 1v1, 2v2 and 3v3 rooms plus streaming infrastructure.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2026-06-26",
    archive: true,
    readingMinutes: 4,
    tags: ["Product History","Battles","Archive"],
    excerpt: "The competitive trading concept became an interactive live-room experience.",
  },
  {
    slug: "predictive-markets-launch-july-2026",
    title: "Predictive Markets Launch at Hybrid Funding",
    description: "Predictive Markets became Hybrid Funding's fifth market path with its own dedicated product page.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2026-07-07",
    archive: true,
    readingMinutes: 4,
    tags: ["Product History","Predictive Markets","Archive"],
    excerpt: "Event-based Yes/No markets expanded Hybrid Funding beyond Forex, Crypto, Futures, and Equities.",
  },
  {
    slug: "hybrid-funding-pwa-launch",
    title: "Hybrid Funding Becomes an Installable Web App",
    description: "Progressive Web App support added home-screen installation and a more app-like mobile experience.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2026-07-17",
    archive: true,
    readingMinutes: 3,
    tags: ["Product History","Mobile","Archive"],
    excerpt: "Hybrid Funding became installable with mobile shortcuts and PWA navigation.",
  },
  {
    slug: "ai-market-radar-launch-july-2026",
    title: "AI Market Radar Launches for Predictive Markets",
    description: "AI Market Radar introduced a live scanner for movers, volume spikes, decision windows, and book imbalances.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2026-07-19",
    archive: true,
    readingMinutes: 4,
    tags: ["Product History","AI Radar","Archive"],
    excerpt: "Predictive Markets gained a dedicated research layer for narrowing live events into higher-priority research candidates.",
  },
  {
    slug: "sunny-summer-promotion-2026",
    title: "SUNNY35 / SUNNY20 Summer Promotion",
    description: "The July 20–August 10 SUNNY campaign introduced two seasonal codes and a 90/10 add-on promotion.",
    publishedAt: "2026-09-23",
    historicalEventDate: "2026-07-20",
    archive: true,
    readingMinutes: 2,
    tags: ["Product History","Promotion","Archive"],
    excerpt: "The SUNNY campaign followed GOAL and extended Hybrid Funding's seasonal promotion cadence.",
  },
];

export function getPostBySlug(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): PostMeta[] {
  const current = getPostBySlug(slug);
  if (!current) return posts.slice(0, limit);
  return posts
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score: p.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}
