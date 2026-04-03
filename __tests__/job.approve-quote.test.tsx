import React from 'react';
import { render } from '@testing-library/react-native';

const mockJobModule: any = {
  jobs: [],
  approveQuote: jest.fn(),
  acknowledgeEstimate: jest.fn(),
};

jest.mock('../context/JobsContext', () => ({
  useJobs: () => mockJobModule,
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
}), { virtual: true });

describe('ApproveQuoteScreen', () => {
  beforeEach(() => {
    mockJobModule.jobs = [];
    mockJobModule.approveQuote.mockReset();
    mockJobModule.acknowledgeEstimate.mockReset();
  });

  it('renders quote mode and shows payment summary', () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ jobId: 'j1' });

    mockJobModule.jobs = [{
      id: 'j1',
      quote_total: 100,
      quote_labour: 50,
      quote_materials: 50,
      deposit_amount: 25,
      pricing_type: 'fixed',
      quote_notes: 'Test note',
    }];

    const ApproveQuote = require('../app/job/approve-quote').default;
    const { getByText } = render(<ApproveQuote />);

    expect(getByText('Review Quote')).toBeTruthy();
    expect(getByText('Approve Quote')).toBeTruthy();
    expect(getByText('Deposit paid')).toBeTruthy();
    expect(getByText('£25.00')).toBeTruthy();
    expect(getByText('Remaining balance')).toBeTruthy();
    expect(getByText('£75.00')).toBeTruthy();
  });

  it('renders estimate mode and shows estimate header and values', () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ jobId: 'j2', mode: 'estimate' });

    mockJobModule.jobs = [{
      id: 'j2',
      estimate_hours: 2,
      estimate_hourly_rate: 30,
      estimate_materials: 10,
      estimate_total: 70,
      pricing_type: 'hourly',
      estimate_notes: 'Estimate note',
    }];

    const ApproveQuote = require('../app/job/approve-quote').default;
    const { getByText } = render(<ApproveQuote />);

    expect(getByText('Review Estimate')).toBeTruthy();
    expect(getByText('Acknowledge Estimate')).toBeTruthy();
    expect(getByText('Estimated hours')).toBeTruthy();
    expect(getByText('2 hrs')).toBeTruthy();
  });
});
