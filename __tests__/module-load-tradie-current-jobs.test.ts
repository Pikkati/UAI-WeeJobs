test('module-load tradie current jobs', () => {
  // eslint-disable-next-line global-require
  const mod = require('../app/tradie/current-jobs');
  expect(mod.default).toBeDefined();
});
