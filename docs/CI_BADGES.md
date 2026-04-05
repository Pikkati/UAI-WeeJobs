## Branch-specific CI badges

You can create a branch-specific status badge for a workflow using the following pattern:

- Workflow badge URL (replace placeholders):
  https://github.com/<owner>/<repo>/actions/workflows/<workflow-file>/badge.svg?branch=<branch>

Example for the `release-dry-run.yml` workflow on branch `chore/remediate/deps-2026-03-25`:

https://github.com/getnudged/weejobs/actions/workflows/release-dry-run.yml/badge.svg?branch=chore/remediate/deps-2026-03-25

Notes:

- GitHub does not support wildcard branch badges directly. For dynamic badges per matching branch pattern (e.g. `chore/remediate/*`), generate badges programmatically (CI job or external service) based on the branch name and commit SHA.
- Alternatively maintainers can add a small badge per active remediation branch in the README or a status page.
