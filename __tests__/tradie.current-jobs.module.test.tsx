import TradieCurrentJobsScreen from '../app/tradie/current-jobs';

describe('TradieCurrentJobs module', () => {
  test('loads without throwing and default export is a function', () => {
    expect(typeof TradieCurrentJobsScreen).toBe('function');
  });
});
