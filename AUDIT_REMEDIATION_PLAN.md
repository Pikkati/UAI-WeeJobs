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
