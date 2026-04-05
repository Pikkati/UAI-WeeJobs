# jest-expo Remediation Plan (2026-03-25)

## Goal

Attempt a targeted remediation for `jest-expo` to resolve audit findings while keeping tests passing.

## Scope

- Evaluate safe upgrade/downgrade paths for `jest-expo` that resolve transitive advisories
- Validate changes locally with `npm ci --legacy-peer-deps` and `npm test --ci`
- Adjust `jest.config.cjs` and test setup/mocks as needed
- Open small, focused draft PRs per change for CI validation

## Steps

1. Create branch `chore/security/remediate-jest-expo-2026-03-25` from `UAI-Development`.
2. Record current versions and audit output in the PR description.
3. Try bumping/downgrading `jest-expo` to the target version suggested by `npm audit` (note: may be semver-major).
4. Run `npm ci --legacy-peer-deps` and `npm test -- --ci --runInBand`.
5. If tests fail, capture failing traces, attempt minimal `jest.config.cjs` adjustments (preset/env/mocks), and re-run tests.
6. If incompatible, revert and document the reason; consider selective overrides or leave as documented low-risk advisory.

## Validation

- Local test suite must pass before marking PR as ready.
- CI must run `npm ci --legacy-peer-deps` and pass tests on the PR.

## Notes

- Keep changes isolated to devDependencies and test config.
- Label PRs `[security] [semver-major]` where applicable.
