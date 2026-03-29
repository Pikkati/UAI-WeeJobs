// Ensure test environment has supabase env vars so createClient doesn't throw.
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

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
const mockFrom = jest.fn((table: string) => {
  if (table === 'users') {
    return {
      select: () => ({ order: async () => ({ data: usersData, error: null }) }),
      update: (payload: any) => ({ eq: async (col: string, id: string) => { const user = usersData.find(u => u.id === id); if (user) user.role = payload.role; return { error: null }; } }),
    };
  }
  if (table === 'audit_logs') {
    return { insert: async (p: any) => { auditInserted.push(p); return { data: null, error: null }; } };
  }
  return { select: () => ({ order: async () => ({ data: [], error: null }) }) };
});

jest.mock('../lib/supabase', () => ({ supabase: { from: mockFrom } }));

const AdminUsersScreen = require('../app/admin/users').default;

describe('AdminUsersScreen', () => {
  beforeEach(() => {
    mockFrom.mockClear();
    auditInserted.length = 0;
    usersData[0].role = 'customer';
  });

  it('promotes a user to admin and logs an audit entry', async () => {
    const { getByTestId, getByText, debug } = render(<AdminUsersScreen />);
    // Debug rendered tree to inspect why FlatList items may not be visible in this test environment
    // (temporary debug during troubleshooting)
    // eslint-disable-next-line no-console
    console.log(debug());

    // Wait for the users count to appear, indicating fetchUsers completed
    await waitFor(() => {
      expect(getByText(/registered users/)).toBeTruthy();
    });

    // Now the promote button should be available
    fireEvent.press(getByTestId('promote-button-u1'));

    await waitFor(() => {
      expect(auditInserted.length).toBe(1);
      expect(usersData[0].role).toBe('admin');
    });
  });
});
