# ESLint plugin resolver — Known issue & temporary workarounds

## Summary

When running ESLint in this repository some environments produce an error similar to:

```
EslintPluginImportResolveError: typescript with invalid interface loaded as resolver
```

This appears to be an upstream compatibility issue between `eslint-plugin-import` (and its resolver) and certain installed TypeScript/resolver versions.

## Recommended temporary steps

1. Prefer typechecking and tests for local validation until an upstream fix is available:

```bash
npm run typecheck
npm test
```

2. If you must run ESLint locally, run it narrowly (changed files or single packages) to reduce exposure to the resolver bug.

3. If CI is blocked by this error, you can temporarily relax or skip the lint step in CI while keeping `typecheck` and `test` gates active. Add an explicit note in the PR explaining the temporary bypass and link to this document.

## How to help fix this

- Run `npm ls eslint-plugin-import` and `npm ls eslint-import-resolver-typescript` and include the output when opening an issue or pull request.
- If you identify a compatible set of package versions that avoid the error, propose a small, well-tested PR pinning those versions.

## Notes

This is a temporary workaround entry. Remove or update this document once an upstream fix is released and CI/linting succeed normally.
