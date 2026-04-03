import { getStatusDescription, getCancelRefundMessage } from '../app/job/tracking';

describe('getStatusDescription', () => {
  it('returns human text for known statuses', () => {
    expect(getStatusDescription('booked')).toMatch(/Job booked/i);
    expect(getStatusDescription('in_progress')).toMatch(/Work in progress/i);
    expect(getStatusDescription('completed')).toMatch(/Job completed/i);
  });

  it('returns empty string for unknown status', () => {
    // @ts-ignore - pass an unlikely value to exercise default
    expect(getStatusDescription('unknown_status')).toBe('');
  });
});

describe('getCancelRefundMessage', () => {
  it('returns full-refund message when job is booked', () => {
    const { depositText, refundMessage } = getCancelRefundMessage('booked', 25);
    expect(depositText).toBe('£25.00 deposit');
    expect(refundMessage).toMatch(/full refund/i);
  });

  it('returns non-refundable message when not booked', () => {
    const { depositText, refundMessage } = getCancelRefundMessage('on_the_way');
    expect(depositText).toBe('your deposit');
    expect(refundMessage).toMatch(/non-refundable/i);
  });
});

