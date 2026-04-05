import { parseServerError } from '../lib/error';

describe('parseServerError', () => {
  test('returns Unknown error for falsy input', () => {
    expect(parseServerError(null).message).toBe('Unknown error');
    expect(parseServerError(undefined).message).toBe('Unknown error');
  });

  test('parses 429 response-like object with retry-after header', () => {
    const resp = {
      status: 429,
      headers: { get: (k: string) => (k === 'retry-after' ? '60' : null) },
    } as any;
    const parsed = parseServerError(resp);
    expect(parsed.isRateLimited).toBe(true);
    expect(parsed.retryAfterSeconds).toBe(60);
    expect(parsed.message).toMatch(/Too many requests/i);
  });

  test('detects rate limit from error message', () => {
    const err = { message: 'Rate limit exceeded, try later' } as any;
    const parsed = parseServerError(err);
    expect(parsed.isRateLimited).toBe(true);
    expect(parsed.message).toMatch(/Too many attempts/i);
  });

  test('falls back to string conversion', () => {
    expect(parseServerError('simple string').message).toBe('simple string');
  });
});
