Summary:

- Implement admin role guard in app/admin/_layout.tsx to redirect non-admin users to /customer.
- Add tests under __tests__ for admin access, users, messages, post-job flows, pricing, and related mocks.
- Fixes to mocks (deduplicate expo-linear-gradient, react-native mock tweaks) and add testIDs/initialNumToRender for FlatList stability.
- Ran full test suite locally: 21 suites, 30 tests passed.

Notes:

- Some tests include FlatList sync render workarounds; consider centralizing them in Jest setup.
- ESLint configuration updated; see docs/LINT_LIMITATIONS.md for details.
