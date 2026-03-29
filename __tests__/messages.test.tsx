// Ensure test environment has supabase env vars so createClient doesn't throw.
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user', role: 'customer' }, isLoading: false }),
  AuthProvider: ({ children }: any) => children,
}));

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'jobs') {
        return {
          select: () => ({
            eq: () => ({
              in: () => ({
                order: async () => ({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({ single: async () => ({ data: null, error: null }) }),
        }),
      };
    },
  },
}));

const MessagesScreen = require('../app/customer/messages').default;

describe('Messages screen', () => {
  it('shows empty state when there are no conversations', async () => {
    const { getByText } = render(<MessagesScreen />);

    await waitFor(() => {
      expect(getByText('No messages yet')).toBeTruthy();
    });
  });
});
