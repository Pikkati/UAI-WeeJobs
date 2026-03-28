describe('module-load customer post-job', () => {
  test('loads customer post-job module', () => {
    const mod = require('../app/customer/post-job').default;
    expect(typeof mod).toBe('function');
  });
});
