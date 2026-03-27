# Dependency Update Policy

Purpose: define safe practices for updating dependencies to balance security, stability, and speed.

Policy:

- Classify updates: `patch` (non-breaking), `minor` (additive), `major` (potential breaking).
- Apply `patch` and `minor` updates regularly (weekly/bi-weekly). For `major` updates, open a dedicated PR and run full CI locally with `act`.
- For vulnerability fixes (npm audit high/critical), prioritize minimal, well-tested upgrades or apply mitigations.

PR Requirements:

- Include a changelog entry for user-facing changes or version bumps.
- Run `npx tsc --noEmit` and `npm test` locally; prefer `npm run test:q` when running in watch environments.
- If CI fails due to environment/billing, notify maintainers and consider backporting fixes to release branches.

Automation:

- Dependabot or Renovate may be used; configure them to open grouped PRs and target `UAI-Development`.
- Use the weekly audit snapshot artifact to monitor vulnerability trends.
