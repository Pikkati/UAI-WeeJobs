// Module-load test for customer jobs screen
jest.mock('../lib/supabase', () => ({
  supabase: {},
  User: null,
  Review: null,
}));
jest.mock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [] }) }));
describe('app/customer/jobs module load', () => {
  it('requires without throwing', () => {
    // eslint-disable-next-line global-require
    const mod = require('../app/customer/jobs');
    expect(mod).toBeTruthy();
  });
});
