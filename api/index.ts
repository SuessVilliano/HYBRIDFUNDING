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

  const source = data.source || "website-get-started-today";
  if (/webinar/i.test(source)) {
    tags.push("webinar-lead", "funnel-webinar");
  }
  if (/course/i.test(source)) {
    tags.push("course-interest");
  }

  const payload = {
    locationId,
    firstName: data.firstName,
    lastName: data.lastName,
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    phone: phoneE164,
    source,
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

// Prop-firm account status endpoint.
// Called by the Hybrid MCP server's `get_prop_firm_status` tool (propfirm
// provider). Scrapes the public PropAccount dashboard for the linked account
// and returns balance / equity / profit-target / drawdown numbers.
// NOTE: phase, payout-eligibility and trader-score are NOT available from the
// upstream HTML scrape — they live in other systems (PropAccount admin API,
// payout workflow, internal scoring) and must be sourced separately.
app.get("/api/account/status", async (req: Request, res: Response) => {
  try {
    const apiKey = req.header("x-api-key");
    const expectedKey = process.env.HYBRID_FUNDING_API_KEY;
    if (!expectedKey || !apiKey || apiKey !== expectedKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const account = typeof req.query.account === "string" ? req.query.account : "";
    if (!account) {
      return res.status(400).json({ error: "account query param required" });
    }

    const dashboardUrl = `https://hybridfundingdashboard.propaccount.com/es/overview?accountId=${encodeURIComponent(account)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let upstream: Response;
    try {
      upstream = await fetch(dashboardUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; HybridFundingBot/1.0)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      return res.status(502).json({
        error: "Upstream dashboard error",
        status: upstream.status,
        account,
      });
    }

    const html = await upstream.text();

    // Regex-based extraction — mirrors hybrid-journal/base44/functions/
    // syncHybridFunding/entry.ts parseHybridFundingDashboard().
    let balance = 0;
    let equity = 0;
    let profit_target: number | null = null;
    let daily_loss_limit: number | null = null;
    let max_drawdown: number | null = null;
    let total_profit_loss = 0;

    const balanceMatch = html.match(/Balance[:\s]*\$?([\d,]+\.?\d*)/i);
    if (balanceMatch) {
      balance = parseFloat(balanceMatch[1].replace(/,/g, ""));
    }

    const equityMatch = html.match(/Equity[:\s]*\$?([\d,]+\.?\d*)/i);
    if (equityMatch) {
      equity = parseFloat(equityMatch[1].replace(/,/g, ""));
    }

    const profitTargetMatch = html.match(/Profit\s*Target[:\s]*\$?([\d,]+\.?\d*)/i);
    if (profitTargetMatch) {
      profit_target = parseFloat(profitTargetMatch[1].replace(/,/g, ""));
    }

    const dailyLossMatch = html.match(/Daily\s*Loss\s*Limit[:\s]*\$?([\d,]+\.?\d*)/i);
    if (dailyLossMatch) {
      daily_loss_limit = parseFloat(dailyLossMatch[1].replace(/,/g, ""));
    }

    const maxDrawdownMatch = html.match(/Max\s*Draw\s*down[:\s]*\$?([\d,]+\.?\d*)/i);
    if (maxDrawdownMatch) {
      max_drawdown = parseFloat(maxDrawdownMatch[1].replace(/,/g, ""));
    }

    // Sum trade profits from any embedded __INITIAL_STATE__ JSON, falling back
    // to 0 if not present. The HTML table parse for individual trades is not
    // needed here — the MCP only needs aggregate P&L.
    const jsonDataMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/);
    if (jsonDataMatch) {
      try {
        const data = JSON.parse(jsonDataMatch[1]);
        if (Array.isArray(data?.trades)) {
          total_profit_loss = data.trades.reduce(
            (sum: number, t: any) => sum + (parseFloat(t.profit ?? t.pnl) || 0),
            0,
          );
        }
        if (data?.account) {
          balance = data.account.balance || balance;
          equity = data.account.equity || equity;
        }
      } catch {
        /* ignore — fall back to regex-only metrics */
      }
    }

    return res.status(200).json({
      account,
      configured: true,
      fetched_at: new Date().toISOString(),
      balance,
      equity,
      profit_target,
      daily_loss_limit,
      max_drawdown,
      total_profit_loss,
      source: "propaccount_dashboard",
    });
  } catch (error: any) {
    console.error("[account/status] error", error);
    return res.status(500).json({ error: error?.message || "Internal error" });
  }
});

export default app;
