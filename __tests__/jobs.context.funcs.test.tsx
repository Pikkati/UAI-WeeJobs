import React from 'react';
import { render } from '@testing-library/react-native';

// Provide a minimal AuthContext so JobsProvider initializes without network
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1', subscription_plan: 'payg' } }),
}), { virtual: true });

import { JobsProvider, useJobs } from '../context/JobsContext';
import { Text } from 'react-native';

function TestConsumer() {
  const ctx = useJobs();

  const custBooked = ctx.getNextActionsByRole('booked', 'customer', 'fixed');
  const tradieBookedHourly = ctx.getNextActionsByRole('booked', 'tradesperson', 'hourly');
  const depDefault = ctx.calculateDeposit();
  const depLarge = ctx.calculateDeposit('£500');
  const depSmall = ctx.calculateDeposit('£50');

  return (
    <>
      <Text>{custBooked.map(a => a.label).join(',')}</Text>
      <Text>{tradieBookedHourly.map(a => a.label).join(',')}</Text>
      <Text>{depDefault}</Text>
      <Text>{depLarge}</Text>
      <Text>{depSmall}</Text>
    </>
  );
}

describe('JobsContext logic', () => {
  test('getNextActionsByRole and calculateDeposit behave as expected', () => {
    const { getByText } = render(
      <JobsProvider>
        <TestConsumer />
      </JobsProvider>
    );

    // Customer booked should include Track Job
    expect(getByText(/Track Job/)).toBeTruthy();

    // Tradie booked + hourly should include Send Estimate
    expect(getByText(/Send Estimate/)).toBeTruthy();

    // Deposit defaults and boundaries
    expect(getByText('20')).toBeTruthy();
    expect(getByText('50')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
  });
});
