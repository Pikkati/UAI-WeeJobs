import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

// Provide a user so JobsProvider functions run (fallback for tests)
// eslint-disable-next-line no-undef
(global as any).__TEST_USE_AUTH__ = () => ({ user: { id: 'u1' } });

// Mock AsyncStorage to return cached jobs (ESM-compatible)
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k) => JSON.stringify([{ id: 'cached1', title: 'Cached Job' }])),
    setItem: jest.fn(async () => {}),
  },
}), { virtual: true });

// Mock supabase to simulate a network error when fetching jobs (ESM-compatible)
jest.mock('../lib/supabase', () => ({
  __esModule: true,
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(async () => ({ data: null, error: new Error('network') })),
      })),
    })),
  },
}), { virtual: true });
// Ensure AuthContext returns the test user
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }), { virtual: true });

// Provide a test supabase override (used by lib/supabase when loading)
// eslint-disable-next-line no-undef
(global as any).__TEST_SUPABASE__ = {
  from: (table: string) => ({
    select: () => ({
      order: async () => ({ data: null, error: new Error('network') }),
      eq: async () => ({ data: [], error: null }),
      in: async () => ({ data: [], error: null }),
      single: async () => ({ data: null, error: null }),
    }),
    update: async () => ({ data: [], error: null }),
    insert: async () => ({ data: [], error: null }),
  }),
  functions: { invoke: async () => ({ data: null, error: null }) },
};

import { JobsProvider, useJobs } from '../context/JobsContext';

function Consumer() {
  const { jobs, loading } = useJobs();
  return (
    <>
      <Text testID="loading">{String(loading)}</Text>
      <Text testID="jobs-count">{jobs.length}</Text>
    </>
  );
}

describe('JobsProvider fetch/caching', () => {
  it('loads cached jobs when Supabase fetch fails', async () => {
    const utils = render(
      <JobsProvider>
        <Consumer />
      </JobsProvider>
    );

    await waitFor(() => expect(utils.getByTestId('jobs-count').props.children).toBe(1), { timeout: 2000 });
    expect(utils.getByTestId('loading').props.children).toBe('false');
  });
});
