# Design tokens

This file documents the project's design token exports and how to verify them in CI.

Exports (from `constants/design-tokens.ts`):

- `Colors` — color palette values (hex strings)
- `Spacing` — numeric spacing scale
- `BorderRadius` — radii tokens

Verification

Add a simple Jest test that imports `constants/design-tokens.ts` and asserts the expected exports are present. The test in `__tests__/design-tokens.export.test.ts` performs this check.

CLI

To perform a quick assets check locally run:

```bash
node scripts/optimize-assets.js --max 500000
```

The CI job will run the test-suite which includes the design-tokens verification.
