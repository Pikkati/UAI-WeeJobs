import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { rateLimit } from 'https://deno.land/x/oak_rate_limit@0.1.0/mod.ts';
// Optional Sentry for Deno via esm.sh. If SENTRY_DSN is set in env, we'll attempt
// to initialize Sentry to capture runtime errors from this function.
let Sentry: any = null;
try {
  // @ts-ignore
  Sentry = await import('https://esm.sh/@sentry/node@7?target=deno');
  const dsn = Deno.env.get('SENTRY_DSN');
  if (dsn) {
    try {
      Sentry.init({
        dsn,
        environment: Deno.env.get('DEPLOYMENT_ENV') || 'development',
      });
      console.log('Sentry initialized for Edge Function');
    } catch (e) {
      console.warn('Sentry init failed:', (e as any)?.message || e);
      Sentry = null;
    }
  } else {
    Sentry = null;
  }
} catch (e) {
  // Import failed or not available in this runtime; continue without Sentry
  console.warn('Sentry init failed:', (e as any)?.message || e);
  Sentry = null;
}
// Deno runtime globals are used in this file; declare for TypeScript compile-time
declare const Deno: any;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
});

serve(async (req) => {
  const ip = req.headers.get('x-forwarded-for') || req.conn.remoteAddr.hostname;
  const limited = limiter(ip);

  if (limited) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      },
    );

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!,
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(JSON.stringify({ error: 'Missing jobId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      if (Sentry)
        Sentry.captureException(
          new Error('Unauthorised access to create-deposit-payment-intent'),
        );
      return new Response(JSON.stringify({ error: 'Unauthorised' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: job, error: jobError } = await serviceSupabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      if (Sentry) Sentry.captureException(new Error(`Job not found: ${jobId}`));
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (job.customer_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!job.tradie_id) {
      return new Response(JSON.stringify({ error: 'No tradie selected yet' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (job.deposit_paid || job.status === 'booked') {
      if (Sentry)
        Sentry.captureException(
          new Error(`Deposit already paid for job: ${jobId}`),
        );
      return new Response(JSON.stringify({ error: 'Deposit already paid' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const depositAmount = Math.round(Number(job.deposit_amount ?? 5000));

    const customer = await stripe.customers.create({
      metadata: {
        supabase_user_id: user.id,
      },
    });

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2023-10-16' },
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: 'gbp',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: {
        job_id: job.id,
        payment_type: 'deposit',
        customer_user_id: user.id,
        tradie_id: job.tradie_id,
      },
    });

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        merchantDisplayName: 'WeeJobs',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    try {
      if (Sentry) {
        Sentry.captureException(error);
        // flush to ensure events are sent before function exits (best-effort)
        if (typeof Sentry.flush === 'function') {
          await Sentry.flush(2000);
        }
      }
    } catch (e) {
      console.warn('Sentry capture failed', (e as any)?.message || e);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
