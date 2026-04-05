import { aggregateInterestCounts } from '../app/customer/jobs';

describe('aggregateInterestCounts', () => {
  it('counts job_ids correctly', () => {
    const rows = [
      { job_id: 'a' },
      { job_id: 'b' },
      { job_id: 'a' },
      {},
      { job_id: 'b' },
    ];

    const counts = aggregateInterestCounts(rows as any);
    expect(counts).toEqual({ a: 2, b: 2 });
  });

  it('returns empty object for falsy or invalid input', () => {
    // @ts-ignore
    expect(aggregateInterestCounts(null)).toEqual({});
    // @ts-ignore
    expect(aggregateInterestCounts(undefined)).toEqual({});
    expect(aggregateInterestCounts([])).toEqual({});
  });
});
