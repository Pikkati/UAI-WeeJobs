// Module-load test for app index
jest.mock('../lib/supabase', () => ({ supabase: {}, User: null, Review: null }));
jest.mock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [] }) }));
jest.mock('../context/ThemeContext', () => ({ useTheme: () => ({ theme: 'light' }) }));
describe('app/index module load', () => {
  it('requires without throwing', () => {
    // eslint-disable-next-line global-require
    const mod = require('../app/index');
    expect(mod).toBeTruthy();
  });
});
