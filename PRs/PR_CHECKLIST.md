PR Checklist
=============

- [ ] Run `npm run test:ci` locally and confirm coverage meets project thresholds
- [ ] Ensure no unexpected console output during tests (set `WEEJOBS_DEBUG` to true if debugging)
- [ ] Confirm native/Expo mocks in `__mocks__` are minimal and stable
- [ ] Confirm focused helper tests (e.g., `__tests__/jobs.helpers.test.ts`) pass
- [ ] Add any required CI secrets (e.g., codecov token) in repo settings if coverage upload is needed
- [ ] Request review from `dev` or `audit` team
- [ ] Merge into `UAI-Development` (do not merge into `main` directly)
