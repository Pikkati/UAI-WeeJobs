// Import the module to exercise its file-level export for coverage.
test('useColorScheme module loads without error', () => {
  require('../hooks/useColorScheme');
  expect(true).toBe(true);
});
