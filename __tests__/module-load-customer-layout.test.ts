test('module-load customer _layout', () => {
  // Ensure the customer layout module loads without running navigation side-effects
  // eslint-disable-next-line global-require
  const mod = require('../app/customer/_layout');
  expect(mod.default).toBeDefined();
});
