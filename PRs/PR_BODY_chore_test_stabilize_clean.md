Title: test: stabilize Jest — chainable supabase mock & Expo mocks

Summary
-------
This PR introduces a set of test-time improvements to make the Jest suite stable and deterministic in CI and locally.

Key changes
-----------
- Add a chainable Supabase mock at `__mocks__/lib/supabase.js` to support `.from(...).insert/.select` and chaining (`eq`, `match`, `single`).
- Add lightweight Expo/React Native test mocks:
  - `__mocks__/expo-image.js`
  - `__mocks__/expo-image-picker.js`
  - `__mocks__/expo-font.js`
  - `__mocks__/expo-vector-icons.js`
  - `__mocks__/expo-linear-gradient.js`
  - `__mocks__/async-storage.js` (for `@react-native-async-storage/async-storage`)
- Update `jest.config.cjs` to map the above mocks via `moduleNameMapper`.
- Set `IS_REACT_ACT_ENVIRONMENT` in `jest-setup.js` to reduce act() warnings in React 18+/19 tests.
- Add a smoke harness `__tests__/smoke.harness.test.tsx` and an npm script `test:smoke` for quick validation.

Testing
-------
- Ran the full Jest suite locally (`--runInBand`) — all tests passed in my environment.
- Added smoke test to catch regressions quickly.

Notes
-----
- This PR is intentionally focused and avoids touching large build artifacts (I created a separate, focused branch).
- I did not bump `jest-expo` here; there's a separate PR draft for the `jest-expo` upgrade under `PRs/chore-upgrade-jest-expo-55.md`.

How to test locally
-------------------
Run the smoke test:

```bash
npm run test:smoke
```

Or run the full test suite:

```bash
node ./node_modules/jest/bin/jest.js --config=jest.config.cjs --runInBand
```

If you prefer the web UI, create a PR review request for `chore/test-stabilize-clean` and trigger CI via GitHub Actions.
