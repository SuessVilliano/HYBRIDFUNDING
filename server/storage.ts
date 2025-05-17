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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Challenge product methods
  async getAllChallengeProducts(): Promise<ChallengeProduct[]> {
    return await db.select().from(challengeProducts).where(eq(challengeProducts.isActive, true));
  }

  async getChallengeProductsByAssetClass(assetClass: string): Promise<ChallengeProduct[]> {
    return await db
      .select()
      .from(challengeProducts)
      .where(eq(challengeProducts.assetClass, assetClass as any))
      .where(eq(challengeProducts.isActive, true));
  }

  async getChallengeProduct(id: number): Promise<ChallengeProduct | undefined> {
    const [product] = await db.select().from(challengeProducts).where(eq(challengeProducts.id, id));
    return product;
  }

  async createChallengeProduct(product: InsertChallengeProduct): Promise<ChallengeProduct> {
    const [newProduct] = await db.insert(challengeProducts).values(product).returning();
    return newProduct;
  }

  // Purchased challenge methods
  async getPurchasedChallenges(userId: number): Promise<PurchasedChallenge[]> {
    return await db.select().from(purchasedChallenges).where(eq(purchasedChallenges.userId, userId));
  }

  async getPurchasedChallenge(id: number): Promise<PurchasedChallenge | undefined> {
    const [challenge] = await db.select().from(purchasedChallenges).where(eq(purchasedChallenges.id, id));
    return challenge;
  }

  async createPurchasedChallenge(challenge: InsertPurchasedChallenge): Promise<PurchasedChallenge> {
    const [newChallenge] = await db.insert(purchasedChallenges).values(challenge).returning();
    return newChallenge;
  }

  async updatePurchasedChallengeStatus(id: number, status: string): Promise<PurchasedChallenge | undefined> {
    const [updated] = await db
      .update(purchasedChallenges)
      .set({ status: status as any })
      .where(eq(purchasedChallenges.id, id))
      .returning();
    return updated;
  }

  // Contact message methods
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  // Affiliate application methods
  async createAffiliateApplication(application: InsertAffiliateApplication): Promise<AffiliateApplication> {
    const [newApplication] = await db.insert(affiliateApplications).values(application).returning();
    return newApplication;
  }

  async getAffiliateApplication(userId: number): Promise<AffiliateApplication | undefined> {
    const [application] = await db
      .select()
      .from(affiliateApplications)
      .where(eq(affiliateApplications.userId, userId));
    return application;
  }
}

export const storage = new DatabaseStorage();
