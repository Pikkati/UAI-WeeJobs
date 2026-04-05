import { canEditOrDelete, getActionText, aggregateInterestCounts } from '../app/customer/jobs';

describe('Customer jobs helpers', () => {
  test('canEditOrDelete true for open and pending statuses', () => {
    expect(canEditOrDelete('open')).toBe(true);
    expect(canEditOrDelete('pending_customer_choice')).toBe(true);
    expect(canEditOrDelete('awaiting_customer_choice')).toBe(true);
    expect(canEditOrDelete('booked')).toBe(false);
  });

  test('getActionText returns correct hints', () => {
    expect(getActionText('open', 1)).toBe('Tap to view interested tradespeople');
    expect(getActionText('open', 0)).toBeNull();
    expect(getActionText('awaiting_customer_choice', 0)).toBe('Tap to choose your tradesperson');
    expect(getActionText('awaiting_quote_approval', 0)).toBe('Tap to review the quote');
    expect(getActionText('booked', 0)).toBe('Tap to track progress');
    expect(getActionText('completed', 0)).toBe('Tap to leave a review');
    expect(getActionText('some_unknown' as any, 0)).toBeNull();
  });

  test('aggregateInterestCounts counts job_id occurrences', () => {
    const rows = [
      { job_id: 'j1' },
      { job_id: 'j2' },
      { job_id: 'j1' },
      { job_id: undefined },
      {},
    ];
    const counts = aggregateInterestCounts(rows as any);
    expect(counts.j1).toBe(2);
    expect(counts.j2).toBe(1);
    expect(Object.keys(counts)).toHaveLength(2);
  });
});
