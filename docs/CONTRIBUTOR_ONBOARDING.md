# Contributor Onboarding

Welcome — this guide helps new contributors get productive quickly.

## Repo overview
- Frontend (Expo + React Native) app: `app/`
- Shared components: `components/`
- Context providers: `context/`
- Tests: `__tests__/`
- Supabase functions: `supabase/functions/`
- Migrations: `migrations/`
- Scripts: `scripts/`

## Prerequisites
- Node.js 20.x (recommended)
- npm or yarn
- Optional: a Supabase project and `DATABASE_URL` for running migrations

## Local setup
1. Install deps:

```bash
npm ci
```

2. Create a local `.env` (not committed) with required variables for development. See `app/.env.example` if present.

3. Run the app (Expo):

```bash
npm run start
```

## Running tests

Run the Jest suite locally:

```bash
npx jest --config=jest.config.cjs --runInBand
```

To collect coverage:

```bash
npx jest --config=jest.config.cjs --coverage --runInBand
```

## Linting & formatting

- Type check: `npm run type`
- Lint: `npm run lint`
- Format: `npm run format`

CI runs type and lint checks on PRs — make sure those pass locally before opening a PR.

## Migrations

To apply migrations to a Postgres database set `DATABASE_URL` (or `SUPABASE_DB_URL`) and run:

```bash
node scripts/run-migrations.js
```

This runner will create a `schema_migrations` table and apply SQL files from `migrations/`.

## Development practices
- Write small, focused PRs with a clear description and linked issue if available.
- Add or update tests for new behavior (unit tests in `__tests__/`).
- Keep changes scoped; avoid broad refactors in the same PR as feature work.

## Commit & PR guidelines
- Use conventional commits for clarity (e.g. `feat: add password strength meter`).
- Describe what, why, and any deployment notes in the PR body.
- Run `npm run type` and `npm run lint` before requesting review.

## Adding a new Supabase function
- Place the function under `supabase/functions/<name>/` and follow the existing function patterns.
- Keep secrets out of the repo; use environment variables configured in deployment.

## Getting help
- Ping the maintainers in the repo PRs or open an issue for larger changes.

Thank you for contributing!
