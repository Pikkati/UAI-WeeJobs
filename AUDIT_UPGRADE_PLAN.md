# Audit Upgrade Plan (generated)

Summary of actionable items from `npm audit` (see tmp_npm_audit.json):

- Root cause: many moderate/high findings originate from the `jest-expo` version (47.x) used by the project. Upgrading `jest-expo` to `55.0.11` resolves multiple transitive vulnerabilities (e.g., @expo/config, @expo/config-plugins, @jest/transform, babel-jest, anymatch).

Priority actions:

1. Upgrade `jest-expo` to 55.0.11 in a sandbox branch and run tests. This is a SemVer major bump and may require changes to Jest configs/presets.
   - Impact: fixes several moderate/high vulnerabilities reported under `jest-expo` dependencies.
   - Steps:
     - Create branch `chore/upgrade/jest-expo-55`.
     - Update `devDependencies` -> `jest-expo: 55.0.11`.
     - Run `npm ci` and `npx tsc --noEmit` then `npm test` in a docker container for Node 20.
     - Address any breaking changes reported by jest-expo changelog.

2. Review the `brace-expansion` and related packages reported under Expo CLI and Metro -- these often resolve by upgrading Expo CLI / metro-config or applying targeted fixes.

3. Run `npm audit fix --package-lock-only` where safe and re-run tests. For issues requiring major bumps (like jest-expo), perform upgrades in sandbox branch and test thoroughly.

4. After successful upgrades, update `package-lock.json` and open PR summarizing the dependency changes and test results.

Notes:

- Some fixes are SemVer-major and may require code/config changes. Start with `jest-expo` since it impacts dev/test infra.
- Keep CI Docker test matrix running during the upgrade to detect regressions across Node versions.
