import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid mobile number")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid mobile number"),
  smsConsent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to receive SMS messages" }),
  }),
  marketingConsent: z.boolean().optional().default(false),
});

type FormValues = z.input<typeof formSchema>;

interface GetStartedFormProps {
  source?: string;
  onSuccess?: () => void;
}

const GetStartedForm: React.FC<GetStartedFormProps> = ({ source, onSuccess }) => {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      smsConsent: false as unknown as true,
      marketingConsent: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      onSuccess?.();
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-3" />
        <h3 className="font-['Orbitron'] text-xl text-white mb-2">You're on the list</h3>
        <p className="text-[#B8B8D0] text-sm">
          Watch your inbox and phone — we'll reach out shortly with your early access details.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-[#0F0F1A] border border-accent/30 focus:border-accent rounded-md px-3 py-2 text-white placeholder:text-[#6F6F8A] outline-none transition-colors";
  const labelClass = "block text-[#B8B8D0] text-xs font-['Orbitron'] uppercase tracking-wide mb-1";
  const errorClass = "text-red-400 text-xs mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-left">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className={labelClass}>First Name</label>
          <input id="firstName" type="text" autoComplete="given-name" className={inputClass} {...register("firstName")} />
          {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>Last Name</label>
          <input id="lastName" type="text" autoComplete="family-name" className={inputClass} {...register("lastName")} />
          {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email Address</label>
        <input id="email" type="email" autoComplete="email" className={inputClass} {...register("email")} />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>Mobile Phone Number</label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+1 555 123 4567"
          className={inputClass}
          {...register("phone")}
        />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>

      <label className="flex items-start gap-2 text-xs text-[#B8B8D0] leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 accent-accent flex-shrink-0"
          {...register("smsConsent")}
        />
        <span>
          By checking this box, I consent to receive SMS messages from Hybrid Funding for account
          updates, promotions, and onboarding info. Message &amp; data rates may apply. Message
          frequency varies. Reply HELP for help, STOP to unsubscribe. Consent is not a condition of
          purchase.
        </span>
      </label>
      {errors.smsConsent && <p className={errorClass}>{errors.smsConsent.message as string}</p>}

      <label className="flex items-start gap-2 text-xs text-[#B8B8D0] leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 accent-accent flex-shrink-0"
          {...register("marketingConsent")}
        />
        <span>
          (Optional) I'd also like to receive marketing emails about new challenges, promotions,
          and trader resources.
        </span>
      </label>

      {serverError && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        variant="neon-filled"
        className="w-full py-3 font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting…" : "Get Started Today"}
      </Button>

      <p className="text-[10px] text-[#6F6F8A] text-center">
        We respect your privacy. Your information is never shared with third parties.
      </p>
    </form>
  );
};

export default GetStartedForm;
