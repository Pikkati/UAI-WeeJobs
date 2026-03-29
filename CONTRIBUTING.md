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

### Known linting limitation

We currently observe a known ESLint plugin resolver error when running `npx eslint` in some environments: `EslintPluginImportResolveError: typescript with invalid interface loaded as resolver`. This appears to be an upstream compatibility issue between `eslint-plugin-import` and the TypeScript resolver.

Workarounds:

- Run typechecking and tests locally instead of relying on full ESLint until upstream fixes the issue:

	```bash
	npm run typecheck
	npm test
	```

- See [docs/LINT_LIMITATIONS.md](docs/LINT_LIMITATIONS.md) for more details and troubleshooting steps.

If you can test or propose a fix (pinning versions, reproducer, or PR), please open a PR referencing this note.
