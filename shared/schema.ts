import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum, varchar, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const assetClassEnum = pgEnum("asset_class", ["forex", "crypto", "futures"]);
export const challengeTypeEnum = pgEnum("challenge_type", ["one-step", "two-step", "three-step", "four-phase", "instant", "instant-lite"]);
export const challengeStatusEnum = pgEnum("challenge_status", ["pending", "active", "passed", "failed", "funded"]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  purchasedChallenges: many(purchasedChallenges),
}));

// Challenge products table
export const challengeProducts = pgTable("challenge_products", {
  id: serial("id").primaryKey(),
  accountSize: integer("account_size").notNull(),
  assetClass: assetClassEnum("asset_class").notNull(),
  challengeType: challengeTypeEnum("challenge_type").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  profitTarget: decimal("profit_target", { precision: 5, scale: 2 }),
  maxDrawdown: decimal("max_drawdown", { precision: 5, scale: 2 }).notNull(),
  isBestValue: boolean("is_best_value").default(false),
  isActive: boolean("is_active").default(true).notNull(),
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Challenge products relations
export const challengeProductsRelations = relations(challengeProducts, ({ many }) => ({
  purchasedChallenges: many(purchasedChallenges),
}));

// Purchased challenges table
export const purchasedChallenges = pgTable("purchased_challenges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  challengeProductId: integer("challenge_product_id").notNull().references(() => challengeProducts.id),
  status: challengeStatusEnum("status").default("pending").notNull(),
  tradingPlatformLogin: text("trading_platform_login"),
  tradingPlatformPassword: text("trading_platform_password"),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }),
  currentDrawdown: decimal("current_drawdown", { precision: 5, scale: 2 }),
  currentProfit: decimal("current_profit", { precision: 5, scale: 2 }),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  payoutEligibleDate: timestamp("payout_eligible_date"),
  lastPayoutDate: timestamp("last_payout_date"),
});

// Purchased challenges relations
export const purchasedChallengesRelations = relations(purchasedChallenges, ({ one }) => ({
  user: one(users, {
    fields: [purchasedChallenges.userId],
    references: [users.id],
  }),
  challengeProduct: one(challengeProducts, {
    fields: [purchasedChallenges.challengeProductId],
    references: [challengeProducts.id],
  }),
}));

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Affiliate applications table
export const affiliateApplications = pgTable("affiliate_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  email: text("email").notNull(),
  name: text("name").notNull(),
  website: text("website"),
  socialMediaLinks: text("social_media_links"),
  marketingPlan: text("marketing_plan"),
  isApproved: boolean("is_approved").default(false),
  affiliateCode: text("affiliate_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Trade House trader identities
export const tradeHouseTraders = pgTable("trade_house_traders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  handle: text("handle").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  logoUrl: text("logo_url"),
  bio: text("bio"),
  defaultDivision: text("default_division").default("trading").notNull(),
  defaultPlatform: text("default_platform").default("other").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Hybrid-issued demo/challenge/funded accounts assigned to Trade House traders.
// Platform passwords are intentionally not stored here. Support can record the
// login/account ID and delivery state while the platform remains the credential authority.
export const tradeHouseAccounts = pgTable("trade_house_accounts", {
  id: serial("id").primaryKey(),
  traderId: integer("trader_id").notNull().references(() => tradeHouseTraders.id),
  platform: text("platform").default("other").notNull(),
  accountKind: text("account_kind").default("demo").notNull(),
  accountSize: integer("account_size"),
  platformLogin: text("platform_login"),
  dashboardUrl: text("dashboard_url"),
  supportStatus: text("support_status").default("requested").notNull(),
  supportReference: text("support_reference"),
  credentialsDelivered: boolean("credentials_delivered").default(false).notNull(),
  issuedAt: timestamp("issued_at"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Trade House seasons
export const tradeHouseSeasons = pgTable("trade_house_seasons", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  format: text("format").default("league").notNull(),
  status: text("status").default("forming").notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  ruleConfig: text("rule_config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Every official or featured battle
export const tradeHouseBattles = pgTable("trade_house_battles", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id").references(() => tradeHouseSeasons.id),
  roomId: text("room_id").notNull().unique(),
  name: text("name").notNull(),
  format: text("format").notNull(),
  mode: text("mode").notNull(),
  accountSize: integer("account_size"),
  sponsorName: text("sponsor_name"),
  sponsorUrl: text("sponsor_url"),
  promoText: text("promo_text"),
  musicUrl: text("music_url"),
  ruleConfig: text("rule_config"),
  status: text("status").default("scheduled").notNull(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Persistent battle result / history row
export const tradeHouseEntries = pgTable("trade_house_entries", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").notNull().references(() => tradeHouseBattles.id),
  traderId: integer("trader_id").notNull().references(() => tradeHouseTraders.id),
  accountId: integer("account_id").references(() => tradeHouseAccounts.id),
  dashboardUrl: text("dashboard_url"),
  inviteTokenHash: text("invite_token_hash"),
  inviteLastFour: text("invite_last_four"),
  inviteExpiresAt: timestamp("invite_expires_at"),
  inviteRevokedAt: timestamp("invite_revoked_at"),
  profileCompletedAt: timestamp("profile_completed_at"),
  side: text("side"),
  slot: integer("slot"),
  startingBalance: decimal("starting_balance", { precision: 14, scale: 2 }),
  endingBalance: decimal("ending_balance", { precision: 14, scale: 2 }),
  pnl: decimal("pnl", { precision: 14, scale: 2 }),
  returnPct: decimal("return_pct", { precision: 8, scale: 4 }),
  maxDrawdownPct: decimal("max_drawdown_pct", { precision: 8, scale: 4 }),
  placement: integer("placement"),
  seasonPoints: integer("season_points").default(0).notNull(),
  result: text("result").default("active").notNull(),
  verified: boolean("verified").default(false).notNull(),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
});

export const insertChallengeProductSchema = createInsertSchema(challengeProducts).pick({
  accountSize: true,
  assetClass: true,
  challengeType: true,
  price: true,
  profitTarget: true,
  maxDrawdown: true,
  isBestValue: true,
  isActive: true,
  label: true,
});

export const insertPurchasedChallengeSchema = createInsertSchema(purchasedChallenges).pick({
  userId: true,
  challengeProductId: true,
  status: true,
  tradingPlatformLogin: true,
  tradingPlatformPassword: true,
  currentBalance: true,
  currentDrawdown: true,
  currentProfit: true,
  startDate: true,
  endDate: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  message: true,
});

export const insertTradeHouseTraderSchema = createInsertSchema(tradeHouseTraders).pick({
  userId: true,
  handle: true,
  displayName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  logoUrl: true,
  bio: true,
  defaultDivision: true,
  defaultPlatform: true,
  isActive: true,
});

export const insertTradeHouseAccountSchema = createInsertSchema(tradeHouseAccounts).pick({
  traderId: true,
  platform: true,
  accountKind: true,
  accountSize: true,
  platformLogin: true,
  dashboardUrl: true,
  supportStatus: true,
  supportReference: true,
  credentialsDelivered: true,
  issuedAt: true,
  verifiedAt: true,
});

export const insertTradeHouseSeasonSchema = createInsertSchema(tradeHouseSeasons).pick({
  slug: true,
  name: true,
  format: true,
  status: true,
  startsAt: true,
  endsAt: true,
  ruleConfig: true,
});

export const insertTradeHouseBattleSchema = createInsertSchema(tradeHouseBattles).pick({
  seasonId: true,
  roomId: true,
  name: true,
  format: true,
  mode: true,
  accountSize: true,
  sponsorName: true,
  sponsorUrl: true,
  promoText: true,
  musicUrl: true,
  ruleConfig: true,
  status: true,
  startedAt: true,
  endedAt: true,
});

export const insertTradeHouseEntrySchema = createInsertSchema(tradeHouseEntries).pick({
  battleId: true,
  traderId: true,
  accountId: true,
  dashboardUrl: true,
  inviteTokenHash: true,
  inviteLastFour: true,
  inviteExpiresAt: true,
  inviteRevokedAt: true,
  profileCompletedAt: true,
  side: true,
  slot: true,
  startingBalance: true,
  endingBalance: true,
  pnl: true,
  returnPct: true,
  maxDrawdownPct: true,
  placement: true,
  seasonPoints: true,
  result: true,
  verified: true,
  startedAt: true,
  finishedAt: true,
});

export const insertAffiliateApplicationSchema = createInsertSchema(affiliateApplications).pick({
  userId: true,
  email: true,
  name: true,
  website: true,
  socialMediaLinks: true,
  marketingPlan: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChallengeProduct = z.infer<typeof insertChallengeProductSchema>;
export type ChallengeProduct = typeof challengeProducts.$inferSelect;

export type InsertPurchasedChallenge = z.infer<typeof insertPurchasedChallengeSchema>;
export type PurchasedChallenge = typeof purchasedChallenges.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type InsertAffiliateApplication = z.infer<typeof insertAffiliateApplicationSchema>;
export type AffiliateApplication = typeof affiliateApplications.$inferSelect;

export type InsertTradeHouseTrader = z.infer<typeof insertTradeHouseTraderSchema>;
export type TradeHouseTrader = typeof tradeHouseTraders.$inferSelect;
export type InsertTradeHouseAccount = z.infer<typeof insertTradeHouseAccountSchema>;
export type TradeHouseAccount = typeof tradeHouseAccounts.$inferSelect;
export type InsertTradeHouseSeason = z.infer<typeof insertTradeHouseSeasonSchema>;
export type TradeHouseSeason = typeof tradeHouseSeasons.$inferSelect;
export type InsertTradeHouseBattle = z.infer<typeof insertTradeHouseBattleSchema>;
export type TradeHouseBattle = typeof tradeHouseBattles.$inferSelect;
export type InsertTradeHouseEntry = z.infer<typeof insertTradeHouseEntrySchema>;
export type TradeHouseEntry = typeof tradeHouseEntries.$inferSelect;
