// Module-load test for JobsContext
jest.mock('../lib/supabase', () => ({ supabase: {}, User: null, Review: null }));
describe('context/JobsContext module load', () => {
  it('requires without throwing and exports useJobs', () => {
    // eslint-disable-next-line global-require
    const mod = require('../context/JobsContext');
    expect(mod).toBeTruthy();
    expect(typeof mod.useJobs === 'function' || typeof mod.default === 'object').toBeTruthy();
  });
});
