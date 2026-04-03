import JobTrackingScreen from '../app/job/tracking';

describe('JobTracking module', () => {
  test('loads without throwing and default export is a function', () => {
    expect(typeof JobTrackingScreen).toBe('function');
  });
});
