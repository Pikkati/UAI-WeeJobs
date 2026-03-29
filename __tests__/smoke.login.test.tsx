// Ensure test environment has supabase env vars so createClient doesn't throw.
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
}));

jest.mock('../context/AuthContext', () => {
  const loginMock = jest.fn(async (email: string, pwd: string) => ({ success: true, user: { role: 'customer' } }));
  return {
    useAuth: () => ({ login: loginMock, signup: jest.fn() }),
    AuthProvider: ({ children }: any) => children,
  };
});

const LoginScreen = require('../app/onboarding/login').default;


describe('Smoke: LoginScreen', () => {
  it('signs in and navigates to customer route', async () => {
    const { getByPlaceholderText, getByText, getAllByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('Email address'), 'test@weejobs.test');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    const signInMatches = getAllByText('Sign In');
    // Choose the last match which is the primary button label
    fireEvent.press(signInMatches[signInMatches.length - 1]);

    await waitFor(() => {
      const { router } = require('expo-router');
      expect(router.replace).toHaveBeenCalledWith('/customer');
    });
  });
});
