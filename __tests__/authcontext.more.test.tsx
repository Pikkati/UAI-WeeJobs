import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Mock AsyncStorage used by AuthProvider
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (k: string) => (global as any).__asyncStorage?.[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => { (global as any).__asyncStorage = (global as any).__asyncStorage || {}; (global as any).__asyncStorage[k] = v; }),
    removeItem: jest.fn(async (k: string) => { (global as any).__asyncStorage = (global as any).__asyncStorage || {}; delete (global as any).__asyncStorage[k]; }),
  }
}));

describe('AuthProvider additional flows', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (global as any).__asyncStorage = {};
  });

  test('signup returns already-registered message on signup error', async () => {
    const { supabase } = require('../lib/supabase');
    if (!supabase.auth) (supabase as any).auth = { signUp: async () => ({ data: null, error: null }), signOut: async () => ({}) };
    jest.spyOn(supabase.auth, 'signUp' as any).mockImplementation(async () => ({ data: null, error: { message: 'already registered' } }));

    const { AuthProvider, useAuth } = require('../context/AuthContext');

    function Invoker({ cb }: any) {
      const { signup } = useAuth();
      React.useEffect(() => {
        signup('x@y.com', 'pw', 'Name', 'customer').then(cb);
      }, [signup]);
      return null;
    }

    let result: any = null;
    render(
      <AuthProvider>
        <Invoker cb={(r: any) => (result = r)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/already exists|already registered/i);
    });
  }, 10000);

  test('signup requires verification when confirmed_at is null', async () => {
    const { supabase } = require('../lib/supabase');
    if (!supabase.auth) (supabase as any).auth = { signUp: async () => ({ data: null, error: null }), signOut: async () => ({}) };
    jest.spyOn(supabase.auth, 'signUp' as any).mockImplementation(async () => ({ data: { user: { id: 'u2', confirmed_at: null } }, error: null }));

    const { AuthProvider, useAuth } = require('../context/AuthContext');

    function Invoker({ cb }: any) {
      const { signup } = useAuth();
      React.useEffect(() => {
        signup('a@b.com', 'pw', 'Name', 'customer').then(cb);
      }, [signup]);
      return null;
    }

    let result: any = null;
    render(
      <AuthProvider>
        <Invoker cb={(r: any) => (result = r)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.needsVerification).toBe(true);
    });
  });

  test('sendPasswordReset calls supabase reset when available', async () => {
    const { supabase } = require('../lib/supabase');
    if (!supabase.auth) (supabase as any).auth = {};
    (supabase.auth as any).resetPasswordForEmail = jest.fn(async (email: string) => ({ error: null }));

    const { AuthProvider, useAuth } = require('../context/AuthContext');

    function Invoker({ cb }: any) {
      const { sendPasswordReset } = useAuth();
      React.useEffect(() => {
        sendPasswordReset('a@b.com').then(cb);
      }, [sendPasswordReset]);
      return null;
    }

    let result: any = null;
    render(
      <AuthProvider>
        <Invoker cb={(r: any) => (result = r)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  test('resendVerification returns error when endpoint not set and ok when endpoint responds', async () => {
    // First: no env set
    delete (process as any).env.EXPO_PUBLIC_API_BASE;
    const { AuthProvider, useAuth } = require('../context/AuthContext');

    function Invoker1({ cb }: any) {
      const { resendVerification } = useAuth();
      React.useEffect(() => {
        resendVerification('a@b.com').then(cb);
      }, [resendVerification]);
      return null;
    }

    let r1: any = null;
    render(
      <AuthProvider>
        <Invoker1 cb={(res: any) => (r1 = res)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(r1).toBeDefined();
      expect(r1.success).toBe(false);
      expect(r1.error).toMatch(/Resend endpoint not configured/i);
    });

    // Now set env and mock fetch
    (process as any).env.EXPO_PUBLIC_API_BASE = 'https://api.example';
    global.fetch = jest.fn(async () => ({ ok: true } as any));

    function Invoker2({ cb }: any) {
      const { resendVerification } = useAuth();
      React.useEffect(() => {
        resendVerification('b@c.com').then(cb);
      }, [resendVerification]);
      return null;
    }

    let r2: any = null;
    render(
      <AuthProvider>
        <Invoker2 cb={(res: any) => (r2 = res)} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(r2).toBeDefined();
      expect(r2.success).toBe(true);
    });
  });
});
