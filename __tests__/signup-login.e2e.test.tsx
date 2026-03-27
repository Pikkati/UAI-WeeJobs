import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Mock AsyncStorage to avoid ESM/native import issues
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => null),
}));

// Mock supabase to control auth responses
jest.mock('../lib/supabase', () => {
  return {
    supabase: {
      auth: {
        signUp: jest.fn(async ({ email }: any) => ({ data: { user: { id: 'new-id', email, confirmed_at: null } }, error: null })),
        signInWithPassword: jest.fn(async ({ email, password }: any) => {
          if (email === 'confirmed@example.com' && password === 'password') {
            return { data: { user: { id: 'u1', email, confirmed_at: new Date().toISOString() } }, error: null };
          }
          return { data: null, error: { message: 'Invalid credentials' } };
        }),
        signOut: jest.fn(async () => ({ error: null })),
        // For reset password (not used in these tests) provide a no-op
        resetPasswordForEmail: jest.fn(async () => ({ error: null })),
      },
      from: (table: string) => ({
        select: (_: string) => ({
          eq: (_k: string, _v: string) => ({
            single: async () => ({ data: { id: 'u1', email: 'confirmed@example.com', name: 'Confirmed User' }, error: null }),
          }),
        }),
        insert: async (_obj: any) => ({ data: null, error: null }),
      }),
    },
  };
});

import { AuthProvider, useAuth } from '../context/AuthContext';

function TestInvoker({ email, password, cb }: { email: string; password?: string; cb: (res: any) => void }) {
  const auth = useAuth();
  React.useEffect(() => {
    (async () => {
      if (password) {
        const r = await auth.login(email, password);
        cb(r);
      } else {
        const r = await auth.signup(email, 'password', 'Test User', 'customer');
        cb(r);
      }
    })();
  }, [email, password]);
  return null;
}

test('signup requires verification when user is unconfirmed', async () => {
  let result: any = null;
  render(
    <AuthProvider>
      <TestInvoker email="new@example.com" cb={(r) => (result = r)} />
    </AuthProvider>
  );

  await waitFor(() => {
    if (!result) throw new Error('waiting');
    expect(result.success).toBe(true);
    expect(result.needsVerification).toBe(true);
  });
});

test('login returns user when confirmed', async () => {
  let result: any = null;
  render(
    <AuthProvider>
      <TestInvoker email="confirmed@example.com" password="password" cb={(r) => (result = r)} />
    </AuthProvider>
  );

  await waitFor(() => {
    if (!result) throw new Error('waiting');
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('confirmed@example.com');
  });
});
