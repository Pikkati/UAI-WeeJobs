// Module-load test for ThemeContext
jest.mock('../lib/supabase', () => ({ supabase: {}, User: null, Review: null }));
describe('context/ThemeContext module load', () => {
  it('requires without throwing and exports useTheme', () => {
    // eslint-disable-next-line global-require
    const mod = require('../context/ThemeContext');
    expect(mod).toBeTruthy();
    expect(typeof mod.useTheme === 'function' || typeof mod.default === 'object').toBeTruthy();
  });
});
