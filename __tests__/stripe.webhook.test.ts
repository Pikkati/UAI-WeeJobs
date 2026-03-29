import { processStripeEvent } from '../scripts/stripe-webhook';

describe('Stripe webhook processing', () => {
  it('handles payment_intent.succeeded with job_id and updates DB', async () => {
    const mockEq = jest.fn(async () => ({ data: [{ id: 'job-123' }], error: null }));
    const mockUpdate = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ update: mockUpdate }));
    const mockSupabase = { from: mockFrom } as any;

    const event = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          metadata: { job_id: 'job-123', payment_type: 'deposit' },
          amount_received: 5000,
        },
      },
    } as any;

    const result = await processStripeEvent(event, mockSupabase);

    expect(mockFrom).toHaveBeenCalledWith('jobs');
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 'job-123');
    expect(result).toEqual([{ id: 'job-123' }]);
  });

  it('handles charge.refunded and updates DB via upsertJobRefund', async () => {
    const mockEq = jest.fn(async () => ({ data: [{ id: 'job-456' }], error: null }));
    const mockUpdate = jest.fn(() => ({ eq: mockEq }));
    const mockFrom = jest.fn(() => ({ update: mockUpdate }));
    const mockSupabase = { from: mockFrom } as any;

    const event = {
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_123',
          metadata: { job_id: 'job-456' },
        },
      },
    } as any;

    const result = await processStripeEvent(event, mockSupabase);

    expect(mockFrom).toHaveBeenCalledWith('jobs');
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', 'job-456');
    expect(result).toEqual([{ id: 'job-456' }]);
  });
});
