# Branch Protection Setup (admin steps)

These steps must be performed by a repository administrator in GitHub Settings → Branches.

1. Go to 'Branches' → 'Add rule' and enter `UAI-Development` as the branch name pattern.
2. Enable the following protections:
   - Require pull request reviews before merging (set to 1 or 2 reviewers).
   - Require status checks to pass before merging: ensure `CI` (and any other workflows you require) are selected.
   - Require branches to be up to date before merging (recommended).
   - Include administrators (optional: prevents admins from bypassing protections).
   - Do not allow force pushes and do not allow branch deletion.
3. Optionally restrict who can push to the branch to a team or set of users.
4. Save the rule.

Notes:

- Branch protection cannot be fully configured via code in a public repo without GitHub Admin API calls. These steps document the manual configuration required.
- After applying protections, verify by attempting a protected action or opening a PR to `UAI-Development`.
