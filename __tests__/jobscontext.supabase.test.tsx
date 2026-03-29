import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { JobsProvider, useJobs } from '../context/JobsContext';

// Provide a user so JobsProvider functions run deterministically
// eslint-disable-next-line no-undef
(global as any).__TEST_USE_AUTH__ = () => ({ user: { id: 'u1', subscription_plan: 'pro' } });
// Ensure AuthContext hook resolves to a test user (module-level mocks)
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1', subscription_plan: 'pro' } }) }), { virtual: true });

// Provide a synchronous test cache so JobsProvider loads without remote fetch
// eslint-disable-next-line no-undef
(global as any).__TEST_JOBS_CACHE__ = [];

function TestInvoker() {
  const {
    expressInterest,
    fetchInterests,
    closeApplications,
    selectTradesman,
    sendEstimate,
    acknowledgeEstimate,
    sendQuote,
    approveQuote,
    sendInvoice,
    confirmCompletion,
    cancelJob,
  } = useJobs();

  const [out, setOut] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const ei = await expressInterest('job1', true, 10);
      const fi = await fetchInterests('job1');
      const ca = await closeApplications('job1');
      const st = await selectTradesman('job1', 'trad1', 'fixed');
      const se = await sendEstimate('job1', { hours: 2, hourlyRate: 20, materials: 10, total: 50 });
      const ae = await acknowledgeEstimate('job1');
      const sq = await sendQuote('job1', { labour: 100, materials: 10, notes: '', total: 110 });
      const aq = await approveQuote('job1');
      const si = await sendInvoice('job1', { hours: 1, hourlyRate: 20, materials: 5, total: 25 });
      const cc = await confirmCompletion('job1', 'customer');
      const cancel = await cancelJob('job1', 'customer', 'reason');
      setOut({ ei, fiLen: fi.length, ca, st, se, ae, sq, aq, si, cc, cancel });
    })();
  }, []);

  return <Text testID="out">{JSON.stringify(out)}</Text>;
}

describe('JobsContext supabase interactions', () => {
  it('resolves core supabase-backed functions without throwing', async () => {
    const utils = render(
      <JobsProvider>
        <TestInvoker />
      </JobsProvider>
    );

    await waitFor(() => {
      const el = utils.getByTestId('out').props.children;
      expect(el).not.toBeNull();
    }, { timeout: 3000 });

    const result = JSON.parse(utils.getByTestId('out').props.children);
    expect(result.ei).toBe(true);
    expect(result.fiLen).toBe(0);
    expect(result.ca).toBe(true);
    expect(result.st).toBe(true);
    expect(result.se).toBe(true);
    expect(result.ae).toBe(true);
    expect(result.sq).toBe(true);
    expect(result.aq).toBe(true);
    expect(result.si).toBe(true);
    expect(result.cc).toBe(true);
    expect(result.cancel).toBe(true);
  });
});
