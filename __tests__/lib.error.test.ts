import { parseServerError } from '../lib/error';

describe('parseServerError', () => {
  test('returns Unknown for falsy input', () => {
    expect(parseServerError(null).message).toBe('Unknown error');
  });

  test('parses 429 response with retry-after header (get)', () => {
    const resp = { status: 429, headers: { get: () => '120' } };
    const res = parseServerError(resp as any);
    expect(res.isRateLimited).toBe(true);
    expect(res.retryAfterSeconds).toBe(120);
  });

  test('parses 429 response with headers object map', () => {
    const resp = { status: 429, headers: { 'retry-after': '30' } };
    const res = parseServerError(resp as any);
    expect(res.isRateLimited).toBe(true);
    expect(res.retryAfterSeconds).toBe(30);
  });

  test('parses error object with message containing rate limit text', () => {
    const err = { message: 'You are rate-limited for too many requests' };
    const res = parseServerError(err as any);
    expect(res.isRateLimited).toBe(true);
  });

  test('parses plain string error', () => {
    const res = parseServerError('simple error');
    expect(res.message).toBe('simple error');
  });
});
// single test block above
