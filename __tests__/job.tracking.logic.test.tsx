import {
  getStatusDescription,
  getCancelRefundMessage,
} from '../app/job/tracking';

describe('Job tracking helpers', () => {
  test('getStatusDescription returns expected labels', () => {
    expect(getStatusDescription('booked')).toBe(
      'Job booked - waiting for tradesperson',
    );
    expect(getStatusDescription('on_the_way')).toBe(
      'Tradesperson is on the way',
    );
    expect(getStatusDescription('completed')).toBe('Job completed!');
    expect(getStatusDescription('unknown' as any)).toBe('');
  });

  test('getCancelRefundMessage formats deposit and refund message', () => {
    const r1 = getCancelRefundMessage('booked', 30);
    expect(r1.depositText).toBe('£30.00 deposit');
    expect(r1.refundMessage).toContain('full refund');

    const r2 = getCancelRefundMessage('on_the_way');
    expect(r2.depositText).toBe('your deposit');
    expect(r2.refundMessage).toContain('non-refundable');
  });
});
