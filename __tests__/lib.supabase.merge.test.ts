import { getSupabaseClient, supabase } from '../lib/supabase';

describe('supabase fallback merge behavior', () => {
  let orig: any;

  beforeAll(() => {
    // Save original container so we can restore it after the test
    // eslint-disable-next-line no-undef
    orig = (global as any).__TEST_SUPABASE__;
  });

  afterAll(() => {
    // Restore original
    // eslint-disable-next-line no-undef
    (global as any).__TEST_SUPABASE__ = orig;
  });

  it('preserves .from when assigning a partial global', () => {
    // Assign a partial object (missing .from) to simulate some tests
    // that previously caused the internal container to lose the `.from`
    // helper.
    // eslint-disable-next-line no-undef
    (global as any).__TEST_SUPABASE__ = {
      auth: { signUp: jest.fn() },
      functions: {},
    };

    const client = getSupabaseClient();
    expect(typeof client.from).toBe('function');

    const fromRes = client.from('users');
    expect(fromRes && typeof fromRes.insert === 'function').toBe(true);

    // The exported wrapper should also provide a working `.from(...).insert`
    const wrapperRes = supabase.from('users');
    expect(wrapperRes && typeof wrapperRes.insert === 'function').toBe(true);
  });
});
