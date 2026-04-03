import * as analytics from '../lib/analytics';

describe('analytics.track', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  test('logs to console when ANALYTICS_ENDPOINT not set', async () => {
    process.env.ANALYTICS_ENDPOINT = '';
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await analytics.track('test_event', { a: 1 });
    expect(spy).toHaveBeenCalledWith('[analytics]', 'test_event', { a: 1 });
    spy.mockRestore();
  });

  test('calls fetch when ANALYTICS_ENDPOINT set', async () => {
    process.env.ANALYTICS_ENDPOINT = 'https://example.test/analytics';
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    // @ts-ignore
    global.fetch = mockFetch;
    await analytics.track('evt', { x: true });
    expect(mockFetch).toHaveBeenCalled();
  });
});
