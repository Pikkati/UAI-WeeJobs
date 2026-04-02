import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Optional Sentry for Deno via esm.sh. If SENTRY_DSN is set in env, we'll attempt
// to initialize Sentry to capture runtime errors from this function.
let Sentry: any = null;
try {
  // @ts-ignore
  Sentry = await import("https://esm.sh/@sentry/node@7?target=deno");
  const dsn = Deno.env.get("SENTRY_DSN");
  if (dsn) {
    try {
      Sentry.init({ dsn, environment: Deno.env.get("DEPLOYMENT_ENV") || "development" });
      console.log("Sentry initialized for Edge Function: resend-verification");
    } catch (e) {
      console.warn("Sentry init failed:", (e as any)?.message || e);
      Sentry = null;
    }
  } else {
    Sentry = null;
  }
} catch (e) {
  // Import failed or not available in this runtime; continue without Sentry
  console.warn("Sentry import/init failed:", (e as any)?.message || e);
  Sentry = null;
}

// Deno runtime globals are used in this file; declare for TypeScript compile-time
declare const Deno: any;

serve(async (req) => {
  try {
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

    const body = await req.json().catch(() => ({}));
    const email = (body && body.email) || '';
    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('EXPO_PUBLIC_SUPABASE_URL') || '';
    const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY') || '';

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.warn('Resend-verification: Supabase configuration missing');
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const serviceSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Try server-side admin API if available on the client library
    try {
      if (serviceSupabase && serviceSupabase.auth && (serviceSupabase.auth as any).admin) {
        const admin: any = (serviceSupabase.auth as any).admin;
        if (typeof admin.generateLink === 'function') {
          // Attempt to generate/send verification link (best-effort)
          try {
            await admin.generateLink({ type: 'signup', email });
            return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          } catch (e) {
            // swallow and fallback
            console.warn('admin.generateLink failed:', (e as any)?.message || e);
          }
        }
      }
    } catch (e) {
      // non-fatal
      console.warn('admin resend attempt failed:', (e as any)?.message || e);
    }

    // Fallback: call Supabase OTP endpoint directly using service role key (best-effort)
    try {
      const otpRes = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ email, type: 'signup' }),
      });

      if (otpRes.ok) {
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      const text = await otpRes.text().catch(() => '');
      console.warn('otp endpoint returned non-ok:', otpRes.status, text);
    } catch (e) {
      console.warn('otp fallback failed:', (e as any)?.message || e);
    }

    // If we reach here nothing worked
    return new Response(JSON.stringify({ error: 'Unable to resend verification' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    try { if (Sentry) Sentry.captureException(error); } catch {}
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
