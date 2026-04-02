import React from 'react';
import { render } from '@testing-library/react-native';

// Mock router + params
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ jobId: 'j1' })),
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}), { virtual: true });

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) }), { virtual: true });

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', role: 'customer' },
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }),
}), { virtual: true });

// Mock JobsContext with a job in 'on_the_way' status
jest.mock('../context/JobsContext', () => ({
  useJobs: () => ({
    jobs: [
      {
        id: 'j1',
        status: 'on_the_way',
        category: 'plumbing',
        area: 'Test Area',
        pricing_type: 'fixed',
        deposit_paid: true,
        deposit_amount: 20,
        quote_total: 150,
        tradie_confirmed: false,
        customer_confirmed: false,
        deposit_refunded: false,
      },
    ],
    getNextActionsByRole: () => [{ action: 'message', label: 'Message', variant: 'primary' }],
    markOnTheWay: jest.fn(),
    markArrived: jest.fn(),
    confirmCompletion: jest.fn().mockResolvedValue(true),
    cancelJob: jest.fn().mockResolvedValue(true),
  }),
}), { virtual: true });

describe('JobTrackingScreen render', () => {
  test('renders header, map preview and ETA for on_the_way', async () => {
    const JobTrackingScreen = require('../app/job/tracking').default;
    const { findByText } = render(<JobTrackingScreen />);

    // Header
    const header = await findByText('Job Tracking');
    expect(header).toBeTruthy();

    // Map preview
    const map = await findByText('Map Preview');
    expect(map).toBeTruthy();

    // ETA card should be visible for on_the_way
    const eta = await findByText('Estimated arrival');
    expect(eta).toBeTruthy();
  });
});
