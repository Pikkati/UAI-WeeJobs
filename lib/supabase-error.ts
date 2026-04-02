import { parseServerError } from './error';

// Lazy-load Sentry to avoid test/CI failures when not installed
const sentry = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    return require('./sentry');
  } catch {
    return { captureException: () => {} };
  }
})();

export class SupabaseError extends Error {
  isRateLimited?: boolean;
  retryAfterSeconds?: number | null;
  original?: any;
  context?: string;
  constructor(message: string, opts?: { isRateLimited?: boolean; retryAfterSeconds?: number | null; original?: any; context?: string }) {
    super(message);
    this.name = 'SupabaseError';
    this.isRateLimited = opts?.isRateLimited;
    this.retryAfterSeconds = opts?.retryAfterSeconds ?? null;
    this.original = opts?.original;
    this.context = opts?.context;
  }
}

export type SupabaseResponse<T> = { data?: T; error?: any };

export function handleSupabaseResult<T>(res: SupabaseResponse<T>, context?: string): T {
  if (!res) throw new SupabaseError('No response from server', { context });
  if (res.error) {
    try { sentry.captureException?.(res.error); } catch {}
    const parsed = parseServerError(res.error);
    const message = parsed?.message || 'Server error';
    throw new SupabaseError(message, { isRateLimited: parsed.isRateLimited, retryAfterSeconds: parsed.retryAfterSeconds ?? null, original: res.error, context });
  }
  return (res.data as T) ?? (null as any);
}

export async function awaitAndHandle<T>(p: Promise<SupabaseResponse<T>>, context?: string): Promise<T> {
  const res = await p;
  return handleSupabaseResult(res, context);
}

export default { SupabaseError, handleSupabaseResult, awaitAndHandle };
