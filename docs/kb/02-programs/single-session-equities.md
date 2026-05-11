---
title: Single Session Equities Program
category: programs
tags: [sse, equities, day-trading, intraday]
applies_to: [single-session-equities]
last_updated: 2026-05-11
---

## What it is

Single Session Equities is an intraday-only program. You open and close all positions within the same trading session — no overnight or multi-day holds. The program runs on the **GooeyPro** trading platform and is built around the U.S. equities Regular Market session.

## Trading session

- **Permitted window:** 09:30 ET through **15:55 ET**
- All positions must be **fully closed by 15:55 ET**.
- Pre-Market and Extended Hours trading is **not** permitted, even though U.S. equities are technically available during those windows.

If a position is still open at 15:55 ET, the platform will attempt to close it automatically — but the trader is responsible for the close. **A position open past 15:55 ET is treated as a hard breach** under the Prohibited Practices rule.

## Products

You may trade any **S&P 100** equity products made available on the platform.

## Platform, leverage, and pricing

- **Platform:** GooeyPro only
- **Leverage:** 2:1
- **Commissions:** $0.02 per share per side, with a **$0.50 minimum commission per transaction**
- **Liquidity, pricing, and execution:** sourced directly from **Nasdaq**

## Rules at a glance

| Rule | Evaluation phase | Funded phase |
|---|---|---|
| Profit Target | 10% returns to progress | None |
| Max Drawdown | 3.0% trailing (closed balance, locks at starting balance after 3.0% return) | 3.0% trailing (same mechanics) |
| Daily Loss Limit | 2.5% intraday trailing | 2.5% intraday trailing |
| Daily Profit Cap | 2.5% (daily pause if hit — not a hard breach) | N/A |
| Min profitable days | 3 days at ≥0.5% profit each | 3 days at ≥0.5% profit each |
| Min hold time | 1 minute per trade | 1 minute per trade |
| Consistency rule | N/A | 25% (no more than 25% of total profits from a single day) |
| Profit Split | N/A | 80% trader / 20% firm |
| 15:55 ET close requirement | Yes — hard breach if open past cutoff | Yes — hard breach if open past cutoff |

## Daily Loss Limit (intraday trailing)

The Daily Loss Limit follows an intraday trailing model. It trails the **higher** of the daily balance high-water mark and the daily equity high-water mark.

**Example:** $100,000 account. Day starts with a 2.5% breach level of $97,500. During the day, equity reaches $102,000 and balance reaches $101,000 — the higher value, $102,000, becomes the daily high-water mark. The new breach threshold is now $99,450 (2.5% below $102,000). If equity falls below $99,450 during the day, the account hard breaches. If the day ends with both balance and equity at $101,000, the next day starts with a breach threshold of $98,475 (2.5% below $101,000).

## Daily Profit Cap (Evaluation only)

The Daily Profit Cap is 2.5% of the day's starting equity. Hitting the cap is **not** a hard breach — instead, the platform closes open trades, cancels open orders, and pauses the account until the next trading day (after 17:00 ET).

**Example:** $100,000 account starts the day with equity of $102,000. Profit cap for the day is $104,500. If equity exceeds $104,500, positions are closed and the account is paused. If the account settles at $104,600 after liquidation, it may trade again the next day; the new cap is then based on the new day's starting equity.

## Minimum profitable trading days

To progress to the Funded phase **or** become eligible for a payout in the Funded phase, you must generate **at least 0.5% profit per day across three separate trading days**, in addition to meeting all other rules.

## Minimum hold time

Every trade must be held for at least **1 minute**. Trades held under 1 minute are violations — the profits from that trade are forfeited.

## Funded phase: payouts

- **First payout:** requestable after 14 days in the Funded phase
- **Subsequent payouts:** every 14 days, provided all conditions are met
- **Profit Split:** 80% trader / 20% firm
- **Minimum withdrawal:** $100

See [SSE Payouts](../06-funding-and-payouts/sse-payouts.md), [Lock Upon Payout](../06-funding-and-payouts/lock-upon-payout-sse.md), and [Payout Protector add-on](../08-add-ons/payout-protector.md).

## Common questions

**Q:** What happens if I hold a position past 15:55 ET?
**A:** It's a hard breach. The platform attempts to auto-close, but the responsibility is on the trader. If a position is open past the cutoff, the account is breached. See [SSE 15:55 Cutoff](../05-breaches/sse-15-55-cutoff.md).

**Q:** Can I trade Pre-Market or Extended Hours?
**A:** No. Only the 09:30 ET – 15:55 ET window is permitted.

**Q:** What's the platform?
**A:** GooeyPro — and only GooeyPro — for Single Session Equities.
