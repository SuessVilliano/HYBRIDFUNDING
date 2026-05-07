# GHL Webinar Funnel — Setup Guide

This doc covers what's wired in code on `claude/webinar-funnel` and what you (or the GHL admin) still need to do **inside GHL** to make the marketing automations fire.

> **Code-side work is complete.** `/webinar` now embeds your GHL form (`DdwxJSrjfQVY2gY5Qnh0` — "Hybrid Funding Webinar"). The page swaps to the YouTube training automatically the moment the form is submitted.

---

## How the page behaves

`https://www.hybridfunding.co/webinar` has two states:

1. **Locked (default visit)** — left column shows the value-prop copy and bullets; right column embeds the GHL inline form via `https://api.leadconnectorhq.com/widget/form/DdwxJSrjfQVY2gY5Qnh0` with the official `form_embed.js` script loaded.
2. **Unlocked** — page swaps to the YouTube training (autoplay) plus a "Book a Free Strategy Call" CTA pointing at the GHL booking widget for location `wAgobr9TOihDZxQ2G3a5`.

Three independent triggers can flip the page from locked → unlocked, in order of preference:

| # | Trigger | Where it comes from |
|---|---------|---------------------|
| 1 | `postMessage` from the GHL form iframe (origin matches `leadconnectorhq.com / msgsndr.com / gohighlevel.com` and payload mentions submit) | `form_embed.js` after the visitor clicks Submit |
| 2 | URL query param `?watched=1` | GHL form's "Redirect URL" setting (set this — see below) |
| 3 | `localStorage["hf_webinar_unlocked"] === "1"` | Set by triggers 1 or 2 on prior visits |

If GHL ever changes the postMessage shape, the redirect (trigger 2) is the safety net.

---

## What you need to do inside GHL

### 1. Set the form redirect URL (belt-and-suspenders)

GHL → Sites → Forms & Surveys → **Hybrid Funding Webinar** → **Settings** → **On Submit** → **Redirect to URL**:

```
https://www.hybridfunding.co/webinar?watched=1
```

You can also pass the first name through so the success banner greets the visitor:

```
https://www.hybridfunding.co/webinar?watched=1&first_name={{contact.first_name}}
```

This guarantees the page unlocks even if the cross-origin postMessage handshake misses.

### 2. Workflow — "Webinar Lead Nurture" (this is where the SMS with the YouTube link lives)

GHL → Automation → Workflows → New Workflow.

**Trigger:** *Form Submitted* → form: **Hybrid Funding Webinar**

**Steps (suggested):**

1. **Send SMS** (immediate)
   ```
   Hey {{contact.first_name}}, here's your Hybrid Funding training:
   https://youtu.be/1btvnorAx6A

   Watch it from start to finish — there's a special offer at the end.
   Reply STOP to opt out.
   ```
2. **Send Email** (immediate) — same link with a styled CTA + the booking link
3. **Wait 1 day** → Send Email: "Did the training make sense? Reply with your biggest takeaway."
4. **Wait 2 days** → Send SMS: "Want me to walk through your funded-account roadmap on a free 20-min call? {{calendar.booking_link}}"
5. **If contact books a call** → exit workflow. Else → Wait 4 days → last-chance offer email.

This is the workflow that fulfills "text them the YouTube link."

### 3. Pipeline — "Webinar Funnel" (optional but recommended)

Create a pipeline with these stages so each lead becomes an Opportunity on a board:

| Stage | What moves a contact here |
|---|---|
| Opted In | "Form Submitted: Hybrid Funding Webinar" — add a workflow action: Opportunity → Create |
| Watched Training | Tag `webinar-watched` (see Optional below) |
| Strategy Call Booked | Calendar booking made on the linked GHL calendar |
| Strategy Call Completed | Calendar appointment status = Showed |
| Customer | Funded account purchased |
| Lost | Manual or 30-day inactivity |

Add the **Opportunity → Create** action right after the form-submit trigger in workflow #2 above, pointing at this pipeline + "Opted In" stage.

### 4. Tags (for segmentation + future workflows)

Inside the form's settings (or as a workflow action), apply these tags on submit so future automations can branch off them:

- `webinar-lead`
- `funnel-webinar`

The home-page **Watch Webinar** card (which still uses the React form → `/api/lead`) already applies these tags automatically when its `source` contains "webinar". Keeping naming aligned across both entry points means one nurture workflow can listen on the tag instead of two separate triggers.

### 5. Optional — `webinar-watched` tracking

If you want a separate tag added when someone finishes the video (so you can drip differently to "watched" vs "opted in but never watched"):

- **Quick path:** add a follow-up button under the embed ("Mark training complete → Book a call") that POSTs to `/api/lead` with `source: "webinar-watched"`. One-line change.
- **Proper path:** wire YouTube IFrame API `onStateChange` → fetch a GHL inbound webhook on completion → workflow adds the `webinar-watched` tag.

---

## What you don't need anymore

- The custom React opt-in form previously on `/webinar` is gone — the GHL iframe replaces it. Form-side validation, A/B tests, field changes, and Twilio SMS/email-sending all happen inside GHL going forward.
- `/api/lead` is **still wired** and is unchanged — used by the home-page "Watch Webinar" gated form. If you eventually want to migrate that to the iframe too, swap `A2PCompliantOptInForm` for the same iframe and you can deprecate `/api/lead`.

## What I did **not** do

- I did not create the form's redirect URL, workflow, pipeline, or opportunity stages — those are GHL UI tasks (the workflow API doesn't allow creating workflows).
- I did not change the existing `claude/ghl-optin-integration` branch (looked like an unrelated heavy refactor).
