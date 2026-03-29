// Ensure test environment has supabase env vars so createClient doesn't throw.
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// In this test environment, make FlatList render items synchronously so renderItem output is available
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    ...RN,
    FlatList: ({ data, renderItem, ...rest }: any) => React.createElement(
      RN.View,
      rest,
      ...(data || []).map((item: any, i: number) => React.createElement(RN.View, { key: item.id || i }, renderItem({ item, index: i })))
    ),
  };
});

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'cust1', role: 'customer' }, isLoading: false }),
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
                order: async () => ({ data: [
                  { id: 'job1', tradie_id: 'tradie1', category: 'Plumbing', updated_at: '2026-03-02T00:00:00Z' }
                ], error: null }),
              }),
            }),
          }),
        };
      }

      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({ single: async () => ({ data: { name: 'Tradie Joe' }, error: null }) }),
          }),
        };
      }

      if (table === 'messages') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: async () => ({ data: [ { id: 'm1', content: 'Hello there', created_at: '2026-03-03T00:00:00Z' } ], error: null }),
              }),
            }),
          }),
        };
      }

      return { select: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }) }) }) };
    },
  },
}));

const MessagesScreen = require('../app/customer/messages').default;

describe('Messages navigation', () => {
  it('navigates to chat when conversation pressed', async () => {
    const { router } = require('expo-router');
    const { getByText } = render(<MessagesScreen />);

    await waitFor(() => {
      expect(getByText('Tradie Joe')).toBeTruthy();
    });

    fireEvent.press(getByText('Tradie Joe'));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/chat/[jobId]',
        params: { jobId: 'job1', recipientName: 'Tradie Joe', jobCategory: 'Plumbing' },
      });
    });
  });
});
