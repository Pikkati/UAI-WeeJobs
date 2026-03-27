import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimit } from "https://deno.land/x/oak_rate_limit@0.1.0/mod.ts";
// Deno runtime globals are used in this file; declare for TypeScript compile-time
declare const Deno: any;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
});

serve(async (req) => {
  const ip = req.headers.get("x-forwarded-for") || req.conn.remoteAddr.hostname;
  const limited = limiter(ip);

  if (limited) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth header" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!   
      );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(JSON.stringify({ error: "Missing jobId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorised" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: job, error: jobError } = await serviceSupabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (job.customer_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!job.tradie_id) {
      return new Response(JSON.stringify({ error: "No tradie selected yet" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (job.deposit_paid || job.status === "booked") {
      return new Response(JSON.stringify({ error: "Deposit already paid" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
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
      { apiVersion: "2023-10-16" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: "gbp",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: {
        job_id: job.id,
        payment_type: "deposit",
        customer_user_id: user.id,
        tradie_id: job.tradie_id,
      },
    });

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        merchantDisplayName: "WeeJobs",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
