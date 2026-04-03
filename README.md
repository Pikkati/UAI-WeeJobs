## Payments: Stripe Integration

This project includes a scaffold for Stripe payment integration and webhook handling.

**Local webhook testing:**
1. Add your Stripe secrets to `.env` (see `.env.example`).
2. Start the webhook listener:
   ```bash
   npm run start:webhook
   ```
3. Use the Stripe CLI to forward events:
   ```bash
   stripe listen --forward-to localhost:4242/webhook
   ```
4. Implement event handlers in `scripts/stripe-webhook.js` for events like `payment_intent.succeeded`.

See `docs/STRIPE.md` for more details and security notes.
 
<!-- Codecov badge -->
[![codecov](https://codecov.io/gh/Pikkati/UAI-WeeJobs/branch/UAI-Development/graph/badge.svg)](https://codecov.io/gh/Pikkati/UAI-WeeJobs)
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Gaps and Next Steps

This project is buildable and TypeScript passes after targeted fixes, but a few important gaps remain before production readiness:

- **expo-image type resolution:** ESLint reports many `import/no-unresolved` errors for `expo-image`. Add type declarations or install the correct package and typings.
- **Unused vars & hook deps:** Several files have `no-unused-vars` warnings and missing `react-hooks/exhaustive-deps` entries; review and fix each useEffect and unused variable.
- **React Native types:** We added permissive `declarations.d.ts` shims to unblock types. Replace these shims by installing and configuring proper `@types/*` or adapt code to use supported typed APIs.
- **Lint rule violations:** Some `react/no-unescaped-entities` errors remain (strings with apostrophes); escape or refactor strings.
 - **Environment secrets:** `.env.example` created but real Supabase keys must be added to CI secrets (GitHub/Vercel/Expo) — do NOT commit real keys.

## Environment variables

Required environment variables (set locally in `.env` or as CI secrets):

- `EXPO_PUBLIC_SUPABASE_URL` — Your Supabase project URL (e.g. `https://xyz.supabase.co`).
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key used by the client.
- `SERVICE_ROLE_KEY` — Supabase service role key for server-side operations (keep secret).
- `STRIPE_SECRET_KEY` — Stripe secret key for server-side Stripe calls.
- `STRIPE_ENDPOINT_SECRET` — Stripe webhook signing secret for verifying webhook events.
- `SENTRY_AUTH_TOKEN` — (Optional) Sentry auth token for releases and CI integration.
- `SENTRY_ORG` / `SENTRY_PROJECT` — (Optional) Sentry organization and project used by CI.
- `GH_TOKEN` / `NODE_AUTH_TOKEN` — (Optional) Tokens used in CI for publishing or private installs.
- `EAS_TOKEN` — (Optional) Expo Application Services token for EAS builds in CI.

Notes:

- Use `.env.example` as a template for local development. Never commit secret values.
- For GitHub Actions, add secrets via the repository settings (Settings → Secrets). Example:

   ```bash
   gh secret set EXPO_PUBLIC_SUPABASE_URL --body "https://your-project.supabase.co"
   gh secret set EXPO_PUBLIC_SUPABASE_ANON_KEY --body "your-anon-key"
   gh secret set SERVICE_ROLE_KEY --body "your-service-role-key"
   gh secret set STRIPE_SECRET_KEY --body "sk_test_..."
   gh secret set STRIPE_ENDPOINT_SECRET --body "whsec_..."
   ```

 - When running locally, create a `.env` file at the project root (do not commit it).
 
 ### Docker Compose (local dev)
 
 A lightweight `docker-compose.yml` is provided to run a local Postgres instance and the app in a container. This is useful for reproducing the CI environment and running tests.
 
 Start the services:
 
 ```bash
 docker compose up --build
 ```
 
 The app service runs `npx expo start` in tunnel mode. The Postgres service listens on `5432` and uses the database `weejobs_dev` with credentials in `docker-compose.yml` (update these for your environment).
 
 To stop and remove containers:
 
 ```bash
 docker compose down -v
 ```
 

- **Payments:** Stripe flows are mocked; integrate real Stripe server endpoints and keys when ready and add `STRIPE_` env vars to `.env.example`.
- **CI workflows:** Add GitHub Actions to run `npm ci`, `npx tsc --noEmit`, and `npx eslint` on PRs.

## CI & Audit Status

- **CI (PR Base):** ![PR Base Branch Check](https://github.com/getnudged/weejobs/actions/workflows/pr-base-check.yml/badge.svg)
- **CI (Main build):** ![CI build](https://github.com/getnudged/weejobs/actions/workflows/ci.yml/badge.svg)
- **Dependency Audit (weekly):** ![Dependency Audit](https://github.com/getnudged/weejobs/actions/workflows/dependency-audit.yml/badge.svg)
 - **Audit Snapshot (weekly):** ![Audit Snapshot](https://github.com/getnudged/weejobs/actions/workflows/audit-snapshot.yml/badge.svg)

These badges reflect the latest run status for the named workflows. If a badge indicates a failure, open the corresponding workflow run in GitHub Actions to inspect logs.

Note: If ESLint runs fail locally or in CI with a plugin resolver error (e.g. `EslintPluginImportResolveError`), follow the temporary workarounds documented in [docs/LINT_LIMITATIONS.md](docs/LINT_LIMITATIONS.md).

If you want, I can: install missing typings for `expo-image`, fix the remaining lint warnings, and open a PR with these documentation changes.

### Running tests and CI locally

To reproduce the GitHub Actions CI job locally and run the tests with coverage use the following steps. The CI installs with `--legacy-peer-deps` to accommodate some Expo canary peer-dependencies.

```bash
# install deps (mirror CI)
npm ci --legacy-peer-deps --no-audit --no-fund

# run the same scripted CI test job (produces coverage/ folder)
npm run test:ci
```

The repository's CI workflow then uploads the `coverage` directory as an artifact and sends coverage to Codecov using `codecov/codecov-action@v4` (see `.github/workflows/ci-tests.yml`). If your repo is private, set the `CODECOV_TOKEN` secret in GitHub repository settings before relying on Codecov uploads.

## Running CI tests locally (Docker)

You can reproduce CI test runs locally using Docker. From the project root:

```bash
# Build the test image (uses node:20)
docker build -t weejobs-test:local .

# Run typecheck + tests inside the container
docker run --rm -v "$PWD":/usr/src/app -w /usr/src/app weejobs-test:local
```

This mirrors the GitHub Actions job and ensures `npm ci` + `tsc` + `jest` run in a clean environment.

## Repository Branch Policy

- **Working branch:** UAI-Development — all active development, audits, and upgrades must land on this branch. Do not merge feature work directly into `main`. `main` is reserved for stable releases.

If you find changes mistakenly merged into `main`, create a branch from the current `main` (for backup), then restore `main` to the intended stable commit and open PRs against `UAI-Development`.

For full details and branch protection guidance see [Branch Policy and Protection](docs/BRANCH_POLICY.md).

## Assets contribution quick guide

- Place individual SVG icons in `assets/icons/` using kebab-case filenames (e.g. `search-outline.svg`).
- Generate an SVG sprite with:

```bash
npm run assets:icon-sprite
```

- Optimize SVGs (requires `svgo`):

```bash
npm run assets:optimize
```

- To auto-generate platform PNG icons from a 1024x1024 master PNG, add `assets/icons/app-icon.png` and run:

```bash
npm run assets:generate-icons
```

Notes: `assets:generate-icons` uses `sharp` and `assets:optimize` uses `svgo` — install them as devDependencies locally to enable full automation.

