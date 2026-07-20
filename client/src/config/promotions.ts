/* PROMOTION HISTORY
 * 2026-05-XX  UNITY20     — 20% off all plans
 * 2026-06-19  GOAL40/25   — 40% standard, 25% instant. Ended 2026-07-19
 * 2026-07-20  SUNNY35/20  — 35% standard, 20% instant, both + 90/10 profit split add-on. Ends 2026-08-10
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
  name: "Sunny Days Promo",
  headline: "Sunny Days. Brighter Payouts.",
  subtext: "Up to 35% off every plan — plus a 90/10 profit split add-on included.",
  startDate: "2026-07-20",
  endDate: "2026-08-10",
  badgeText: "☀️ Sunny Promo — Valid July 20 – August 10, 2026",
  exitPopupHeadline: "Don\'t let the sun set on this deal.",
  exitPopupSubtext: "Use SUNNY35 for 35% off + a 90/10 profit split add-on (SUNNY20 for Instant Funding) before August 10th.",
  tiers: [
    {
      code: "SUNNY35",
      discountPercent: 35,
      multiplier: 0.65,
      label: "35% OFF + 90/10 SPLIT",
      applicablePlans: "standard",
    },
    {
      code: "SUNNY20",
      discountPercent: 20,
      multiplier: 0.80,
      label: "20% OFF + 90/10 SPLIT",
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
