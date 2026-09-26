import { Link } from "wouter";
import { Gift, WalletCards, Zap, ShoppingCart, ArrowRight } from "lucide-react";

interface FeatureUpdateBannerProps {
  compact?: boolean;
}

const features = [
  { icon: Gift, label: "Bundles", detail: "Buy 3 or 5 challenges together + payout perks" },
  { icon: WalletCards, label: "Customer Credit", detail: "+10 points of profit share when choosing credit" },
  { icon: Zap, label: "Rapid Payout", detail: "Bi-weekly, weekly or daily payout options" },
  { icon: ShoppingCart, label: "Cart", detail: "Multiple items in one checkout" },
];

export default function FeatureUpdateBanner({ compact = false }: FeatureUpdateBannerProps) {
  if (compact) {
    return (
      <div className="border-b border-accent/20 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10">
        <div className="container mx-auto flex flex-col items-center justify-center gap-2 px-4 py-3 text-center sm:flex-row sm:gap-3">
          <span className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 font-['Orbitron'] text-[10px] font-bold uppercase tracking-widest text-accent">
            New • PropX Launch
          </span>
          <span className="text-sm text-white">
            PropX launch: October 1–25 offers save up to 50% on eligible challenges.
          </span>
          <Link href="/blog/propx-rebrand-october-2026-promotion" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-primary">
            Read the announcement <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-[#171728] to-primary/10 p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-accent/40 bg-accent/15 px-3 py-1 font-['Orbitron'] text-[10px] font-bold uppercase tracking-widest text-accent">
            New • Rolling Out
          </span>
          <h2 className="mt-3 font-['Orbitron'] text-2xl font-bold text-white md:text-3xl">
            Bigger checkouts. More payout choice.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#B8B8D0] md:text-base">
            Four new features are being enabled for Hybrid Funding traders within the announced 10-business-day rollout window. Availability requires the new dashboard experience.
          </p>
        </div>
        <Link href="/blog/bundles-customer-credit-rapid-payout-cart" className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-accent hover:text-primary">
          Full details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, label, detail }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <Icon className="mb-2 h-5 w-5 text-accent" />
            <div className="font-['Orbitron'] text-sm font-bold text-white">{label}</div>
            <p className="mt-1 text-xs leading-relaxed text-[#B8B8D0]">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
