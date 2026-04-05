export type ParsedError = {
  message: string;
  isRateLimited?: boolean;
  retryAfterSeconds?: number | null;
};

export function parseServerError(err: any): ParsedError {
  if (!err) return { message: 'Unknown error' };

  // If it's a fetch/Response-like object
  if (typeof err === 'object' && typeof err.status === 'number') {
    const status = err.status;
    if (status === 429) {
      const ra =
        err.headers &&
        (err.headers.get
          ? err.headers.get('retry-after')
          : err.headers['retry-after']);
      const retryAfterSeconds = ra ? parseInt(String(ra), 10) || null : null;
      return {
        message: 'Too many requests. Please try again later.',
        isRateLimited: true,
        retryAfterSeconds,
      };
    }
    const msg = err.message || err.error || JSON.stringify(err);
    return { message: String(msg) };
  }

  // If it's an error object with message
  if (err && typeof err === 'object' && 'message' in err) {
    const message = String(err.message || err.error || 'Unknown server error');
    const lower = message.toLowerCase();
    if (
      lower.includes('too many') ||
      lower.includes('rate limit') ||
      lower.includes('rate-limited')
    ) {
      return {
        message: 'Too many attempts. Please try again later.',
        isRateLimited: true,
        retryAfterSeconds: null,
      };
    }
    return { message };
  }

  // Fallback to string
  return { message: String(err) };
}
