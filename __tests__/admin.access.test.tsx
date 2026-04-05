// Ensure test environment has supabase env vars so createClient doesn't throw.
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockedUseAuth = jest.fn();

jest.mock('expo-router', () => {
  const React = require('react');
  const Tabs = ({ children }: any) => <>{children}</>;
  Tabs.Screen = ({ children }: any) => <>{children}</>;
  return {
    Tabs,
    router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
    useLocalSearchParams: () => ({}),
    useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  };
});

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockedUseAuth(),
  AuthProvider: ({ children }: any) => children,
}));

const AdminLayout = require('../app/admin/_layout').default;

describe('Admin layout access control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects non-admin users to customer route', async () => {
    mockedUseAuth.mockReturnValue({
      user: { role: 'customer' },
      isLoading: false,
    });
    const { router } = require('expo-router');
    render(<AdminLayout />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/customer');
    });
  });

  it('does not redirect admin users', async () => {
    mockedUseAuth.mockReturnValue({
      user: { role: 'admin' },
      isLoading: false,
    });
    const { router } = require('expo-router');
    render(<AdminLayout />);

    await waitFor(() => {
      expect(router.replace).not.toHaveBeenCalled();
    });
  });
});
