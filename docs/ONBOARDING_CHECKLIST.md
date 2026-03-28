# WeeJobs - New Contributor Onboarding Checklist

Welcome — this checklist helps new contributors get the project running locally and make a proper PR.

## Quick setup

- Install Node (use a version matching CI / package engines; Node 20+ is recommended).
- Install Git and GitHub CLI (optional but helpful).

Commands (run from repository root):

```bash
# install dependencies
npm ci

# run typecheck
npx tsc --noEmit

# run tests (unit)
npm test

# run dev / app
npm run dev
```

## Branching & workflow

- Create a feature branch for each logical change: `git switch -c feat/your-topic`
- Keep commits small and focused; use present-tense messages.
- Push the branch and open a PR against `UAI-Development` (repository requires this base branch).
- Ensure PR description explains the change, how to test, and includes `npm run test:q` text when tests are added (PR checks enforce this).

## Local development tips

- If working on UI, use Expo / the project's dev script to preview the app.
- For auth flows, ensure you have a Supabase project or mock/test users configured. See `lib/supabase.ts` for env var names: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Persisted auth uses `@react-native-async-storage/async-storage` in the app.

## Tests and CI

- Run the full test suite locally before opening a PR:

```bash
npm test
# or the project's targeted quick test command
npm run test:q
```

- CI runs TypeScript checks (`npx tsc --noEmit`), installs dependencies with `npm ci`, and runs the test matrix. Node version mismatches can cause failures — use Node 20+ locally to match CI when possible.

## PR checklist (before requesting review)

- [ ] All new code has unit tests where applicable
- [ ] TypeScript compiles with `npx tsc --noEmit`
- [ ] Linting and formatting applied (run `npm run lint` / `npm run format` if available)
- [ ] PR description includes test instructions and `npm run test:q` when required
- [ ] PR targets `UAI-Development` branch

## Contributing conventions

- Follow existing code style and patterns found in `app/`, `context/`, and `lib/` folders.
- When changing schema or DB-related code, add a migration and include a short rollout note in the PR.
- Avoid breaking changes to public APIs — document them in the PR if unavoidable.

## Helpful files & locations

- App entry and pages: `app/`
- Auth logic: `context/AuthContext.tsx`
- Supabase types & client: `lib/supabase.ts`
- Tests: `__tests__/`
- CI workflows: `.github/workflows/`

## Who to ask

- If you're unsure about priorities or sensitive changes (auth, payments, deployments), ping the repo maintainers via the PR or the team channel.

---

If you'd like, I can also:
- create `docs/CONTRIBUTOR_ONBOARDING.md` with more formal guidance,
- add a small in-app onboarding checklist page wired to this doc,
- or open a PR with this file committed to the current feature branch.
