import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Play, Lock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/ui/loading";
import SEO from "@/components/SEO";
import { breadcrumbSchema } from "@/lib/jsonLd";
import { trackEvent } from "@/lib/analytics";

const YOUTUBE_ID = "1btvnorAx6A";
const BOOKING_URL =
  "https://api.leadconnectorhq.com/widget/booking/wAgobr9TOihDZxQ2G3a5";

const webinarCopy = {
  badge: "Free Training — Watch Instantly",
  headline:
    "How to Get a Funded Trading Account in 30 Days or Less",
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
  formSubtext: "Instant access. No spam. Unsubscribe anytime.",
  ctaLabel: "Watch Free Training",
};

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(7, { message: "Please enter a valid phone number" }),
  smsConsent: z.boolean().refine((v) => v === true, {
    message: "You must consent to receive SMS messages to continue",
  }),
  marketingConsent: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Webinar = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submittedFirstName, setSubmittedFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      smsConsent: false,
      marketingConsent: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          smsConsent: data.smsConsent,
          marketingConsent: data.marketingConsent ?? false,
          source: "webinar-optin",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Submission failed");
      }

      trackEvent("webinar_optin_submitted", { email: data.email });
      setSubmittedFirstName(data.firstName);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast({
        title: "Could not submit",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {submitted ? (
          <WatchView firstName={submittedFirstName} />
        ) : (
          <OptInView form={form} onSubmit={onSubmit} isSubmitting={isSubmitting} />
        )}
      </div>
    </section>
  );
};

interface OptInViewProps {
  form: ReturnType<typeof useForm<FormValues>>;
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting: boolean;
}

const OptInView = ({ form, onSubmit, isSubmitting }: OptInViewProps) => {
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
          {webinarCopy.headline.split("Funded Trading Account")[0]}
          <span className="text-accent neon-text-accent">
            Funded Trading Account
          </span>
          {webinarCopy.headline.split("Funded Trading Account")[1]}
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
        <div className="glassmorphism rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40 border border-accent/20">
          <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 mb-6 aspect-video flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-primary/10 to-transparent" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/40">
                <Play className="h-6 w-6 text-[#0F0F1A] ml-1" fill="currentColor" />
              </div>
              <p className="text-sm font-semibold text-white">~45 Minutes</p>
              <p className="text-xs text-[#B8B8D0]">Free Training</p>
            </div>
          </div>

          <h2 className="font-['Orbitron'] text-xl font-bold text-white mb-1">
            {webinarCopy.formHeadline}
          </h2>
          <p className="text-sm text-[#B8B8D0] mb-6">
            {webinarCopy.formSubtext}
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#B8B8D0]">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="First" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#B8B8D0]">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Last" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-[#B8B8D0]">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-[#B8B8D0]">
                      Phone (for SMS reminders)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smsConsent"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0 rounded-md border border-white/10 bg-white/5 p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-tight">
                      <FormLabel className="text-xs text-white font-normal">
                        I agree to receive SMS reminders and updates from Hybrid
                        Funding. Message and data rates may apply. Reply STOP to
                        opt out.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketingConsent"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-xs text-[#B8B8D0] font-normal leading-tight">
                      Send me promotional offers and trading tips (optional).
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="neon"
                size="lg"
                rounded="full"
                className="w-full font-['Orbitron'] font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loading size="sm" />
                ) : (
                  <>{webinarCopy.ctaLabel} →</>
                )}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[#B8B8D0]">
                <Lock className="h-3 w-3" />
                We respect your privacy. No spam, ever.
              </p>
            </form>
          </Form>
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
          below — there's a special offer at the end.
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
