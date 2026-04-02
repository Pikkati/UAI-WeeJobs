# Environment Variables

This document lists the important environment variables used by the project and how to set them for development, CI, and production.

## Local development
- Create a `.env` file at the project root. Do NOT commit real secrets.
- Use `.env.example` as a template.

## Key variables
- `STRIPE_SECRET` — Your Stripe secret key (server-only). Required for webhook handling.
- `STRIPE_ENDPOINT_SECRET` — Stripe webhook signing secret (server-only).
- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL used by client.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Public anon key for Supabase client.
- `EXPO_PUBLIC_API_BASE` — Optional API base (for Edge Functions). Example: `http://localhost:54321/functions/v1`
- `EXPO_PUBLIC_SENTRY_DSN` — Optional Sentry DSN for client reporting.
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key for client-side SDK.

## CI / secrets
- Add the server-only secrets (`STRIPE_SECRET`, `STRIPE_ENDPOINT_SECRET`, `EXPO_SERVICE_ROLE_KEY`, etc.) to GitHub Actions secrets or your CI provider.
- Do NOT expose `EXPO_SERVICE_ROLE_KEY` or `STRIPE_SECRET` to client builds.

## Running locally with Edge Functions
1. Start Supabase locally (or point to a test project).
2. Set `EXPO_PUBLIC_API_BASE` to your local Supabase functions URL.

## Notes
- `.env.example` documents minimal variables. Extend as needed for new features.
