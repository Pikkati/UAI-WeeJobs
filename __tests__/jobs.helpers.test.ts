import { canEditOrDelete, getActionText, STATUS_LABELS } from '../app/customer/jobs.helpers';

describe('jobs.helpers', () => {
  it('canEditOrDelete returns true for open/pending/awaiting_customer_choice', () => {
    expect(canEditOrDelete('open' as any)).toBe(true);
    expect(canEditOrDelete('pending_customer_choice' as any)).toBe(true);
    expect(canEditOrDelete('awaiting_customer_choice' as any)).toBe(true);
    expect(canEditOrDelete('booked' as any)).toBe(false);
  });

  it('getActionText uses interestCounts and job status to return hints', () => {
    const job = { id: 'j1', status: 'open' } as any;
    expect(getActionText(job, { j1: 2 })).toContain('Tap to view interested tradespeople');
    expect(getActionText({ ...job, status: 'awaiting_quote_approval' }, {})).toContain('review the quote');
    expect(getActionText({ ...job, status: 'completed' }, {})).toContain('leave a review');
  });

  it('STATUS_LABELS contains friendly labels for common statuses', () => {
    expect(STATUS_LABELS.open).toBeDefined();
    expect(STATUS_LABELS.awaiting_final_payment).toBeDefined();
  });
});
