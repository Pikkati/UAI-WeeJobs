// Module-load test for admin index
jest.mock('../lib/supabase', () => ({
  supabase: {},
  User: null,
  Review: null,
}));
jest.mock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [] }) }));
jest.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light' }),
}));
describe('app/admin/index module load', () => {
  it('requires without throwing', () => {
    // eslint-disable-next-line global-require
    const mod = require('../app/admin/index');
    expect(mod).toBeTruthy();
  });
});
