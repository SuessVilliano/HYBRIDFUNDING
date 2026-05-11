# Hybrid Funding — Canonical Knowledge Base

Single source of truth for everything our AI assistants (GHL Conversation AI on the chat widget + GHL Ask AI / AI Agent Studio inside the sub-account) should know about Hybrid Funding programs, rules, and policies.

## How this is organized

```
docs/kb/
├── 01-company/                Company overview, ecosystem, contact info
├── 02-programs/               Each funded-trading program (one file each)
├── 03-platforms/              Trading platforms we support
├── 04-rules/                  Trading rules that apply across programs
├── 05-breaches/               What constitutes a breach and what happens
├── 06-funding-and-payouts/    Getting funded, profit splits, withdrawals
├── 07-account-management/     KYC, account limits, billing, taxes
├── 08-add-ons/                Optional point-of-sale add-ons
├── 09-eligibility-and-affiliates/  Who can trade, affiliate program
└── 10-support-workflows/      When the bot should escalate to a human
```

## File template

Every article starts with this frontmatter:

```markdown
---
title: Daily Loss Limit
category: rules
tags: [drawdown, breach, daily-loss]
applies_to: [one-step, two-step, instant-funding]
last_updated: 2026-05-11
---

## What it is
…short prose description…

## How it works
…rule mechanics…

## Examples
…worked examples…

## Common questions
**Q:** …
**A:** …
```

## How to deploy to GHL

After any change in `docs/kb/`, run:

```bash
npm run build:kb
```

This produces two outputs in `dist/kb/`:

1. **`articles/*.md`** — one file per topic with frontmatter stripped. Drag-and-drop these into **GHL → Sub-account → Conversation AI → Knowledge Base** so the chat widget can cite them individually.
2. **`bundle.md`** — every article concatenated with a table of contents. Upload this **single file** to **GHL → Sub-account → AI Agent Studio → your agent → Knowledge Sources** so Ask AI can reason across everything at once.

## Editing rules

- **One topic per file.** If an article is growing past ~400 words, split it.
- **Never invent numbers.** Drawdowns, profit splits, leverage caps, and fees come from the official program rules docs. If you need to add a value that's not in an existing article, verify against the source rules doc first.
- **No mentions of our backend tech partners.** This is hard-required. Search the diff before merging.
- **Update `last_updated`** in the frontmatter every time you edit.

## Programs documented in this KB

- One-Step Evaluation
- Two-Step Evaluation
- Instant Funding
- Single Session Equities (Equities Day Trading)

Other programs (e.g. 3-Step, Instant Funding Lite) are deliberately excluded from this KB until we have published rules docs for them. Adding them prematurely creates risk of giving traders wrong information.
