# Audit and Branch Naming Conventions

Use these conventions to keep long-running maintenance and audit work discoverable:

- Prefix branches with `audit/` for security, dependency, or toolchain audits. Example: `audit/jest-upgrade`.
- Prefix feature branches with `feature/` or `fix/` for fixes and feature work. Example: `feature/payment-webhook`.
- Short-lived branches: prefer concise names under 50 characters and reference the task or ticket ID when applicable (e.g., `feature/123-add-stripe`).
- When automation creates branches (bots, upgrade tools), use `audit/` or `automation/` prefixes and include the agent name: `audit/dep-update-bot/npm-2026-03-25`.

PRs from `audit/*` branches should target `UAI-Development` and include:

- A short summary of the audit/change
- Test steps and CI status
- Any migration steps and roll-back notes
