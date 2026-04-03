# Audit Remediation Plan

Summary
- `npm audit` reports 5 low-severity findings related to `jest-expo` and its transitive deps (`jsdom`, `http-proxy-agent`, `@tootallnate/once`).
- Suggested fix is a major-version change to `jest-expo` (47.0.1) which is potentially breaking.

Recommended approach
1. Create a sandbox branch `chore/upgrade/jest-expo-sandbox`.
2. Update test deps incrementally and run the full test suite and typecheck:
   - Try `npm install jest-expo@47 --save-dev` in the sandbox to reproduce issues.
   - If tests fail, iterate: update `jest-environment-jsdom`, `jsdom`, and `http-proxy-agent` as required.
3. If major upgrades are required across Expo/Jest setup, consider migrating to a fresh test runner config (create a playground app) to validate changes before merging.
4. If the fix requires downgrades that conflict with other deps, prefer leaving low-severity issues open and document the rationale.
5. For any change that affects runtime or CI, ensure a full CI run (including `ci-node-matrix.yml`) passes before merging.

Next steps I can take
- Create the sandbox branch and push a PR that attempts `jest-expo@47` and includes failing test logs for review.
- Or open an issue summarizing the audit and asking maintainers to approve a remediation strategy.

## Latest npm audit (automated run)

I ran `npm ci` and `npm audit --json` and saved the report to `tmp_npm_audit.json`. Summary:

- Total vulnerabilities: **13** (5 low, 1 moderate, 7 high)
- Several high-severity findings relate to `@typescript-eslint/*` packages and transitive deps such as `minimatch` and `picomatch`.
- Multiple low/medium findings are transitive issues under `jest-expo` and its dependencies (`jsdom`, `http-proxy-agent`, `@tootallnate/once`).

Immediate recommendations:

1. Run `npm audit fix` to automatically apply non-breaking fixes and then re-run the test suite. Commit `package-lock.json` only if tests pass.
2. For high-severity issues that require major bumps (e.g., some `@typescript-eslint` packages or `jest-expo`), create sandbox branches and upgrade incrementally:
   - `chore/upgrade/jest-expo-sandbox` to validate major `jest-expo` upgrades.
   - `chore/upgrade/ts-eslint-sandbox` to test `@typescript-eslint` upgrades and confirm lint/test behavior.
3. Prioritize fixes that have non-breaking patches available (see `tmp_npm_audit.json` `fixAvailable` entries).
4. After each upgrade, run the full CI matrix (Node versions used in `ci.yml`) and a local Docker CI run to catch environment-specific regressions.

If you'd like, I can create the sandbox branches and open PRs that attempt safe, incremental upgrades and include CI/test logs for each attempt.
