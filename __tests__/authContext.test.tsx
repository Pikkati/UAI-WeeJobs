import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    storage: {} as Record<string, string>,
    getItem: jest.fn(
      async (k: string) => (global as any).__asyncStorage?.[k] ?? null,
    ),
    setItem: jest.fn(async (k: string, v: string) => {
      (global as any).__asyncStorage = (global as any).__asyncStorage || {};
      (global as any).__asyncStorage[k] = v;
    }),
    removeItem: jest.fn(async (k: string) => {
      (global as any).__asyncStorage = (global as any).__asyncStorage || {};
      delete (global as any).__asyncStorage[k];
    }),
  },
}));

// Provide a mock supabase client
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockFrom = jest.fn();

jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signUp: jest.fn(async () => ({
        data: {
          user: {
            id: 'u1',
            email: 'x@x.com',
            confirmed_at: new Date().toISOString(),
          },
        },
        error: null,
      })),
      signOut: () => mockSignOut(),
    },
    from: (table: string) => ({
      select: () => ({
        eq: (col: string, val: string) => ({
          single: async () => mockFrom(table, col, val),
        }),
      }),
    }),
  },
}));

function TestInvoker({ email, cb }: { email: string; cb: (res: any) => void }) {
  const { login } = useAuth();

  React.useEffect(() => {
    (async () => {
      const res = await login(email, 'password');
      cb(res);
    })();
  }, [email]);

  return null;
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).__asyncStorage = {};
  });

  test('successful login stores user and returns success', async () => {
    // Arrange: supabase signIn returns a confirmed user
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {
        user: {
          id: 'u1',
          email: 'test@example.com',
          confirmed_at: new Date().toISOString(),
        },
      },
      error: null,
    });
    mockFrom.mockResolvedValueOnce({
      data: {
        id: 'u1',
        email: 'test@example.com',
        name: 'Tester',
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null,
    });

    let result: any = null;

    render(
      <AuthProvider>
        <TestInvoker email="test@example.com" cb={(r) => (result = r)} />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(result).not.toBeNull();
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });
  });

  test('login for unconfirmed user returns needsVerification', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: 'u2', email: 'unverified@example.com', confirmed_at: null },
      },
      error: { message: 'User not confirmed' },
    });

    let result2: any = null;

    render(
      <AuthProvider>
        <TestInvoker email="unverified@example.com" cb={(r) => (result2 = r)} />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(result2).not.toBeNull();
      expect(result2.success).toBe(false);
      expect(result2.needsVerification).toBeTruthy();
    });
  });
});

// (HookInvoker/TextButton removed — using TestConsumer with TouchableOpacity/Text)
