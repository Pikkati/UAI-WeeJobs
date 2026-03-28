import { parseServerError } from '../lib/error';

describe('parseServerError', () => {
  test('handles null/undefined', () => {
    expect(parseServerError(null).message).toBe('Unknown error');
    expect(parseServerError(undefined).message).toBe('Unknown error');
  });

  test('handles Response-like 429 with headers.get', () => {
    const res: any = { status: 429, headers: { get: (k: string) => (k === 'retry-after' ? '120' : null) } };
    const parsed = parseServerError(res);
    expect(parsed.isRateLimited).toBe(true);
    expect(parsed.retryAfterSeconds).toBe(120);
  });

  test('handles Response-like 429 with headers object', () => {
    const res: any = { status: 429, headers: { 'retry-after': '30' } };
    const parsed = parseServerError(res);
    expect(parsed.isRateLimited).toBe(true);
    expect(parsed.retryAfterSeconds).toBe(30);
  });

  test('handles error object with rate limit message', () => {
    const err = { message: 'Too many requests: rate limit exceeded' };
    const parsed = parseServerError(err);
    expect(parsed.isRateLimited).toBe(true);
    expect(parsed.message).toMatch(/too many attempts/i);
  });

  test('falls back to string conversion', () => {
    expect(parseServerError('boom').message).toBe('boom');
  });
});
