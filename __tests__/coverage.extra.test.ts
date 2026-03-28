import { scorePassword } from '../components/PasswordStrength';
import { parseServerError } from '../lib/error';
import analytics from '../lib/analytics';
import { formatDate, formatMemberSince } from '../app/public-profile';
import { setThemeMode, Colors } from '../constants/theme';

describe('extra coverage helpers', () => {
  test('exercise small pure utilities and shims', async () => {
    // theme toggles
    setThemeMode('light');
    setThemeMode('dark');
    expect(Colors).toBeDefined();

    // password scoring
    expect(scorePassword('')).toBe(0);
    expect(scorePassword('Abcd1234!')).toBeGreaterThanOrEqual(1);

    // parseServerError
    expect(parseServerError(null).message).toBe('Unknown error');

    // analytics fallback path logs to console when no endpoint
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await analytics.track('test_event', { sample: 1 });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();

    // public profile formatters
    expect(formatDate('2023-03-15T12:00:00Z')).toMatch(/15\s[A-Za-z]{3}\s2023/);
    expect(formatMemberSince('2021-06-15T12:00:00Z')).toMatch(/June\s2021/);

    // supabase fallback client behavior (no env vars)
    const origProc = (global as any).process;
    try {
      (global as any).process = { env: {} } as any;
      // require afresh to ensure fallback path
      jest.resetModules();
      const mod = require('../lib/supabase');
      const { supabase, getSupabaseClient } = mod;
      const res = await supabase.from('users').select('*').order('id');
      expect(res).toHaveProperty('data');
      const client = getSupabaseClient();
      expect(typeof client.from).toBe('function');
    } finally {
      (global as any).process = origProc;
    }
  });
});
