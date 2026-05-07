# GHL Webinar Funnel — Setup Guide

This doc covers what's wired up in code on the `claude/webinar-funnel` branch and what you (or the GHL admin) still need to do **inside the GHL UI** to make the marketing automations fire.

> Code-side work is complete. GHL workflows themselves cannot be created via API — they must be built in the GHL UI. The code applies the right tags so workflows can listen for them.

---

## What the code now does

When a visitor opts in on `https://www.hybridfunding.co/webinar`:

1. The page POSTs to `/api/lead` with `source: "webinar-optin"`.
2. The serverless handler (`api/index.ts`) creates a contact in GHL via `services.leadconnectorhq.com/contacts/` using `GHL_PIT_TOKEN`.
3. The contact is created (or re-tagged if it's a duplicate) with these tags:
   - `web-optin`
   - `sms-consent`
   - `webinar-lead`
   - `funnel-webinar`
   - `marketing-consent` (only if the optional checkbox was ticked)
4. The page then plays the embedded YouTube training (`1btvnorAx6A` — same video as the existing Watch Webinar modal) and shows a CTA to book a strategy call.

Source values for future funnels follow the same pattern: anything containing `"webinar"` adds the webinar tags, anything containing `"course"` adds `course-interest`.

---

## What to set up inside GHL

Sub-account: **Hybrid Funding** · Location ID: `wAgobr9TOihDZxQ2G3a5`

### 1. Workflow — "Webinar Lead Nurture"

**Trigger:** Contact Tag added · `webinar-lead`

**Steps (suggested):**

1. Wait 1 minute → Send SMS: "Hey {{contact.first_name}}, your training is ready. Watch it now: https://hybridfunding.co/webinar"
2. Send Email: "Your free training + replay link" (template — include the YouTube/Hybrid training URL and the booking link)
3. Wait 1 day → Send Email: "Did the training make sense? Reply with your biggest takeaway."
4. Wait 2 days → Send SMS: "Want me to walk through your funded-account roadmap on a free 20-min call? {{calendar.booking_link}}"
5. If contact books → exit workflow. Else → Wait 4 days → Send last-chance email + offer.

### 2. Workflow — "Webinar No-Show / No Action"

**Trigger:** Contact Tag added · `funnel-webinar`
**Filter:** No `booking-completed` tag after 7 days

**Action:** Move into a longer-cycle drip (weekly value emails for 4 weeks).

### 3. Pipeline — "Webinar Funnel"

Create a pipeline with these stages so each lead becomes an Opportunity you can see on a board:

| Stage | What moves a contact here |
|---|---|
| Opted In | Tag `webinar-lead` added (use a workflow action: "Create / Update Opportunity") |
| Watched Training | Tag `webinar-watched` (set this in GHL when video is finished — see below) |
| Strategy Call Booked | Calendar booking made on the linked GHL calendar |
| Strategy Call Completed | Calendar appointment status = Showed |
| Customer | Funded account purchased |
| Lost | Manual or 30-day inactivity |

To auto-create the opportunity: in workflow #1 above, add an "Opportunity → Create" action right after the trigger, pointing at this pipeline / "Opted In" stage.

### 4. (Optional) Watch tracking

If you want a `webinar-watched` tag added when someone finishes the video, you have two options:

- **Quick path:** add a follow-up button under the embed ("Mark training complete → Book a call") that POSTs to `/api/lead` again with `source: "webinar-watched"`. (One-line code change if you want this.)
- **Proper path:** use YouTube IFrame API `onStateChange` → fetch a webhook on completion → trigger a GHL workflow inbound webhook that adds the tag.

### 5. Booking calendar

The Watch view links to `https://api.leadconnectorhq.com/widget/booking/wAgobr9TOihDZxQ2G3a5`. If you have a more specific calendar (e.g. "Webinar Strategy Call"), replace `BOOKING_URL` in `client/src/pages/Webinar.tsx`.

---

## Things I did **not** do

- I did **not** create workflows, pipelines, opportunities, or calendars in GHL — the GHL API does not support creating workflows, and creating opportunities programmatically requires per-stage IDs that aren't available without the workflow/pipeline existing first. Those are UI tasks.
- I did **not** change the existing `web-optin` tag flow used by the home-page form. New tags are additive.
- I did **not** touch the `claude/ghl-optin-integration` branch (looked like an unrelated heavy refactor).
