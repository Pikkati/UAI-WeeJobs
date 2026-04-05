import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

describe('AuthProvider.login branches', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns invalid credentials when supabase returns invalid login', async () => {
    const { supabase } = require('../lib/supabase');

    if (supabase) {
      if (!supabase.auth)
        (supabase as any).auth = {
          signInWithPassword: async () => ({
            data: null,
            error: { message: 'Invalid login' },
          }),
          signOut: async () => ({}),
        };
      jest
        .spyOn(supabase.auth, 'signInWithPassword' as any)
        .mockImplementation(async () => ({
          data: null,
          error: { message: 'Invalid login' },
        }));
    }

    if (supabase && supabase.from) {
      jest
        .spyOn(supabase, 'from' as any)
        .mockImplementation(() => ({
          select: () => ({
            eq: () => ({ single: async () => ({ data: null, error: null }) }),
          }),
        }));
    }

    const { AuthProvider, useAuth } = require('../context/AuthContext');

    function Invoker({ cb }: any) {
      const { login } = useAuth();
      React.useEffect(() => {
        login('a@b.com', 'pw').then(cb);
      }, [login]);
      return null;
    }

    let result: any = null;
    render(
      <AuthProvider>
        <Invoker cb={(r: any) => (result = r)} />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/invalid email|invalid/i);
    });
  });

  test('falls back to test users when supabase throws', async () => {
    const { supabase } = require('../lib/supabase');
    const constants = require('../constants/data');

    if (supabase) {
      if (!supabase.auth)
        (supabase as any).auth = {
          signInWithPassword: async () => ({ data: null, error: null }),
          signOut: async () => ({}),
        };
      jest
        .spyOn(supabase.auth, 'signInWithPassword' as any)
        .mockImplementation(async () => {
          throw new Error('network');
        });
    }

    if (supabase && supabase.from) {
      jest
        .spyOn(supabase, 'from' as any)
        .mockImplementation(() => ({
          select: () => ({
            eq: () => ({ single: async () => ({ data: null, error: null }) }),
          }),
        }));
    }

    const original = { ...(constants.TEST_USERS || {}) };
    (constants as any).TEST_USERS = {
      u1: {
        id: 'u1',
        email: 'fallback@example.com',
        password: 'pw',
        name: 'Fallback',
      },
    };

    const { AuthProvider, useAuth } = require('../context/AuthContext');

    function Invoker({ cb }: any) {
      const { login } = useAuth();
      React.useEffect(() => {
        login('fallback@example.com', 'pw').then(cb);
      }, [login]);
      return null;
    }

    let result: any = null;
    render(
      <AuthProvider>
        <Invoker cb={(r: any) => (result = r)} />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('fallback@example.com');
    });

    (constants as any).TEST_USERS = original;
  });
});
