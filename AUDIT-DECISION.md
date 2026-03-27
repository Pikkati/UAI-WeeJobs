# Audit Decision Log

Summary of actions taken to triage and remediate npm audit advisories (March 25, 2026):

- Created lockfile-update PR: [chore/lockfile-update-2026-03-25](https://github.com/getnudged/weejobs/pull/21)
- Upgraded `jest-environment-jsdom` in sandbox: [PR #23](https://github.com/getnudged/weejobs/pull/23)
- Upgraded `jest-expo` in sandbox: [PR #24](https://github.com/getnudged/weejobs/pull/24)
- Patched CI to allow local `act` runs (install `eas-cli` locally): [PR #25](https://github.com/getnudged/weejobs/pull/25)
- Applied dependency remediation and lockfile refresh: [PR #26](https://github.com/getnudged/weejobs/pull/26)

Decision summary:

- Priority: avoid breaking changes in prod branches. Prefer sandbox PRs for major upgrades (jest-expo 55.x, jest-environment-jsdom 30.3.0) and validate with `npx tsc` + `npm test` before merging.
- Lockfile updates should be merged once CI (remote) is green to restore `npm ci` behavior.
- For advisories fixable only via major upgrades (breaking), create targeted PRs and run full CI and manual smoke tests.

Next actions:

- Merge lockfile-update PR (#21) after remote CI passes.
- Monitor PRs #23/#24/#26 CI runs; rebase if necessary and merge in order that keeps tests passing.
- Create additional targeted PRs for remaining transitive advisories if `npm audit` still reports high/critical items after merging these PRs.

Contact: automation@devops (robot) for follow-ups.
