# Audit Remediation Actions (2026-03-25)

Summary
-------
This document lists concrete remediation branches and steps to resolve the 5 low-severity advisories found by `npm audit` while minimizing test breakage.

Advisories
----------
All advisories are transitive and trace to test tooling:
- `@tootallnate/once` (via `http-proxy-agent`)
- `http-proxy-agent` (via `jsdom`)
- `jsdom` (via `http-proxy-agent`)
- `jest-environment-jsdom` (direct)
- `jest-expo` (direct)

High-level approach
-------------------
- Do not run `npm audit fix --force` on `UAI-Development` (breaking changes). Use sandbox branches and small, reversible PRs.
- Attempt targeted upgrades of `jest-environment-jsdom` and `jest-expo` in isolated branches; validate locally and in CI.
- If a semver-major upgrade is required and breaks tests, create a compatibility PR with minimal `jest.config.cjs` or mock adjustments. If incompatible, document risk and defer.

Planned branches (one PR per item)
----------------------------------
1. `chore/security/remediate-jest-environment-jsdom-2026-03-25`
   - Bump `jest-environment-jsdom` to `^30.3.0` (audit recommended).
   - Run `npm ci --legacy-peer-deps` and `npm test -- --ci --runInBand`.
   - Fix `jest.config.cjs` or test setup where necessary. If unresolved, revert and document.

2. `chore/security/remediate-jest-expo-compat-2026-03-25`
   - Evaluate `jest-expo` versions that work with `jest-environment-jsdom@30.x`.
   - Try a compatible `jest-expo` (or keep current `^55` and ensure it pulls a safe `jest-environment-jsdom`).

3. `chore/security/remediate-jsdom-override-2026-03-25`
   - If upstream upgrades don't resolve transitive `jsdom` -> `http-proxy-agent` -> `@tootallnate/once`, consider a lockfile override/resolution or adding a brief risk justification.

4. `chore/security/document-decision-log-2026-03-25`
   - Add an explicit decision log entry recording which advisories were fixed, which were deferred, and why.

Immediate next actions (performed now)
-------------------------------------
- Create the branches above as drafts (one PR per branch) so CI can run and we can iterate on fixes.
- Prioritize `jest-environment-jsdom` PR first since it is the direct fix suggested by `npm audit`.

Validation criteria
-------------------
- Local tests pass before marking PR ready.
- CI runs `npm ci --legacy-peer-deps` and the test suite passes.

Notes
-----
- Keep all changes limited to `devDependencies` and test config files. Avoid touching production deps.
- Use draft PRs; label `[security] [semver-major]` when applicable.
