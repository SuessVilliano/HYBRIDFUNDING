/* PROMOTION HISTORY
 * 2026-05-XX  UNITY20     — 20% off all plans
 * 2026-06-19  GOAL40/25   — 40% standard, 25% instant. Ended 2026-07-19
 * 2026-07-20  SUNNY35/20  — 35% standard, 20% instant, both + 90/10 profit split add-on. Ended 2026-08-10
 * 2026-08-12  PALM40/25   — 40% standard, 25% instant, both + 90/10 profit split add-on. Ends 2026-08-31
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
  name: "Palm Season Promo",
  headline: "Turn the Scroll Into a Signup.",
  subtext: "Up to 40% off every plan — plus a 90/10 profit split add-on included.",
  startDate: "2026-08-12",
  endDate: "2026-08-31",
  badgeText: "🌴 Palm Promo — Valid August 12 – 31, 2026",
  exitPopupHeadline: "The right offer, right now.",
  exitPopupSubtext: "Use PALM40 for 40% off + a 90/10 profit split add-on (PALM25 for Instant Funding) before August 31st.",
  tiers: [
    {
      code: "PALM40",
      discountPercent: 40,
      multiplier: 0.60,
      label: "40% OFF + 90/10 SPLIT",
      applicablePlans: "standard",
    },
    {
      code: "PALM25",
      discountPercent: 25,
      multiplier: 0.75,
      label: "25% OFF + 90/10 SPLIT",
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
