// Tests for supabase proxy binding and global override behavior
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => null),
  },
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    functions: { invoke: jest.fn() },
  })),
}));

describe('supabase wrapper proxy and binding', () => {
  afterEach(() => {
    // Clean up any test global overrides and module cache
    // so each test imports the module fresh.
    // eslint-disable-next-line no-undef
    delete global.__TEST_SUPABASE__;
    jest.resetModules();
    jest.restoreAllMocks();
    process.env.EXPO_PUBLIC_SUPABASE_URL = '';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = '';
  });

  test('delegates exported calls to global.__TEST_SUPABASE__ when provided', async () => {
    const signInMock = jest.fn(async () => ({
      data: { user: { id: 'u1', confirmed_at: 'now' } },
      error: null,
    }));
    const fromMock = jest
      .fn()
      .mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: { id: 'u1', email: 't@t.com', name: 'T', role: 'customer' },
              error: null,
            }),
          }),
        }),
      }));

    // Provide a stable test container like jest-setup does in CI
    // eslint-disable-next-line no-undef
    global.__TEST_SUPABASE__ = {
      auth: { signInWithPassword: signInMock, signOut: jest.fn() },
      from: fromMock,
      functions: { invoke: jest.fn(async () => ({ data: null, error: null })) },
    };

    const { supabase } = require('../lib/supabase');

    const res = await supabase.auth.signInWithPassword({
      email: 't@t.com',
      password: 'pw',
    });

    expect(signInMock).toHaveBeenCalled();
    expect(res).toBeDefined();
  });

  test('getSupabaseClient binds nested methods to their owner (preserves this)', async () => {
    let seenThis: any = null;
    const auth = {
      signUp: jest.fn(function () {
        // capture the `this` value when invoked
        // @ts-ignore
        seenThis = this;
        return { data: null, error: null };
      }),
    };

    // eslint-disable-next-line no-undef
    global.__TEST_SUPABASE__ = {
      auth,
      from: () => ({
        select: () => ({
          eq: () => ({ single: async () => ({ data: null, error: null }) }),
        }),
      }),
      functions: { invoke: jest.fn() },
    };

    const { getSupabaseClient } = require('../lib/supabase');
    const client = getSupabaseClient();

    await (client.auth as any).signUp({ email: 'a', password: 'b' });

    expect(seenThis).toBe(auth);
    // original mock should still be recognised as a Jest mock
    expect((auth.signUp as any)._isMockFunction).toBeTruthy();
  });
});
