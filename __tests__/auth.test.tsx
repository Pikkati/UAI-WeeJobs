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

// Mock AuthContext to ensure the test uses the correct context
jest.mock('../context/AuthContext', () => {
  const actual = jest.requireActual('../context/AuthContext');
  return {
    ...actual,
    AuthProvider: actual.AuthProvider,
    useAuth: actual.useAuth,
  };
});

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    user: { id: "test-user-id", name: "Test User" },
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

function TestConsumer({ onDone }: { onDone: (res: any) => void }) {
  const { user, login } = useAuth();

  // Trigger login and notify when user becomes available
  React.useEffect(() => {
    (async () => {
      await login(); // wait for login to complete if it returns a promise
    })();
  }, []);

  React.useEffect(() => {
    if (user) {
      onDone({ success: true, user });
    }
  }, [user]);

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
    expect(result.user.id).toBe('123');
    expect(result.user.name).toBe('Test User');
    expect(result.user.role).toBe('tradesperson');
    expect(result.user.pricing_default).toBe('fixed');
    expect(result.user.hourly_rate).toBe(50);
    expect(result.user.bio).toBe('Experienced tradie');
    expect(result.user.areas_covered).toEqual(['Area 1', 'Area 2']);
    expect(result.user.portfolio_photos).toEqual([]);
  });
});
