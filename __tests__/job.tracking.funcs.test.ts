import {
  getStatusDescription,
  getCancelRefundMessage,
} from '../app/job/tracking';

describe('Job tracking helpers', () => {
  test('getStatusDescription returns human text for known statuses', () => {
    expect(getStatusDescription('booked')).toContain('Job booked');
    expect(getStatusDescription('completed')).toBe('Job completed!');
    expect(getStatusDescription('unknown' as any)).toBe('');
  });

  test('getCancelRefundMessage formats deposit and refund text', () => {
    const noDeposit = getCancelRefundMessage('booked');
    expect(noDeposit.depositText).toBe('your deposit');
    expect(noDeposit.refundMessage).toContain('full refund');

    const withDeposit = getCancelRefundMessage('on_the_way', 20.5);
    expect(withDeposit.depositText).toBe('£20.50 deposit');
    expect(withDeposit.refundMessage).toContain('non-refundable');
  });
});
