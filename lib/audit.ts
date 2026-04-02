import { getSupabaseClient } from './supabase';

// Lazy-load Sentry to avoid test/CI failures when package isn't present
const sentry = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    return require('./sentry');
  } catch {
    return { captureException: () => {} };
  }
})();

/**
 * Write an audit event to the `audit_logs` table (best-effort).
 * Payload is stored as JSON in the `payload` column. This function
 * intentionally swallows errors to avoid impacting user flows.
 */
export async function auditEvent(event: string, payload?: any, userId?: string, supabaseClient?: any): Promise<void> {
  try {
    const client = supabaseClient ?? getSupabaseClient();
    if (!client || typeof client.from !== 'function') return;

    const body = {
      event,
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload || {}),
      user_id: userId ?? null,
      created_at: new Date().toISOString(),
    } as any;

    try {
      // Best-effort insert; ignore any errors
      await client.from('audit_logs').insert(body);
    } catch (e) {
      try { sentry.captureException?.(e); } catch {}
    }
  } catch (e) {
    try { sentry.captureException?.(e); } catch {}
  }
}

export default { auditEvent };
