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
