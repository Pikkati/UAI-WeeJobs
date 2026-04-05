import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { JobsProvider, useJobs } from '../context/JobsContext';
import { AuthProvider } from '../context/AuthContext';

function TestInvoker({ cb }: { cb: (res: any) => void }) {
  const ctx = useJobs();

  useEffect(() => {
    const res = {
      depositDefault: ctx.calculateDeposit(),
      deposit200: ctx.calculateDeposit('£200'),
      deposit1000: ctx.calculateDeposit('£1000'),
      depositInvalid: ctx.calculateDeposit('no number'),
      customerBookedHourlyFirst: ctx.getNextActionsByRole(
        'booked',
        'customer',
        'hourly',
      )[0]?.label,
      tradieInProgressHourlyFirst: ctx.getNextActionsByRole(
        'in_progress',
        'tradesperson',
        'hourly',
      )[0]?.label,
      unknownStatus: ctx.getNextActionsByRole('unknown' as any, 'customer')
        .length,
    };
    cb(res);
  }, [cb, ctx]);

  return null;
}

describe('JobsContext helpers', () => {
  test('calculateDeposit and getNextActionsByRole behave as expected', async () => {
    let result: any = null;

    render(
      <AuthProvider>
        <JobsProvider>
          <TestInvoker cb={(r) => (result = r)} />
        </JobsProvider>
      </AuthProvider>,
    );

    // wait for effects to settle
    await waitFor(() => expect(result).toBeTruthy());
    expect(result).toBeTruthy();
    expect(result.depositDefault).toBe(20);
    expect(result.deposit200).toBe(20);
    expect(result.deposit1000).toBe(50);
    expect(result.depositInvalid).toBe(20);

    expect(result.customerBookedHourlyFirst).toBe('View Estimate');
    expect(result.tradieInProgressHourlyFirst).toBe('Send Invoice');
    expect(result.unknownStatus).toBe(0);
  });
});
