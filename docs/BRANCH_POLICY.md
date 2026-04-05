# Branch Policy and Protection (UAI-Development)

This repository uses a protected working branch named `UAI-Development` for all active
development, audits, and dependency/upgrade work. `main` is reserved for stable releases.

Required settings (manual steps in GitHub repository settings):

- Protect branch `UAI-Development`:
  - Require pull request reviews before merging (1 or 2 reviewers).
  - Require status checks to pass before merging: `CI` and any other required workflows.
  - Require branches to be up to date before merging (optional but recommended).
  - Restrict who can push to the branch (admins can override if needed).
  - Disallow force pushes and branch deletion.

- CODEOWNERS is configured to request reviews for core areas (see `.github/CODEOWNERS`).

Recommended workflow for contributors:

1. Create a short-lived feature branch from `UAI-Development`, use the `feature/` or
   `audit/` prefix when appropriate (e.g., `feature/payment-webhook` or `audit/jest-upgrade`).
2. Run `npm test` and `npx tsc --noEmit` locally and fix issues before opening a PR.
3. Open a PR targeting `UAI-Development` and include testing notes and CI output.
4. Assign reviewers; ensure code owners are requested where applicable.
5. After approval and passing status checks, merge using the repository's merge policy.

If a change was accidentally merged into `main`:

- Create a backup branch from `main` for the mistaken commit (e.g., `backup/main-YYYYMMDD`).
- Reset `main` to the intended stable commit using `git reset --hard <commit>` and push.
- Re-open a PR from a branch based on `UAI-Development` with the intended changes.

Notes for automation and CI:

- CI workflows are configured to run on `UAI-Development` pushes and PRs targeting `UAI-Development`.
- Automation agents should create branches under `audit/` or `feature/` and open PRs targeting `UAI-Development`.
