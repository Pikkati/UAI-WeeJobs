const { processStripeEvent } = require('../scripts/stripe-webhook');

describe('processStripeEvent', () => {
  it('updates job status for payment_intent.payment_failed', async () => {
    const eq = jest.fn().mockResolvedValue({ data: [{ id: 'job123' }], error: null });
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    const supabaseMock = { from };

    const event = {
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_1',
          metadata: { job_id: 'job123' },
          last_payment_error: { message: 'card declined' },
        },
      },
    };

    const result = await processStripeEvent(event, supabaseMock);

    expect(from).toHaveBeenCalledWith('jobs');
    expect(update).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'job123');
    expect(result).toEqual([{ id: 'job123' }]);
  });

  it('returns null for unknown event type', async () => {
    const supabaseMock = { from: jest.fn() };
    const event = {
      type: 'some.random.event',
      data: { object: {} },
    };

    const result = await processStripeEvent(event, supabaseMock);
    expect(result).toBeNull();
  });
});
