// Module-load test for onboarding intro screen
jest.mock('../lib/supabase', () => ({ supabase: {}, User: null, Review: null }));
jest.mock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [] }) }));
jest.mock('../context/ThemeContext', () => ({ useTheme: () => ({ theme: 'light' }) }));
describe('app/onboarding/intro module load', () => {
  it('requires without throwing', () => {
    // eslint-disable-next-line global-require
    const mod = require('../app/onboarding/intro');
    expect(mod).toBeTruthy();
  });
});
