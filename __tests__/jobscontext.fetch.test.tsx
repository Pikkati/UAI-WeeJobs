import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { JobsProvider, useJobs } from '../context/JobsContext';

// Provide a user so JobsProvider functions run (fallback for tests)
// eslint-disable-next-line no-undef
(global as any).__TEST_USE_AUTH__ = () => ({ user: { id: 'u1' } });

// Mock AsyncStorage to return cached jobs (ESM-compatible)
jest.mock(
  '@react-native-async-storage/async-storage',
  () => ({
    __esModule: true,
    default: {
      getItem: jest.fn(async (k) =>
        JSON.stringify([{ id: 'cached1', title: 'Cached Job' }]),
      ),
      setItem: jest.fn(async () => {}),
    },
  }),
  { virtual: true },
);

// Note: tests provide a `global.__TEST_SUPABASE__` override below so we avoid
// mocking the module shape here. The runtime `lib/supabase` module prefers the
// global override which produces a stable, chainable test supabase instance.
// Ensure AuthContext returns the test user
jest.mock(
  '../context/AuthContext',
  () => ({ useAuth: () => ({ user: { id: 'u1' } }) }),
  { virtual: true },
);

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

// Provide a synchronous test cache so JobsProvider can load cached jobs
// deterministically during tests (avoids AsyncStorage/mock timing issues).
// eslint-disable-next-line no-undef
(global as any).__TEST_JOBS_CACHE__ = [{ id: 'cached1', title: 'Cached Job' }];

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
      </JobsProvider>,
    );

    await waitFor(
      () => expect(utils.getByTestId('jobs-count').props.children).toBe(1),
      { timeout: 2000 },
    );
    expect(utils.getByTestId('loading').props.children).toBe('false');
  });
});
