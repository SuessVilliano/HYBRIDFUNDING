# Prediction Autopilot Architecture

## Objective

Turn Hybrid Funding's Prediction Market Radar from a discovery dashboard into an autonomous research, timing, risk, and execution engine.

The system should continuously answer five questions:

1. **What markets deserve attention?**
2. **What is the estimated fair probability?**
3. **Is the current executable price favorable?**
4. **Is this the right time to enter?**
5. **How much account risk can be allocated without violating Hybrid Funding rules?**

Human review should be optional for analysis. Live execution remains disabled until Hybrid Funding's funded-account provider exposes an authorized order endpoint that is confirmed to book trades against the funded account.

---

## State machine

Every market exists in exactly one state:

**DISCOVER → WATCH → ARMED → ENTER → MANAGE → EXIT → COOLDOWN**

A market can also move to **PASS / AVOID** at any time.

### DISCOVER
Radar sees a MOVER, VOL SPIKE, DECISION, BOOK CHECK, unusual order flow, news catalyst, or cross-market discrepancy.

### WATCH
The thesis is interesting but execution/timing is weak.

### ARMED
Fair-value gap, liquidity, spread, catalyst proximity, and source quality meet minimum thresholds. System waits for a price/order-flow trigger.

### ENTER
Execution-quality threshold passes and risk engine approves position size.

### MANAGE
Track price, order-book depth, new information, correlation, account drawdown, event-cap usage, and thesis invalidation.

### EXIT
Close because fair value has been captured, edge disappeared, invalidation fired, resolution is imminent with unfavorable execution, or account risk requires reduction.

### COOLDOWN
Prevent immediate re-entry after an exit unless materially new information changes fair value.

---

## Data layers

### 1. Polymarket Gamma
Purpose: market discovery and metadata.

Capture:
- event / market IDs
- question
- resolution source
- end date
- category
- outcomes
- volume
- liquidity
- token IDs
- negative-risk structure

### 2. Polymarket CLOB + WebSocket
Purpose: execution truth.

Capture continuously:
- best bid / ask
- spread
- full depth
- price changes
- last trades
- trade size
- bid/ask imbalance
- fillable size
- estimated slippage
- short-window velocity
- order-book replenishment / depletion

This layer should drive Entry Window decisions, not a two-minute Gamma snapshot.

### 3. Polymarket Data API / on-chain data
Purpose:
- recent trades
- holders / positions where available
- participant activity
- market-state history
- wallet / flow research where appropriate

Wallet activity is evidence of flow, not proof that a trader possesses superior information.

### 4. News / official sources
Highest information weight should go to sources directly connected to market resolution:
- official league / team reports for sports
- government releases
- official corporate releases / filings
- central-bank releases
- official election / agency sources
- designated resolution source in the contract

### 5. Trusted news
Use reputable, timestamped reporting as evidence and as a catalyst detector.

### 6. Social / Reddit
Use as:
- sentiment
- narrative velocity
- disagreement
- emerging-topic detection
- possible early catalyst discovery

Never treat social consensus as truth. Apply manipulation / bot / duplication penalties.

### 7. Cross-market feeds
For financially linked prediction markets, consume:
- Hybrid AI signals
- TickBlaze / market prices when available
- futures
- Forex
- crypto
- equities
- rates / commodities

Example: a prediction market about EUR/USD crossing a level should ingest the actual FX price, volatility, time remaining, and Hybrid AI trend/momentum state.

---

## Fair Value Engine

For a YES share:

**Edge = Estimated Fair Probability - Executable YES Price**

For a NO share:

**Edge = (1 - Estimated Fair Probability) - Executable NO Price**

Do not use displayed midpoint when calculating a trade. Use the price the order can actually fill at for the intended size.

Produce:
- Fair Probability
- Confidence interval
- Executable price
- Edge after spread
- Edge after fees
- Slippage-adjusted edge
- Source confidence
- Model disagreement

No trade if uncertainty is wider than the estimated edge.

---

## Entry Window Engine

Radar Pro V3 should output:

- **ENTER NOW**
- **WATCH**
- **WAIT**
- **LATE**
- **AVOID**

along with a 0-100 **Entry Quality** score.

### Inputs

#### Pricing
- executable price
- fair probability gap
- bid/ask spread
- expected slippage for target size

#### Liquidity
- depth within 1¢ / 2¢ / 5¢
- book imbalance
- replenishment
- trade size relative to depth

#### Flow
- 30s / 2m / 5m / 15m price velocity
- volume acceleration
- large trades
- signed trade flow
- whether a move is being accepted or rejected

#### Timing
- time until next catalyst
- time until event start
- time until resolution
- known information-release schedule

#### Information
- source freshness
- official confirmation
- news-source agreement
- social velocity
- conflicting information

#### Market structure
- MOVER
- VOL SPIKE
- DECISION
- BOOK CHECK
- correlated-market confirmation

### Entry-window principle

The ideal entry is **not** "as late as possible."

It is the moment where:

**information advantage remains > execution cost + uncertainty + timing risk**

Waiting creates more information but may destroy price edge. Entering early gets a better possible price but increases information uncertainty and capital lock-up.

The engine's job is to estimate that trade-off continuously.

---

## Existing Hybrid Radar signals

### MOVER
Current trigger:
- >= 10 probability-point move in 24h
- >= $25K 24h volume
- price between 3% and 97%

Question:
**Did genuine information cause the move, or did a thin market overshoot?**

Autopilot enhancement:
- compare move against volume acceleration
- inspect spread/depth before and after move
- classify continuation vs exhaustion
- compare correlated markets/news timestamps

### VOL SPIKE
Current trigger:
- >= $100K 24h volume
- 24h volume >= 8x displayed liquidity
- < 5 probability-point 24h move
- price between 5% and 95%

Question:
**Why is so much money changing hands without the probability moving?**

Autopilot enhancement:
- watch for imbalance breakout
- measure aggressive buy/sell flow
- detect absorption
- arm an entry only after confirmation

### DECISION
Current trigger:
- resolves within 72h
- price between 20% and 80%
- >= $10K 24h volume

Question:
**What fresh information can still move a market that is about to resolve?**

Autopilot enhancement:
- catalyst clock
- resolution-source monitor
- late-information detector
- execution deterioration penalty as resolution approaches

### BOOK CHECK
Current trigger:
- negative-risk / mutually exclusive multi-outcome book
- sum of executable bids >= 103%
- >= $25K event 24h volume

Question:
**Is the combined book arithmetically inconsistent after fees and actual fill sizes?**

Autopilot enhancement:
- walk each order book
- calculate executable combined edge by size
- fees/slippage
- atomic/leg-risk controls
- do not call an arbitrage unless every required leg is actually fillable

---

## Source weighting

Suggested starting hierarchy:

| Source class | Initial weight |
|---|---:|
| Contract resolution source / official source | 1.00 |
| Live CLOB / actual trades | 0.95 |
| Direct correlated-market price | 0.90 |
| High-quality current news | 0.80 |
| Domain-specific statistical model | 0.75 |
| Multiple independent credible reports | 0.70 |
| Reddit / social aggregate | 0.35 |
| Single social account / comment | 0.10 |

These weights must be learned from results rather than treated as permanent truth.

---

## Autonomous decision object

Each candidate should produce a machine-readable record like:

```json
{
  "market": "Will X happen?",
  "side": "YES",
  "state": "ARMED",
  "fair_probability": 0.61,
  "fair_range": [0.56, 0.66],
  "best_ask": 0.48,
  "expected_fill": 0.49,
  "net_edge": 0.10,
  "entry_quality": 84,
  "entry_window": "ENTER NOW",
  "max_entry_price": 0.51,
  "risk_dollars": 12.50,
  "event_profit_cap_remaining": 25.00,
  "portfolio_risk_after": 47.50,
  "catalyst": "official release in 2h",
  "invalidation": "official source contradicts thesis",
  "target_exit": 0.58,
  "max_hold": "until catalyst + 10m",
  "sources": [],
  "reason": "fair-value gap remains large after spread/slippage; deep book; catalyst near; correlated market confirms"
}
```

The execution system should be able to consume this object without an LLM composing an order manually.

---

## Risk Engine for $5K Hybrid Prediction account

Current published parameters:
- starting balance: $5,000
- evaluation target: 10% / $500
- daily drawdown: 3% / $150 at starting balance
- max trailing drawdown: 6% / $300 at starting balance
- max profit contribution per event: 0.5% / $25
- no leverage
- 1% opening commission
- opening price range: $0.20-$0.80

The system must know:
- current balance / equity
- current daily drawdown threshold
- current trailing threshold
- open worst-case exposure
- correlation clusters
- profit already attributed to each event
- remaining event-cap room

Suggested initial autopilot guardrails while collecting data:
- keep hard drawdown limits separate from the strategy's own smaller risk budget
- cap correlated clusters
- reduce size as spreads widen
- never increase risk simply because confidence text from an LLM is high
- disable new entries if live account state is stale

---

## Execution adapter

There are two separate execution contexts:

### Direct Polymarket
Polymarket exposes authenticated CLOB order placement and real-time user/order WebSockets. This can technically support full automation.

### Hybrid Funding funded account
Do **not** route funded-account trades directly through a personal Polymarket account. The funded account must use the execution route recognized by the Hybrid Funding / provider account.

Required provider integration:
- account balance/equity
- open positions
- order placement
- order cancellation
- fill events
- realized P&L
- daily / trailing drawdown
- event profit-cap accounting

Until that endpoint is confirmed, Autopilot may output **trade-ready decisions** and paper-track them, but should not pretend a direct Polymarket order is a Hybrid funded-account trade.

---

## Learning loop

Every signal and every hypothetical/real execution should be logged.

Measure:
- Brier score / calibration
- realized P&L
- entry price vs later prices
- maximum favorable excursion
- maximum adverse excursion
- slippage
- maker vs taker
- entry-window state
- source combination
- market category
- time-to-resolution bucket
- signal type
- exit reason

Then answer questions such as:
- Are ENTER NOW calls actually better than WATCH?
- Which signal produces the best risk-adjusted return?
- Is Reddit useful in sports but harmful in politics?
- Does Hybrid AI improve financial prediction-market timing?
- How many hours before resolution produces the best net edge?
- Are 30-50¢ contracts better for this strategy than 60-80¢ contracts?
- When does high volume confirm a move vs mark exhaustion?

This turns "secrets" into proprietary evidence.

---

## Target architecture

```
POLYMARKET GAMMA ─┐
POLYMARKET CLOB ──┤
POLYMARKET DATA ──┤
NEWS / OFFICIAL ──┤
REDDIT / SOCIAL ──┼─> NORMALIZER / ENTITY GRAPH
HYBRID AI ────────┤          |
TICKBLAZE / FX ───┘          v
                     FAIR VALUE ENGINE
                            |
                            v
                     ENTRY WINDOW ENGINE
                            |
                    DISCOVER/WATCH/ARMED
                            |
                            v
                        RISK ENGINE
                            |
                            v
                   EXECUTION ADAPTER
                            |
                            v
                      MANAGE / EXIT
                            |
                            v
                  JOURNAL + LEARNING LOOP
```

## Product implication

The public product can show research and timing scores.

The internal/private version can become the autonomous engine.

Hybrid Picks can use the same engine editorially:
- "Radar found this market"
- "Entry Window moved from WAIT to ARMED"
- "The market repriced"
- "Here is what changed"

That creates both trading infrastructure and content from the same data pipeline.


---

## Refresh, trigger, and credit strategy

The system should be **event-driven and demand-driven**, not continuously polling expensive enrichment sources.

### Tier 0 — Cached display
When a user opens Radar:
- show the newest cached scan immediately if it is still fresh
- current client freshness window: **10 minutes**
- do not invoke an LLM merely to display cached data

### Tier 1 — User-triggered refresh
Run a market-data scan when:
- the Radar page opens and cache is stale
- the user clicks **Scan Now**
- a stale Radar tab becomes visible / focused again
- the user explicitly opens a candidate and asks for deeper analysis

The base Polymarket scan and the AI/news enrichment are separate operations.

### Tier 2 — Cheap live triggers while a user is actively watching
For a selected market/watchlist, a lightweight WebSocket or market-data listener may recompute the local entry score without invoking paid AI.

Suggested triggers:
- probability moves **3–5 points quickly**
- bid/ask spread compresses below the strategy threshold
- spread widens sharply
- executable depth changes by **2x or more**
- short-window volume accelerates **3x+ versus baseline**
- a large trade materially exceeds normal trade size
- order-book imbalance flips
- price enters or exits the user's max-entry range
- market crosses an Entry Window state boundary, e.g. WAIT → WATCH or WATCH → ENTER NOW
- time-to-resolution enters key buckets: **72h, 24h, 6h, 1h**

These triggers should recompute deterministic market-structure logic first. They should **not automatically spend AI credits**.

### Tier 3 — Enrichment triggers
Invoke news / official-source / AI research only when a deterministic trigger says new information could materially change fair value.

Examples:
- MOVER without an identified catalyst
- VOL SPIKE plus a price breakout
- official resolution-source update
- new injury/status report for sports
- scheduled macro release becomes available
- correlated Futures / Forex / Crypto price makes an abnormal move
- social narrative velocity spikes and needs verification
- Entry Window reaches ARMED but source confidence is still insufficient
- user clicks **AI Vet / Deep Research**

### Tier 4 — Weekly global deep scan
Run one scheduled global pass per week.

Recommended starting cadence:
- **Sunday early morning ET** before the main Hybrid Picks / NFL workflow

The weekly job should:
1. snapshot the active global market universe
2. calculate category baselines for volume, liquidity, spreads, depth, and volatility
3. grade resolved signals from the previous week
4. recalibrate MOVER / VOL SPIKE / DECISION / BOOK CHECK performance
5. measure Entry Window results by state
6. identify categories where thresholds should differ
7. update correlation maps
8. compile the top research candidates for the coming week
9. produce **one batch summary**, rather than one AI request per market

### Credit policy

**Free / cheap computation first. Paid intelligence last.**

Order of operations:

```
CACHE
  ↓
POLYMARKET DATA
  ↓
DETERMINISTIC SIGNALS
  ↓
ENTRY WINDOW SCORE
  ↓
IS THIS IMPORTANT ENOUGH TO RESEARCH?
  ↓ yes
OFFICIAL SOURCES + NEWS
  ↓
SOCIAL SENTIMENT
  ↓
AI SYNTHESIS
```

An LLM should not be used to answer questions that arithmetic, the order book, timestamps, or structured APIs already answer.

### Recommended data retention

Do not repeatedly purchase the same reasoning.

Store:
- market snapshot timestamp
- signal type
- price / bid / ask
- spread
- liquidity / volume
- Entry Window score
- source facts used in analysis
- fair-value estimate
- model output hash / timestamp
- final resolution

If nothing material changed since the last enrichment, reuse the prior analysis.

This turns AI usage from a polling cost into a **cacheable research event**.
