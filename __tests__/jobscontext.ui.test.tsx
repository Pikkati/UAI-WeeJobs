import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import { JobsProvider, useJobs } from '../context/JobsContext';
import { Text, View } from 'react-native';

// Provide a user so JobsProvider will attempt to fetch; mock supabase to return empty lists
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1', role: 'customer' } }) }));

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

function DebugConsumer() {
  const ctx = useJobs();
  return (
    <View>
      <Text testID="jobs-count">{String(ctx.jobs.length)}</Text>
      <Text testID="loading">{String(ctx.loading)}</Text>
      <Text testID="deposit">{String(ctx.calculateDeposit('£150'))}</Text>
    </View>
  );
}

describe('JobsContext UI integration', () => {
  it('provides jobs state and calculation helpers to UI', async () => {
    const { getByTestId } = render(
      <JobsProvider>
        <DebugConsumer />
      </JobsProvider>
    );

    // wait for effects to settle
    await waitFor(() => expect(getByTestId('loading').props.children === 'false'));

    expect(getByTestId('jobs-count').props.children).toBe('0');
    expect(getByTestId('deposit').props.children).toBe('15');
  });
});
