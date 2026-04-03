test('module-load customer edit-job', () => {
  // eslint-disable-next-line global-require
  const mod = require('../app/customer/edit-job');
  expect(mod.default).toBeDefined();
});
