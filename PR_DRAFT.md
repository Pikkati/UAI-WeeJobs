Title: UAI-Development: typing, tests, audit fixes

Summary:

- Replace broad type shims with focused `expo-image` types and removed temporary shims
- Restored `expo-image` imports, fixed `defaultProps` casts and icon typings
- Added unit & integration tests: `__tests__/data.test.ts`, `__tests__/supabase.test.ts`, `__tests__/users.test.ts`, `__tests__/auth.test.tsx`
- Removed unused `react-native-deck-swiper` to reduce transitive vulnerabilities
- Ran `npm audit` and applied non-breaking fixes; upgraded `jest-expo` and test tooling

Checklist:

- [x] Type fixes and focused declarations
- [x] Tests added and passing locally (4/4)
- [x] Audit triage (reduced to low-severity issues)
- [ ] CI caching and secrets configuration
- [ ] Further dependency upgrades (schedule breaking changes)

Notes:

- CI: recommend adding node cache and running `npm ci` in workflow, and configure necessary secrets (SUPABASE keys, STRIPE keys) in repo settings.
- Dependencies: remaining low-severity advisories are test-tooling related; schedule non-trivial/upstream upgrades for a release window.

How to create the PR (if automatic CLI fails):

1. Open GitHub and create a new pull request from branch `UAI-Development` into `main`.
2. Use the above content as title/body and mark as draft.
3. Assign reviewers and add labels `type:chore`, `tests`, `security`.

Files changed (high level):

- package.json, package-lock.json (test tooling upgrades)
- types/expo-image.d.ts, declarations.d.ts (removed), types/shims.d.ts (removed)
- multiple `app/*` files (restored expo-image imports, defaultProps casts)
- **tests**/\* (added tests)
