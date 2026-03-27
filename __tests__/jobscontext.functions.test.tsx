import React, { useEffect } from 'react';
import { render } from '@testing-library/react-native';

// Ensure AuthContext returns no user so JobsProvider doesn't call fetchJobs
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: null }) }));

// Provide a lightweight virtual mock for ../lib/supabase to avoid creating a real client
jest.mock('../lib/supabase', () => {
  const noopResult = Promise.resolve({ data: [], error: null });
  const chainable = () => ({ select: () => ({ order: () => noopResult, eq: () => noopResult, in: () => noopResult, single: () => noopResult }), update: () => noopResult, insert: () => noopResult });
  return {
    supabase: {
      from: chainable,
      functions: { invoke: async () => ({ data: null, error: null }) },
    },
    Job: undefined,
    JobStatus: undefined,
    JobInterest: undefined,
    Quote: undefined,
    PricingType: undefined,
  };
}, { virtual: true });

import { JobsProvider, useJobs } from '../context/JobsContext';

let captured: any = {};

function TestConsumer() {
  const ctx = useJobs();
  useEffect(() => {
    captured.getNextCustomer = ctx.getNextActionsByRole('booked', 'customer');
    captured.getNextTrades = ctx.getNextActionsByRole('booked', 'tradesperson');
    captured.depositDefault = ctx.calculateDeposit();
    captured.depositSmall = ctx.calculateDeposit('£30');
    captured.depositMedium = ctx.calculateDeposit('£200');
    captured.depositLarge = ctx.calculateDeposit('£600');
  }, [ctx]);
  return null;
}

describe('JobsContext functions (pure behavior)', () => {
  test('calculateDeposit and getNextActionsByRole behave as expected', async () => {
    render(
      <JobsProvider>
        <TestConsumer />
      </JobsProvider>
    );

    // Allow effects to run
    await new Promise((r) => setTimeout(r, 10));

    expect(captured.depositDefault).toBe(20);
    expect(captured.depositSmall).toBe(10);
    expect(captured.depositMedium).toBe(20);
    expect(captured.depositLarge).toBe(50);

    expect(Array.isArray(captured.getNextCustomer)).toBeTruthy();
    expect(captured.getNextCustomer.some((b: any) => b.action === 'track_job' || b.action === 'choose_tradesperson')).toBeTruthy();

    expect(Array.isArray(captured.getNextTrades)).toBeTruthy();
    expect(captured.getNextTrades.some((b: any) => b.action === 'send_estimate' || b.action === 'start_navigation')).toBeTruthy();
  });
});
