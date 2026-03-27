Staging environment and Expo EAS build setup
==========================================

This document describes how to set up a staging environment and automated Expo/EAS builds for the project.

1) Create a staging Supabase project
  - Provision a separate Supabase project for staging.
  - Create the same schema (migrations) and RLS policies as production.
  - Add seeded test accounts or sample data.

2) GitHub Secrets (add to repo Settings → Secrets):
  - `EXPO_PUBLIC_SUPABASE_URL` — staging Supabase URL
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY` — staging anon key
  - `EAS_TOKEN` — Expo EAS token for CI builds
  - `EXPO_ACCOUNT_USERNAME` (optional) — for notifications

3) Local EAS setup (for maintainers)
  - Install EAS CLI: `npm install -g eas-cli`
  - Login: `eas login`
  - Create `eas.json` (a minimal preview profile is included in the repo)
  - Run a local preview build: `eas build --platform all --profile preview --non-interactive`

4) CI / GitHub Actions
  - A workflow template `.github/workflows/staging-build.yml` is provided. It expects the `EAS_TOKEN` secret and the staging `EXPO_*` secrets.
  - The workflow performs a non-interactive `eas build` on push to the `UAI-Development` branch and uploads artifacts.

5) Notes and troubleshooting
  - Mobile code signing (iOS/Android) needs credentials. For preview/testing, you can use Expo's temporary credentials or configure secure repository secrets for keys.
  - For EAS to run without interactive prompts in CI, populate `EAS_TOKEN` and configure credentials in Expo/EAS with `eas credentials` beforehand.

6) Next steps
  - Wire a lightweight staging deployment for backend endpoints (serverless webhooks) pointing to the staging Supabase.
  - Configure device pools for smoke tests and add E2E runs post-build.
