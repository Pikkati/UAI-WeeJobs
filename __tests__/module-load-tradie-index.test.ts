describe('module-load tradie index', () => {
  test('loads tradie index module', () => {
    const mod = require('../app/tradie/index').default;
    expect(typeof mod).toBe('function');
  });
});
