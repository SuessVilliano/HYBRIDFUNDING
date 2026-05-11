---
title: Automated Strategies and EAs
category: rules
tags: [ea, automation, automated-strategies]
applies_to: [one-step, two-step, instant-funding]
last_updated: 2026-05-11
---

## What it is

You **can** use an automated trading strategy (EA, bot, algorithmic system), provided it does not violate the Prohibited Trading policy.

## What's not allowed

The following automated-strategy patterns are **not** permitted:

- Utilizing any **third-party strategy, off-the-shelf strategy, or one marketed to pass challenge accounts**
- Using one strategy to pass an evaluation and a **different strategy** in the funded account
- Any strategy that exploits errors or latency in pricing or platform feeds
- Any strategy that triggers cancellation of trades by the Liquidity Provider
- Any strategy that creates regulatory issues for the Liquidity Provider

## What to do

- Build or commission your own strategy, or substantially adapt one to your own approach.
- Use the **same strategy** through evaluation and funded phases.
- Test in a demo first. The Prohibited Trading framework gives Hybrid Funding broad discretion — if your strategy could be confused for a passing service or off-the-shelf system, you risk forfeiture even after passing.

## Common questions

**Q:** What if I bought an EA from a vendor and modified it heavily?
**A:** Heavily modified is a judgment call. The rule explicitly prohibits **off-the-shelf** strategies — if your version is materially the same as something publicly sold or marketed, it may still trigger review. When in doubt, contact support before deploying it on a paid account.

**Q:** Can I run different EAs in evaluation vs funded?
**A:** No. Changing strategies between evaluation and funded phases is explicitly listed as Prohibited Trading.

**Q:** Are automated strategies allowed on Single Session Equities?
**A:** SSE has its own Prohibited Practices, including the 1-minute minimum hold time and the 15:55 ET cutoff. Any automation must comply with those. See [Single Session Equities](../02-programs/single-session-equities.md).
