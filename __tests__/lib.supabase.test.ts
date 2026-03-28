describe('lib/supabase fallback client', () => {
  test('provides a minimal mock client when env vars missing', async () => {
    const hasProcess = typeof process !== 'undefined' && process && process.env;
    const oldUrl = hasProcess ? (process.env as any).EXPO_PUBLIC_SUPABASE_URL : undefined;
    const oldKey = hasProcess ? (process.env as any).EXPO_PUBLIC_SUPABASE_ANON_KEY : undefined;
    try {
      if (hasProcess) {
        delete (process.env as any).EXPO_PUBLIC_SUPABASE_URL;
        delete (process.env as any).EXPO_PUBLIC_SUPABASE_ANON_KEY;
      }
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      const { supabase } = require('../lib/supabase');
      expect(supabase).toBeDefined();
      const q = supabase.from('table');
      expect(typeof q.select).toBe('function');
      const sel = q.select();
      expect(typeof sel.order).toBe('function');
      const res = await sel.order();
      expect(res).toHaveProperty('data');
      expect(res).toHaveProperty('error');
    } finally {
      if (hasProcess) {
        if (oldUrl !== undefined) (process.env as any).EXPO_PUBLIC_SUPABASE_URL = oldUrl;
        if (oldKey !== undefined) (process.env as any).EXPO_PUBLIC_SUPABASE_ANON_KEY = oldKey;
      }
    }
  });
});
