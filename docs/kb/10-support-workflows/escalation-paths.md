---
title: When to Escalate to a Human
category: support-workflows
tags: [escalation, human-handoff, support-routing]
last_updated: 2026-05-11
---

## When the chatbot should hand off to a human

The AI assistant should answer most program-rules, pricing, and policy questions directly from this knowledge base. It should **hand off to a human** via email (support@hybridfunding.io) or live chat when the user asks about, or describes, any of the following:

### Account-specific scenarios

- "My account is breached and I think it shouldn't be" — escalate to support with timestamps.
- "I can't log in to the platform" — escalate; do not try to debug platform-specific auth issues via chat.
- "I need to combine two funded accounts" — escalate; combinations require a manual support step.
- "My KYC keeps failing" — escalate to support with screenshots.
- "I want a refund" — escalate; refund eligibility is decided case-by-case.

### Payment / billing

- "I see an unrecognized Dashboardanalytix.com charge"
- "My withdrawal hasn't arrived after X days"
- Any chargeback or dispute language

### Compliance / legal

- KYC failures or country-eligibility questions for borderline situations
- Tax form requests or tax-jurisdiction-specific questions
- Any inquiry that references regulators, attorneys, or legal action

### Edge cases on the rules

- Specific drawdown / breach calculation on a *specific account number* — the bot can explain general mechanics but should not commit to a specific account's current threshold without referring the user to the trader dashboard.
- Anything where the bot's confidence is below high — better to escalate than risk a wrong rule citation.

## How to escalate

If the user is on live chat: hand off in-chat using the GHL Conversation AI escalation flow.

If escalation requires a fresh thread, give the user:

> "I'm going to make sure this gets to a human who can pull up your specific account. Please email **support@hybridfunding.io** with your account ID and a short description of the issue, and we'll get back to you within one business day."

## What the bot should never do

- **Never invent rule percentages, drawdown thresholds, profit splits, or fees.** If the user asks about a specific number and the KB doesn't have it, defer to the trader dashboard or escalate.
- **Never promise a specific outcome on a breach appeal.** Hard breaches are generally final; only support can review specific cases.
- **Never confirm KYC will pass for a specific country.** Defer to OFAC checks and the KYC flow itself.
