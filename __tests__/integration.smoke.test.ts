/**
 * Lightweight integration smoke test — ensure key modules import without throwing.
 */
describe('integration smoke', () => {
  test('core modules import without throwing', () => {
    const modules = [
      '../app/_layout',
      '../app/index',
      '../components/TopBar',
      '../lib/supabase',
    ];
    modules.forEach((m) => {
      expect(() => require(m)).not.toThrow();
    });
  });
});
