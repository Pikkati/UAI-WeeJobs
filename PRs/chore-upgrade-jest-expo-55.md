Title: chore: upgrade jest-expo to 55.0.11

## Summary

This branch upgrades `jest-expo` to `55.0.11` and updates the `package-lock.json` accordingly. It also includes related CI/test improvements and fixes that make tests reproducible and safer across Node versions.

Files/changes included

- Bumped `jest-expo` in `package.json`.
- Updated `package-lock.json` following `npm install`.
- Upstream-safe Jest preset changes to ensure our `rn-jest-setup-wrapper` runs first.
- Removed `postinstall` node_modules redirect and replaced with preset/moduleNameMapper.
- Added `Dockerfile` for test runner and `.github/workflows/ci-docker.yml` (Node matrix, npm cache, retry, coverage artifact).
- Added `jest-preset/rn-jest-setup-wrapper.js` and moved wrapper into preset area.
- Hardened `jest-environment-custom.js` and added an integration test `__tests__/setup-env.test.ts`.
- Added `AUDIT_UPGRADE_PLAN.md` recommending this upgrade and next steps.
- Added `husky` + `lint-staged` pre-commit hook and configuration.

## Why

Upgrading `jest-expo` resolves multiple transitive vulnerabilities reported by `npm audit` (see `tmp_npm_audit.json` and `AUDIT_UPGRADE_PLAN.md`). The bump is semver-major; this PR runs a full test matrix in Docker to validate the upgrade across Node versions.

## Testing

- `npm install` (lockfile updated) — run in Docker
- `npx tsc --noEmit` — TypeScript checks
- `npm test -- --ci --runInBand` — Jest tests

## Checklist

- [x] Tests pass locally in Docker (Node 20)
- [x] Lockfile updated
- [ ] CI checks pass on GitHub (matrix)
- [ ] Request reviewers and merge when green

## Notes for reviewers

- Look closely at any Jest or Jest-Expo related config changes — the preset was adjusted to run our wrapper first and avoid modifying `node_modules` during installs.
- If you run into failures locally, run the Dockerized steps in `README.md` to reproduce a clean environment.
