// Module-load test for customer dashboard module
jest.mock('../lib/supabase', () => ({ supabase: {}, User: null, Review: null }));
jest.mock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [] }) }));
jest.mock('../context/ThemeContext', () => ({ useTheme: () => ({ theme: 'light' }) }));
describe('app/customer/dashboard module load', () => {
  it('requires without throwing', () => {
    // eslint-disable-next-line global-require
    const mod = require('../app/customer/dashboard');
    expect(mod).toBeTruthy();
  });
});
