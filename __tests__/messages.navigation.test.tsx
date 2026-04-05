// Ensure test environment has supabase env vars so createClient doesn't throw.
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// In this test environment, make FlatList render items synchronously so renderItem output is available
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    ...RN,
    FlatList: ({ data, renderItem, ...rest }: any) =>
      React.createElement(
        RN.View,
        rest,
        ...(data || []).map((item: any, i: number) =>
          React.createElement(
            RN.View,
            { key: item.id || i },
            renderItem({ item, index: i }),
          ),
        ),
      ),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'cust1', role: 'customer' },
    isLoading: false,
  }),
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
                order: async () => ({
                  data: [
                    {
                      id: 'job1',
                      tradie_id: 'tradie1',
                      category: 'Plumbing',
                      updated_at: '2026-03-02T00:00:00Z',
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }

      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { name: 'Tradie Joe' },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === 'messages') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: async () => ({
                  data: [
                    {
                      id: 'm1',
                      content: 'Hello there',
                      created_at: '2026-03-03T00:00:00Z',
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          eq: () => ({ order: async () => ({ data: [], error: null }) }),
        }),
      };
    },
  },
}));

describe('Messages navigation', () => {
  it('navigates to chat when conversation pressed', async () => {
    // Opt-in to fetching conversations in this test (the component skips
    // network effects by default under Jest to avoid noisy act() warnings).
    // eslint-disable-next-line no-undef
    (global as any).__TEST_FORCE_FETCH_CONVERSATIONS = true;
    const MessagesScreen = require('../app/customer/messages').default;
    const { router } = require('expo-router');
    // Suppress React act() warnings for this test only by setting the
    // shared test-level console error handler. This avoids spying on the
    // globally wrapped `console.error` which the test harness already
    // replaces during setup.
    // eslint-disable-next-line no-undef
    (global as any).__TEST_CONSOLE_ERROR_HANDLER__ = (...args: any[]) => {
      try {
        if (
          args &&
          args[0] &&
          typeof args[0] === 'string' &&
          args[0].includes('not wrapped in act')
        ) {
          return;
        }
      } catch {
        // fall through to original if filter fails
      }
      // forward to original console error
      // eslint-disable-next-line no-undef
      (global as any).__TEST_CONSOLE_ERROR_HANDLER__ = undefined; // temporarily clear to avoid recursion
      try {
        // eslint-disable-next-line no-undef
        const orig =
          (global as any).__JEST_ORIG_CONSOLE_ERROR__ || console.error;
        orig.apply(console, args as any);
      } finally {
        // eslint-disable-next-line no-undef
        delete (global as any).__TEST_CONSOLE_ERROR_HANDLER__;
      }
    };

    const { getByText } = render(<MessagesScreen />);

    await waitFor(() => {
      expect(getByText('Tradie Joe')).toBeTruthy();
    });

    fireEvent.press(getByText('Tradie Joe'));
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith({
        pathname: '/chat/[jobId]',
        params: {
          jobId: 'job1',
          recipientName: 'Tradie Joe',
          jobCategory: 'Plumbing',
        },
      });
    });
    // restore console handler and cleanup override
    // eslint-disable-next-line no-undef
    delete (global as any).__TEST_CONSOLE_ERROR_HANDLER__;
    // eslint-disable-next-line no-undef
    delete (global as any).__TEST_FORCE_FETCH_CONVERSATIONS;
  });
});
