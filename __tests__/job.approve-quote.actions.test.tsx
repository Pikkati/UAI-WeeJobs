import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockPush = jest.fn();

const mockJobModule: any = {
  jobs: [],
  approveQuote: jest.fn().mockResolvedValue(true),
  acknowledgeEstimate: jest.fn().mockResolvedValue(true),
};

jest.mock('../context/JobsContext', () => ({ useJobs: () => mockJobModule }));

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
  router: { push: mockPush, back: jest.fn(), replace: jest.fn() },
}), { virtual: true });

describe('ApproveQuote interaction flows', () => {
  beforeEach(() => {
    mockJobModule.jobs = [];
    mockJobModule.approveQuote.mockClear();
    mockJobModule.acknowledgeEstimate.mockClear();
    mockPush.mockClear();
    jest.spyOn(Alert, 'alert').mockImplementation((title: any, msg: any, buttons: any) => {
      if (Array.isArray(buttons) && buttons[0] && typeof buttons[0].onPress === 'function') {
        buttons[0].onPress();
      }
    });
  });

  afterEach(() => {
    // @ts-ignore
    Alert.alert.mockRestore && Alert.alert.mockRestore();
  });

  it('calls approveQuote and navigates to pay-final when approving a quote', async () => {
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

    const approveButton = getByText('Approve Quote');
    fireEvent.press(approveButton);

    await waitFor(() => expect(mockJobModule.approveQuote).toHaveBeenCalledWith('j1'));
    expect(mockJobModule.approveQuote).toHaveBeenCalledTimes(1);
  });

  it('calls acknowledgeEstimate and navigates to tracking when acknowledging estimate', async () => {
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

    const ackButton = getByText('Acknowledge Estimate');
    fireEvent.press(ackButton);

    await waitFor(() => expect(mockJobModule.acknowledgeEstimate).toHaveBeenCalledWith('j2'));
    expect(mockJobModule.acknowledgeEstimate).toHaveBeenCalledTimes(1);
  });
});
