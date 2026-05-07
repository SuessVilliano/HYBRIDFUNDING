import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Loading from "@/components/ui/loading";
import { Phone, Calendar, Video, Lock } from "lucide-react";
import WebinarModal from "@/components/WebinarModal";
import BookingModal from "@/components/BookingModal";
import { trackEvent } from "@/lib/analytics";

type Intent = "webinar" | "booking" | null;

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  smsConsent: z.boolean().refine((val) => val === true, {
    message: "You must consent to receive SMS messages to continue"
  }),
  promotionalConsent: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface A2PCompliantOptInFormProps {
  onSuccess?: () => void;
  showResourceLinks?: boolean;
  compactMode?: boolean;
}

const A2PCompliantOptInForm = ({ 
  onSuccess, 
  showResourceLinks = true,
  compactMode = false 
}: A2PCompliantOptInFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWebinar, setShowWebinar] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [intent, setIntent] = useState<Intent>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const selectIntent = (next: Intent) => {
    setIntent(next);
    if (next === "webinar") trackEvent("webinar_card_click");
    if (next === "booking") trackEvent("booking_card_click");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      smsConsent: false,
      promotionalConsent: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const trimmed = data.name.trim();
      const spaceIdx = trimmed.indexOf(" ");
      const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
      const lastName = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1).trim();

      const source =
        intent === "webinar"
          ? "watch-webinar-optin"
          : intent === "booking"
            ? "book-appointment-optin"
            : "website-get-started-today";

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName: lastName || firstName,
          email: data.email,
          phone: data.phone,
          smsConsent: data.smsConsent,
          marketingConsent: data.promotionalConsent ?? false,
          source,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Submission failed");
      }

      if (intent === "webinar") {
        trackEvent("webinar_optin_submitted");
        setShowWebinar(true);
      } else if (intent === "booking") {
        trackEvent("booking_optin_submitted");
        setShowBooking(true);
      } else {
        toast({
          title: "Successfully registered!",
          description: "You'll receive a confirmation SMS shortly.",
        });
      }

      form.reset();
      setIntent(null);
      onSuccess?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Please try again later.";
      toast({
        title: "Registration failed",
        description: msg,
        variant: "destructive",
      });
      console.error("Error submitting opt-in form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={compactMode ? "" : "glassmorphism rounded-xl p-6 md:p-8"}>
      <div className="mb-6">
        <h3 className="font-['Orbitron'] text-2xl md:text-3xl font-bold text-white mb-2">
          Get Started Today
        </h3>
        <p className="text-[#B8B8D0]">
          Join our community and receive updates, trading insights, and exclusive offers.
        </p>
      </div>

      {showResourceLinks && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={() => selectIntent("booking")}
              aria-pressed={intent === "booking"}
              className={`flex items-center gap-3 rounded-lg p-4 transition-all group text-left w-full border ${
                intent === "booking"
                  ? "bg-primary/30 border-primary shadow-[0_0_18px_rgba(138,43,226,0.45)]"
                  : "bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 border-primary/30"
              }`}
              data-testid="link-appointment-booking"
            >
              <Calendar className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-white font-semibold text-sm">Book Appointment</p>
                <p className="text-[#B8B8D0] text-xs">Get your questions answered</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => selectIntent("webinar")}
              aria-pressed={intent === "webinar"}
              className={`flex items-center gap-3 rounded-lg p-4 transition-all group text-left w-full border ${
                intent === "webinar"
                  ? "bg-accent/30 border-accent shadow-[0_0_18px_rgba(0,255,255,0.45)]"
                  : "bg-gradient-to-r from-accent/20 to-accent/10 hover:from-accent/30 hover:to-accent/20 border-accent/30"
              }`}
              data-testid="link-webinar"
            >
              <Video className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-white font-semibold text-sm">Watch Webinar</p>
                <p className="text-[#B8B8D0] text-xs">Learn about our program</p>
              </div>
            </button>
          </div>

          {intent && (
            <div className="mb-6 flex items-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-white">
              <Lock className="h-3.5 w-3.5 text-accent" />
              <span>
                {intent === "webinar"
                  ? "Fill out the form below to unlock the training video."
                  : "Fill out the form below to access the booking calendar."}
              </span>
            </div>
          )}
        </>
      )}
      <WebinarModal open={showWebinar} onClose={() => setShowWebinar(false)} />
      <BookingModal open={showBooking} onClose={() => setShowBooking(false)} />

      <Form {...form}>
        <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-accent">Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="John Doe"
                    className="bg-[#0F0F1A] border-primary/30 focus:border-accent text-white"
                    data-testid="input-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-accent">Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="john@example.com"
                    className="bg-[#0F0F1A] border-primary/30 focus:border-accent text-white"
                    data-testid="input-email"
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
                <FormLabel className="text-accent">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Mobile Phone Number
                  </div>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="bg-[#0F0F1A] border-primary/30 focus:border-accent text-white"
                    data-testid="input-phone"
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-accent/30 bg-accent/5 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                    data-testid="checkbox-sms-consent"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-white text-sm font-normal cursor-pointer">
                    I consent to receive SMS notifications and alerts from{" "}
                    <span className="font-semibold">Hybrid Funding</span>. Message frequency varies. 
                    Message & data rates may apply. Text HELP to our support number for assistance. 
                    You can reply STOP to unsubscribe at any time.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="promotionalConsent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/30 bg-primary/5 p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                    data-testid="checkbox-promotional-consent"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-white text-sm font-normal cursor-pointer">
                    <span className="text-[#B8B8D0]">(Optional)</span> By checking this box, I agree to receive 
                    occasional marketing messages and exclusive offers from{" "}
                    <span className="font-semibold">Hybrid Funding</span>.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="neon-filled"
              size="xl"
              rounded="full"
              disabled={isSubmitting}
              className="w-full font-['Orbitron'] shadow-glow-accent"
              data-testid="button-submit"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loading variant="dots" size="sm" text="" />
                  <span>SUBMITTING...</span>
                </div>
              ) : intent === "webinar" ? (
                "WATCH FREE TRAINING →"
              ) : intent === "booking" ? (
                "UNLOCK BOOKING CALENDAR →"
              ) : (
                "GET STARTED"
              )}
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-[#B8B8D0] text-xs leading-relaxed">
              By submitting this form, you agree to our{" "}
              <a
                href="https://dashboardanalytix.com/client-terms-and-policies/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-primary transition-colors underline"
                data-testid="link-terms"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://dashboardanalytix.com/client-terms-and-policies/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-primary transition-colors underline"
                data-testid="link-privacy"
              >
                Privacy Policy
              </a>
              . For more information about our SMS program, please review our policies.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default A2PCompliantOptInForm;
