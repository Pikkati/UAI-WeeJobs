import { track } from '../lib/analytics';
import * as analytics from '../lib/analytics';

describe('analytics.track', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV } as NodeJS.ProcessEnv;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('falls back to console.log when ANALYTICS_ENDPOINT is not set', async () => {
    delete process.env.ANALYTICS_ENDPOINT;
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await track('test_event', { a: 1 });

    expect(spy).toHaveBeenCalledWith('[analytics]', 'test_event', { a: 1 });
    spy.mockRestore();
  });

  test('uses fetch when ANALYTICS_ENDPOINT is set', async () => {
    process.env.ANALYTICS_ENDPOINT = 'https://example.test/analytics';
    // @ts-ignore - provide a mock global fetch
    global.fetch = jest.fn(() => Promise.resolve({ ok: true })) as any;

    await track('remote_event', { b: 2 });

    expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(0);
    const [url, opts] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://example.test/analytics');
    expect(opts.method).toBe('POST');
    expect(typeof opts.body).toBe('string');
  });
});

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
