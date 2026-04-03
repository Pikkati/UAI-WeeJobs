describe('Smoke harness - quick module load', () => {
  test('requires core modules without rendering', () => {
    jest.resetModules();
    const mod1 = require('../app/index');
    const mod2 = require('../lib/supabase');
    const mod3 = require('../lib/analytics');
    const mod4 = require('../context/AuthContext');
    const mod5 = require('../context/JobsContext');
    expect(mod1).toBeDefined();
    expect(mod2).toBeDefined();
    expect(mod3).toBeDefined();
    expect(mod4).toBeDefined();
    expect(mod5).toBeDefined();
  });
});
