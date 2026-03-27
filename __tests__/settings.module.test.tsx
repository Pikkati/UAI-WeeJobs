// Module-load test for settings screen
jest.mock('../lib/supabase', () => ({ supabase: {}, User: null, Review: null }));
jest.mock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [] }) }));
jest.mock('../context/ThemeContext', () => ({ useTheme: () => ({ theme: 'light' }) }));
describe('app/settings module load', () => {
  it('requires without throwing', () => {
    // eslint-disable-next-line global-require
    const mod = require('../app/settings');
    expect(mod).toBeTruthy();
  });
});
