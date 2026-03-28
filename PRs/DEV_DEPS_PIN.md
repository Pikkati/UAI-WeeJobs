Dev dependencies audit & pinning recommendations

Purpose
-------
This note captures a safe approach to pinning devDependencies and resolving lint/TS toolchain mismatches.

Recommended workflow
--------------------
1. Run `npm audit` and `npm outdated` to get the current list.
2. Prefer pinning to a tested minor/patch version rather than `^` ranges for CI reproducibility.
3. Resolve ESLint/TypeScript mismatches by either:
   - Downgrading `typescript` to the latest 5.x (e.g. `~5.4.x` or `~5.9.x`) if many ESLint plugins used don't support TS6, or
   - Upgrading `@typescript-eslint/*` and `eslint` plugins to versions that explicitly support TypeScript 6.
4. Run the full test matrix after each change.

Quick checklist
---------------
- [ ] `npm audit` — fix or document high/critical findings
- [ ] `npm outdated` — decide pin/upgrade candidates
- [ ] Run `npm ci` on a fresh container to validate
- [ ] Commit `package-lock.json` after changes

Notes
-----
Pinning is useful for CI stability; for long-term maintenance consider dependabot or Renovate with lockfile maintenance enabled.
