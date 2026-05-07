import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Play, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";
import { trackEvent } from "@/lib/analytics";

const YOUTUBE_ID = "1btvnorAx6A";
const BOOKING_URL =
  "https://api.leadconnectorhq.com/widget/booking/wAgobr9TOihDZxQ2G3a5";
const GHL_FORM_ID = "DdwxJSrjfQVY2gY5Qnh0";
const GHL_FORM_SRC = `https://api.leadconnectorhq.com/widget/form/${GHL_FORM_ID}`;
const UNLOCK_KEY = "hf_webinar_unlocked";

const webinarCopy = {
  badge: "Free Training — Watch Instantly",
  headline: "How to Get a Funded Trading Account in 30 Days or Less",
  subheadline:
    "Even if you've failed challenges before — watch the exact system serious traders use to go from evaluation to funded account, with up to 90% profit split.",
  bullets: [
    "The #1 reason traders fail prop firm challenges (and exactly how to avoid it)",
    "Which funding program is the fastest path to your first payout (1-Step vs. 2-Step vs. Instant)",
    "How to trade funded capital on YOUR preferred platform — cTrader, DXtrade, MatchTrader, Tradovate, or Volumetrica",
    "The daily routine of traders who consistently pass evaluations",
    "How the Hybrid Funding ecosystem gives you tools your competition doesn't have",
  ],
  formHeadline: "Watch the Free Training Now",
  formSubtext: "Instant access. We'll also text you the link.",
};

const Webinar = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("watched") === "1") {
      try { localStorage.setItem(UNLOCK_KEY, "1"); } catch {}
      setUnlocked(true);
      const fn = params.get("first_name") || params.get("firstName");
      if (fn) setFirstName(fn);
      return;
    }
    try {
      if (localStorage.getItem(UNLOCK_KEY) === "1") setUnlocked(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (unlocked) return;

    const scriptId = "ghl-form-embed-script";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://link.msgsndr.com/js/form_embed.js";
      s.async = true;
      document.body.appendChild(s);
    }

    const onMessage = (e: MessageEvent) => {
      if (typeof e.origin !== "string") return;
      if (
        !/leadconnectorhq\.com|msgsndr\.com|gohighlevel\.com/i.test(e.origin)
      ) {
        return;
      }
      const data = e.data;
      const payload =
        typeof data === "string" ? data : JSON.stringify(data || {});
      const looksLikeSubmit =
        /form[_-]?submit|submission|submitted|onFormSubmit/i.test(payload);
      if (!looksLikeSubmit) return;

      try { localStorage.setItem(UNLOCK_KEY, "1"); } catch {}
      trackEvent("webinar_optin_submitted_ghl");

      try {
        const obj = typeof data === "object" && data ? data : {};
        const fn =
          (obj as any).first_name ||
          (obj as any).firstName ||
          (obj as any).contact?.first_name;
        if (typeof fn === "string") setFirstName(fn);
      } catch {}

      setUnlocked(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [unlocked]);

  return (
    <section className="py-16 sm:py-20 cyberpunk-bg page-transition min-h-screen">
      <SEO
        title="Free Training: How to Get a Funded Trading Account | Hybrid Funding"
        description="Watch the free training that walks serious traders through the exact system to pass prop firm evaluations and reach funded payouts — across cTrader, DXtrade, MatchTrader, Tradovate, and Volumetrica."
        path="/webinar"
        jsonLd={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Free Training", path: "/webinar" },
        ])}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {unlocked ? (
          <WatchView firstName={firstName} />
        ) : (
          <OptInView />
        )}
      </div>
    </section>
  );
};

const OptInView = () => {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          {webinarCopy.badge}
        </div>

        <h1 className="font-['Orbitron'] text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
          How to Get a{" "}
          <span className="text-accent neon-text-accent">
            Funded Trading Account
          </span>{" "}
          in 30 Days or Less
        </h1>

        <p className="text-[#B8B8D0] text-lg leading-relaxed mb-8">
          {webinarCopy.subheadline}
        </p>

        <div className="mb-8">
          <p className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            What You'll Learn
          </p>
          <ul className="space-y-3">
            {webinarCopy.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" />
                <span className="text-[#B8B8D0]">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glassmorphism rounded-xl p-4 flex items-center gap-4">
          <div className="flex -space-x-2">
            {["A", "J", "M", "T", "R"].map((l) => (
              <div
                key={l}
                className="h-9 w-9 rounded-full border-2 border-[#0F0F1A] bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent"
              >
                {l}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Hundreds of traders have already watched this training
            </p>
            <p className="text-xs text-[#B8B8D0]">
              Join them and discover your path to funded trading
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:sticky lg:top-24"
      >
        <div className="glassmorphism rounded-2xl p-2 sm:p-3 shadow-2xl shadow-black/40 border border-accent/20">
          <div className="px-3 sm:px-4 pt-3 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
                <Play className="h-4 w-4 text-[#0F0F1A] ml-0.5" fill="currentColor" />
              </div>
              <div>
                <h2 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white">
                  {webinarCopy.formHeadline}
                </h2>
                <p className="text-xs text-[#B8B8D0]">
                  {webinarCopy.formSubtext}
                </p>
              </div>
            </div>
          </div>
          <iframe
            src={GHL_FORM_SRC}
            style={{
              width: "100%",
              minHeight: 620,
              border: "none",
              borderRadius: 8,
              background: "transparent",
            }}
            id={`inline-${GHL_FORM_ID}`}
            data-layout="{'id':'INLINE'}"
            data-trigger-type="alwaysShow"
            data-trigger-value=""
            data-activation-type="alwaysActivated"
            data-activation-value=""
            data-deactivation-type="neverDeactivate"
            data-deactivation-value=""
            data-form-name="Hybrid Funding Webinar"
            data-height="undefined"
            data-layout-iframe-id={`inline-${GHL_FORM_ID}`}
            data-form-id={GHL_FORM_ID}
            title="Hybrid Funding Webinar"
          />
        </div>
      </motion.div>
    </div>
  );
};

const WatchView = ({ firstName }: { firstName: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8 rounded-xl border border-accent/30 bg-accent/10 px-6 py-4 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
        <p className="text-sm font-medium text-white">
          You're in{firstName ? `, ${firstName}` : ""}! Watch the full training
          below — we've also texted the link to your phone so you can revisit it
          anytime.
        </p>
      </div>

      <div className="glassmorphism rounded-2xl overflow-hidden border border-accent/30 shadow-2xl shadow-accent/20">
        <div className="aspect-video bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1`}
            title="Hybrid Funding Free Training"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      <div className="mt-10 glassmorphism rounded-2xl p-8 text-center">
        <h2 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white mb-3">
          Ready to get funded?
        </h2>
        <p className="text-[#B8B8D0] mb-6 max-w-lg mx-auto">
          Book a free 20-minute strategy call and we'll build your personalized
          funding roadmap — no pressure, just clarity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center"
          >
            <Button
              variant="neon"
              size="lg"
              rounded="full"
              className="font-['Orbitron'] font-semibold"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book a Free Strategy Call
            </Button>
          </a>
          <Link href="/challenges">
            <Button
              variant="outline"
              size="lg"
              rounded="full"
              className="font-['Orbitron'] font-semibold border-white/20 text-white hover:bg-white/5"
            >
              View Funding Programs
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Webinar;
