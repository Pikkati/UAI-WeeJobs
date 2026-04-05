// Module-load test for customer index
jest.mock('../lib/supabase', () => ({
  supabase: {},
  User: null,
  Review: null,
}));
jest.mock('../context/JobsContext', () => ({ useJobs: () => ({ jobs: [] }) }));
describe('app/customer/index module load', () => {
  it('requires without throwing', () => {
    // eslint-disable-next-line global-require
    const mod = require('../app/customer/index');
    expect(mod).toBeTruthy();
  });
});
