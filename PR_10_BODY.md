PR #10 — Stabilise tests and add focused unit/interaction tests

Summary
- Stabilised flaky tests and added focused unit + interaction tests to improve coverage and CI stability.
- Key fixes: mocked Alert flows in interaction tests, guarded async fetch results in `choose-tradesman`, added `_testInterests` test injection, and improved test harness usage.

What changed
- Added/updated tests:
  - `__tests__/job.approve-quote.actions.test.tsx` (interaction flows)
  - `__tests__/job.approve-quote.test.tsx` (render tests)
  - `__tests__/onboarding.signup.validation.test.tsx` (signup validation)
  - `__tests__/onboarding.signup.test.tsx`, `__tests__/onboarding.login.test.tsx`
  - `__tests__/job.choose-tradesman.test.tsx`, `__tests__/job.choose-tradesman.viewprofile.test.tsx`
  - Several helper/unit tests for customer jobs and tracking functions
- Minor component hardening in `app/job/choose-tradesman.tsx` (Array.isArray guard, optional _testInterests prop, safer event handling)
- Updated project TODOs and added a local branch `pr-10-finalize-tests` with these changes.

Why
- These changes make tests deterministic and reduce CI flakiness. They also cover previously untested branches (approve/acknowledge flows, signup validation), improving overall reliability.

Testing
- Run full test suite and coverage locally:

```bash
npx jest --coverage
```

Files of interest
- `app/job/approve-quote.tsx` — interaction behavior tested and guarded
- `app/job/choose-tradesman.tsx` — fetch result guards and test hooks
- New tests under `__tests__/` as listed above

Next steps
- Open PR on GitHub (link created automatically when branch was pushed):
  https://github.com/Pikkati/UAI-WeeJobs/pull/new/pr-10-finalize-tests
- Optionally run `gh pr create --title "Stabilise tests and add unit/interaction tests" --body-file PR_10_BODY.md --head pr-10-finalize-tests` to open the PR from CLI.

Notes for reviewers
- Focus on test files and the small component guard changes. Coverage artifacts (coverage/lcov-report) were generated during runs but do not need review.

If you want, I can open the PR via the GitHub CLI now (if installed and authenticated).