import { checkAssets } from '../scripts/optimize-assets';

describe('assets optimization script', () => {
  it('scans images without throwing and returns summary', async () => {
    const res = await checkAssets({ maxSizeBytes: Number.MAX_SAFE_INTEGER });
    expect(res).toBeDefined();
    expect(typeof res.scanned).toBe('number');
    expect(Array.isArray(res.oversized)).toBe(true);
  });
});
