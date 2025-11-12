# Hybrid Funding - Proprietary Trading Platform

## Overview

Hybrid Funding is a next-generation proprietary trading firm platform that provides traders with access to capital through evaluation challenges across Forex, Crypto, and Futures markets. The platform features a revolutionary competitive trading arena called "TradeHouse Battles" where traders compete in real-time tournaments for funded accounts and rewards.

**Core Purpose:** Democratize access to trading capital by funding talented traders who demonstrate skill and discipline through structured evaluation programs.

**Key Differentiators:**
- Multiple challenge types (One-Step, Two-Step, Three-Step, Four-Phase, Instant Funding, Instant Funding Lite)
- Multi-asset class support (Forex, Crypto, Futures)
- TradeHouse Battles competitive gaming arena
- Flexible profit splits (up to 90%)
- Comprehensive affiliate program with tiered commissions

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18+ with TypeScript
- **Routing:** Wouter (lightweight React router)
- **Styling:** Tailwind CSS with custom cyberpunk theme
- **UI Components:** Radix UI primitives with shadcn/ui configuration
- **State Management:** TanStack Query (React Query) for server state
- **Forms:** React Hook Form with Zod validation
- **Animations:** Framer Motion for page transitions and UI effects

**Design System:**
- Cyberpunk-themed visual identity with neon accents
- Primary color: #8A2BE2 (Cyberpunk Purple)
- Accent color: #00FFFF (Aqua Blue)
- Dark background (#0F0F1A) with glassmorphism effects
- Custom fonts: Orbitron (headings), Inter (body)
- Responsive-first approach with mobile breakpoint at 768px

**Key Pages:**
- Home: Hero section with CTAs, features showcase, TradeHouse Battles promotion
- Challenges: Multi-tab interface for different asset classes and challenge types
- Battles: Embedded TradeHouse Battles arena at `battles.hybridfunding.co`
- About: Company information, mission, values
- Affiliate: Program details with tiered commission structure
- FAQ: Categorized accordion-style Q&A
- Contact: Form submission with A2P-compliant SMS opt-in
- Trader Portal: Dashboard access and instructions

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- ESM module system
- Custom middleware for logging and error handling
- Vite integration for development with HMR

**API Design Pattern:**
- RESTful endpoints under `/api` prefix
- Request validation using Zod schemas
- Centralized error handling with status codes
- Response format: JSON with consistent structure

**Key API Routes:**
- `POST /api/auth/register` - User registration
- `POST /api/contact` - Contact form submissions
- `POST /api/affiliate` - Affiliate applications
- Challenge product CRUD operations
- Purchased challenge tracking

### Data Storage

**Database Solution:**
- PostgreSQL via Neon serverless
- ORM: Drizzle ORM with type-safe schema
- Migration system: Drizzle Kit

**Schema Design:**
- **users:** Authentication and profile data with role-based access
- **challengeProducts:** Challenge configurations (account size, pricing, rules)
- **purchasedChallenges:** User challenge purchases and status tracking
- **contactMessages:** Contact form submissions
- **affiliateApplications:** Affiliate program applications

**Enums:**
- assetClassEnum: forex, crypto, futures
- challengeTypeEnum: one-step, two-step, three-step, instant
- challengeStatusEnum: pending, active, passed, failed, funded
- userRoleEnum: user, admin

**Relationships:**
- Users → many PurchasedChallenges
- ChallengeProducts → many PurchasedChallenges

### External Dependencies

**Third-Party Services:**

1. **Payment Processing:**
   - Stripe integration for challenge purchases
   - External checkout redirects to `hybridfundingdashboard.propaccount.com`

2. **Trading Platforms:**
   - Rithmic (futures)
   - MatchTrader (advanced order types)
   - DXTrade (web-based)
   - cTrader (scalping/algos)

3. **TradeHouse Battles:**
   - Embedded arena at `battles.hybridfunding.co`
   - Real-time tournament system
   - Rewards up to $100,000+ funded accounts

4. **Communication:**
   - Email: contact@hybridfunding.club (primary support)
   - Email: affiliate@tradehybrid.club (affiliate inquiries)
   - SMS opt-in via A2P-compliant forms (MakeForms integration)
   - Chat widget: AnyChat widget (ID: 854ec014-677b-3467-be78-23cbdb44e178)

5. **External Resources:**
   - Terms & Policies: `https://dashboardanalytix.com/client-terms-and-policies/`
   - Trader Dashboard: `https://hybridfundingdashboard.propaccount.com/`

**Database:**
- Neon Serverless PostgreSQL
- WebSocket support via `ws` package
- Connection pooling with `@neondatabase/serverless`

**Authentication & Sessions:**
- Session management: connect-pg-simple (PostgreSQL-backed sessions)
- KYC verification required for funded accounts (deferred for Instant Funding)

**Key Configuration Files:**
- `drizzle.config.ts`: Database schema and migration settings
- `vite.config.ts`: Frontend build and dev server configuration
- `tailwind.config.ts`: Theme customization and design tokens
- `components.json`: shadcn/ui component configuration

**Environment Variables Required:**
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: development/production flag