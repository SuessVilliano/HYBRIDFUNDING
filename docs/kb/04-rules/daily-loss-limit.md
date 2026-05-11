---
title: Daily Loss Limit
category: rules
tags: [drawdown, breach, daily-loss]
applies_to: [one-step, two-step, instant-funding, single-session-equities]
last_updated: 2026-05-11
---

## What it is

The Daily Loss Limit is the maximum amount your account can lose in a single trading day. Violating it is a **hard breach** — the account is terminated.

The mechanics differ between Forex/CFD programs (One-Step, Two-Step, Instant Funding) and Single Session Equities.

## Forex / CFD programs (One-Step, Two-Step, Instant Funding)

The Daily Loss Limit is calculated using the **previous day's end-of-day balance**, which resets at **5:00 PM EST**. The limit compounds with the account as it grows.

**Instant Funding specifically:** the Daily Loss Limit is **5%** of prior-day balance.

For One-Step and Two-Step plans, the specific Daily Loss Limit percentage depends on the plan and account size — your trader dashboard shows the exact threshold for any active plan.

**Example (Forex/CFD):** Prior day's end-of-day balance (5:00 PM EST) was $100,000. With a 5% Daily Loss Limit, the account would violate the daily loss rule if equity reached $95,000 during the day. Even if floating equity is +$5,000 on the day, the new-day (5:00 PM EST) daily-loss threshold is still based on the previous day's $100,000 closing balance — so the limit stays at $95,000.

## Single Session Equities

SSE uses an **intraday trailing** Daily Loss Limit of **2.5%**. The limit trails the **higher** of the daily balance high-water mark and the daily equity high-water mark.

**Example (SSE):** $100,000 account. Day starts with a 2.5% breach threshold of $97,500. During the day, equity reaches $102,000 and balance reaches $101,000 — the higher value, $102,000, becomes the daily high-water mark, and the new breach threshold becomes $99,450 (2.5% below $102,000). If equity falls below $99,450 during the day, the account breaches. If the day ends with both balance and equity at $101,000, the next day starts with a breach threshold of $98,475 (2.5% below $101,000).

## Common questions

**Q:** Does the Daily Loss Limit reset at 5:00 PM EST every day?
**A:** Yes for Forex/CFD programs. SSE uses an intraday trailing model that resets on each new trading day based on that day's starting balance and equity.

**Q:** If I'm up money on the day, does that raise my Daily Loss Limit?
**A:** Not for Forex/CFD programs — those use prior-day end-of-day balance, so intraday gains don't shift the threshold. For SSE, intraday equity highs *do* shift the trailing threshold up.

**Q:** What happens if I breach it?
**A:** Hard breach. The account is closed. See [Hard vs Soft Breaches](../05-breaches/hard-vs-soft-breaches.md).
