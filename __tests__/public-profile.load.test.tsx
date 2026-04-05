// Module-load test for public-profile
jest.mock('../lib/supabase', () => ({
  supabase: {},
  User: null,
  Review: null,
}));
jest.mock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [] }) }));
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));
describe('app/public-profile module load', () => {
  it('requires without throwing', () => {
    // eslint-disable-next-line global-require
    const mod = require('../app/public-profile');
    expect(mod).toBeTruthy();
  });
});
