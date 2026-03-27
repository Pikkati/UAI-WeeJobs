# WeeJobs — Full App Breakdown

## What It Is
WeeJobs is a two-sided mobile marketplace app for the Causeway Coast & Glens area of Northern Ireland. It connects local customers who need small-to-medium jobs done with local tradespeople. Tagline: "No Job Too Wee".

Built with Expo (React Native) for iOS and Android, backed by Supabase (PostgreSQL).

## The Three User Types
1. Customer — posts jobs, chooses tradespeople, manages payments, tracks progress.
2. Tradesperson (Tradie) — browses jobs, expresses interest, sends quotes/estimates, completes work, gets paid.
3. Admin — oversees platform, views jobs/users, manages settings.

## Core Features by Role

### Customer Flow
- Posting a Job: category, description, area, timing, budget; attach photos; special garage-clearance flag. Job posted as `open` and visible to relevant tradies.
- Seeing Interest: live banner "X tradespersons interested"; tap to view interested tradies.
- Closing Applications: manual via job menu or auto-close when 5 tradies express interest → status `awaiting_customer_choice`.
- Choosing a Tradesperson: cards show name, rating, reviews, jobs completed, Verified PRO badge, subscription plan; tap "Select" to accept and auto-decline others.
- Paying the Deposit: 10% of budget (capped £10–£50); mock Stripe checkout; job moves to `booked`.
- Tracking Progress: visual timeline of stages; real-time updates from tradie actions.
- Quotes / Estimates: fixed price = binding quote (customer taps Approve); hourly = provisional estimate (acknowledged non-binding).
- Final Payment: fixed price pays remaining balance; hourly pays final invoice with variance warning if >20% over estimate.
- Confirming Completion: both parties confirm; job becomes `completed` when both confirm.
- Leaving a Review: 1–5 star, title, comment; affects tradie rating.
- Job Management: edit/delete while `open`, cancel before booking, options via long-press or ⋮ menu.

### Tradesperson Flow
- Swiping Jobs: stack of open job cards (Tinder-style); swipe right to express interest, left to pass; tap to view details.
- Unlocking Leads (Monetisation): PAYG (£2–£5 per lead) or PRO (£49/month unlimited). Modal confirms fee before charge.
- My Jobs: lists all assigned jobs with status-specific action banners and context actions (e.g., "Mark On My Way", "Mark Arrived", "Send Quote").
- Sending Quotes/Estimates/Invoices: interfaces for fixed-price quotes, hourly estimates, and final invoices; variance checks for hourly flows.
- Profile & Pricing Preference: default pricing style (Fixed/Hourly), hourly rate if chosen; shows rating, reviews, jobs completed, PRO badge.

## Dual Pricing Model (Status Flows)
- Fixed Price: open → awaiting_customer_choice → booked → on_the_way → in_progress → awaiting_quote_approval → awaiting_final_payment → paid → awaiting_confirmation → completed
- Hourly Rate: open → awaiting_customer_choice → booked → on_the_way → estimate_acknowledged → in_progress → awaiting_invoice_payment → paid → awaiting_confirmation → completed

## Monetisation
- PAYG: £2–£5 per lead, pay-per-job, no badge.
- PRO: £49/month, unlimited lead unlocks, Verified PRO badge (visible on profile and selection cards).

## Admin Dashboard
- Dashboard: overview stats (jobs, users, revenue).
- Jobs: view all jobs across statuses.
- Users: view customers and tradies.
- Settings: platform configuration.

## Messaging
- In-app, per-job messaging between customer and tradie.
- Messages tab lists active conversations for each user.

## Onboarding
- Intro slides (3 screens) with hero imagery and editorial layout.
- Role selection (Customer or Tradie) and email/password sign-in via Supabase Auth.
- Sign up is stubbed as "coming soon".

## Design
- Dark theme: black background (#000000), white text.
- Accent: blue (#2563EB) from WeeJobs logo.
- Bold italic headings; dark cards (#1A1A1A) with subtle borders (#333333).
- Cinematic splash screen with full-bleed handyman image and gradient overlay.

## Service Area
Causeway Coast & Glens, Northern Ireland — includes Coleraine, Portstewart, Portrush, Ballymoney, Ballycastle, Limavady, and surrounding areas.

---
Notes: this document is intended as a concise product/spec summary for dev, design, and stakeholder alignment. It can be expanded into user stories, API specs, and UI flows as next steps.
