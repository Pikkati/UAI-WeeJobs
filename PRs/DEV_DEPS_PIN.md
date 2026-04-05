Dev dependencies audit & pinning recommendations

## Purpose

This note captures a safe approach to pinning devDependencies and resolving lint/TS toolchain mismatches.

## Recommended workflow

1. Run `npm audit` and `npm outdated` to get the current list.
2. Prefer pinning to a tested minor/patch version rather than `^` ranges for CI reproducibility.
3. Resolve ESLint/TypeScript mismatches by either:
   - Downgrading `typescript` to the latest 5.x (e.g. `~5.4.x` or `~5.9.x`) if many ESLint plugins used don't support TS6, or
   - Upgrading `@typescript-eslint/*` and `eslint` plugins to versions that explicitly support TypeScript 6.
4. Run the full test matrix after each change.

## Quick checklist

- [ ] `npm audit` — fix or document high/critical findings
- [ ] `npm outdated` — decide pin/upgrade candidates
- [ ] Run `npm ci` on a fresh container to validate
- [ ] Commit `package-lock.json` after changes

## Notes

Pinning is useful for CI stability; for long-term maintenance consider dependabot or Renovate with lockfile maintenance enabled.

## Current scan (run locally Mar 28, 2026)

- `npm outdated --depth=0` shows several direct and transitive packages that are behind (notably `eslint`, `sharp`, `svgo`, and expo/jest-related canary updates).
- `npm audit` reports 14 vulnerabilities (8 moderate, 6 high) largely coming from transitive dependencies under `jest-expo` (semver, micromatch, sane, braces, etc.).

## Immediate recommended actions

1. Do NOT upgrade `jest-expo` blindly to a canary release — this can be a semver-major change. Instead, create a dedicated branch and test the upgrade across the full Jest matrix.
2. For CI stability, pin the TypeScript major to `5.x` in `package.json` (already present) and avoid moving to TS6 until ESLint plugins confirm support.
3. Run `npm audit fix --package-lock-only` in a branch to update lockfile where safe, then run the full test suite.
4. Open a follow-up PR that includes the audit report, the `package-lock.json` changes, and CI green badges.

If you want, I can open a PR with the lockfile-only audit fixes and the changelog entry for review.
