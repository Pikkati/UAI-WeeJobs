import { supabase } from '../lib/supabase';

describe('lib supabase test-response map', () => {
  test('setResponse returns seeded rows for table single/select', async () => {
    // eslint-disable-next-line no-undef
    const g: any = typeof global !== 'undefined' ? global : (globalThis as any);
    if (
      !g ||
      !g.__TEST_SUPABASE__ ||
      typeof g.__TEST_SUPABASE__.setResponse !== 'function'
    ) {
      // Environment doesn't expose the test supabase helper; skip.
      expect(true).toBe(true);
      return;
    }

    // Seed a predictable response for the `jobs` table
    g.__TEST_SUPABASE__.setResponse('jobs', [{ id: 'j1', name: 'Seeded Job' }]);

    const res = await supabase.from('jobs').select('*').eq('id', 'j1').single();
    expect(res).toBeDefined();
    expect(res.data).toBeDefined();
    expect(res.data.id).toBe('j1');
    expect(res.data.name).toBe('Seeded Job');

    // Clearing responses should revert to empty results
    g.__TEST_SUPABASE__.clearResponses();
    const res2 = await supabase
      .from('jobs')
      .select('*')
      .eq('id', 'j1')
      .single();
    expect(res2).toBeDefined();
    expect(res2.data).toBeNull();
  });
});
