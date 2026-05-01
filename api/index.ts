import express, { type Request, type Response } from "express";
import { z } from "zod";

// Self-contained serverless handler for production /api/* routes.
// Avoids importing server/index.ts which pulls in vite/drizzle/ws and
// blocks cold-start on Vercel Functions.

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const leadSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().toLowerCase().email("Valid email required"),
  phone: z.string().trim().min(7, "Phone is required").max(20),
  smsConsent: z.literal(true, {
    errorMap: () => ({ message: "SMS consent is required" }),
  }),
  marketingConsent: z.boolean().optional().default(false),
  source: z.string().trim().max(120).optional(),
});

function toE164(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (raw.trim().startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

app.post("/api/lead", async (req: Request, res: Response) => {
  const parsed = leadSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return res.status(400).json({ error: first?.message || "Invalid input" });
  }
  const data = parsed.data;

  const phoneE164 = toE164(data.phone);
  if (!phoneE164) {
    return res.status(400).json({ error: "Phone number must be valid" });
  }

  const token = process.env.GHL_PIT_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID || "wAgobr9TOihDZxQ2G3a5";

  if (!token) {
    console.error("[lead] GHL_PIT_TOKEN is not configured");
    return res.status(500).json({ error: "Lead service is not configured" });
  }

  const tags = ["web-optin", "sms-consent"];
  if (data.marketingConsent) tags.push("marketing-consent");

  const payload = {
    locationId,
    firstName: data.firstName,
    lastName: data.lastName,
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    phone: phoneE164,
    source: data.source || "website-get-started-today",
    tags,
    dnd: false,
  };

  try {
    const ghlRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const bodyText = await ghlRes.text();
    let parsed: any = {};
    try { parsed = JSON.parse(bodyText); } catch { /* ignore */ }

    // GHL surfaces "duplicate contact" as either 409 or a 400 with a specific
    // message + an existing contactId. Both mean "we already have this lead" —
    // treat them as success so the user sees the confirmation instead of an
    // error, and re-tag the existing contact.
    const isDuplicate =
      ghlRes.status === 409 ||
      (ghlRes.status === 400 &&
        typeof parsed?.message === "string" &&
        /duplicat/i.test(parsed.message));

    if (!ghlRes.ok && !isDuplicate) {
      console.error("[lead] GHL error", ghlRes.status, bodyText);
      return res.status(502).json({ error: "Unable to submit at this time. Please try again." });
    }

    const contactId: string | undefined =
      parsed?.contact?.id || parsed?.id || parsed?.meta?.contactId;

    // For duplicates, push tags onto the existing contact so the workflow still fires.
    if (isDuplicate && contactId) {
      try {
        await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/tags`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Version: "2021-07-28",
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ tags }),
        });
      } catch (tagErr) {
        console.error("[lead] tag-on-duplicate failed", tagErr);
      }
    }

    console.log("[lead] accepted", {
      email: data.email,
      status: ghlRes.status,
      duplicate: isDuplicate,
      contactId,
    });
    return res.status(200).json({ success: true, duplicate: isDuplicate });
  } catch (err) {
    console.error("[lead] network error", err);
    return res.status(502).json({ error: "Unable to submit at this time. Please try again." });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

export default app;
