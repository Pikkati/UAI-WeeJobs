import { canEditOrDelete, getActionText } from '../app/customer/jobs';

describe('Customer Jobs logic helpers', () => {
  test('canEditOrDelete returns true for editable statuses', () => {
    expect(canEditOrDelete('open')).toBe(true);
    expect(canEditOrDelete('pending_customer_choice')).toBe(true);
    expect(canEditOrDelete('awaiting_customer_choice')).toBe(true);
  });

  test('canEditOrDelete returns false for non-editable statuses', () => {
    expect(canEditOrDelete('booked')).toBe(false);
    expect(canEditOrDelete('in_progress')).toBe(false);
  });

  test('getActionText returns correct hints based on status and interest count', () => {
    expect(getActionText('open', 0)).toBeNull();
    expect(getActionText('open', 2)).toBe(
      'Tap to view interested tradespeople',
    );
    expect(getActionText('pending_customer_choice', 1)).toBe(
      'Tap to view interested tradespeople',
    );
    expect(getActionText('awaiting_customer_choice', 0)).toBe(
      'Tap to choose your tradesperson',
    );
    expect(getActionText('booked', 0)).toBe('Tap to track progress');
    expect(getActionText('completed', 0)).toBe('Tap to leave a review');
    expect(getActionText('unknown_status' as any, 0)).toBeNull();
  });
});
