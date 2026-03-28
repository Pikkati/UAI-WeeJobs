describe('module-load admin index', () => {
  test('loads admin index module', () => {
    const mod = require('../app/admin/index').default;
    expect(typeof mod).toBe('function');
  });
});
