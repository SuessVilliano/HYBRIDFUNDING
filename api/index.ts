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
  traderType: z.enum(["sniper", "architect", "hybrid", "phoenix"]).optional(),
  marketPath: z.enum(["forex", "crypto", "futures", "equities", "predictive"]).optional(),
  referralCode: z.string().trim().max(60).optional(),
  utmSource: z.string().trim().max(80).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
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

  const cleanTag = (raw: string) =>
    raw.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);

  const tags = ["web-optin", "sms-consent"];
  if (data.marketingConsent) tags.push("marketing-consent");
  if (data.traderType) tags.push("trader-dna", `trader-dna-${data.traderType}`);
  if (data.marketPath) tags.push(`market-interest-${data.marketPath}`);
  if (data.referralCode) tags.push("affiliate-referred", `affiliate-ref-${cleanTag(data.referralCode)}`);
  if (data.utmSource) tags.push(`utm-source-${cleanTag(data.utmSource)}`);
  if (data.utmCampaign) tags.push(`utm-campaign-${cleanTag(data.utmCampaign)}`);

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

app.post("/api/newsletter", async (req: Request, res: Response) => {
  const emailResult = z.string().trim().toLowerCase().email().safeParse(req.body?.email);
  if (!emailResult.success) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const email = emailResult.data;
  const token = process.env.GHL_PIT_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID || "wAgobr9TOihDZxQ2G3a5";
  if (!token) return res.status(500).json({ error: "Subscription service is not configured" });

  const tags = ["newsletter-subscriber", "updates-subscriber"];
  const payload = {
    locationId,
    email,
    source: "hybridfunding-news-updates",
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
    let body: any = {};
    try { body = JSON.parse(bodyText); } catch { /* ignore */ }

    const isDuplicate =
      ghlRes.status === 409 ||
      (ghlRes.status === 400 && typeof body?.message === "string" && /duplicat/i.test(body.message));

    if (!ghlRes.ok && !isDuplicate) {
      console.error("[newsletter] GHL error", ghlRes.status, bodyText);
      return res.status(502).json({ error: "Unable to subscribe at this time. Please try again." });
    }

    const contactId: string | undefined =
      body?.contact?.id || body?.id || body?.meta?.contactId;

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
        console.error("[newsletter] tag-on-duplicate failed", tagErr);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[newsletter] error", err);
    return res.status(502).json({ error: "Unable to subscribe at this time. Please try again." });
  }
});

// Privacy-safe recent activity for the public site.
// Returns no names, email addresses, phone numbers, contact IDs, or individual locations.
app.get("/api/activity", async (_req: Request, res: Response) => {
  const token = process.env.GHL_PIT_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID || "wAgobr9TOihDZxQ2G3a5";

  if (!token) return res.status(200).json({ events: [], regions: [], recentCount: 0 });

  try {
    const upstream = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${encodeURIComponent(locationId)}&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Version: "2021-07-28",
          Accept: "application/json",
        },
      },
    );

    if (!upstream.ok) {
      console.error("[activity] GHL error", upstream.status, await upstream.text());
      return res.status(200).json({ events: [], regions: [], recentCount: 0 });
    }

    const body: any = await upstream.json();
    const contacts = Array.isArray(body?.contacts) ? body.contacts : [];
    const now = Date.now();
    const windowMs = 30 * 24 * 60 * 60 * 1000;

    const recent = contacts
      .filter((c: any) => {
        const t = new Date(c?.dateAdded || c?.createdAt || 0).getTime();
        return Number.isFinite(t) && now - t >= 0 && now - t <= windowMs;
      })
      .sort((a: any, b: any) =>
        new Date(b?.dateAdded || b?.createdAt || 0).getTime() -
        new Date(a?.dateAdded || a?.createdAt || 0).getTime()
      );

    const sourceLabel = (source: string) => {
      const x = String(source || "").toLowerCase();
      if (x.includes("dna")) return "Trader DNA Test";
      if (x.includes("webinar")) return "Free Training";
      if (x.includes("affiliate")) return "Affiliate Partner";
      if (x.includes("predict")) return "Predictive Markets";
      if (x.includes("playbook")) return "Trader Playbook";
      return "HybridFunding.co";
    };

    const events = recent.slice(0, 8).map((c: any) => ({
      type: "community_join",
      label: "New trader joined the Hybrid Funding community",
      source: sourceLabel(c?.source),
      at: c?.dateAdded || c?.createdAt || null,
    }));

    // Only surface regional activity when 3+ recent contacts share a state.
    // This prevents a public message from revealing an individual lead's location.
    const stateCounts = new Map<string, number>();
    for (const c of recent) {
      const state = String(c?.state || "").trim();
      if (!state) continue;
      stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
    }
    const regions = [...stateCounts.entries()]
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([state, count]) => ({ state, count }));

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");
    return res.status(200).json({ events, regions, recentCount: recent.length });
  } catch (err) {
    console.error("[activity] error", err);
    return res.status(200).json({ events: [], regions: [], recentCount: 0 });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});


// ─── Trade House verified public leaderboard ──────────────────────────────────
// Official standings are read from Hybrid Funding's public PropAccount dashboard
// links. The roster is server-side allowlisted so this endpoint cannot be used as
// an open proxy for arbitrary account IDs.
const tradeHouseRosterSchema = z.array(
  z.object({
    id: z.string().trim().min(1).max(64),
    name: z.string().trim().min(1).max(40),
    accountId: z.string().trim().min(1).max(160).optional(),
    dashboardUrl: z.string().url().optional(),
    startingBalance: z.number().positive().optional(),
    market: z.string().trim().max(40).optional(),
    country: z.string().trim().max(60).optional(),
  }).refine((value) => Boolean(value.accountId || value.dashboardUrl), {
    message: "accountId or dashboardUrl is required",
  }),
).max(32);

const publicPayoutsSchema = z.array(
  z.object({
    id: z.string().trim().min(1).max(80),
    displayName: z.string().trim().min(1).max(60),
    amount: z.number().nonnegative(),
    paidAt: z.string().trim().min(4).max(64),
    program: z.string().trim().min(1).max(80),
    proofUrl: z.string().url().optional(),
  }),
).max(250);

function loadTradeHouseRoster() {
  const defaultRoster = [
    ["83db3117-30c4-434d-819c-df35d1d3b470", "Test Account 01"],
    ["36240f5d-bf00-4e91-ab41-f8604e1e8776", "Test Account 02"],
    ["2e96ce6a-ce74-421f-87cc-d7d5f8efd064", "Test Account 03"],
    ["db9f368d-ed1f-4626-956a-ce360f33d70a", "Test Account 04"],
    ["c5197178-3d25-4a8a-8bc0-e5211f4d1908", "Test Account 05"],
    ["d42a8250-340c-4627-9d49-61aa7d6eca9e", "Test Account 06"],
  ].map(([id, name], index) => ({
    id: `test-account-${index + 1}`,
    name,
    dashboardUrl: `https://hybridfundingdashboard.propaccount.com/en/public-overview/${id}`,
  }));
  const raw = process.env.TRADEHOUSE_ROSTER_JSON || JSON.stringify(defaultRoster);
  try {
    const parsed = tradeHouseRosterSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      console.error("[tradehouse] invalid TRADEHOUSE_ROSTER_JSON", parsed.error.flatten());
      return [];
    }
    return parsed.data;
  } catch (error) {
    console.error("[tradehouse] unable to parse TRADEHOUSE_ROSTER_JSON", error);
    return [];
  }
}

function resolvePublicDashboard(entry: any) {
  if (entry.accountId) {
    const accountId = String(entry.accountId).trim();
    return {
      accountId,
      dashboardUrl: `https://hybridfundingdashboard.propaccount.com/es/overview?accountId=${encodeURIComponent(accountId)}`,
    };
  }

  try {
    const url = new URL(entry.dashboardUrl);
    if (url.hostname !== "hybridfundingdashboard.propaccount.com") return null;
    const publicOverviewMatch = url.pathname.match(/^\/[^/]+\/public-overview\/([0-9a-f-]{20,})$/i);
    const accountId = url.searchParams.get("accountId") || publicOverviewMatch?.[1];
    if (!accountId) return null;
    return { accountId, dashboardUrl: url.toString() };
  } catch {
    return null;
  }
}

function firstNumberMatch(html: string, pattern: RegExp): number | null {
  const match = html.match(pattern);
  if (!match) return null;
  const value = Number.parseFloat(match[1].replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
}

async function fetchTradeHouseDashboard(accountId: string, startingBalance: number | undefined, sourceUrl?: string) {
  const dashboardUrl = sourceUrl || `https://hybridfundingdashboard.propaccount.com/es/overview?accountId=${encodeURIComponent(accountId)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  let upstream: Response;
  try {
    upstream = await fetch(dashboardUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HybridFundingTradeHouse/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!upstream.ok) {
    throw new Error(`dashboard returned ${upstream.status}`);
  }

  const html = await upstream.text();
  // The current public-overview page is a Next.js streamed document. Its
  // dehydrated query data is escaped inside self.__next_f.push(...) scripts.
  // Normalizing escaped quotes lets us read the stable account/statistics keys
  // without depending on the dashboard's rendered markup or locale.
  const embedded = html.replaceAll('\\"', '"');
  const embeddedNumber = (key: string): number | null => {
    const match = embedded.match(new RegExp(`"${key}"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`));
    if (!match) return null;
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
  };
  let balance = firstNumberMatch(html, /Balance[:\s]*\$?([\d,]+\.?\d*)/i) ?? NaN;
  let equity = firstNumberMatch(html, /Equity[:\s]*\$?([\d,]+\.?\d*)/i) ?? balance;
  const profitTarget = firstNumberMatch(html, /Profit\s*Target[:\s]*\$?([\d,]+\.?\d*)/i);
  const dailyLossLimit = firstNumberMatch(html, /Daily\s*Loss\s*Limit[:\s]*\$?([\d,]+\.?\d*)/i);
  const maxDrawdownLimit = firstNumberMatch(html, /Max\s*Draw\s*down[:\s]*\$?([\d,]+\.?\d*)/i);

  let trades: any[] = [];
  let openPositions: any[] = [];
  const jsonDataMatch = html.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});/);

  if (jsonDataMatch) {
    try {
      const data = JSON.parse(jsonDataMatch[1]);
      trades = Array.isArray(data?.trades)
        ? data.trades
        : Array.isArray(data?.account?.trades)
          ? data.account.trades
          : [];
      openPositions = Array.isArray(data?.positions)
        ? data.positions
        : Array.isArray(data?.openPositions)
          ? data.openPositions
          : Array.isArray(data?.account?.openPositions)
            ? data.account.openPositions
            : [];

      const account = data?.account;
      const accountBalance = Number(account?.balance);
      const accountEquity = Number(account?.equity);
      if (account?.balance != null && Number.isFinite(accountBalance) && accountBalance >= 0) balance = accountBalance;
      if (account?.equity != null && Number.isFinite(accountEquity) && accountEquity >= 0) equity = accountEquity;
    } catch (error) {
      console.error("[tradehouse] embedded dashboard state parse failed", accountId, error);
    }
  }

  const publicBalance = embeddedNumber("currentBalance") ?? embeddedNumber("accountBalance");
  const publicEquity = embeddedNumber("currentEquityNumber") ?? embeddedNumber("accountEquity");
  const accountSize = embeddedNumber("accountSize");
  const effectiveStartingBalance = startingBalance ?? accountSize ?? 0;
  if (publicBalance != null) balance = publicBalance;
  if (publicEquity != null) equity = publicEquity;
  const publicTradeCount = embeddedNumber("numberOfTrades");
  const publicWins = embeddedNumber("tradesWon");
  const publicLosses = embeddedNumber("tradesLost");

  // A successful HTTP response may be a login shell, not account data.
  if (!Number.isFinite(balance)) throw new Error("Dashboard balance could not be verified");
  if (!Number.isFinite(equity)) equity = balance;

  const tradePnl = (trade: any) => {
    const value = Number(trade?.profit ?? trade?.pnl ?? trade?.netProfit ?? trade?.profitLoss ?? 0);
    return Number.isFinite(value) ? value : 0;
  };

  const pnls = trades.map(tradePnl);
  const pnl = balance - effectiveStartingBalance;
  const wins = publicWins ?? pnls.filter((value) => value > 0).length;
  const losses = publicLosses ?? pnls.filter((value) => value < 0).length;
  const biggestWin = pnls.length ? Math.max(0, ...pnls) : 0;

  const timestampCandidates = trades
    .map((trade: any) => trade?.closeTime ?? trade?.closedAt ?? trade?.updatedAt ?? trade?.createdAt ?? trade?.openTime ?? null)
    .filter(Boolean)
    .map((value: any) => new Date(value))
    .filter((value: Date) => Number.isFinite(value.getTime()))
    .sort((a: Date, b: Date) => b.getTime() - a.getTime());

  return {
    balance,
    equity,
    pnl,
    startingBalance: effectiveStartingBalance,
    returnPct: effectiveStartingBalance > 0 ? (pnl / effectiveStartingBalance) * 100 : 0,
    profitTarget,
    dailyLossLimit,
    maxDrawdownLimit,
    tradeCount: publicTradeCount ?? trades.length,
    wins,
    losses,
    biggestWin,
    openPositionCount: openPositions.length,
    lastTradeAt: timestampCandidates[0]?.toISOString() ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

app.get("/api/tradehouse/leaderboard", async (_req: Request, res: Response) => {
  const roster = loadTradeHouseRoster();
  const rows = await Promise.all(
    roster.map(async (entry) => {
      const dashboard = resolvePublicDashboard(entry);
      if (!dashboard) {
        return {
          id: entry.id,
          name: entry.name,
          rank: 0,
          accountId: "",
          dashboardUrl: entry.dashboardUrl || "",
          startingBalance: entry.startingBalance,
          balance: 0,
          equity: 0,
          pnl: 0,
          returnPct: 0,
          tradeCount: 0,
          wins: 0,
          losses: 0,
          biggestWin: 0,
          openPositionCount: 0,
          lastTradeAt: null,
          fetchedAt: null,
          verified: false,
          status: "unavailable" as const,
        };
      }

      try {
        const stats = await fetchTradeHouseDashboard(dashboard.accountId, entry.startingBalance, dashboard.dashboardUrl);
        return {
          id: entry.id,
          name: entry.name,
          rank: 0,
          accountId: dashboard.accountId,
          dashboardUrl: dashboard.dashboardUrl,
          startingBalance: entry.startingBalance,
          ...stats,
          verified: true,
          status: stats.openPositionCount > 0 ? "live" as const : "flat" as const,
        };
      } catch (error) {
        console.error("[tradehouse] dashboard fetch failed", entry.id, error);
        return {
          id: entry.id,
          name: entry.name,
          rank: 0,
          accountId: dashboard.accountId,
          dashboardUrl: dashboard.dashboardUrl,
          startingBalance: entry.startingBalance,
          balance: 0,
          equity: 0,
          pnl: 0,
          returnPct: 0,
          tradeCount: 0,
          wins: 0,
          losses: 0,
          biggestWin: 0,
          openPositionCount: 0,
          lastTradeAt: null,
          fetchedAt: null,
          verified: false,
          status: "unavailable" as const,
        };
      }
    }),
  );

  rows.sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    if (b.returnPct !== a.returnPct) return b.returnPct - a.returnPct;
    if (b.pnl !== a.pnl) return b.pnl - a.pnl;
    return a.name.localeCompare(b.name);
  });

  const standings = rows.map((row, index) => ({ ...row, rank: index + 1 }));
  const configuredStatus = process.env.TRADEHOUSE_SEASON_STATUS;
  const status = configuredStatus === "live" || configuredStatus === "complete" || configuredStatus === "forming"
    ? configuredStatus
    : "forming";

  res.setHeader("Cache-Control", "public, max-age=5, s-maxage=10, stale-while-revalidate=20");
  return res.status(200).json({
    season: {
      name: process.env.TRADEHOUSE_SEASON_NAME || "Season 1",
      status,
      accountType: "simulated",
      refreshSeconds: 15,
      endsAt: process.env.TRADEHOUSE_SEASON_ENDS_AT || null,
      dataPolicy: "Official standings are computed from allowlisted Hybrid Funding public dashboard feeds.",
    },
    standings,
    updatedAt: new Date().toISOString(),
  });
});

app.get("/api/public-payouts", (_req: Request, res: Response) => {
  let payouts: z.infer<typeof publicPayoutsSchema> = [];
  try {
    const parsed = publicPayoutsSchema.safeParse(JSON.parse(process.env.HYBRID_PUBLIC_PAYOUTS_JSON || "[]"));
    if (parsed.success) payouts = parsed.data;
    else console.error("[public-payouts] invalid HYBRID_PUBLIC_PAYOUTS_JSON", parsed.error.flatten());
  } catch (error) {
    console.error("[public-payouts] unable to parse payout feed", error);
  }

  payouts = payouts.slice().sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
  const total = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=120");
  return res.status(200).json({
    payouts,
    count: payouts.length,
    total,
    updatedAt: new Date().toISOString(),
  });
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
