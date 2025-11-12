import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum, varchar, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const assetClassEnum = pgEnum("asset_class", ["forex", "crypto", "futures"]);
export const challengeTypeEnum = pgEnum("challenge_type", ["one-step", "two-step", "three-step", "instant", "instant-lite"]);
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
