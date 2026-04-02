import { canEditOrDelete, getActionText } from '../lib/helpers/customer.jobs.helpers';

describe('customer/jobs.helpers', () => {
  describe('canEditOrDelete', () => {
    it('returns true for editable statuses', () => {
      expect(canEditOrDelete('open')).toBe(true);
      expect(canEditOrDelete('pending_customer_choice')).toBe(true);
      expect(canEditOrDelete('awaiting_customer_choice')).toBe(true);
    });

    it('returns false for non-editable statuses', () => {
      expect(canEditOrDelete('booked')).toBe(false);
      expect(canEditOrDelete('completed')).toBe(false);
    });
  });

  describe('getActionText', () => {
    const baseJob = { id: 'job1', status: 'open' } as any;

    it('returns interested text when there are interests', () => {
      const text = getActionText(baseJob, { job1: 2 });
      expect(text).toBe('Tap to view interested tradespeople');
    });

    it('returns null for open when no interests', () => {
      const text = getActionText({ ...baseJob, status: 'open' }, {});
      expect(text).toBeNull();
    });

    it('returns correct texts for other statuses', () => {
      expect(getActionText({ ...baseJob, status: 'awaiting_customer_choice' } as any)).toBe('Tap to choose your tradesperson');
      expect(getActionText({ ...baseJob, status: 'awaiting_quote_approval' } as any)).toBe('Tap to review the quote');
      expect(getActionText({ ...baseJob, status: 'awaiting_final_payment' } as any)).toBe('Tap to complete payment');
      expect(getActionText({ ...baseJob, status: 'booked' } as any)).toBe('Tap to track progress');
      expect(getActionText({ ...baseJob, status: 'completed' } as any)).toBe('Tap to leave a review');
      // @ts-ignore - exercise default
      expect(getActionText({ ...baseJob, status: 'unknown_status' } as any)).toBeNull();
    });
  });
});


