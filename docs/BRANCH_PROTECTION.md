## Branch protection guidance for remediation branches

Recommendations:

- Create a branch protection rule for `chore/remediate/*` that:
  - Requires status checks to pass (at least `CI - Node Matrix` and any required triage jobs).
  - Allows maintainers to push or bypass rules when an emergency fix is required.
  - Enables required reviewers (1-2) for dependency updates.
  - Optionally require signed commits if your org enforces them.

- Add a short note in repository Settings > Branch protection rules `Description` field reminding contributors to run `npm run test:q` when using local CI emulation (see `CONTRIBUTING.md`).

- Automations:
  - Consider enabling Dependabot auto-merge for low-risk updates (patch/minor) after CI passes.
  - Use enforcement only for active remediation branches; keep `main` protections stricter (e.g., require release gating and changelog checks).
