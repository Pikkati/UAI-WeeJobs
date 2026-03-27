import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k) => null),
    setItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => null),
  },
}));

// Mock supabase to force a failure so AuthContext falls back to TEST_USERS
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'not found' } }) }) }) }),
  },
}));

function TestConsumer({ onDone }: { onDone: (res: any) => void }) {
  const { login } = useAuth();

  React.useEffect(() => {
    (async () => {
      const result = await login('john@weejobs.test', 'password123');
      onDone(result);
    })();
  }, []);

  return null;
}

test('AuthContext.login falls back to TEST_USERS when supabase fails', async () => {
  let result: any = null;

  render(
    <AuthProvider>
      <TestConsumer onDone={(r) => (result = r)} />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(result).not.toBeNull();
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('john@weejobs.test');
  });
});
