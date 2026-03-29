import { aggregateInterestCounts } from '../app/customer/jobs';

describe('aggregateInterestCounts', () => {
  test('returns empty object for falsy input', () => {
    expect(aggregateInterestCounts(null as any)).toEqual({});
    expect(aggregateInterestCounts(undefined as any)).toEqual({});
  });

  test('counts occurrences and ignores rows without job_id', () => {
    const rows = [
      { job_id: 'j1' },
      { job_id: 'j2' },
      { job_id: 'j1' },
      { other: 'x' } as any,
    ];
    expect(aggregateInterestCounts(rows as any)).toEqual({ j1: 2, j2: 1 });
  });
});
