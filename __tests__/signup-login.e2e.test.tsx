import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Mock AsyncStorage to avoid ESM/native import issues (ESM-compatible)
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => null),
  },
}));

// Mock supabase to control auth responses
// Provide a test-global supabase mock used by lib/supabase
// eslint-disable-next-line no-undef
(global as any).__TEST_SUPABASE__ = {
  auth: {
    signUp: async ({ email }: any) => ({ data: { user: { id: 'new-id', email, confirmed_at: null } }, error: null }),
    signInWithPassword: async ({ email, password }: any) => {
      if (email === 'confirmed@example.com' && password === 'password') {
        return { data: { user: { id: 'u1', email, confirmed_at: new Date().toISOString() } }, error: null };
      }
      return { data: null, error: { message: 'Invalid credentials' } };
    },
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
  },
  from: (table: string) => ({
    select: (_: string) => ({
      eq: (_k: string, _v: string) => ({
        single: async () => ({ data: { id: 'u1', email: 'confirmed@example.com', name: 'Confirmed User' }, error: null }),
      }),
    }),
    insert: async (_obj: any) => ({ data: null, error: null }),
  }),
  functions: { invoke: async () => ({ data: null, error: null }) },
};

// Debug: inspect resolved supabase in the Jest environment
// eslint-disable-next-line no-console
console.log('TEST_SUPABASE_AT_TEST', require('../lib/supabase'));
// More introspection
try {
  // eslint-disable-next-line no-console
  console.log('TEST_SUPABASE_AUTH_TYPE', typeof (require('../lib/supabase') as any).supabase.auth);
} catch (e) {
  // ignore
}
// Extra introspection: try calling the test auth.signUp to ensure it behaves
try {
  const libSup = require('../lib/supabase') as any;
  // eslint-disable-next-line no-console
  console.log('SUPABASE_AUTH_KEYS', Object.keys(libSup.supabase.auth || {}));
  if (typeof libSup.supabase.auth.signUp === 'function') {
    (async () => {
      try {
        const r = await libSup.supabase.auth.signUp({ email: 'debug@example.com' });
        // eslint-disable-next-line no-console
        console.log('DEBUG_SIGNUP_RES', r);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('DEBUG_SIGNUP_ERR', err);
      }
    })();
  }
} catch (e) {
  // ignore
}

// Import AuthProvider dynamically after configuring global test supabase
const { AuthProvider, useAuth } = require('../context/AuthContext');

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
