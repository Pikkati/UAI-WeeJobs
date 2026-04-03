import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('Utility and lib function coverage boost', () => {
  test('parseServerError handles null and strings and rate limits', () => {
    const { parseServerError } = require('../lib/error');

    expect(parseServerError(null)).toEqual({ message: 'Unknown error' });

    const resp429 = { status: 429, headers: { get: (_: string) => '7' } } as any;
    const out429 = parseServerError(resp429);
    expect(out429.isRateLimited).toBe(true);
    expect(out429.retryAfterSeconds).toBe(7);
    expect(out429.message).toMatch(/Too many requests/);

    const msg = parseServerError('boom');
    expect(msg.message).toBe('boom');

    const obj = parseServerError({ message: 'Rate limit reached' });
    expect(obj.isRateLimited).toBe(true);
  });

  test('analytics.track logs or calls fetch depending on env', async () => {
    jest.resetModules();
    const old = process.env.ANALYTICS_ENDPOINT;
    try {
      // Case: no endpoint -> console.log
      process.env.ANALYTICS_ENDPOINT = '';
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const { track } = require('../lib/analytics');
      await track('ev1', { a: 1 });
      expect(spy).toHaveBeenCalledWith('[analytics]', 'ev1', { a: 1 });
      spy.mockRestore();

      // Case: endpoint -> fetch called
      process.env.ANALYTICS_ENDPOINT = 'http://example.test/collect';
      (global as any).fetch = jest.fn(() => Promise.resolve({ ok: true }));
      const { track: track2 } = require('../lib/analytics');
      await track2('ev2', { b: 2 });
      expect((global as any).fetch).toHaveBeenCalled();
      const [url, opts] = (global as any).fetch.mock.calls[0];
      expect(url).toBe('http://example.test/collect');
      expect(opts.method).toBe('POST');
      const body = JSON.parse(opts.body);
      expect(body).toHaveProperty('name', 'ev2');
    } finally {
      process.env.ANALYTICS_ENDPOINT = old;
      delete (global as any).fetch;
    }
  });

  test('sentry module exports noop shim when no DSN present', () => {
    jest.resetModules();
    const old = process.env.SENTRY_DSN;
    try {
      delete (process.env as any).SENTRY_DSN;
      const Sentry = require('../lib/sentry');
      expect(typeof Sentry.captureException).toBe('function');
      expect(typeof Sentry.captureMessage).toBe('function');
    } finally {
      if (typeof old !== 'undefined') process.env.SENTRY_DSN = old;
    }
  });

  test('supabase getSupabaseClient binds nested functions', () => {
    jest.resetModules();
    delete (global as any).__TEST_SUPABASE__;
    (global as any).__TEST_SUPABASE__ = {
      auth: {
        name: 'bob',
        getName() { return (this as any).name; }
      }
    } as any;
    const { getSupabaseClient } = require('../lib/supabase');
    const client = getSupabaseClient();
    expect(client.auth.getName()).toBe('bob');
    delete (global as any).__TEST_SUPABASE__;
  });

  test('scorePassword utility behaves for sample passwords', () => {
    const { scorePassword } = require('../components/PasswordStrength');
    expect(scorePassword('')).toBe(0);
    expect(scorePassword('abcd')).toBe(0);
    expect(scorePassword('abcd1234')).toBe(2);
    expect(scorePassword('Abcd1234!')).toBe(4);
  });
});
