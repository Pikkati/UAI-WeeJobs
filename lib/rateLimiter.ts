// Very small in-memory rate limiter used on the client and in-edge runtimes
// Not suitable for horizontal-scaled servers — prefer Redis or other shared
// stores for production APIs. This is intentionally simple and dependency-free.

type AttemptsMap = Map<string, number[]>;

const attempts: AttemptsMap = new Map();

function prune(arr: number[], windowMs: number) {
  const cutoff = Date.now() - windowMs;
  let i = 0;
  while (i < arr.length && arr[i] < cutoff) i++;
  if (i > 0) arr.splice(0, i);
}

export function isRateLimited(key: string, maxAttempts = 5, windowMs = 60 * 1000): boolean {
  const arr = attempts.get(key) || [];
  prune(arr, windowMs);
  return arr.length >= maxAttempts;
}

export function markAttempt(key: string, maxAttempts = 5, windowMs = 60 * 1000): void {
  const now = Date.now();
  const arr = attempts.get(key) || [];
  prune(arr, windowMs);
  arr.push(now);
  // keep array size bounded
  if (arr.length > Math.max(maxAttempts * 3, 100)) arr.splice(0, arr.length - Math.max(maxAttempts * 3, 100));
  attempts.set(key, arr);
}

export async function tryPerform<T>(
  key: string,
  fn: () => Promise<T>,
  opts?: { maxAttempts?: number; windowMs?: number }
): Promise<{ ok: boolean; result?: T; isRateLimited?: boolean; error?: any }> {
  const maxAttempts = opts?.maxAttempts ?? 5;
  const windowMs = opts?.windowMs ?? 60 * 1000;
  if (isRateLimited(key, maxAttempts, windowMs)) return { ok: false, isRateLimited: true };
  markAttempt(key, maxAttempts, windowMs);
  try {
    const r = await fn();
    return { ok: true, result: r };
  } catch (e) {
    return { ok: false, error: e };
  }
}

export default { isRateLimited, markAttempt, tryPerform };
