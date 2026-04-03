import { supabase, getSupabaseClient } from '../lib/supabase';

describe('supabase wrapper and resolver', () => {
  let orig: any;

  beforeAll(() => {
    orig = (global as any).__TEST_SUPABASE__;
  });

  afterAll(() => {
    (global as any).__TEST_SUPABASE__ = orig;
  });

  test('supabase.from().insert and supabase.auth.signUp call underlying mocks', async () => {
    const insertMock = jest.fn(async () => ({ data: null, error: null }));
    const fromMock = jest.fn((table: string) => ({ insert: insertMock }));
    const signUpMock = jest.fn(async () => ({ data: { user: { id: 'u1' } }, error: null }));
    (global as any).__TEST_SUPABASE__ = {
      from: fromMock,
      auth: { signUp: signUpMock },
      functions: { invoke: jest.fn(async () => ({ data: null, error: null })) },
    };

    const res = await supabase.from('jobs').insert({ foo: 'bar' });
    expect(fromMock).toHaveBeenCalledWith('jobs');
    expect(insertMock).toHaveBeenCalledWith({ foo: 'bar' });

    await supabase.auth.signUp({ email: 'x' });
    expect(signUpMock).toHaveBeenCalledWith({ email: 'x' });
  });

  test('getSupabaseClient returns wrapper with callable/insertable `.from`', async () => {
    const insertSpy = jest.fn(async () => ({ data: null, error: null }));
    (global as any).__TEST_SUPABASE__.from = (table: string) => ({ insert: insertSpy });

    const client = getSupabaseClient();
    const target = client.from('users');
    expect(typeof target.insert).toBe('function');

    await target.insert({ hello: 'world' });
    expect(insertSpy).toHaveBeenCalledWith({ hello: 'world' });
  });
});
