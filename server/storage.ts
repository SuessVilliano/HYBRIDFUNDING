import {
  users,
  type User,
  type InsertUser,
  challengeProducts,
  type ChallengeProduct,
  type InsertChallengeProduct,
  purchasedChallenges,
  type PurchasedChallenge,
  type InsertPurchasedChallenge,
  contactMessages,
  type ContactMessage,
  type InsertContactMessage,
  affiliateApplications,
  type AffiliateApplication,
  type InsertAffiliateApplication
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Challenge product methods
  getAllChallengeProducts(): Promise<ChallengeProduct[]>;
  getChallengeProductsByAssetClass(assetClass: string): Promise<ChallengeProduct[]>;
  getChallengeProduct(id: number): Promise<ChallengeProduct | undefined>;
  createChallengeProduct(product: InsertChallengeProduct): Promise<ChallengeProduct>;

  // Purchased challenge methods
  getPurchasedChallenges(userId: number): Promise<PurchasedChallenge[]>;
  getPurchasedChallenge(id: number): Promise<PurchasedChallenge | undefined>;
  createPurchasedChallenge(challenge: InsertPurchasedChallenge): Promise<PurchasedChallenge>;
  updatePurchasedChallengeStatus(id: number, status: string): Promise<PurchasedChallenge | undefined>;

  // Contact message methods
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Affiliate application methods
  createAffiliateApplication(application: InsertAffiliateApplication): Promise<AffiliateApplication>;
  getAffiliateApplication(userId: number): Promise<AffiliateApplication | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db!.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db!.insert(users).values(insertUser).returning();
    return user;
  }

  // Challenge product methods
  async getAllChallengeProducts(): Promise<ChallengeProduct[]> {
    return await db!.select().from(challengeProducts);
  }

  async getChallengeProductsByAssetClass(assetClass: string): Promise<ChallengeProduct[]> {
    return await db!
      .select()
      .from(challengeProducts)
      .where(eq(challengeProducts.assetClass, assetClass as any));
  }

  async getChallengeProduct(id: number): Promise<ChallengeProduct | undefined> {
    const [product] = await db!.select().from(challengeProducts).where(eq(challengeProducts.id, id));
    return product;
  }

  async createChallengeProduct(product: InsertChallengeProduct): Promise<ChallengeProduct> {
    const [newProduct] = await db!.insert(challengeProducts).values(product).returning();
    return newProduct;
  }

  // Purchased challenge methods
  async getPurchasedChallenges(userId: number): Promise<PurchasedChallenge[]> {
    return await db!.select().from(purchasedChallenges).where(eq(purchasedChallenges.userId, userId));
  }

  async getPurchasedChallenge(id: number): Promise<PurchasedChallenge | undefined> {
    const [challenge] = await db!.select().from(purchasedChallenges).where(eq(purchasedChallenges.id, id));
    return challenge;
  }

  async createPurchasedChallenge(challenge: InsertPurchasedChallenge): Promise<PurchasedChallenge> {
    const [newChallenge] = await db!.insert(purchasedChallenges).values(challenge).returning();
    return newChallenge;
  }

  async updatePurchasedChallengeStatus(id: number, status: string): Promise<PurchasedChallenge | undefined> {
    const [updated] = await db!
      .update(purchasedChallenges)
      .set({ status: status as any })
      .where(eq(purchasedChallenges.id, id))
      .returning();
    return updated;
  }

  // Contact message methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db!.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  // Affiliate application methods
  async createAffiliateApplication(application: InsertAffiliateApplication): Promise<AffiliateApplication> {
    const [newApplication] = await db!.insert(affiliateApplications).values(application).returning();
    return newApplication;
  }

  async getAffiliateApplication(userId: number): Promise<AffiliateApplication | undefined> {
    const [application] = await db!
      .select()
      .from(affiliateApplications)
      .where(eq(affiliateApplications.userId, userId));
    return application;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private challengeProducts: Map<number, ChallengeProduct>;
  private purchasedChallenges: Map<number, PurchasedChallenge>;
  private contactMessages: Map<number, ContactMessage>;
  private affiliateApplications: Map<number, AffiliateApplication>;

  private userIdCounter: number;
  private challengeProductIdCounter: number;
  private purchasedChallengeIdCounter: number;
  private contactMessageIdCounter: number;
  private affiliateApplicationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.challengeProducts = new Map();
    this.purchasedChallenges = new Map();
    this.contactMessages = new Map();
    this.affiliateApplications = new Map();

    this.userIdCounter = 1;
    this.challengeProductIdCounter = 1;
    this.purchasedChallengeIdCounter = 1;
    this.contactMessageIdCounter = 1;
    this.affiliateApplicationIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id, createdAt: new Date(), updatedAt: new Date(), role: insertUser.role ?? "user", firstName: insertUser.firstName ?? null, lastName: insertUser.lastName ?? null };
    this.users.set(id, user);
    return user;
  }

  async getAllChallengeProducts(): Promise<ChallengeProduct[]> {
    return Array.from(this.challengeProducts.values());
  }

  async getChallengeProductsByAssetClass(assetClass: string): Promise<ChallengeProduct[]> {
    return Array.from(this.challengeProducts.values()).filter(p => p.assetClass === assetClass);
  }

  async getChallengeProduct(id: number): Promise<ChallengeProduct | undefined> {
    return this.challengeProducts.get(id);
  }

  async createChallengeProduct(product: InsertChallengeProduct): Promise<ChallengeProduct> {
    const id = this.challengeProductIdCounter++;
    const newProduct: ChallengeProduct = {
      ...product,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      profitTarget: product.profitTarget ?? null,
      label: product.label ?? null,
      isBestValue: product.isBestValue ?? false,
      isActive: product.isActive ?? true
    };
    this.challengeProducts.set(id, newProduct);
    return newProduct;
  }

  async getPurchasedChallenges(userId: number): Promise<PurchasedChallenge[]> {
    return Array.from(this.purchasedChallenges.values()).filter(p => p.userId === userId);
  }

  async getPurchasedChallenge(id: number): Promise<PurchasedChallenge | undefined> {
    return this.purchasedChallenges.get(id);
  }

  async createPurchasedChallenge(challenge: InsertPurchasedChallenge): Promise<PurchasedChallenge> {
    const id = this.purchasedChallengeIdCounter++;
    const newChallenge: PurchasedChallenge = {
      ...challenge,
      id,
      currentBalance: challenge.currentBalance ?? null,
      currentDrawdown: challenge.currentDrawdown ?? null,
      currentProfit: challenge.currentProfit ?? null,
      startDate: challenge.startDate ?? null,
      endDate: challenge.endDate ?? null,
      purchaseDate: new Date(),
      tradingPlatformLogin: challenge.tradingPlatformLogin ?? null,
      tradingPlatformPassword: challenge.tradingPlatformPassword ?? null,
      payoutEligibleDate: null,
      lastPayoutDate: null,
      status: challenge.status ?? "pending"
    };
    this.purchasedChallenges.set(id, newChallenge);
    return newChallenge;
  }

  async updatePurchasedChallengeStatus(id: number, status: string): Promise<PurchasedChallenge | undefined> {
    const challenge = this.purchasedChallenges.get(id);
    if (!challenge) return undefined;
    const updated = { ...challenge, status: status as any };
    this.purchasedChallenges.set(id, updated);
    return updated;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageIdCounter++;
    const newMessage: ContactMessage = { ...message, id, isRead: false, createdAt: new Date() };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }

  async createAffiliateApplication(application: InsertAffiliateApplication): Promise<AffiliateApplication> {
    const id = this.affiliateApplicationIdCounter++;
    const newApp: AffiliateApplication = {
      ...application,
      id,
      userId: application.userId ?? null,
      website: application.website ?? null,
      socialMediaLinks: application.socialMediaLinks ?? null,
      marketingPlan: application.marketingPlan ?? null,
      isApproved: false,
      affiliateCode: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.affiliateApplications.set(id, newApp);
    return newApp;
  }

  async getAffiliateApplication(userId: number): Promise<AffiliateApplication | undefined> {
    return Array.from(this.affiliateApplications.values()).find(a => a.userId === userId);
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
