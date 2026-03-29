// Ensure test environment has supabase env vars so createClient doesn't throw.
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// In test environment, replace FlatList with a simple renderer
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    ...RN,
    FlatList: ({ data, renderItem, ...rest }: any) => React.createElement(RN.View, rest, data?.map((item: any, i: number) => renderItem({ item, index: i })) ),
  };
});

jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'admin1', role: 'admin' }, isLoading: false }),
  AuthProvider: ({ children }: any) => children,
}));

let usersData: any[] = [
  { id: 'u1', name: 'User One', email: 'u1@example.com', role: 'customer', area: 'Test Area', created_at: '2026-03-01', updated_at: '2026-03-01' },
];
const auditInserted: any[] = [];

describe('AdminUsersScreen', () => {
  let AdminUsersScreen: any;

  beforeAll(() => {
    // Provide a module-scoped supabase mock so the component imports the stubbed
    // client implementation directly (avoids global race conditions).
    jest.doMock('../lib/supabase', () => {
      return {
        __esModule: true,
        supabase: {
          from: (table: string) => {
            if (table === 'users') {
              return {
                select: () => ({ order: async () => ({ data: usersData, error: null }) }),
                update: (payload: any) => ({ eq: async (_col: string, id: string) => { const user = usersData.find(u => u.id === id); if (user) user.role = payload.role; return { error: null }; } }),
              };
            }
            if (table === 'audit_logs') {
              return { insert: async (p: any) => { auditInserted.push(p); return { data: null, error: null }; } };
            }
            return { select: () => ({ order: async () => ({ data: [], error: null }) }) };
          },
        },
        getSupabaseClient: () => ({
          from: (table: string) => {
            if (table === 'users') {
              return {
                select: () => ({ order: async () => ({ data: usersData, error: null }) }),
                update: (payload: any) => ({ eq: async (_col: string, id: string) => { const user = usersData.find(u => u.id === id); if (user) user.role = payload.role; return { error: null }; } }),
              };
            }
            if (table === 'audit_logs') {
              return { insert: async (p: any) => { auditInserted.push(p); return { data: null, error: null }; } };
            }
            return { select: () => ({ order: async () => ({ data: [], error: null }) }) };
          },
        }),
      };
    });

    // Ensure the stable test container does not short-circuit module mocks.
    // The `jest-setup.js` file exposes a default `global.__TEST_SUPABASE__`;
    // set it to null so the component will call the mocked `getSupabaseClient()`.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (global as any).__TEST_SUPABASE__ = null;

    // Require the component after mocking the module
    // eslint-disable-next-line global-require
    AdminUsersScreen = require('../app/admin/users').default;
  });

  afterAll(() => {
    try {
      jest.dontMock('../lib/supabase');
    } catch (e) {
      // ignore
    }
  });

  beforeEach(() => {
    usersData = [ { id: 'u1', name: 'User One', email: 'u1@example.com', role: 'customer', area: 'Test Area', created_at: '2026-03-01', updated_at: '2026-03-01' } ];
    auditInserted.length = 0;
  });

  it('promotes a user to admin and logs an audit entry', async () => {
    const { getByTestId, getByText } = render(<AdminUsersScreen />);

    // Wait for users to be loaded
    await waitFor(() => {
      expect(getByText(/registered users/)).toBeTruthy();
    });

    // Promote via UI
    fireEvent.press(getByTestId('promote-button-u1'));

    await waitFor(() => {
      expect(auditInserted.length).toBe(1);
      expect(usersData[0].role).toBe('admin');
    });
  });
});
