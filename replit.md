# WeeJobs - Mobile Handyman Marketplace

## Overview

WeeJobs is a mobile-first handyman marketplace app for the Causeway Coast & Glens, Northern Ireland. It connects local customers with local tradespeople for small to medium jobs.

**Tagline:** "No Job Too Wee" — no task is too small.

## Tech Stack

- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **Database:** Supabase (Postgres)
- **Styling:** Custom theme with black (#000000) background, white text, and blue accent (#2563EB) from logo

## Project Structure

```
app/
├── _layout.tsx          # Root layout with AuthProvider & JobsProvider
├── index.tsx            # Splash screen
├── onboarding/
│   ├── intro.tsx        # Onboarding slides
│   ├── role-select.tsx  # Choose customer or tradesperson
│   └── login.tsx        # Login screen
├── customer/            # Customer app screens
│   ├── _layout.tsx      # Tab navigation
│   ├── index.tsx        # Home screen
│   ├── post-job.tsx     # Post a job form
│   ├── jobs.tsx         # My jobs list
│   ├── messages.tsx     # Messages
│   └── profile.tsx      # Profile
├── tradie/              # Tradesperson app screens
│   ├── _layout.tsx      # Tab navigation
│   ├── index.tsx        # Swipe jobs (Express Interest flow)
│   ├── current-jobs.tsx # Accepted jobs
│   ├── messages.tsx     # Messages
│   └── profile.tsx      # Profile
├── job/                 # Job flow screens (marketplace)
│   ├── _layout.tsx      # Stack navigation
│   ├── choose-tradesman.tsx  # Customer selects tradesperson
│   ├── pay-deposit.tsx  # Customer pays deposit
│   ├── tracking.tsx     # Job status tracking with timeline
│   ├── send-quote.tsx   # Tradesperson sends quote
│   ├── approve-quote.tsx # Customer approves quote
│   ├── pay-final.tsx    # Customer pays remaining balance
│   ├── receipt.tsx      # Payment receipt
│   └── review.tsx       # Leave review after completion
└── admin/               # Admin dashboard
    ├── _layout.tsx      # Tab navigation
    ├── index.tsx        # Dashboard
    ├── jobs.tsx         # All jobs
    ├── users.tsx        # All users
    └── settings.tsx     # Settings

components/
├── LeadUnlockModal.tsx  # Monetization unlock modal
├── VerifiedProBadge.tsx # PRO badge component
├── JobStatusTimeline.tsx # Visual job status timeline
└── StripeCheckoutStub.tsx # Mock Stripe checkout modal

constants/
├── theme.ts             # Colors, Typography, Spacing
└── data.ts              # Areas, Categories, Test Users

context/
├── AuthContext.tsx      # Authentication state
└── JobsContext.tsx      # Jobs state & marketplace actions

lib/
└── supabase.ts          # Supabase client and types
```

## Test Accounts

- **Customer:** sarah@weejobs.test / password123
- **Tradesperson:** john@weejobs.test / password123
- **Admin:** admin@weejobs.test / password123

## Key Features

1. **Customers:** Post jobs, choose tradesperson, pay deposits, approve quotes, leave reviews
2. **Tradespeople:** Express interest in jobs (swipe), send quotes/estimates, complete work
3. **Monetization:** PAYG (£2-5 per lead unlock) or PRO (£49/month unlimited)
4. **Admin:** View all jobs and users
5. **Dual Pricing Model:** Fixed price quotes OR hourly rate invoices

## Dual Pricing Model

Tradespeople can choose their preferred pricing style in their profile:

### Fixed Price Flow

1. Tradie arrives, inspects job
2. Tradie sends **binding quote** (fixed price)
3. Customer **approves quote** to confirm
4. Work completed, customer pays final balance

### Hourly Rate Flow

1. Tradie sends **estimate** (provisional - hours x rate + materials)
2. Customer **acknowledges estimate** (not binding)
3. Work completed
4. Tradie sends **invoice** (actual hours worked)
5. Customer sees variance warning if >20% different from estimate
6. Customer pays invoice

## Monetization Model

- **PAYG (Pay As You Go):** £2-5 per lead unlock + 10% commission fee
- **PRO Subscription:** £49/month for unlimited lead unlocks, verified badge

## Environment Variables Required

- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Database Tables

- `users` - id, email, name, role, phone, area, trade_categories
- `jobs` - id, customer_id, tradie_id, name, phone, email, area, category, description, timing, photos, status, is_garage_clearance
- `messages` - id, job_id, sender_id, receiver_id, content, read

## Supabase Setup Files

Located in `supabase/` folder:

- `schema.sql` - Production schema with proper RLS security policies
- `schema-dev.sql` - Development schema with permissive policies for testing

### Marketplace Job Flow

1. **Customer posts job:** Creates row in `jobs` with `status='open'`
2. **Tradies express interest:** Creates row in `job_interests`, job moves to `pending_customer_choice`
3. **Customer chooses tradesperson:** Selects from 1-3 interested tradies
4. **Customer pays deposit:** 10% of budget (£10-£50), job moves to `booked`
5. **Tradie on the way:** Status = `on_the_way`
6. **Tradie arrives:** Status = `in_progress`
7. **Tradie sends quote:** Status = `awaiting_quote_approval`
8. **Customer approves quote:** Status = `awaiting_final_payment`
9. **Customer pays final balance:** Status = `paid`
10. **Both confirm completion:** Status = `completed`
11. **Customer leaves review:** 1-5 star rating + comment

### Job Status Values

**Fixed Price Flow:**
`open` → `pending_customer_choice` → `booked` → `on_the_way` → `in_progress` → `awaiting_quote_approval` → `awaiting_final_payment` → `paid` → `awaiting_confirmation` → `completed`

**Hourly Rate Flow:**
`open` → `pending_customer_choice` → `booked` → `on_the_way` → `estimate_acknowledged` → `in_progress` → `awaiting_invoice_payment` → `paid` → `awaiting_confirmation` → `completed`

### Database Tables

- `job_interests` - tracks tradesperson interest in jobs
- `reviews` - customer/tradie reviews after job completion

## Recent Changes

- Initial MVP build (January 2026)
- Created complete app structure with all screens
- Implemented Tinder-style job swiping for tradespeople
- Added customer job posting with photo upload
- Created admin dashboard
- Implemented marketplace flow (January 2026):
  - Added JobsContext with complete job status machine
  - Created 8 new job flow screens (choose-tradesman, pay-deposit, tracking, send-quote, approve-quote, pay-final, receipt, review)
  - Added monetization system (PAYG vs PRO)
  - Mock Stripe payment integration for deposits and final payments
  - Airbnb-style review system
  - Job status timeline component
- Tradie My Jobs redesign (January 2026):
  - Beautiful tappable job cards with gold accent borders for actionable jobs
  - Status-specific action banners (On My Way, Arrived, Send Quote, Mark Complete)
  - Confirmation alerts before all tradie actions
  - Proper handling of all marketplace statuses
  - Mutual completion confirmation logic (both customer and tradie must confirm)
  - Navigation to shared tracking screen (/job/tracking) that works for both roles
- Dual Pricing Model (January 2026):
  - Added pricing_type field to jobs (fixed/hourly) inherited from tradie's profile preference
  - Extended Job type with estimate fields (hours, hourly_rate, materials_cost, total)
  - Extended Job type with invoice fields (invoice_hours, invoice_materials, invoice_total)
  - Branched status machine in JobsContext for fixed vs hourly flows
  - New actions: sendEstimate, acknowledgeEstimate, sendInvoice, payInvoice
  - Redesigned send-quote screen for Quote/Estimate/Invoice modes
  - Updated approve-quote for both binding quotes and provisional estimates
  - Pay-final screen shows invoice breakdown with variance warnings (>20%)
  - Tradie profile pricing preference toggle with hourly rate input
  - Migration file at supabase/migration-pricing.sql

- Brand Refresh (March 2026):
  - Switched from dark navy + gold to black + white + blue (#2563EB) from logo
  - Generated hero handyman image for splash/intro screens (assets/images/hero-handyman.png)
  - Cinematic splash screen with full-bleed hero image and gradient overlay
  - Redesigned intro onboarding with hero background, left-aligned text, modern layout
  - Updated all button text colors from Colors.background to Colors.white for readability on blue
  - Tab bars now use blue active tint instead of gold

## User Preferences

- Black background with blue accent from logo
- White text, clean modern aesthetic
- Bold, italic headings
- No emojis in code unless requested
