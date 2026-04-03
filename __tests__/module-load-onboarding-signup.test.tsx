describe('module-load onboarding signup', () => {
  test('loads onboarding signup module', () => {
    const mod = require('../app/onboarding/signup').default;
    expect(typeof mod).toBe('function');
  });
});
