test('module-load customer jobs', () => {
  // Require module without rendering to avoid invoking hooks
  // eslint-disable-next-line global-require
  const mod = require('../app/customer/jobs');
  expect(mod.default).toBeDefined();
});
