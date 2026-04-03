describe('module-load job layout', () => {
  test('loads job _layout module', () => {
    const mod = require('../app/job/_layout').default;
    expect(typeof mod).toBe('function');
  });
});
