import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

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

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }), { virtual: true });

describe('ApproveQuote helper flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockJobModule.jobs = [];
  });

  it('sends change request and navigates to chat with message', async () => {
    const expo = require('expo-router');
    expo.useLocalSearchParams.mockReturnValue({ jobId: 'j1' });

    mockJobModule.jobs = [{
      id: 'j1',
      category: 'Plumbing',
      quote_total: 100,
      quote_labour: 50,
      quote_materials: 50,
      deposit_amount: 10,
      pricing_type: 'fixed',
    }];

    const ApproveQuote = require('../app/job/approve-quote').default;
    const { getByText, getByPlaceholderText } = render(<ApproveQuote />);

    // Open the change request modal
    fireEvent.press(getByText('Request Change'));

    const input = getByPlaceholderText("Explain what changes you'd like...");
    fireEvent.changeText(input, 'Please reduce the materials');

    fireEvent.press(getByText('Send Message'));

    await waitFor(() => expect(mockPush).toHaveBeenCalled());

    // Expect navigation to chat pathname with params (jobId included)
    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/chat/[jobId]' }));
  });
});
