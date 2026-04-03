// Module-load test for tradie index
jest.mock('../lib/supabase', () => ({ supabase: {}, User: null, Review: null }));
jest.mock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [] }) }));
jest.mock('../context/ThemeContext', () => ({ useTheme: () => ({ theme: 'light' }) }));
describe('app/tradie/index module load', () => {
  it('requires without throwing', () => {
    // eslint-disable-next-line global-require
    const mod = require('../app/tradie/index');
    expect(mod).toBeTruthy();
  });
});
