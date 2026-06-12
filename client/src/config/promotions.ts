/* PROMOTION HISTORY
 * 2026-05-XX  UNITY20   — 20% off all plans
 * 2026-06-19  GOAL40/25 — 40% standard, 25% instant. Ends 2026-07-19
 */

export interface PromoTier {
  code: string;
  discountPercent: number;      // e.g. 40
  multiplier: number;           // e.g. 0.60  (price * multiplier = discounted price)
  label: string;                // e.g. "40% OFF"
  applicablePlans: "all" | "standard" | "instant";
  // "all"      = every plan uses this code
  // "standard" = all plans EXCEPT Instant Funding and IF Lite
  // "instant"  = Instant Funding and Instant Funding Lite only
}

export interface ActivePromotion {
  active: boolean;              // flip to false to disable all promos instantly
  name: string;                 // e.g. "Summer Goal Promo"
  headline: string;             // banner headline
  subtext: string;              // banner subtext
  startDate: string;            // ISO date string
  endDate: string;              // ISO date string
  tiers: PromoTier[];           // supports 1 or 2 tiers
  badgeText?: string;           // optional badge like "🔥 Limited Time"
  exitPopupHeadline?: string;   // override for exit popup
  exitPopupSubtext?: string;
}

// ─── Edit ONLY this object to launch a new promotion ─────────────────────────
const ACTIVE_PROMOTION: ActivePromotion = {
  active: true,
  name: "Summer Goal Promo",
  headline: "Turn Every Goal Into Profit",
  subtext: "Limited-time summer discount. Start your funded journey now.",
  startDate: "2026-06-19",
  endDate: "2026-07-19",
  badgeText: "🔥 Summer Promo — Valid June 19 – July 19, 2026",
  exitPopupHeadline: "Don\'t leave your goals on the table.",
  exitPopupSubtext: "Use GOAL40 for 40% off all plans before July 19th.",
  tiers: [
    {
      code: "GOAL40",
      discountPercent: 40,
      multiplier: 0.60,
      label: "40% OFF",
      applicablePlans: "standard",
    },
    {
      code: "GOAL25",
      discountPercent: 25,
      multiplier: 0.75,
      label: "25% OFF",
      applicablePlans: "instant",
    },
  ],
};

/**
 * Returns the matching PromoTier for a given plan key, or null if:
 * - The promotion is inactive, OR
 * - No tier covers that plan type.
 *
 * planKey examples: "one-step", "two-step", "three-step", "four-phase",
 *                   "instant", "instant-lite"
 */
export function getPromoForPlan(planKey: string): PromoTier | null {
  if (!ACTIVE_PROMOTION.active) return null;
  const isInstant = planKey === "instant" || planKey === "instant-lite";
  for (const tier of ACTIVE_PROMOTION.tiers) {
    if (tier.applicablePlans === "all") return tier;
    if (tier.applicablePlans === "instant" && isInstant) return tier;
    if (tier.applicablePlans === "standard" && !isInstant) return tier;
  }
  return null;
}

export default ACTIVE_PROMOTION;
