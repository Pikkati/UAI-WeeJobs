import * as analytics from '../lib/analytics';

describe('analytics.track', () => {
  const origConsole = console.log;
  const origFetch = (global as any).fetch;

  afterEach(() => {
    console.log = origConsole;
    (global as any).fetch = origFetch;
    delete (process as any).env.ANALYTICS_ENDPOINT;
  });

  test('logs to console when no endpoint', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await analytics.track('test_event', { a: 1 });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('sends fetch when endpoint present', async () => {
    const old = (process as any).env.ANALYTICS_ENDPOINT;
    (process as any).env.ANALYTICS_ENDPOINT = 'https://example.com/track';
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true });
    await analytics.track('event2', { b: 2 });
    expect((global as any).fetch).toHaveBeenCalled();
    delete (global as any).fetch;
    if (old !== undefined) (process as any).env.ANALYTICS_ENDPOINT = old;
    else delete (process as any).env.ANALYTICS_ENDPOINT;
  });
});
