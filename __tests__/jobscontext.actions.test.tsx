import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react-native';

import { JobsProvider, useJobs } from '../context/JobsContext';

// Provide a user so JobsProvider functions run (fallback for tests)
// eslint-disable-next-line no-undef
(global as any).__TEST_USE_AUTH__ = () => ({ user: { id: 'u1', subscription_plan: 'basic' } });

// Provide a test-global supabase mock used by lib/supabase
// eslint-disable-next-line no-undef
(global as any).__TEST_SUPABASE__ = (() => {
  const insertMock = jest.fn(async () => ({ data: { id: '1' }, error: null }));

  const from = (table: string) => {
    const baseResult = { data: null, error: null };

    const thenableResult = () => {
      const p = Promise.resolve(baseResult);
      const obj: any = {
        then: (onFulfill: any, onReject: any) => p.then(onFulfill, onReject),
        // allow further chaining
        neq: async () => baseResult,
        eq: async () => baseResult,
      };
      return obj;
    };

    return {
      insert: insertMock,
      update: () => ({ eq: () => thenableResult() }),
      select: () => ({
        order: async () => ({ data: [], error: null }),
        eq: () => ({ in: async () => ({ data: table === 'job_interests' ? new Array(5).fill(0).map((_, i) => ({ id: i + 1 })) : [], error: null }) }),
      }),
    };
  };

  return { from, functions: { invoke: async () => ({ data: null, error: null }) } };
})();

// Ensure AuthContext useAuth returns the test user (explicit mock optional)
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1', subscription_plan: 'basic' } }) }), { virtual: true });

const captured: any = {};

function Invoker() {
  const ctx = useJobs();
  useEffect(() => {
    (async () => {
      captured.express = await ctx.expressInterest('job1', true, 10);
      captured.select = await ctx.selectTradesman('job1', 't1', 'fixed');
      captured.cancel = await ctx.cancelJob('job1', 'customer', 'no longer needed');
    })();
  }, [ctx]);
  return null;
}

describe('JobsContext action flows', () => {
  it.skip('expressInterest/selectTradesman/cancelJob resolve true', async () => {
    await render(
      <JobsProvider>
        <Invoker />
      </JobsProvider>
    );

    // wait for async effects to complete and assertions to settle
    await waitFor(() => {
      expect(captured.express).toBe(true);
      expect(captured.select).toBe(true);
      expect(captured.cancel).toBe(true);
    }, { timeout: 5000 });
  });

  afterAll(() => {
    // Clean up global state to avoid pollution
    delete (global as any).__TEST_USE_AUTH__;
    delete (global as any).__TEST_SUPABASE__;
  });
});
