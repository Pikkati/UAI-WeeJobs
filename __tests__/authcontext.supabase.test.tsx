import { render, waitFor } from '@testing-library/react-native';

describe('AuthContext supabase-backed flows', () => {
  afterEach(() => {
    // cleanup any global overrides — reset the test container without
    // deleting the accessor defined by jest-setup so other tests keep
    // the stable identity.
    // eslint-disable-next-line no-undef
    (global as any).__TEST_SUPABASE__ = {};
    jest.restoreAllMocks();
  });

  test('login returns needsVerification when user not confirmed', async () => {
    // eslint-disable-next-line no-undef
    global.__TEST_SUPABASE__ = {
      auth: {
        signInWithPassword: jest.fn(async () => ({
          data: { user: { id: 'u1', confirmed_at: null } },
          error: null,
        })),
        signOut: jest.fn(async () => ({ error: null })),
      },
      from: jest.fn(() => ({
        select: () => ({
          eq: () => ({ single: async () => ({ data: null, error: null }) }),
        }),
      })),
      functions: { invoke: jest.fn(async () => ({ data: null, error: null })) },
    };

    const React = require('react');
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
      expect(result.needsVerification).toBeTruthy();
    });
  });

  test('signup returns needsVerification when signup requires email confirm', async () => {
    // eslint-disable-next-line no-undef
    global.__TEST_SUPABASE__ = {
      auth: {
        signUp: jest.fn(async () => ({
          data: { user: { id: 'u2', confirmed_at: null } },
          error: null,
        })),
      },
      from: jest.fn(() => ({ insert: async () => ({ error: null }) })),
      functions: { invoke: jest.fn(async () => ({ data: null, error: null })) },
    };

    const React = require('react');
    const { AuthProvider, useAuth } = require('../context/AuthContext');

    function Invoker({ cb }: any) {
      const { signup } = useAuth();
      React.useEffect(() => {
        signup('s@example.com', 'pw', 'Name', 'customer').then(cb);
      }, [signup]);
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
      expect(result.needsVerification).toBeTruthy();
    });
  });

  test('sendPasswordReset forwards success when supported', async () => {
    // eslint-disable-next-line no-undef
    global.__TEST_SUPABASE__ = {
      auth: {
        resetPasswordForEmail: jest.fn(async () => ({ error: null })),
      },
      from: jest.fn(() => ({
        select: () => ({
          eq: () => ({ single: async () => ({ data: null, error: null }) }),
        }),
      })),
      functions: { invoke: jest.fn(async () => ({ data: null, error: null })) },
    };

    const React = require('react');
    const { AuthProvider, useAuth } = require('../context/AuthContext');

    function Invoker({ cb }: any) {
      const { sendPasswordReset } = useAuth();
      React.useEffect(() => {
        sendPasswordReset('x@y.com').then(cb);
      }, [sendPasswordReset]);
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
    });
  });
});
