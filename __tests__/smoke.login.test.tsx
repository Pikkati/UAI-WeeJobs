// Ensure test environment has supabase env vars so createClient doesn't throw.
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
}));

jest.mock('../context/AuthContext', () => {
  const lm = jest.fn();
  // expose to test scope via global so tests can adjust return values
  (global as any).__TEST_LOGIN_MOCK__ = lm;
  // Provide a minimal `useAuth` and `AuthProvider` for the component.
  (global as any).__TEST_USE_AUTH__ = () => ({
    login: lm,
    signup: jest.fn(),
    resendVerification: jest.fn(),
  });
  return {
    useAuth: () => ({ login: lm, signup: jest.fn() }),
    AuthProvider: ({ children }: any) => children,
  };
});

const LoginScreen = require('../app/onboarding/login').default;

describe('Smoke: LoginScreen', () => {
  it('signs in and navigates to customer route', async () => {
    // Ensure the login mock resolves with a successful user object
    if (
      (global as any).__TEST_LOGIN_MOCK__ &&
      typeof (global as any).__TEST_LOGIN_MOCK__.mockResolvedValue ===
        'function'
    ) {
      (global as any).__TEST_LOGIN_MOCK__.mockResolvedValue({
        success: true,
        user: { role: 'customer' },
      });
    }

    const { getByPlaceholderText, getByText, getAllByText, getByTestId } =
      render(<LoginScreen />);

    fireEvent.changeText(
      getByPlaceholderText('Email address'),
      'test@weejobs.test',
    );
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByTestId('signin-button'));

    await waitFor(() => {
      const { router } = require('expo-router');
      expect(router.replace).toHaveBeenCalledWith('/customer');
    });
  });
});
