test('module-load job tracking', () => {
  // eslint-disable-next-line global-require
  const mod = require('../app/job/tracking');
  expect(mod.default).toBeDefined();
});
