---
title: Single Session Equities — Rule Specifics
category: rules
tags: [sse, equities, intraday, minimum-hold-time, consistency, profit-cap]
applies_to: [single-session-equities]
last_updated: 2026-05-11
---

## What it is

Single Session Equities has several rules that don't exist on Forex/CFD programs. This page consolidates them in one place.

## 15:55 ET cutoff

- Permitted trading session: **09:30 ET – 15:55 ET**
- **All positions must be closed by 15:55 ET.** Pre-Market and Extended Hours are not permitted.
- The platform attempts to auto-close at 15:55 ET, but the responsibility is the trader's.
- A position open past 15:55 ET is a **hard breach**.

See [SSE 15:55 Cutoff](../05-breaches/sse-15-55-cutoff.md).

## Minimum hold time

- Every trade must be held for **at least 1 minute**.
- Trades held under 1 minute are violations. **All profits from a violating trade are forfeited.**

## Daily Profit Cap (Evaluation phase only)

- 2.5% of the day's starting equity.
- Hitting the cap is **not a hard breach** — it's a **daily pause**. Open trades are closed, open orders are cancelled, and the account is paused until the next trading day (after 17:00 ET).
- See [Single Session Equities](../02-programs/single-session-equities.md) for example math.

## Consistency Rule (Funded phase only)

- **No more than 25% of total profits may be generated on a single trading day** to qualify for a payout.
- Optional add-ons are available at checkout to allow for a higher consistency limit. See [Consistency Rule Add-on](../08-add-ons/consistency-rule-add-on.md).

## Minimum profitable trading days

- To progress from Evaluation to Funded, **and** to be eligible for a payout in the Funded phase, you need **at least 0.5% profit per day across three separate trading days**, in addition to meeting all other rules.

## Lock Upon Payout (default ON, add-on to disable)

- After a payout, the Max Drawdown **locks permanently at the starting balance**.
- Optional add-on at checkout: **+25% of plan price** to disable Lock Upon Payout.
- See [Lock Upon Payout (SSE)](../06-funding-and-payouts/lock-upon-payout-sse.md).

## Payout cadence

- **First payout:** requestable after **14 days** in the Funded phase
- **Subsequent payouts:** every 14 days, provided rules are met
- **Min withdrawal:** $100

## Profit split

- **80% trader / 20% firm**

## Common questions

**Q:** If I exceed the Daily Profit Cap in Evaluation, am I breached?
**A:** No — it's a daily pause, not a hard breach. The account re-enables the next trading day with a new cap based on that day's starting equity.

**Q:** What counts as "trading days" for the minimum profitable days?
**A:** Three separate calendar trading days where you generated at least 0.5% profit. They don't have to be consecutive.

**Q:** Can I trade Pre-Market or Extended Hours?
**A:** No. Only the 09:30 ET – 15:55 ET window is permitted.
