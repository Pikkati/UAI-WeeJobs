// Ensure test environment has supabase env vars so createClient doesn't throw.
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() },
}));

jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

const PricingHomeScreen = require('../app/tradie/pricing').default;

describe('Pricing screen', () => {
  beforeEach(() => {
    (Alert.alert as jest.Mock).mockClear();
  });

  it('shows PAYG alert when pressing PAYG', async () => {
    const { getByText } = render(<PricingHomeScreen />);
    fireEvent.press(getByText('Continue with PAYG'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Pay As You Go Selected',
        expect.any(String),
        expect.any(Array),
      );
    });
  });

  it('shows PRO alert when pressing PRO', async () => {
    const { getByText } = render(<PricingHomeScreen />);
    fireEvent.press(getByText('Upgrade to PRO'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'PRO Subscription',
        expect.any(String),
        expect.any(Array),
      );
    });
  });
});
