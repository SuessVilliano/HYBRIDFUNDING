import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import crypto from "crypto";
import { 
  insertUserSchema, 
  insertChallengeProductSchema, 
  insertPurchasedChallengeSchema,
  insertContactMessageSchema,
  insertAffiliateApplicationSchema
} from "@shared/schema";
import { z } from "zod";

// Helper for validating request body
function validateRequestBody<T extends z.ZodType>(schema: T, body: any): z.infer<T> | null {
  try {
    return schema.parse(body);
  } catch (error) {
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = validateRequestBody(insertUserSchema, req.body);
      if (!userData) {
        return res.status(400).json({ error: "Invalid user data" });
      }

      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already taken" });
      }

      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(409).json({ error: "Email already registered" });
        }
      }

      const newUser = await storage.createUser(userData);
      // Don't return the password in the response
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Challenge product routes
  app.get("/api/challenges", async (req: Request, res: Response) => {
    try {
      const assetClass = req.query.assetClass as string;
      let challenges;
      
      if (assetClass) {
        challenges = await storage.getChallengeProductsByAssetClass(assetClass);
      } else {
        challenges = await storage.getAllChallengeProducts();
      }
      
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/challenges/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const challenge = await storage.getChallengeProduct(id);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }

      res.json(challenge);
    } catch (error) {
      console.error("Error fetching challenge:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/challenges", async (req: Request, res: Response) => {
    try {
      const challengeData = validateRequestBody(insertChallengeProductSchema, req.body);
      if (!challengeData) {
        return res.status(400).json({ error: "Invalid challenge data" });
      }

      const newChallenge = await storage.createChallengeProduct(challengeData);
      res.status(201).json(newChallenge);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Purchased challenge routes
  app.get("/api/user/:userId/challenges", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const challenges = await storage.getPurchasedChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/user/challenges", async (req: Request, res: Response) => {
    try {
      const purchaseData = validateRequestBody(insertPurchasedChallengeSchema, req.body);
      if (!purchaseData) {
        return res.status(400).json({ error: "Invalid purchase data" });
      }

      const user = await storage.getUser(purchaseData.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const challenge = await storage.getChallengeProduct(purchaseData.challengeProductId);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge product not found" });
      }

      const newPurchase = await storage.createPurchasedChallenge(purchaseData);
      res.status(201).json(newPurchase);
    } catch (error) {
      console.error("Error creating purchase:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.patch("/api/user/challenges/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedChallenge = await storage.updatePurchasedChallengeStatus(id, status);
      if (!updatedChallenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }

      res.json(updatedChallenge);
    } catch (error) {
      console.error("Error updating challenge status:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Contact form route
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const messageData = validateRequestBody(insertContactMessageSchema, req.body);
      if (!messageData) {
        return res.status(400).json({ error: "Invalid message data" });
      }

      const newMessage = await storage.createContactMessage(messageData);
      res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Affiliate application route
  app.post("/api/affiliate/apply", async (req: Request, res: Response) => {
    try {
      const applicationData = validateRequestBody(insertAffiliateApplicationSchema, req.body);
      if (!applicationData) {
        return res.status(400).json({ error: "Invalid application data" });
      }

      // Check if user already has an application
      if (applicationData.userId) {
        const existingApplication = await storage.getAffiliateApplication(applicationData.userId);
        if (existingApplication) {
          return res.status(409).json({ error: "You have already submitted an application" });
        }
      }

      const newApplication = await storage.createAffiliateApplication(applicationData);
      res.status(201).json({ 
        success: true, 
        message: "Application submitted successfully",
        applicationId: newApplication.id
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // ─── Trader Battles: Stream Video token generation ───────────────────────────
  app.post("/api/battle-token", async (req: Request, res: Response) => {
    try {
      const { userId, userName, roomId } = req.body;
      if (!userId || !userName || !roomId) {
        return res.status(400).json({ error: "userId, userName, and roomId are required" });
      }

      const apiKey = process.env.STREAM_KEY;
      const apiSecret = process.env.STREAM_SECRET;
      if (!apiKey || !apiSecret) {
        return res.status(500).json({ error: "Stream credentials not configured" });
      }

      // Generate a Stream Video user token (HS256 JWT)
      const now = Math.floor(Date.now() / 1000);
      const exp = now + 60 * 60 * 6; // 6-hour token

      const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
      const payload = Buffer.from(
        JSON.stringify({ iss: apiKey, sub: `user/${userId}`, iat: now, exp, user_id: userId })
      ).toString("base64url");
      const signature = crypto
        .createHmac("sha256", apiSecret)
        .update(`${header}.${payload}`)
        .digest("base64url");
      const token = `${header}.${payload}.${signature}`;

      res.json({ token, apiKey, userId, userName, roomId });
    } catch (error) {
      console.error("Error generating battle token:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
