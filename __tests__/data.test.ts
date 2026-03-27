import { JOB_CATEGORIES } from '../constants/data';

describe('constants/data', () => {
  test('JOB_CATEGORIES includes Plumbing', () => {
    expect(JOB_CATEGORIES).toContain('Plumbing');
  });
});
