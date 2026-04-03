test('module-load chat [jobId]', () => {
  // eslint-disable-next-line global-require
  const mod = require('../app/chat/[jobId]');
  expect(mod.default).toBeDefined();
});
