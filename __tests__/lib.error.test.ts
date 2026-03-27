import {parseServerError} from '../lib/error';

describe('parseServerError', () => {
  test('handles null/undefined', () => {
    expect(parseServerError(null).message).toMatch(/Unknown error/);
    expect(parseServerError(undefined).message).toMatch(/Unknown error/);
  });

  test('parses 429 response-like object with retry-after header', () => {
    const res = { status: 429, headers: { get: () => '5' } } as any;
    const p = parseServerError(res);
    expect(p.isRateLimited).toBe(true);
    expect(p.retryAfterSeconds).toBe(5);
  });

  test('parses generic error object with message', () => {
    const p = parseServerError({ message: 'Something broke' });
    expect(p.message).toBe('Something broke');
  });

  test('detects rate-limit from message text', () => {
    const p = parseServerError({ message: 'Rate limit exceeded' });
    expect(p.isRateLimited).toBe(true);
  });
});
