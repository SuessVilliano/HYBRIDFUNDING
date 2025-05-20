# Hybrid Funding Rule Breach Guidelines

This document provides comprehensive information about rule breaches at Hybrid Funding, their classifications, and the specific consequences for each type of rule violation.

## Types of Rule Breaches

At Hybrid Funding, rule violations are categorized into two main types:

### 1. Soft Breaches

Soft breaches are rule violations that result in position closure but allow trading to continue. These are considered less severe and do not result in account termination.

### 2. Hard Breaches

Hard breaches are serious rule violations that result in immediate account termination. These are considered fundamental violations of the trading agreement and risk management parameters.

---

## Detailed Breach Scenarios

### Weekend Position Holding (Soft Breach)

**Rule**: All positions must be closed by 3:45 PM EST on Friday for Forex and certain other instruments (except crypto, which allows weekend trading).

**When Breach Occurs**:
- Any positions still open at 3:45 PM EST on Friday
- Applies to Forex and non-crypto instruments
- Does not apply if trader has purchased the Weekend Hold add-on (10% additional cost)

**Consequences**:
1. All open positions will be automatically closed at market prices
2. Any pending orders will be cancelled
3. The trader will receive a notification of the soft breach
4. The account remains active and trading can resume when markets reopen
5. Any profits or losses from the closed positions are recorded on the account
6. No penalty or strike is assessed against the trader
7. Multiple occurrences do not escalate to a hard breach

**Example**:
A trader has open EUR/USD and GBP/JPY positions at 3:40 PM EST on Friday and does not close them. At 3:45 PM EST, our system automatically closes these positions at the current market prices. The trader can continue trading when markets reopen the following week with no other penalties.

---

### Maximum Drawdown Breach (Hard Breach)

**Rule**: Account equity must not fall below the maximum drawdown threshold for the specific program.

**Maximum Drawdown Limits**:
- One-Step Program: 6% (Forex), 6% (Crypto)
- Two-Step Program: 8% (Forex), 9% (Crypto)
- Three-Step Program: 5% (all asset classes)
- Instant Funding: 8% (trailing)
- Futures Program: 5% (trailing based on EOD balance)

**When Breach Occurs**:
- Account equity drops below the maximum drawdown threshold
- Can occur during active trading or due to overnight positions
- For static drawdown: Breach occurs when equity falls below X% of starting balance
- For trailing drawdown: Breach occurs when equity falls below X% of highest recorded balance

**Consequences**:
1. Immediate account termination
2. All positions are automatically closed at market prices
3. Trading capabilities are immediately revoked
4. Account access is limited to read-only for review purposes
5. For evaluation accounts: Challenge is failed, and a new challenge must be purchased
6. For funded accounts:
   - Account is terminated
   - Trader still receives their share of any net positive gains generated before breach
   - Profit split applies to the final account balance minus initial balance
   - Payout is processed within the standard payment cycle
7. No opportunity to appeal a maximum drawdown breach

**Example**:
A trader has a $100,000 funded account with a 6% maximum drawdown limit ($94,000). The account equity drops to $93,850 during a trading session due to market volatility. This triggers immediate account termination. If the account had previously generated $5,000 in profits, the trader would still receive their share of those profits (e.g., 80% of $5,000 = $4,000) despite the termination.

---

### 30-Day Inactivity (Hard Breach)

**Rule**: Traders must place at least one trade every 30 calendar days.

**When Breach Occurs**:
- No trading activity for 30 consecutive calendar days
- "Trading activity" is defined as opening or closing a position
- Modifying existing positions or placing pending orders that don't execute does not reset the inactivity counter

**Consequences**:
1. Automatic account termination on day 31 of inactivity
2. Warning notifications are sent at 15 days and 25 days of inactivity
3. Account access is restricted to read-only after termination
4. For evaluation accounts: Challenge is failed, and a new challenge must be purchased
5. For funded accounts:
   - Account is terminated
   - Trader still receives their share of any net positive gains generated
   - Final profit split is calculated based on account balance at termination
   - Payout is processed within the standard payment cycle
6. No opportunity to reactivate an account terminated due to inactivity

**Example**:
A trader with a funded account last placed a trade on January 1st. The trader receives an inactivity warning on January 16th (15 days) and another on January 26th (25 days). With no trading activity by January 31st, the account is automatically terminated. If the account had $7,000 in profits at termination, the trader would receive their profit share (e.g., 80% of $7,000 = $5,600) within the standard payment cycle.

---

### Daily Loss Limit Breach (Hard Breach)

**Rule**: Account equity must not fall below the daily loss limit threshold.

**Daily Loss Limits**:
- Two-Step Program: 4% of previous day's balance
- Instant Funding: 5% of previous day's balance
- One-Step & Three-Step Programs: No specific daily loss limit (only max drawdown applies)
- Crypto Programs: 3% daily cap limit on both gains and losses

**When Breach Occurs**:
- Account equity drops below the daily loss limit threshold during a single trading day
- Daily loss is calculated from the previous day's end-of-day balance (5 PM EST)
- For Crypto's daily cap limit: Positions are closed when the 3% movement limit is reached, and account is locked until the next trading day

**Consequences**:
1. Immediate account termination (except for Crypto 3% cap, which is a temporary lock)
2. All positions are automatically closed at market prices
3. Trading capabilities are immediately revoked
4. Account access is limited to read-only for review purposes
5. For evaluation accounts: Challenge is failed, and a new challenge must be purchased
6. For funded accounts:
   - Account is terminated
   - Trader still receives their share of any net positive gains generated before breach
   - Profit split applies to the final account balance minus initial balance
   - Payout is processed within the standard payment cycle

**Example**:
A trader has a $100,000 Two-Step funded account with a 4% daily loss limit. The previous day's closing balance was $102,000, making the daily loss limit $97,920 (4% below $102,000). During trading, the account equity drops to $97,800. This triggers immediate account termination. If the account had previously generated $2,000 in profits (from the initial $100,000), the trader would receive their profit share of those gains.

---

## Additional Breach Scenarios

### Futures Consistency Requirement Violation (Not a Breach)

**Rule**: The best trading day's profit cannot exceed 25% of the total profit.

**When Situation Occurs**:
- Best trading day's profit exceeds 25% of total profit
- Calculated as: (Best Day Profit ÷ Total Profit) × 100

**Consequences**:
1. Not considered a breach, but prevents phase completion
2. Trader must continue trading to increase total profit
3. Cannot request payout or advance to next phase until consistency requirement is met
4. Account remains active with no penalties

**Example**:
A trader in Phase 1 of the Futures program needs to achieve $9,000 profit with a 25% consistency requirement. They make $3,000 profit in a single day, which is 33.3% of their current total profit ($9,000). Despite reaching the profit target, they cannot complete the phase until they generate more profit to bring the ratio down to 25% or below. They would need to reach at least $12,000 total profit for the $3,000 day to represent 25% or less.

---

### EA/Algorithm Usage Violations (Hard Breach)

**Rule**: Algorithmic trading is allowed with restrictions, but certain practices are prohibited.

**When Breach Occurs**:
- Using algorithms for arbitrage between liquidity providers
- Implementing latency-based strategies
- Using EAs for manipulative purposes
- Running identical strategies across multiple accounts
- Employing high-frequency trading beyond platform capabilities

**Consequences**:
1. Immediate account termination
2. Potential forfeit of all profits if manipulation is detected
3. Permanent ban from Hybrid Funding programs
4. Multiple accounts may be terminated if rule violation affects them

**Example**:
A trader is using an EA that places orders based on latency advantages in market data feed, gaining an unfair advantage. Upon detection, all associated accounts are terminated, and the trader is banned from future participation.

---

## Breach Recovery Options

### Evaluation Account Breaches

For any hard breach during the evaluation phase:
1. No refunds are provided for the purchased challenge
2. Trader must purchase a new challenge to restart the evaluation process
3. Previous performance and progress are not transferable to the new challenge
4. No appeals process is available for evaluation account breaches

### Funded Account Breaches

For hard breaches on funded accounts:
1. Account is permanently terminated
2. Trader receives final payout based on profit share agreement (if account had net gains)
3. To continue trading with Hybrid Funding, a new challenge must be purchased
4. Previous account history does not influence the new challenge requirements
5. Limited appeals process available only for technical malfunctions with supporting evidence

### Technical Malfunction Exceptions

In rare cases, account termination due to platform technical malfunctions may be reviewed:
1. Trader must provide clear evidence of the technical issue
2. Request must be submitted within 24 hours of the breach
3. Evidence must conclusively show the breach was caused by platform malfunction, not trader actions
4. If approved, a replacement account may be issued at the discretion of Hybrid Funding
5. Replacement accounts will match the previous account's balance and status

---

## FAQ on Rule Breaches

### What happens to my profits if my funded account has a hard breach?

If your funded account is terminated due to a hard breach but had generated profits prior to the breach, you will still receive your share of those profits according to your profit-sharing agreement (typically 80-90%). The profit calculation is based on the final account balance at termination minus the initial account balance.

### Can I appeal a rule breach or account termination?

Appeals are generally not accepted for standard rule breaches as these are monitored and enforced by automated systems. The only exception is for proven technical malfunctions of the trading platform that directly caused the breach. Such appeals require substantial evidence and must be submitted within 24 hours of the breach.

### Do rule breaches on one account affect my other accounts?

In most cases, rule breaches are account-specific and do not affect other accounts you may have with Hybrid Funding. However, if we detect coordinated rule violations across multiple accounts or deliberate manipulation, all associated accounts may be subject to termination.

### If my account is terminated due to inactivity, can I still withdraw profits?

Yes. If your funded account is terminated due to 30-day inactivity but had generated profits, you will still receive your share of those profits according to your profit-sharing agreement.

### How are pending orders handled during a breach?

During any breach that results in account termination, all pending orders are immediately canceled, and open positions are closed at current market prices. The final account balance is calculated after these actions.

### If the market gaps and causes my account to breach the maximum drawdown, does that still count?

Yes. Risk management is a key component of our evaluation, and traders are expected to manage their positions to avoid significant losses even in gap scenarios. Market gaps that cause breaches are still considered valid breaches, and the standard termination policy applies.

### Can I get a warning before a breach occurs?

For inactivity breaches, we send notification warnings at 15 days and 25 days of inactivity. For other types of breaches (maximum drawdown, daily loss limit), the system does not provide warnings as these are real-time risk management parameters that are clearly displayed in your account dashboard.

### What happens to my open trades during a soft breach?

During a soft breach (such as weekend position holding without the add-on), all open positions are automatically closed at current market prices, and any pending orders are canceled. The account remains active, and trading can resume when appropriate (e.g., when markets reopen).

### If I purchase the Weekend Hold add-on, can I hold all positions over the weekend?

With the Weekend Hold add-on, you can hold Forex positions over the weekend. However, this does not apply to assets that have natural market closures where trading is not possible regardless of platform rules (such as certain futures contracts that only trade during specific exchange hours).