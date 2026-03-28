# Release Notes (Draft)

This draft summarizes the recent maintenance and CI stabilization work merged to `audit/pin-dev-deps` and prepared for review.

## Summary

- Stabilized Jest and CI tooling:
  - Added robust Jest test shims and native/Expo mocks to avoid import-time failures.
  - Added lightweight integration smoke test and improved test stability.
- Linting & TypeScript:
  - Fixed TypeScript issues and adjusted ESLint config to avoid false positives for native-only modules.
  - Restored TypeScript 5.x pin to avoid plugin mismatches.
- CI & workflows:
  - CI workflow updated to install with `--legacy-peer-deps` to avoid Expo canary peer conflicts.
  - Coverage now uploaded to Codecov via `codecov/codecov-action@v4`.
- Dev-deps audit:
  - Ran `npm audit fix --package-lock-only`; remaining 14 vulnerabilities reported (transitive via `jest-expo`) — requires semver-major bump to address.
  - Created `audit/pin-dev-deps` branch with lockfile updates and documentation.
- Assets:
  - Added `scripts/auto-optimize-assets.js` and optimized oversized image `assets/images/hero-handyman.png` (original backed up under `assets/images/optimized-backup/`).
- Housekeeping:
  - Removed/gated noisy debug `console.log` calls used during development.
  - Updated `README.md` with CI/test run instructions.

## Next steps

- Review the `audit/pin-dev-deps` PR (#6) and decide whether to accept lockfile-only changes or perform a controlled major upgrade for `jest-expo`.
- Triage remaining ESLint warnings and address high-value items.
- Consider scheduling a dependency upgrade sprint to address the remaining `npm audit` findings.

---

PR: https://github.com/Pikkati/UAI-WeeJobs/pull/6
Branch: `audit/pin-dev-deps`

If you want, I can open a non-draft PR, re-run the CI checks on the branch, or start an isolated branch to test a `jest-expo` major bump.
