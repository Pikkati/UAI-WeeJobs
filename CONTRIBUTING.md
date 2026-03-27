## Contributing

Thanks for contributing! A few guidelines to help keep CI stable and reviews fast.

- When running tests locally in watch mode, use the provided helper to auto-quit Jest:

```bash
npm run test:q
```

This will run tests and send `q` to Jest to exit once the run completes (useful for CI emulation and local runs).

- For dependency updates, follow the dependency policy in `docs/DEPENDENCY_POLICY.md` and include a changelog entry when bumping versions.

- Add meaningful PR descriptions and include a checklist (see PR template).

If you need help setting repo secrets for CI, see `CI_SECRETS.md`.

- Maintainers: consider adding a short note in your branch protection rules for remediation branches (e.g. `chore/remediate/*`) recommending contributors use `npm run test:q` when running CI-emulated checks locally to reduce flaky watch-state issues.
