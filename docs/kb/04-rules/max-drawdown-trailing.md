---
title: Max Drawdown (Trailing)
category: rules
tags: [drawdown, breach, trailing-drawdown, high-water-mark]
applies_to: [one-step, two-step, instant-funding, single-session-equities]
last_updated: 2026-05-11
---

## What it is

The Max Trailing Drawdown is the maximum amount your account can fall from its high before the account is hard-breached. It trails on **closed balance** (not floating equity) until your account hits a specific return threshold, at which point it **locks permanently at your starting balance**.

Violating the Max Trailing Drawdown is a **hard breach**.

## How it works

1. At account open, the trailing drawdown threshold is set a specific percentage *below* your starting balance.
2. As your closed balance hits new highs, the trailing drawdown threshold moves up by the same percentage below that new high-water mark.
3. Once your closed balance reaches a return equal to the trailing-drawdown percentage, the threshold locks **at your starting balance** and no longer trails.
4. From that point on, the account is hard-breached only if balance/equity falls back to that starting-balance lock — regardless of how high the account goes.

The trailing drawdown is calculated on **closed balance**, not floating equity. Open winners do not move the high-water mark.

## Program-specific values

| Program | Trailing Drawdown |
|---|---|
| Instant Funding | **8%** trailing, locks at starting balance after 8% return. Also locks at starting balance at payout. |
| Single Session Equities | **3.0%** trailing, locks at starting balance after 3.0% return. |
| One-Step Evaluation | Varies by plan / account size — visible on your trader dashboard. |
| Two-Step Evaluation | Varies by plan / account size — visible on your trader dashboard. |

## Example — Instant Funding ($100,000 account, 8% trailing)

- Starting balance: $100,000
- Initial drawdown floor: $92,000
- Closed balance moves to $102,000 → new high-water mark → floor moves to $94,000
- Closed balance moves to $106,000 → new high-water mark → floor moves to $98,000
- Closed balance reaches $108,000 → 8% return achieved → floor **permanently locks** at $100,000

From that point on, the account would only hard-breach via the trailing drawdown rule if equity dropped to $100,000 — no matter whether the balance grew to $170,000 later. (The Daily Loss Limit still applies separately.)

## Example — Single Session Equities ($100,000 account, 3.0% trailing)

- Starting balance: $100,000
- Initial drawdown floor: $97,000
- Closed balance moves to $102,000 → new high-water mark → floor moves to $99,000
- Closed balance reaches $103,000 → 3.0% return achieved → floor **permanently locks** at $100,000

## Interaction with payouts

When you request a withdrawal (Instant Funding and Evaluation funded accounts):

- The trailing drawdown **locks at your starting balance** at payout — it does not "reset" to track the post-withdrawal balance.
- If you take a **full withdrawal of all gains**, the lock at the starting balance will simultaneously trigger the trailing-drawdown breach rule, resulting in **forfeiture of the funded account**. Always leave some buffer above the starting balance.

See [Withdrawal and Trailing Drawdown](../06-funding-and-payouts/withdrawal-and-trailing-drawdown.md).

## Common questions

**Q:** Does floating equity affect the trailing drawdown?
**A:** Floating equity does **not** move the high-water mark (which is based on closed balance), but floating equity *can* cause a breach if it falls below the current trailing drawdown threshold.

**Q:** What's a "high-water mark"?
**A:** The highest closed balance your account has reached. The trailing drawdown threshold is calculated as a fixed percentage below this high-water mark, until the account locks at starting balance.
