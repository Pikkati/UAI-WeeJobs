## Pull Request Checklist

Please ensure changes meet the repository standards before requesting review.

- [ ] **Description:** PR has a clear, descriptive title and summary of changes.
- [ ] **Scope:** Changes are limited to a single concern and follow project style.
- [ ] **Typecheck:** Ran `npm run typecheck` and fixed any issues.
- [ ] **Tests:** Added/updated tests where appropriate and ran `npm test`.
- [ ] **Lint:** Ran `npm run lint` locally. If you hit the known ESLint resolver issue, see CONTRIBUTING.md and docs/LINT_LIMITATIONS.md for workarounds.
- [ ] **CI:** Confirm CI is green and link the CI run in the PR description.
- [ ] **Docs:** Updated README or other docs if behavior or config changed.
- [ ] **Secrets:** Documented any CI secret changes in `CI_SECRETS.md` if applicable.

### What changed

Provide a short description of the change and why it was necessary.

### How to test

Provide steps to reproduce or validate the changes locally (commands, env vars, test cases).

### Reviewer notes

Anything reviewers should pay special attention to (edge cases, performance, security).
<!-- Describe the change in a single sentence -->
### Summary

<!-- Why is this change required? Provide link to the issue. -->

### Checklist
- [ ] PR targets `UAI-Development` branch
- [ ] Tests added / updated
- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes locally (or use `npm run test:q`)
- [ ] Changelog updated if version bump
- [ ] CI badges passing

### Notes for reviewers

<!-- Additional context -->
## Pull Request Checklist

- **Base branch:** Target the `UAI-Development` branch for all feature, audit, and upgrade PRs. Do not open work directly against `main`.
- **Describe:** Add a short description of the change.
- **Tests:** Ensure `npm test` passes locally and include any test notes.
- **Changelog:** Add notes if this changes behavior or public APIs.
- **Reviewer:** Assign at least one reviewer.

If changes were accidentally opened against `main`, please close that PR and re-open it targeting `UAI-Development`.
