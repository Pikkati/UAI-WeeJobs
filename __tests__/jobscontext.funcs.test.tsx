import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { JobsProvider, useJobs } from '../context/JobsContext';

// Provide a user so JobsProvider functions run deterministically
// eslint-disable-next-line no-undef
(global as any).__TEST_USE_AUTH__ = () => ({ user: { id: 'u1' } });

// Ensure AuthContext hook resolves to a test user (module-level mocks)
jest.mock(
  '../context/AuthContext',
  () => ({ useAuth: () => ({ user: { id: 'u1' } }) }),
  { virtual: true },
);

// Provide a synchronous test cache so JobsProvider loads without remote fetch
// eslint-disable-next-line no-undef
(global as any).__TEST_JOBS_CACHE__ = [];

function CalcConsumer() {
  const { calculateDeposit } = useJobs();
  return (
    <>
      <Text testID="d1">{String(calculateDeposit())}</Text>
      <Text testID="d2">{String(calculateDeposit('£100'))}</Text>
      <Text testID="d3">{String(calculateDeposit('100'))}</Text>
      <Text testID="d4">{String(calculateDeposit('£20'))}</Text>
      <Text testID="d5">{String(calculateDeposit('£1000'))}</Text>
    </>
  );
}

function ActionConsumer() {
  const { getNextActionsByRole } = useJobs();
  const a1 = getNextActionsByRole('booked', 'customer', 'hourly');
  const a2 = getNextActionsByRole('booked', 'tradesperson', 'hourly');
  const a3 = getNextActionsByRole('completed', 'tradesperson');
  const a4 = getNextActionsByRole('paid', 'customer');
  return (
    <>
      <Text testID="a1">{a1.map((a) => a.label).join(',')}</Text>
      <Text testID="a2">{a2.map((a) => a.label).join(',')}</Text>
      <Text testID="a3">{a3.map((a) => a.label).join(',')}</Text>
      <Text testID="a4">{a4.map((a) => a.label).join(',')}</Text>
    </>
  );
}

describe('JobsContext helpers', () => {
  it('calculateDeposit returns expected values', () => {
    const utils = render(
      <JobsProvider>
        <CalcConsumer />
      </JobsProvider>,
    );

    expect(utils.getByTestId('d1').props.children).toBe('20');
    expect(utils.getByTestId('d2').props.children).toBe('10');
    expect(utils.getByTestId('d3').props.children).toBe('10');
    expect(utils.getByTestId('d4').props.children).toBe('10');
    expect(utils.getByTestId('d5').props.children).toBe('50');
  });

  it('getNextActionsByRole returns correct labels for roles and statuses', () => {
    const utils = render(
      <JobsProvider>
        <ActionConsumer />
      </JobsProvider>,
    );

    expect(utils.getByTestId('a1').props.children).toContain('View Estimate');
    expect(utils.getByTestId('a2').props.children).toContain('Send Estimate');
    expect(utils.getByTestId('a3').props.children).toContain('View Payout');
    expect(utils.getByTestId('a4').props.children).toContain(
      'Confirm Complete',
    );
  });
});
