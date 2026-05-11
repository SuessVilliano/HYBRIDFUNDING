---
title: Withdrawal and the Trailing Drawdown
category: funding-and-payouts
tags: [withdrawal, payout, trailing-drawdown, lock-at-starting-balance]
applies_to: [one-step, two-step, instant-funding]
last_updated: 2026-05-11
---

## The key rule

**When a withdrawal is approved, your Max Trailing Drawdown locks permanently at the starting balance.** The trailing drawdown does NOT reset to track the post-withdrawal balance.

## Why this matters

If you withdraw **all** of your gains, the locked-at-starting-balance drawdown will simultaneously trigger the trailing-drawdown breach rule — **forfeiting the funded account**.

Always leave a buffer above your starting balance when you withdraw.

## Worked example (Instant Funding, 80/20 split)

- Funded account starting balance: **$100,000**
- Account grows to: **$120,000** (closed balance) → gain = $20,000
- Trader requests withdrawal of $16,000
- Split: trader gets $12,800 (80%), Hybrid Funding retains $3,200 (20%)
- Post-withdrawal account balance: **$104,000**
- Max Trailing Drawdown is now **locked at the starting $100,000**

In this state, the trader has **$4,000 of buffer** before any further loss would trigger the trailing-drawdown breach rule. The trader can keep trading, but knows the exact floor.

## What "all gains withdrawn" looks like

- Account starting balance: **$100,000**
- Account grows to: **$110,000**
- Trader requests withdrawal of the entire **$10,000** in gains
- After processing, the account balance is **$100,000**
- Trailing drawdown is locked at **$100,000**
- Account balance = trailing drawdown lock → **trailing drawdown breach triggered → funded account forfeited**

This is the trap to avoid. If you want to harvest most of your gains, leave a buffer. Withdraw an amount that leaves the account balance comfortably above the starting balance.

## Common questions

**Q:** Does this apply to Single Session Equities?
**A:** SSE has a similar but separately-named concept: **Lock Upon Payout** is ON by default — once a payout is processed, the Max Drawdown locks permanently at the original starting balance. There's an optional **+25% of plan price** add-on at checkout to disable Lock Upon Payout. See [Lock Upon Payout (SSE)](lock-upon-payout-sse.md).

**Q:** Can I withdraw my first time without locking the drawdown?
**A:** No — the lock is triggered on **any** approved withdrawal.

**Q:** What if my account is much larger by the time I withdraw — does the lock still apply?
**A:** Yes. The lock is always at the original **starting balance**, not the current balance.
