/* PROMOTION CALENDAR: September LEAF → October PropX Launch */

export type PromoPlanScope = "all" | "standard" | "instant";
export type PromoPlatformScope = "all" | "propx" | "core";

export interface PromoTier {
  code: string;
  discountPercent: number;
  multiplier: number;
  label: string;
  applicablePlans: PromoPlanScope;
  platformScope?: PromoPlatformScope;
  maxAccountSize?: number;
  scopeLabel?: string;
}

export interface ActivePromotion {
  active: boolean;
  name: string;
  headline: string;
  subtext: string;
  startDate: string;
  endDate: string;
  tiers: PromoTier[];
  badgeText?: string;
  exitPopupHeadline?: string;
  exitPopupSubtext?: string;
}

export const PROMOTIONS: ActivePromotion[] = [
  {
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
        platformScope: "all",
        scopeLabel: "Evaluations · All Platforms",
      },
      {
        code: "LEAF25",
        discountPercent: 25,
        multiplier: 0.75,
        label: "25% OFF",
        applicablePlans: "instant",
        platformScope: "all",
        scopeLabel: "Instant Funding · All Platforms",
      },
    ],
  },
  {
    active: true,
    name: "PropX Launch Event",
    headline: "GooeyPro is now PropX — Celebrate the Launch.",
    subtext: "October 1–25: save up to 50% on eligible PropX challenges, with CORE savings across every other platform.",
    startDate: "2026-10-01T00:00:00-04:00",
    endDate: "2026-10-25T23:59:59-04:00",
    badgeText: "⚡ PropX Launch Event — Valid October 1–25, 2026",
    exitPopupHeadline: "New name. Same platform. Bigger October savings.",
    exitPopupSubtext: "Use PROPX50/PROPX25 on eligible PropX plans, or CORE40/CORE20 on all other platforms through October 25.",
    tiers: [
      {
        code: "PROPX50",
        discountPercent: 50,
        multiplier: 0.50,
        label: "50% OFF",
        applicablePlans: "standard",
        platformScope: "propx",
        maxAccountSize: 100000,
        scopeLabel: "PropX Challenges · ≤ $100K · Excl. IF",
      },
      {
        code: "PROPX25",
        discountPercent: 25,
        multiplier: 0.75,
        label: "25% OFF",
        applicablePlans: "instant",
        platformScope: "propx",
        maxAccountSize: 100000,
        scopeLabel: "PropX Instant Funding · ≤ $100K",
      },
      {
        code: "CORE40",
        discountPercent: 40,
        multiplier: 0.60,
        label: "40% OFF",
        applicablePlans: "standard",
        platformScope: "core",
        scopeLabel: "Other Platforms · Excl. IF",
      },
      {
        code: "CORE20",
        discountPercent: 20,
        multiplier: 0.80,
        label: "20% OFF",
        applicablePlans: "instant",
        platformScope: "core",
        scopeLabel: "Other Platforms · Instant Funding",
      },
    ],
  },
];

export function getActivePromotion(now = new Date()): ActivePromotion | null {
  const timestamp = now.getTime();
  return (
    PROMOTIONS.find((promo) => {
      if (!promo.active) return false;
      return (
        timestamp >= new Date(promo.startDate).getTime() &&
        timestamp <= new Date(promo.endDate).getTime()
      );
    }) ?? null
  );
}

export function getUpcomingPromotion(now = new Date()): ActivePromotion | null {
  const timestamp = now.getTime();
  return (
    PROMOTIONS.filter(
      (promo) => promo.active && new Date(promo.startDate).getTime() > timestamp,
    ).sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )[0] ?? null
  );
}

function parseAccountSize(size?: string | number): number | null {
  if (typeof size === "number") return size;
  if (!size) return null;
  const cleaned = size.toUpperCase().replace(/[$,\s]/g, "");
  if (cleaned.endsWith("K")) return Number.parseFloat(cleaned) * 1_000;
  if (cleaned.endsWith("M")) return Number.parseFloat(cleaned) * 1_000_000;
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function planMatches(tier: PromoTier, planKey: string): boolean {
  const isInstant = planKey === "instant" || planKey === "instant-lite";
  if (tier.applicablePlans === "all") return true;
  if (tier.applicablePlans === "instant") return isInstant;
  return !isInstant;
}

function platformMatches(tier: PromoTier, marketKey?: string): boolean {
  const scope = tier.platformScope ?? "all";
  if (scope === "all") return true;
  const isPropX = marketKey === "equities";
  return scope === "propx" ? isPropX : !isPropX;
}

export function getPromoForSelection(
  planKey: string,
  marketKey?: string,
  accountSize?: string | number,
  now = new Date(),
): PromoTier | null {
  const promotion = getActivePromotion(now);
  if (!promotion) return null;

  const size = parseAccountSize(accountSize);
  for (const tier of promotion.tiers) {
    if (!planMatches(tier, planKey)) continue;
    if (!platformMatches(tier, marketKey)) continue;
    if (
      tier.maxAccountSize &&
      size !== null &&
      size > tier.maxAccountSize
    ) {
      continue;
    }
    return tier;
  }
  return null;
}

/** Backward-compatible helper for surfaces that do not know market or size. */
export function getPromoForPlan(planKey: string): PromoTier | null {
  return getPromoForSelection(planKey);
}

export function isPromotionActive(now = new Date()): boolean {
  return getActivePromotion(now) !== null;
}

/**
 * Kept as a default export for legacy imports. New UI should use
 * getActivePromotion() so the September → October handoff happens without a deploy.
 */
const ACTIVE_PROMOTION = PROMOTIONS[0];
export default ACTIVE_PROMOTION;
