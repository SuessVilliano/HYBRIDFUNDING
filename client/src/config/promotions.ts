/* CURRENT PROMOTION: September 1–30, 2026 */

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
  name: string;                 // e.g. "September LEAF Event"
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
  name: "September LEAF Event",
  headline: "Turn Over a New Leaf. Fund Your Next Move.",
  subtext: "Save 40% on evaluation plans or 25% on Instant Funding and IF Lite throughout September.",
  startDate: "2026-09-01T00:00:00-04:00",
  endDate: "2026-09-30T23:59:59-04:00",
  badgeText: "🍃 September LEAF Event — Valid September 1–30, 2026",
  exitPopupHeadline: "Your next funded chapter starts here.",
  exitPopupSubtext: "Use LEAF40 for 40% off evaluation plans, or LEAF25 for 25% off Instant Funding and IF Lite, through September 30.",
  tiers: [
    {
      code: "LEAF40",
      discountPercent: 40,
      multiplier: 0.60,
      label: "40% OFF",
      applicablePlans: "standard",
    },
    {
      code: "LEAF25",
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
  if (!isPromotionActive()) return null;
  const isInstant = planKey === "instant" || planKey === "instant-lite";
  for (const tier of ACTIVE_PROMOTION.tiers) {
    if (tier.applicablePlans === "all") return tier;
    if (tier.applicablePlans === "instant" && isInstant) return tier;
    if (tier.applicablePlans === "standard" && !isInstant) return tier;
  }
  return null;
}

export function isPromotionActive(now = new Date()): boolean {
  if (!ACTIVE_PROMOTION.active) return false;
  const timestamp = now.getTime();
  return timestamp >= new Date(ACTIVE_PROMOTION.startDate).getTime()
    && timestamp <= new Date(ACTIVE_PROMOTION.endDate).getTime();
}

export default ACTIVE_PROMOTION;
