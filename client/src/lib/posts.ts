// Blog post manifest. Each post is authored as a TSX component lazily imported
// from /blog/<slug>. Add new posts here and create the matching component file.

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO
  updatedAt?: string;
  readingMinutes: number;
  tags: string[];
  excerpt: string;
}

export const posts: PostMeta[] = [
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
    title: "Futures Prop Firm Rules, Decoded — Tradovate, Volumetrica & DXtrade Futures",
    description:
      "Trailing drawdown, consistency requirements, contract limits, payout phases — what every futures trader needs to know before paying for a 4-Phase Funded Plan.",
    publishedAt: "2026-04-30",
    readingMinutes: 10,
    tags: ["Futures", "Tradovate", "Volumetrica", "DXtrade Futures"],
    excerpt:
      "Hybrid Funding's 4-Phase Funded Futures Plan has phase-by-phase payouts and a 25% consistency requirement. Trade it on Tradovate, Volumetrica, or DXtrade Futures — same rules, your choice of platform.",
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
