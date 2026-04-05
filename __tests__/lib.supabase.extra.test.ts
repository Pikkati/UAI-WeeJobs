describe('lib/supabase extra tests', () => {
  beforeEach(() => {
    jest.resetModules();
    // clear any previous global test client
    if (typeof global !== 'undefined') delete (global as any).__TEST_SUPABASE__;
  });

  test('fallback chain returns data/error when env vars missing', async () => {
    const origProcess = (global as any).process;
    (global as any).process = { env: {} } as any;
    const mod = require('../lib/supabase');
    const { supabase } = mod;

    const res = await supabase.from('users').select('*').order('id');
    expect(res).toBeDefined();
    expect(res).toHaveProperty('data');
    expect(res).toHaveProperty('error');

    (global as any).process = origProcess;
  });

  test('global __TEST_SUPABASE__ delegates to exported supabase and getSupabaseClient', async () => {
    jest.resetModules();
    (global as any).__TEST_SUPABASE__ = {
      auth: {
        signUp: jest.fn(async (opts: any) => ({
          data: { user: { id: 'u1' } },
          error: null,
        })),
      },
      from: (table: string) => ({
        select: () => ({
          order: async () => ({ data: null, error: null }),
          eq: async () => ({ data: [], error: null }),
          in: async () => ({ data: [], error: null }),
          single: async () => ({ data: null, error: null }),
        }),
        update: async () => ({ data: [], error: null }),
        insert: async () => ({ data: [], error: null }),
      }),
      functions: { invoke: async () => ({ data: null, error: null }) },
    };

    const { supabase, getSupabaseClient } = require('../lib/supabase');

    const out = await supabase.auth.signUp({ email: 'a@b' });
    expect((global as any).__TEST_SUPABASE__.auth.signUp).toHaveBeenCalled();
    expect(out).toHaveProperty('data');

    const client = getSupabaseClient();
    expect(typeof client.from).toBe('function');
    const r = await client.from('t').select().order('x');
    expect(r).toHaveProperty('data');
  });
});
