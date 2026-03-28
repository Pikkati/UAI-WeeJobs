import { canEditOrDelete, getActionText } from '../app/customer/jobs.helpers';

describe('customer jobs helpers', () => {
  test('canEditOrDelete returns true for editable statuses', () => {
    expect(canEditOrDelete('open')).toBe(true);
    expect(canEditOrDelete('pending_customer_choice')).toBe(true);
    expect(canEditOrDelete('awaiting_customer_choice')).toBe(true);
  });

  test('canEditOrDelete returns false for non-editable statuses', () => {
    expect(canEditOrDelete('booked')).toBe(false);
    expect(canEditOrDelete('in_progress')).toBe(false);
    expect(canEditOrDelete('completed')).toBe(false);
  });

  test('getActionText returns interest prompt when open with interests', () => {
    const job: any = { id: 'j1', status: 'open' };
    expect(getActionText(job, { j1: 2 })).toBe('Tap to view interested tradespeople');
  });

  test('getActionText returns null when open without interests', () => {
    const job: any = { id: 'j1', status: 'open' };
    expect(getActionText(job, {})).toBeNull();
  });

  test('getActionText returns correct texts for other statuses', () => {
    expect(getActionText({ id: 'x', status: 'awaiting_quote_approval' } as any)).toBe('Tap to review the quote');
    expect(getActionText({ id: 'x', status: 'awaiting_final_payment' } as any)).toBe('Tap to complete payment');
    expect(getActionText({ id: 'x', status: 'booked' } as any)).toBe('Tap to track progress');
    expect(getActionText({ id: 'x', status: 'completed' } as any)).toBe('Tap to leave a review');
  });
});
