describe('supabase fallback', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('provides a minimal supabase mock when env vars missing', async () => {
    // Ensure env vars are unset by replacing global.process.env for import-time detection
    const originalProcess = (global as any).process;
    (global as any).process = { env: {} } as any;

    const mod = require('../lib/supabase');
    const { supabase } = mod;

    // from().select().single() should resolve to a { data, error }
    const result = await supabase.from('users').select('*').single();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('error');

    // functions.invoke fallback should resolve
    if (supabase.functions && typeof supabase.functions.invoke === 'function') {
      const func = await supabase.functions.invoke('test');
      expect(func).toHaveProperty('data');
      expect(func).toHaveProperty('error');
    }

    // restore global process
    (global as any).process = originalProcess;
  });
});
