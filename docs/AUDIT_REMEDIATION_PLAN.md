## Audit remediation plan

Summary

- `npm audit` found 5 low-severity vulnerabilities (see `audit-report.json`).
- Most findings are indirect and related to the testing toolchain (`jest-expo`, `jsdom`, `http-proxy-agent`, `@tootallnate/once`).
- Fixes reported by `npm audit` point to a semver-major change of `jest-expo` (to `47.0.1`), which may be breaking.

Recommended remediation steps

1. Review test tooling compatibility: upgrading `jest-expo` across major versions can require changes to Jest config and related devDependencies.
2. Create a dedicated branch to perform the upgrade and run the full test suite and smoke tests.
3. If the upgrade is breaking, consider pinning `jest-expo` to a maintained secure version or isolating test environment dependencies.
4. For each dependency flagged, attempt `npm audit fix --package-lock-only` in a sandbox branch, run tests, and open a remediation PR with the changes.
5. For complex upgrades, document changelog and migration steps in the PR description.

Automated actions performed

- Collected `npm audit` output and saved it to `audit-report.json`.
- Did not apply automatic fixes due to peer-dependency conflicts; a manual upgrade is recommended.

Next actions (I can perform these)

- Create a branch to attempt `jest-expo` upgrade and run tests; open a PR with results.
- Attempt safer `npm audit fix` for non-breaking fixes, commit lockfile changes, and open a PR.
