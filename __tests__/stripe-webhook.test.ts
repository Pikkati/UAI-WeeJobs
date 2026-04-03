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

  it('handles payment_intent.canceled', async () => {
    const eq = jest.fn().mockResolvedValue({ data: [{ id: 'job456' }], error: null });
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    const supabaseMock = { from };

    const event = {
      type: 'payment_intent.canceled',
      data: {
        object: {
          id: 'pi_2',
          metadata: { job_id: 'job456' },
        },
      },
    };

    const result = await processStripeEvent(event, supabaseMock);
    expect(from).toHaveBeenCalledWith('jobs');
    expect(update).toHaveBeenCalledWith({
      stripe_payment_intent: 'pi_2',
      status: 'cancelled_by_customer',
    });
    expect(eq).toHaveBeenCalledWith('id', 'job456');
    expect(result).toEqual([{ id: 'job456' }]);
  });

  it('handles invoice.payment_failed', async () => {
    const eq = jest.fn().mockResolvedValue({ data: [{ id: 'job789' }], error: null });
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    const supabaseMock = { from };

    const event = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          metadata: { job_id: 'job789' },
          closed: true,
          failure_reason: 'card_declined',
        },
      },
    };

    const result = await processStripeEvent(event, supabaseMock);
    expect(from).toHaveBeenCalledWith('jobs');
    expect(update).toHaveBeenCalledWith({
      status: 'payment_failed',
      last_payment_error: 'invoice closed',
    });
    expect(eq).toHaveBeenCalledWith('id', 'job789');
    expect(result).toEqual([{ id: 'job789' }]);
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

  it('handles payment_intent.succeeded', async () => {
    const eq = jest.fn().mockResolvedValue({ data: [{ id: 'job999' }], error: null });
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    const supabaseMock = { from };

    const event = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_3',
          metadata: { job_id: 'job999', payment_type: 'final' },
          amount_received: 5000,
        },
      },
    };

    const result = await processStripeEvent(event, supabaseMock);

    expect(from).toHaveBeenCalledWith('jobs');
    expect(update).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'job999');
    expect(result).toEqual([{ id: 'job999' }]);
  });

  it('handles charge.refunded', async () => {
    const eq = jest.fn().mockResolvedValue({ data: [{ id: 'job555' }], error: null });
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    const supabaseMock = { from };

    const charge = {
      id: 'ch_1',
      metadata: { job_id: 'job555' },
    };

    const event = {
      type: 'charge.refunded',
      data: { object: charge },
    };

    const result = await processStripeEvent(event, supabaseMock);

    expect(from).toHaveBeenCalledWith('jobs');
    expect(update).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'job555');
    expect(result).toEqual([{ id: 'job555' }]);
  });
});
