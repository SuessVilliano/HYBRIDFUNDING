import express, { type NextFunction, type Request, type Response } from "express";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

// Self-contained serverless handler for production /api/* routes.
// Avoids importing server/index.ts which pulls in vite/drizzle/ws and
// blocks cold-start on Vercel Functions.

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const TRADEHOUSE_BETA_COOKIE = "hf_tradehouse_beta";
const TRADEHOUSE_BETA_SESSION_SECONDS = 60 * 60 * 12;
const TRADEHOUSE_SHARE_SECONDS = 60 * 60 * 24;
const betaAttempts = new Map<string, { count: number; resetAt: number }>();
const BETA_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const BETA_MAX_ATTEMPTS = 5;

function betaCode() {
  return process.env.TRADEHOUSE_BETA_CODE?.trim() || "";
}

function betaSecret() {
  return process.env.TRADEHOUSE_BETA_SECRET?.trim() || process.env.SESSION_SECRET?.trim() || "";
}

function betaConfigured() {
  return Boolean(betaCode() && betaSecret());
}

function betaAttemptKey(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (first || req.ip || "unknown").trim();
}

function betaAttemptState(req: Request) {
  const key = betaAttemptKey(req);
  const now = Date.now();
  const current = betaAttempts.get(key);
  if (!current || current.resetAt <= now) {
    const fresh = { count: 0, resetAt: now + BETA_ATTEMPT_WINDOW_MS };
    betaAttempts.set(key, fresh);
    return { key, state: fresh };
  }
  return { key, state: current };
}

function safeTextEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

type BetaScope = "admin" | "share";

function signBetaToken(ttlSeconds: number, scope: BetaScope = "admin") {
  const secret = betaSecret();
  if (!secret) return "";
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `v2.${scope}.${expiresAt}`;
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readBetaToken(token?: string | null): { scope: BetaScope; expiresAt: number } | null {
  if (!token || !betaSecret()) return null;
  const [version, scopeRaw, expiresRaw, signature] = token.split(".");
  if (version !== "v2" || (scopeRaw !== "admin" && scopeRaw !== "share") || !expiresRaw || !signature) return null;
  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return null;
  const payload = `${version}.${scopeRaw}.${expiresRaw}`;
  const expected = createHmac("sha256", betaSecret()).update(payload).digest("base64url");
  if (!safeTextEqual(signature, expected)) return null;
  return { scope: scopeRaw, expiresAt };
}

function verifyBetaToken(token?: string | null, requiredScope?: BetaScope) {
  const parsed = readBetaToken(token);
  return Boolean(parsed && (!requiredScope || parsed.scope === requiredScope));
}

function cookieValue(req: Request, name: string) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

function queryAccess(req: Request) {
  const value = req.query?.access;
  return typeof value === "string" ? value : "";
}

function hasAdminBetaAccess(req: Request) {
  return verifyBetaToken(cookieValue(req, TRADEHOUSE_BETA_COOKIE), "admin");
}

function hasBetaAccess(req: Request) {
  return hasAdminBetaAccess(req) || verifyBetaToken(queryAccess(req), "share");
}

function setBetaCookie(res: Response, token: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${TRADEHOUSE_BETA_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`,
  );
}

function clearBetaCookie(res: Response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${TRADEHOUSE_BETA_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

function requireTradeHouseBeta(req: Request, res: Response, next: NextFunction) {
  if (!betaConfigured()) {
    return res.status(503).json({ error: "Private beta access is not configured." });
  }
  if (!hasBetaAccess(req)) {
    return res.status(401).json({ error: "Private beta access required." });
  }
  next();
}

function requireTradeHouseAdmin(req: Request, res: Response, next: NextFunction) {
  if (!betaConfigured()) {
    return res.status(503).json({ error: "Private beta access is not configured." });
  }
  if (!hasAdminBetaAccess(req)) {
    return res.status(401).json({ error: "Admin beta session required." });
  }
  next();
}

type TradeHouseSql = ReturnType<typeof neon>;
let tradeHouseSchemaReady: Promise<void> | null = null;

function tradeHouseSql(): TradeHouseSql | null {
  const url = process.env.DATABASE_URL?.trim();
  return url ? neon(url) : null;
}

async function ensureTradeHousePersistence() {
  const sql = tradeHouseSql();
  if (!sql) throw new Error("DATABASE_URL is not configured.");

  if (!tradeHouseSchemaReady) {
    tradeHouseSchemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS trade_house_traders (
          id serial PRIMARY KEY,
          user_id integer REFERENCES users(id),
          handle text NOT NULL UNIQUE,
          display_name text NOT NULL,
          email text,
          phone text,
          avatar_url text,
          logo_url text,
          bio text,
          default_division text NOT NULL DEFAULT 'trading',
          default_platform text NOT NULL DEFAULT 'other',
          is_active boolean NOT NULL DEFAULT true,
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS trade_house_seasons (
          id serial PRIMARY KEY,
          slug text NOT NULL UNIQUE,
          name text NOT NULL,
          format text NOT NULL DEFAULT 'league',
          status text NOT NULL DEFAULT 'forming',
          starts_at timestamp,
          ends_at timestamp,
          rule_config text,
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS trade_house_battles (
          id serial PRIMARY KEY,
          season_id integer REFERENCES trade_house_seasons(id),
          room_id text NOT NULL UNIQUE,
          name text NOT NULL,
          format text NOT NULL,
          mode text NOT NULL,
          account_size integer,
          sponsor_name text,
          sponsor_url text,
          promo_text text,
          music_url text,
          rule_config text,
          status text NOT NULL DEFAULT 'scheduled',
          started_at timestamp,
          ended_at timestamp,
          created_at timestamp NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS trade_house_accounts (
          id serial PRIMARY KEY,
          trader_id integer NOT NULL REFERENCES trade_house_traders(id),
          platform text NOT NULL DEFAULT 'other',
          account_kind text NOT NULL DEFAULT 'demo',
          account_size integer,
          platform_login text,
          dashboard_url text,
          support_status text NOT NULL DEFAULT 'requested',
          support_reference text,
          credentials_delivered boolean NOT NULL DEFAULT false,
          issued_at timestamp,
          verified_at timestamp,
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS trade_house_entries (
          id serial PRIMARY KEY,
          battle_id integer NOT NULL REFERENCES trade_house_battles(id),
          external_key text,
          trader_id integer NOT NULL REFERENCES trade_house_traders(id),
          account_id integer REFERENCES trade_house_accounts(id),
          dashboard_url text,
          invite_token_hash text,
          invite_last_four text,
          invite_expires_at timestamp,
          invite_revoked_at timestamp,
          profile_completed_at timestamp,
          side text,
          slot integer,
          starting_balance numeric(14,2),
          ending_balance numeric(14,2),
          pnl numeric(14,2),
          return_pct numeric(8,4),
          max_drawdown_pct numeric(8,4),
          placement integer,
          season_points integer NOT NULL DEFAULT 0,
          result text NOT NULL DEFAULT 'active',
          verified boolean NOT NULL DEFAULT false,
          started_at timestamp,
          finished_at timestamp,
          created_at timestamp NOT NULL DEFAULT now()
        )
      `;
      await sql`ALTER TABLE trade_house_traders ADD COLUMN IF NOT EXISTS email text`;
      await sql`ALTER TABLE trade_house_traders ADD COLUMN IF NOT EXISTS phone text`;
      await sql`ALTER TABLE trade_house_battles ADD COLUMN IF NOT EXISTS promo_text text`;
      await sql`ALTER TABLE trade_house_battles ADD COLUMN IF NOT EXISTS music_url text`;
      await sql`ALTER TABLE trade_house_entries ALTER COLUMN dashboard_url DROP NOT NULL`;
      await sql`ALTER TABLE trade_house_entries ADD COLUMN IF NOT EXISTS external_key text`;
      await sql`ALTER TABLE trade_house_entries ADD COLUMN IF NOT EXISTS account_id integer REFERENCES trade_house_accounts(id)`;
      await sql`ALTER TABLE trade_house_entries ADD COLUMN IF NOT EXISTS invite_token_hash text`;
      await sql`ALTER TABLE trade_house_entries ADD COLUMN IF NOT EXISTS invite_last_four text`;
      await sql`ALTER TABLE trade_house_entries ADD COLUMN IF NOT EXISTS invite_expires_at timestamp`;
      await sql`ALTER TABLE trade_house_entries ADD COLUMN IF NOT EXISTS invite_revoked_at timestamp`;
      await sql`ALTER TABLE trade_house_entries ADD COLUMN IF NOT EXISTS profile_completed_at timestamp`;
      await sql`CREATE INDEX IF NOT EXISTS idx_trade_house_accounts_trader ON trade_house_accounts(trader_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_trade_house_entries_invite_hash ON trade_house_entries(invite_token_hash)`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_trade_house_entries_external_key ON trade_house_entries(battle_id, external_key) WHERE external_key IS NOT NULL`;
      await sql`CREATE INDEX IF NOT EXISTS idx_trade_house_battles_created_at ON trade_house_battles(created_at DESC)`;
    })().catch((error) => {
      tradeHouseSchemaReady = null;
      throw error;
    });
  }

  await tradeHouseSchemaReady;
  return sql;
}

function tradeHouseInviteToken() {
  const token = randomBytes(24).toString("base64url");
  return {
    token,
    hash: createHash("sha256").update(token).digest("hex"),
    lastFour: token.slice(-4),
  };
}

function safeHandle(value: string, fallback: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
  return cleaned || fallback;
}

function requestOrigin(req: Request) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "www.hybridfunding.co";
  return `${proto}://${Array.isArray(host) ? host[0] : host}`;
}

app.get("/api/tradehouse/beta/status", (req: Request, res: Response) => {
  if (!betaConfigured()) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ authorized: false, configured: false });
  }

  const suppliedAccess = queryAccess(req);
  const share = readBetaToken(suppliedAccess);
  const admin = hasAdminBetaAccess(req);
  const authorized = admin || share?.scope === "share";

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    authorized,
    configured: true,
    scope: admin ? "admin" : share?.scope || null,
  });
});

app.post("/api/tradehouse/beta/login", async (req: Request, res: Response) => {
  if (!betaConfigured()) {
    return res.status(503).json({ error: "Private beta access is not configured." });
  }

  const attempt = betaAttemptState(req);
  if (attempt.state.count >= BETA_MAX_ATTEMPTS) {
    res.setHeader("Retry-After", String(Math.max(1, Math.ceil((attempt.state.resetAt - Date.now()) / 1000))));
    return res.status(429).json({ error: "Too many attempts. Try again later." });
  }

  const submitted = typeof req.body?.code === "string" ? req.body.code.trim() : "";
  if (!submitted || !safeTextEqual(submitted, betaCode())) {
    attempt.state.count += 1;
    betaAttempts.set(attempt.key, attempt.state);
    await new Promise((resolve) => setTimeout(resolve, 650));
    return res.status(401).json({ error: "Invalid access code." });
  }

  betaAttempts.delete(attempt.key);
  const token = signBetaToken(TRADEHOUSE_BETA_SESSION_SECONDS, "admin");
  setBetaCookie(res, token, TRADEHOUSE_BETA_SESSION_SECONDS);
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ok: true });
});

app.post("/api/tradehouse/beta/logout", (_req: Request, res: Response) => {
  clearBetaCookie(res);
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ ok: true });
});

app.post("/api/tradehouse/beta/link-token", requireTradeHouseBeta, (_req: Request, res: Response) => {
  const token = signBetaToken(TRADEHOUSE_SHARE_SECONDS, "share");
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    token,
    expiresAt: new Date(Date.now() + TRADEHOUSE_SHARE_SECONDS * 1000).toISOString(),
  });
});

const traderProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  handle: z.string().trim().min(2).max(40).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: z.string().trim().max(30).optional(),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  dashboardUrl: z.string().trim().url().optional().or(z.literal("")),
  platformLogin: z.string().trim().max(120).optional(),
});

async function findTradeHouseInvite(token: string) {
  const sql = await ensureTradeHousePersistence();
  const hash = createHash("sha256").update(token).digest("hex");
  const rows = await sql`
    SELECT
      e.id AS entry_id,
      e.battle_id,
      e.trader_id,
      e.account_id,
      e.dashboard_url AS entry_dashboard_url,
      e.side,
      e.slot,
      e.starting_balance,
      e.verified,
      e.invite_last_four,
      e.profile_completed_at,
      t.handle,
      t.display_name,
      t.email,
      t.phone,
      t.avatar_url,
      t.logo_url,
      t.default_division,
      t.default_platform,
      a.platform AS account_platform,
      a.account_kind,
      a.account_size AS assigned_account_size,
      a.platform_login,
      a.dashboard_url AS account_dashboard_url,
      a.support_status,
      a.support_reference,
      a.credentials_delivered,
      a.issued_at,
      a.verified_at,
      b.room_id,
      b.name AS battle_name,
      b.format AS battle_format,
      b.mode AS battle_mode,
      b.account_size AS battle_account_size,
      b.status AS battle_status,
      b.rule_config
    FROM trade_house_entries e
    JOIN trade_house_traders t ON t.id = e.trader_id
    JOIN trade_house_battles b ON b.id = e.battle_id
    LEFT JOIN trade_house_accounts a ON a.id = e.account_id
    WHERE e.invite_token_hash = ${hash}
      AND e.invite_revoked_at IS NULL
      AND (e.invite_expires_at IS NULL OR e.invite_expires_at > now())
    LIMIT 1
  `;
  return rows[0] || null;
}

app.get("/api/tradehouse/invite/:token", async (req: Request, res: Response) => {
  try {
    const token = String(req.params.token || "").trim();
    if (token.length < 20) return res.status(404).json({ error: "Invite not found." });
    const row: any = await findTradeHouseInvite(token);
    if (!row) return res.status(404).json({ error: "Invite expired or revoked." });

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      battle: {
        roomId: row.room_id,
        name: row.battle_name,
        format: row.battle_format,
        mode: row.battle_mode,
        accountSize: row.battle_account_size,
        status: row.battle_status,
        ruleConfig: row.rule_config ? JSON.parse(row.rule_config) : null,
      },
      trader: {
        id: row.trader_id,
        handle: row.handle,
        displayName: row.display_name,
        email: row.email,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        logoUrl: row.logo_url,
        division: row.default_division,
        platform: row.default_platform,
      },
      account: {
        id: row.account_id,
        platform: row.account_platform || row.default_platform,
        accountKind: row.account_kind || "demo",
        accountSize: row.assigned_account_size || row.battle_account_size,
        platformLogin: row.platform_login,
        dashboardUrl: row.account_dashboard_url || row.entry_dashboard_url,
        supportStatus: row.support_status || "requested",
        supportReference: row.support_reference,
        credentialsDelivered: Boolean(row.credentials_delivered),
        issuedAt: row.issued_at,
        verifiedAt: row.verified_at,
      },
      entry: {
        id: row.entry_id,
        side: row.side,
        slot: row.slot,
        startingBalance: row.starting_balance == null ? null : Number(row.starting_balance),
        verified: Boolean(row.verified),
        profileCompletedAt: row.profile_completed_at,
      },
      roomUrl: `${requestOrigin(req)}/battles/room/${encodeURIComponent(row.room_id)}?invite=${encodeURIComponent(token)}&name=${encodeURIComponent(row.display_name)}&side=${encodeURIComponent(row.side || "left")}&slot=${encodeURIComponent(String(row.slot || 0))}&mode=${encodeURIComponent(row.battle_mode || "1v1")}`,
    });
  } catch (error) {
    console.error("[tradehouse/invite] lookup failed", error);
    return res.status(500).json({ error: "Invite service unavailable." });
  }
});

app.patch("/api/tradehouse/invite/:token", async (req: Request, res: Response) => {
  try {
    const parsed = traderProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid trader profile", details: parsed.error.flatten() });
    }
    const token = String(req.params.token || "").trim();
    const row: any = await findTradeHouseInvite(token);
    if (!row) return res.status(404).json({ error: "Invite expired or revoked." });

    const data = parsed.data;
    const sql = await ensureTradeHousePersistence();
    let dashboardUrl = data.dashboardUrl?.trim() || null;
    if (dashboardUrl) {
      const dashboard = resolvePublicDashboard({ dashboardUrl });
      if (!dashboard) return res.status(400).json({ error: "Use a valid Hybrid Funding public dashboard URL." });
      dashboardUrl = dashboard.dashboardUrl;
    }

    const nextHandle = data.handle ? safeHandle(data.handle, `trader-${row.trader_id}`) : row.handle;
    const duplicate = await sql`
      SELECT id FROM trade_house_traders WHERE handle = ${nextHandle} AND id <> ${row.trader_id} LIMIT 1
    `;
    if (duplicate.length) return res.status(409).json({ error: "That trader handle is already in use." });

    await sql`
      UPDATE trade_house_traders
      SET
        display_name = COALESCE(${data.displayName || null}, display_name),
        handle = ${nextHandle},
        email = COALESCE(${data.email || null}, email),
        phone = COALESCE(${data.phone || null}, phone),
        avatar_url = CASE WHEN ${data.avatarUrl === ""} THEN NULL ELSE COALESCE(${data.avatarUrl || null}, avatar_url) END,
        logo_url = CASE WHEN ${data.logoUrl === ""} THEN NULL ELSE COALESCE(${data.logoUrl || null}, logo_url) END,
        updated_at = now()
      WHERE id = ${row.trader_id}
    `;

    let accountId = row.account_id ? Number(row.account_id) : null;
    if (!accountId) {
      const accounts = await sql`
        INSERT INTO trade_house_accounts (
          trader_id, platform, account_kind, account_size, platform_login, dashboard_url, support_status
        ) VALUES (
          ${row.trader_id},
          ${row.default_platform || "other"},
          'demo',
          ${row.battle_account_size || null},
          ${data.platformLogin || null},
          ${dashboardUrl},
          'requested'
        )
        RETURNING id
      `;
      accountId = Number(accounts[0]?.id);
      await sql`UPDATE trade_house_entries SET account_id = ${accountId} WHERE id = ${row.entry_id}`;
    } else {
      await sql`
        UPDATE trade_house_accounts
        SET
          platform_login = COALESCE(${data.platformLogin || null}, platform_login),
          dashboard_url = COALESCE(${dashboardUrl}, dashboard_url),
          updated_at = now()
        WHERE id = ${accountId}
      `;
    }

    await sql`
      UPDATE trade_house_entries
      SET
        dashboard_url = COALESCE(${dashboardUrl}, dashboard_url),
        profile_completed_at = CASE
          WHEN ${Boolean(data.displayName || row.display_name) && Boolean(data.email || row.email)} THEN COALESCE(profile_completed_at, now())
          ELSE profile_completed_at
        END
      WHERE id = ${row.entry_id}
    `;

    const refreshed: any = await findTradeHouseInvite(token);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      ok: true,
      trader: {
        handle: refreshed.handle,
        displayName: refreshed.display_name,
        email: refreshed.email,
        phone: refreshed.phone,
        avatarUrl: refreshed.avatar_url,
        logoUrl: refreshed.logo_url,
      },
      account: {
        platform: refreshed.account_platform || refreshed.default_platform,
        platformLogin: refreshed.platform_login,
        dashboardUrl: refreshed.account_dashboard_url || refreshed.entry_dashboard_url,
        supportStatus: refreshed.support_status || "requested",
        credentialsDelivered: Boolean(refreshed.credentials_delivered),
      },
    });
  } catch (error) {
    console.error("[tradehouse/invite] update failed", error);
    return res.status(500).json({ error: "Trader profile could not be saved." });
  }
});

// Admin mutations are restricted to the code-authenticated beta session.
app.use("/api/tradehouse/admin", requireTradeHouseAdmin);

// Non-admin Trade House APIs can be reached by the admin session or a temporary
// signed share link generated by the producer studio.
app.use("/api/tradehouse", requireTradeHouseBeta);

const savedBattleEntrySchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(80),
  handle: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  dashboardUrl: z.string().trim().url().optional().or(z.literal("")),
  avatarUrl: z.string().trim().url().optional().or(z.literal("")),
  startingBalance: z.number().nonnegative().optional(),
  division: z.enum(["trading", "prediction", "hybrid"]).default("trading"),
  platform: z.enum(["matchtrader", "ctrader", "dxtrade", "dxfutures", "tickblaze", "other"]).default("other"),
  accountKind: z.enum(["demo", "challenge", "funded"]).default("demo"),
  platformLogin: z.string().trim().max(120).optional().or(z.literal("")),
  supportStatus: z.enum(["requested", "created", "delivered", "verified"]).default("requested"),
  supportReference: z.string().trim().max(160).optional().or(z.literal("")),
  credentialsDelivered: z.boolean().default(false),
});

const savedBattleSchema = z.object({
  roomId: z.string().trim().min(3).max(80),
  name: z.string().trim().min(1).max(120),
  format: z.enum(["spotlight", "sprint", "target", "prop", "league"]),
  mode: z.enum(["1v1", "2v2", "3v3", "4v4"]),
  accountSize: z.number().int().positive().optional(),
  sponsorName: z.string().trim().max(120).optional().or(z.literal("")),
  sponsorUrl: z.string().trim().url().optional().or(z.literal("")),
  promoText: z.string().trim().max(240).optional().or(z.literal("")),
  musicUrl: z.string().trim().url().optional().or(z.literal("")),
  ruleConfig: z.record(z.any()).default({}),
  status: z.enum(["scheduled", "forming", "live", "complete", "cancelled"]).default("forming"),
  entries: z.array(savedBattleEntrySchema).min(1).max(8),
});

async function savedBattlePayload(sql: TradeHouseSql, roomId: string) {
  const battles = await sql`
    SELECT
      id, room_id, name, format, mode, account_size, sponsor_name, sponsor_url,
      promo_text, music_url, rule_config, status, started_at, ended_at, created_at
    FROM trade_house_battles
    WHERE room_id = ${roomId}
    LIMIT 1
  `;
  const battle: any = battles[0];
  if (!battle) return null;

  const entries = await sql`
    SELECT
      e.id AS entry_id,
      e.external_key,
      e.trader_id,
      e.account_id,
      e.dashboard_url,
      e.side,
      e.slot,
      e.starting_balance,
      e.ending_balance,
      e.pnl,
      e.return_pct,
      e.max_drawdown_pct,
      e.placement,
      e.season_points,
      e.result,
      e.verified,
      e.invite_last_four,
      e.invite_expires_at,
      e.invite_revoked_at,
      e.profile_completed_at,
      t.handle,
      t.display_name,
      t.email,
      t.phone,
      t.avatar_url,
      t.logo_url,
      t.default_division,
      t.default_platform,
      a.account_kind,
      a.account_size AS assigned_account_size,
      a.platform_login,
      a.dashboard_url AS account_dashboard_url,
      a.support_status,
      a.support_reference,
      a.credentials_delivered,
      a.issued_at,
      a.verified_at
    FROM trade_house_entries e
    JOIN trade_house_traders t ON t.id = e.trader_id
    LEFT JOIN trade_house_accounts a ON a.id = e.account_id
    WHERE e.battle_id = ${battle.id}
      AND e.result <> 'removed'
    ORDER BY COALESCE(e.slot, 99), e.id
  `;

  return {
    id: Number(battle.id),
    roomId: battle.room_id,
    name: battle.name,
    format: battle.format,
    mode: battle.mode,
    accountSize: battle.account_size == null ? null : Number(battle.account_size),
    sponsorName: battle.sponsor_name,
    sponsorUrl: battle.sponsor_url,
    promoText: battle.promo_text,
    musicUrl: battle.music_url,
    ruleConfig: battle.rule_config ? JSON.parse(battle.rule_config) : {},
    status: battle.status,
    startedAt: battle.started_at,
    endedAt: battle.ended_at,
    createdAt: battle.created_at,
    entries: entries.map((row: any) => ({
      entryId: Number(row.entry_id),
      id: row.external_key || `entry-${row.entry_id}`,
      traderId: Number(row.trader_id),
      accountId: row.account_id == null ? null : Number(row.account_id),
      name: row.display_name,
      handle: row.handle,
      email: row.email,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      logoUrl: row.logo_url,
      dashboardUrl: row.account_dashboard_url || row.dashboard_url || "",
      division: row.default_division,
      platform: row.default_platform,
      accountKind: row.account_kind || "demo",
      accountSize: row.assigned_account_size == null ? null : Number(row.assigned_account_size),
      platformLogin: row.platform_login,
      supportStatus: row.support_status || "requested",
      supportReference: row.support_reference,
      credentialsDelivered: Boolean(row.credentials_delivered),
      issuedAt: row.issued_at,
      verifiedAt: row.verified_at,
      side: row.side,
      slot: row.slot == null ? null : Number(row.slot),
      startingBalance: row.starting_balance == null ? null : Number(row.starting_balance),
      endingBalance: row.ending_balance == null ? null : Number(row.ending_balance),
      pnl: row.pnl == null ? null : Number(row.pnl),
      returnPct: row.return_pct == null ? null : Number(row.return_pct),
      maxDrawdownPct: row.max_drawdown_pct == null ? null : Number(row.max_drawdown_pct),
      placement: row.placement == null ? null : Number(row.placement),
      seasonPoints: Number(row.season_points || 0),
      result: row.result,
      verified: Boolean(row.verified),
      inviteLastFour: row.invite_last_four,
      inviteExpiresAt: row.invite_expires_at,
      inviteRevokedAt: row.invite_revoked_at,
      profileCompletedAt: row.profile_completed_at,
    })),
  };
}

app.get("/api/tradehouse/admin/battles", async (_req: Request, res: Response) => {
  try {
    const sql = await ensureTradeHousePersistence();
    const rows = await sql`
      SELECT
        b.id, b.room_id, b.name, b.format, b.mode, b.status, b.account_size,
        b.created_at, b.started_at, b.ended_at,
        COUNT(e.id) FILTER (WHERE e.result <> 'removed')::int AS entry_count
      FROM trade_house_battles b
      LEFT JOIN trade_house_entries e ON e.battle_id = b.id
      GROUP BY b.id
      ORDER BY b.created_at DESC
      LIMIT 50
    `;
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      battles: rows.map((row: any) => ({
        id: Number(row.id),
        roomId: row.room_id,
        name: row.name,
        format: row.format,
        mode: row.mode,
        status: row.status,
        accountSize: row.account_size == null ? null : Number(row.account_size),
        entryCount: Number(row.entry_count || 0),
        createdAt: row.created_at,
        startedAt: row.started_at,
        endedAt: row.ended_at,
      })),
    });
  } catch (error) {
    console.error("[tradehouse/admin] list battles failed", error);
    return res.status(500).json({ error: "Saved battles are unavailable." });
  }
});

app.get("/api/tradehouse/admin/battles/:roomId", async (req: Request, res: Response) => {
  try {
    const sql = await ensureTradeHousePersistence();
    const battle = await savedBattlePayload(sql, String(req.params.roomId || ""));
    if (!battle) return res.status(404).json({ error: "Battle not found." });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ battle });
  } catch (error) {
    console.error("[tradehouse/admin] load battle failed", error);
    return res.status(500).json({ error: "Battle could not be loaded." });
  }
});

app.post("/api/tradehouse/admin/battles", async (req: Request, res: Response) => {
  try {
    const parsed = savedBattleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid battle", details: parsed.error.flatten() });
    }
    const data = parsed.data;
    const sql = await ensureTradeHousePersistence();
    const battles = await sql`
      INSERT INTO trade_house_battles (
        room_id, name, format, mode, account_size, sponsor_name, sponsor_url,
        promo_text, music_url, rule_config, status
      ) VALUES (
        ${data.roomId}, ${data.name}, ${data.format}, ${data.mode}, ${data.accountSize || null},
        ${data.sponsorName || null}, ${data.sponsorUrl || null}, ${data.promoText || null},
        ${data.musicUrl || null}, ${JSON.stringify(data.ruleConfig || {})}, ${data.status}
      )
      ON CONFLICT (room_id) DO UPDATE SET
        name = EXCLUDED.name,
        format = EXCLUDED.format,
        mode = EXCLUDED.mode,
        account_size = EXCLUDED.account_size,
        sponsor_name = EXCLUDED.sponsor_name,
        sponsor_url = EXCLUDED.sponsor_url,
        promo_text = EXCLUDED.promo_text,
        music_url = EXCLUDED.music_url,
        rule_config = EXCLUDED.rule_config,
        status = EXCLUDED.status
      RETURNING id
    `;
    const battleId = Number(battles[0]?.id);
    const activeKeys = new Set(data.entries.map((entry) => entry.id));
    const inviteUrls: Array<{ entryId: number; rosterId: string; name: string; inviteUrl: string; lastFour: string }> = [];

    for (let index = 0; index < data.entries.length; index += 1) {
      const entry = data.entries[index];
      const side = index % 2 === 0 ? "left" : "right";
      const slot = Math.floor(index / 2);

      let dashboardUrl: string | null = null;
      if (entry.dashboardUrl) {
        const dashboard = resolvePublicDashboard({ dashboardUrl: entry.dashboardUrl });
        if (!dashboard) return res.status(400).json({ error: `Invalid Hybrid public dashboard for ${entry.name}.` });
        dashboardUrl = dashboard.dashboardUrl;
      }

      const existingRows = await sql`
        SELECT id, trader_id, account_id, invite_token_hash
        FROM trade_house_entries
        WHERE battle_id = ${battleId} AND external_key = ${entry.id}
        LIMIT 1
      `;
      const existing: any = existingRows[0];

      let traderId: number;
      let accountId: number | null;
      if (existing) {
        traderId = Number(existing.trader_id);
        accountId = existing.account_id == null ? null : Number(existing.account_id);
      } else {
        let traderRows: any[] = [];
        if (entry.email) {
          traderRows = await sql`
            SELECT id FROM trade_house_traders WHERE lower(email) = lower(${entry.email}) LIMIT 1
          `;
        }

        if (traderRows.length) {
          traderId = Number(traderRows[0].id);
        } else {
          const baseHandle = safeHandle(entry.handle || entry.name, `trader-${entry.id.slice(-6)}`);
          let handle = baseHandle;
          const collision = await sql`SELECT id FROM trade_house_traders WHERE handle = ${handle} LIMIT 1`;
          if (collision.length) handle = `${baseHandle.slice(0, 30)}-${randomBytes(3).toString("hex")}`;
          traderRows = await sql`
            INSERT INTO trade_house_traders (
              handle, display_name, email, phone, avatar_url, default_division, default_platform
            ) VALUES (
              ${handle}, ${entry.name}, ${entry.email || null}, ${entry.phone || null},
              ${entry.avatarUrl || null}, ${entry.division}, ${entry.platform}
            )
            RETURNING id
          `;
          traderId = Number(traderRows[0].id);
        }
        accountId = null;
      }

      await sql`
        UPDATE trade_house_traders
        SET
          display_name = ${entry.name},
          email = COALESCE(${entry.email || null}, email),
          phone = COALESCE(${entry.phone || null}, phone),
          avatar_url = COALESCE(${entry.avatarUrl || null}, avatar_url),
          default_division = ${entry.division},
          default_platform = ${entry.platform},
          updated_at = now()
        WHERE id = ${traderId}
      `;

      if (accountId) {
        await sql`
          UPDATE trade_house_accounts
          SET
            platform = ${entry.platform},
            account_kind = ${entry.accountKind},
            account_size = COALESCE(${data.accountSize || null}, account_size),
            platform_login = COALESCE(${entry.platformLogin || null}, platform_login),
            dashboard_url = COALESCE(${dashboardUrl}, dashboard_url),
            support_status = ${entry.supportStatus},
            support_reference = COALESCE(${entry.supportReference || null}, support_reference),
            credentials_delivered = ${entry.credentialsDelivered},
            issued_at = CASE WHEN ${entry.supportStatus !== "requested"} THEN COALESCE(issued_at, now()) ELSE issued_at END,
            verified_at = CASE WHEN ${entry.supportStatus === "verified"} THEN COALESCE(verified_at, now()) ELSE verified_at END,
            updated_at = now()
          WHERE id = ${accountId}
        `;
      } else {
        const accounts = await sql`
          INSERT INTO trade_house_accounts (
            trader_id, platform, account_kind, account_size, platform_login, dashboard_url,
            support_status, support_reference, credentials_delivered, issued_at, verified_at
          ) VALUES (
            ${traderId}, ${entry.platform}, ${entry.accountKind}, ${data.accountSize || null},
            ${entry.platformLogin || null}, ${dashboardUrl}, ${entry.supportStatus},
            ${entry.supportReference || null}, ${entry.credentialsDelivered},
            CASE WHEN ${entry.supportStatus !== "requested"} THEN now() ELSE NULL END,
            CASE WHEN ${entry.supportStatus === "verified"} THEN now() ELSE NULL END
          )
          RETURNING id
        `;
        accountId = Number(accounts[0].id);
      }

      if (existing) {
        await sql`
          UPDATE trade_house_entries
          SET
            trader_id = ${traderId},
            account_id = ${accountId},
            dashboard_url = COALESCE(${dashboardUrl}, dashboard_url),
            side = ${side},
            slot = ${slot},
            starting_balance = COALESCE(${entry.startingBalance ?? null}, starting_balance),
            result = CASE WHEN result = 'removed' THEN 'active' ELSE result END
          WHERE id = ${existing.id}
        `;
      } else {
        const invite = tradeHouseInviteToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const entryRows = await sql`
          INSERT INTO trade_house_entries (
            battle_id, external_key, trader_id, account_id, dashboard_url,
            invite_token_hash, invite_last_four, invite_expires_at,
            side, slot, starting_balance, result, verified
          ) VALUES (
            ${battleId}, ${entry.id}, ${traderId}, ${accountId}, ${dashboardUrl},
            ${invite.hash}, ${invite.lastFour}, ${expiresAt},
            ${side}, ${slot}, ${entry.startingBalance ?? null}, 'active', false
          )
          RETURNING id
        `;
        const entryId = Number(entryRows[0].id);
        inviteUrls.push({
          entryId,
          rosterId: entry.id,
          name: entry.name,
          inviteUrl: `${requestOrigin(req)}/tradehouse/join/${invite.token}`,
          lastFour: invite.lastFour,
        });
      }
    }

    const currentEntries = await sql`
      SELECT id, external_key FROM trade_house_entries WHERE battle_id = ${battleId} AND result <> 'removed'
    `;
    for (const row of currentEntries as any[]) {
      if (row.external_key && !activeKeys.has(String(row.external_key))) {
        await sql`UPDATE trade_house_entries SET result = 'removed' WHERE id = ${row.id}`;
      }
    }

    const battle = await savedBattlePayload(sql, data.roomId);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ok: true, battle, newInvites: inviteUrls });
  } catch (error) {
    console.error("[tradehouse/admin] save battle failed", error);
    return res.status(500).json({ error: "Battle could not be saved." });
  }
});

app.post("/api/tradehouse/admin/entries/:entryId/invite", async (req: Request, res: Response) => {
  try {
    const entryId = Number(req.params.entryId);
    if (!Number.isFinite(entryId)) return res.status(400).json({ error: "Invalid entry." });
    const sql = await ensureTradeHousePersistence();
    const rows = await sql`
      SELECT e.id, t.display_name
      FROM trade_house_entries e
      JOIN trade_house_traders t ON t.id = e.trader_id
      WHERE e.id = ${entryId}
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Entry not found." });
    const invite = tradeHouseInviteToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await sql`
      UPDATE trade_house_entries
      SET
        invite_token_hash = ${invite.hash},
        invite_last_four = ${invite.lastFour},
        invite_expires_at = ${expiresAt},
        invite_revoked_at = NULL
      WHERE id = ${entryId}
    `;
    return res.status(200).json({
      ok: true,
      inviteUrl: `${requestOrigin(req)}/tradehouse/join/${invite.token}`,
      lastFour: invite.lastFour,
      expiresAt,
    });
  } catch (error) {
    console.error("[tradehouse/admin] invite generation failed", error);
    return res.status(500).json({ error: "Invite could not be generated." });
  }
});

const accountAdminSchema = z.object({
  platform: z.enum(["matchtrader", "ctrader", "dxtrade", "dxfutures", "tickblaze", "other"]).optional(),
  accountKind: z.enum(["demo", "challenge", "funded"]).optional(),
  accountSize: z.number().int().positive().optional(),
  platformLogin: z.string().trim().max(120).optional().or(z.literal("")),
  dashboardUrl: z.string().trim().url().optional().or(z.literal("")),
  supportStatus: z.enum(["requested", "created", "delivered", "verified"]).optional(),
  supportReference: z.string().trim().max(160).optional().or(z.literal("")),
  credentialsDelivered: z.boolean().optional(),
});

app.patch("/api/tradehouse/admin/entries/:entryId/account", async (req: Request, res: Response) => {
  try {
    const entryId = Number(req.params.entryId);
    if (!Number.isFinite(entryId)) return res.status(400).json({ error: "Invalid entry." });
    const parsed = accountAdminSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid account update", details: parsed.error.flatten() });
    const data = parsed.data;
    const sql = await ensureTradeHousePersistence();
    const rows = await sql`
      SELECT e.id, e.account_id, e.trader_id, e.dashboard_url, t.default_platform
      FROM trade_house_entries e
      JOIN trade_house_traders t ON t.id = e.trader_id
      WHERE e.id = ${entryId}
      LIMIT 1
    `;
    const row: any = rows[0];
    if (!row) return res.status(404).json({ error: "Entry not found." });

    let dashboardUrl: string | null = null;
    if (data.dashboardUrl) {
      const dashboard = resolvePublicDashboard({ dashboardUrl: data.dashboardUrl });
      if (!dashboard) return res.status(400).json({ error: "Use a valid Hybrid Funding public dashboard URL." });
      dashboardUrl = dashboard.dashboardUrl;
    }

    let accountId = row.account_id == null ? null : Number(row.account_id);
    if (!accountId) {
      const created = await sql`
        INSERT INTO trade_house_accounts (
          trader_id, platform, account_kind, account_size, platform_login, dashboard_url,
          support_status, support_reference, credentials_delivered, issued_at, verified_at
        ) VALUES (
          ${row.trader_id}, ${data.platform || row.default_platform || "other"}, ${data.accountKind || "demo"},
          ${data.accountSize || null}, ${data.platformLogin || null}, ${dashboardUrl},
          ${data.supportStatus || "requested"}, ${data.supportReference || null}, ${Boolean(data.credentialsDelivered)},
          CASE WHEN ${Boolean(data.supportStatus && data.supportStatus !== "requested")} THEN now() ELSE NULL END,
          CASE WHEN ${data.supportStatus === "verified"} THEN now() ELSE NULL END
        )
        RETURNING id
      `;
      accountId = Number(created[0].id);
      await sql`UPDATE trade_house_entries SET account_id = ${accountId} WHERE id = ${entryId}`;
    } else {
      await sql`
        UPDATE trade_house_accounts
        SET
          platform = COALESCE(${data.platform || null}, platform),
          account_kind = COALESCE(${data.accountKind || null}, account_kind),
          account_size = COALESCE(${data.accountSize || null}, account_size),
          platform_login = CASE WHEN ${data.platformLogin === ""} THEN NULL ELSE COALESCE(${data.platformLogin || null}, platform_login) END,
          dashboard_url = COALESCE(${dashboardUrl}, dashboard_url),
          support_status = COALESCE(${data.supportStatus || null}, support_status),
          support_reference = CASE WHEN ${data.supportReference === ""} THEN NULL ELSE COALESCE(${data.supportReference || null}, support_reference) END,
          credentials_delivered = COALESCE(${data.credentialsDelivered ?? null}, credentials_delivered),
          issued_at = CASE WHEN ${Boolean(data.supportStatus && data.supportStatus !== "requested")} THEN COALESCE(issued_at, now()) ELSE issued_at END,
          verified_at = CASE WHEN ${data.supportStatus === "verified"} THEN COALESCE(verified_at, now()) ELSE verified_at END,
          updated_at = now()
        WHERE id = ${accountId}
      `;
    }

    if (dashboardUrl) {
      await sql`UPDATE trade_house_entries SET dashboard_url = ${dashboardUrl} WHERE id = ${entryId}`;
    }

    return res.status(200).json({ ok: true, accountId });
  } catch (error) {
    console.error("[tradehouse/admin] account update failed", error);
    return res.status(500).json({ error: "Account assignment could not be saved." });
  }
});


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
    avatarUrl: z.string().url().optional(),
    startingBalance: z.number().positive().optional(),
    division: z.enum(["trading", "prediction", "hybrid"]).default("trading"),
    platform: z.enum(["matchtrader", "ctrader", "dxtrade", "dxfutures", "tickblaze", "other"]).optional(),
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


const quickBattleEntrySchema = z.object({
  id: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(40),
  dashboardUrl: z.string().url(),
  avatarUrl: z.string().url().optional(),
  startingBalance: z.number().nonnegative().optional(),
  division: z.enum(["trading", "prediction", "hybrid"]).default("trading"),
  platform: z.enum(["matchtrader", "ctrader", "dxtrade", "dxfutures", "tickblaze", "other"]).optional(),
});

const quickBattleSchema = z.object({
  entries: z.array(quickBattleEntrySchema).min(1).max(8),
  seasonName: z.string().trim().min(1).max(80).optional(),
});

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
  const configuredRoster = process.env.TRADEHOUSE_ROSTER_JSON?.trim();
  const raw = configuredRoster && configuredRoster !== "[]" ? configuredRoster : JSON.stringify(defaultRoster);
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


app.post("/api/tradehouse/quick-leaderboard", async (req: Request, res: Response) => {
  const parsed = quickBattleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid quick battle roster", details: parsed.error.flatten() });
  }

  const rows = await Promise.all(
    parsed.data.entries.map(async (entry) => {
      try {
        const dashboard = resolvePublicDashboard({ dashboardUrl: entry.dashboardUrl });
        if (!dashboard) throw new Error("Unsupported Hybrid public dashboard URL");
        const stats = await fetchTradeHouseDashboard(dashboard.accountId, entry.startingBalance, dashboard.dashboardUrl);
        return {
          id: entry.id,
          name: entry.name,
          rank: 0,
          source: "hybrid" as const,
          sourceLabel: "Hybrid Funding",
          division: entry.division,
          platform: entry.platform ?? "other",
          accountId: dashboard.accountId,
          dashboardUrl: dashboard.dashboardUrl,
          avatarUrl: entry.avatarUrl,
          ...stats,
          verified: true,
          status: stats.openPositionCount > 0 ? "live" as const : "flat" as const,
        };
      } catch (error) {
        console.error("[tradehouse/quick] feed failed", entry.id, error);
        return {
          id: entry.id,
          name: entry.name,
          rank: 0,
          source: "hybrid" as const,
          sourceLabel: "Hybrid Funding",
          division: entry.division,
          platform: entry.platform ?? "other",
          accountId: "",
          dashboardUrl: entry.dashboardUrl,
          avatarUrl: entry.avatarUrl,
          startingBalance: entry.startingBalance ?? 0,
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
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    season: {
      name: parsed.data.seasonName || "Quick Battle",
      status: "live",
      accountType: "simulated",
      refreshSeconds: 15,
      endsAt: null,
      dataPolicy: "All Quick Battle standings are read from verified public Hybrid Funding dashboards. The underlying execution platform is metadata only.",
    },
    standings,
    updatedAt: new Date().toISOString(),
  });
});

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
          avatarUrl: entry.avatarUrl,
          startingBalance: entry.startingBalance,
          division: entry.division,
          platform: entry.platform ?? "other",
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
          avatarUrl: entry.avatarUrl,
          startingBalance: entry.startingBalance,
          division: entry.division,
          platform: entry.platform ?? "other",
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
          division: entry.division,
          platform: entry.platform ?? "other",
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
