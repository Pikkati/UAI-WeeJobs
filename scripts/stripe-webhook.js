#!/usr/bin/env node
/* Simple Stripe webhook listener for local testing and staging.
   - Expects STRIPE_SECRET and STRIPE_ENDPOINT_SECRET in env or .env
   - Use `npm run start:webhook` to start locally.
*/
let express;
let Stripe;

try {
  express = require('express');
} catch (e) {
  express = null;
}

try {
  Stripe = require('stripe');
} catch (e) {
  Stripe = null;
}

const env = (typeof process !== 'undefined' && process.env) ? process.env : {};
const port = env.PORT || 4242;
const stripeSecret = env.STRIPE_SECRET || env.EXPO_PUBLIC_STRIPE_SECRET;
const endpointSecret = env.STRIPE_ENDPOINT_SECRET || env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY;

if (!stripeSecret) {
  console.warn('Warning: STRIPE_SECRET not set. Webhook verification will be skipped.');
}
if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. DB updates will be unavailable.');
}

const stripe = Stripe && stripeSecret ? Stripe(stripeSecret) : null;
const supabase = supabaseUrl && supabaseKey ? require('@supabase/supabase-js').createClient(supabaseUrl, supabaseKey) : null;
const app = express ? express() : null;

const upsertJobPaymentIntent = async (paymentIntent) => {
  const metadata = paymentIntent.metadata || {};
  const jobId = metadata.job_id;
  const paymentType = metadata.payment_type || 'deposit';
  if (!jobId || !supabase) {
    return null;
  }

  const updates = {
    stripe_payment_intent: paymentIntent.id,
  };

  if (paymentType === 'deposit') {
    updates.deposit_paid = true;
    updates.deposit_paid_at = new Date().toISOString();
    updates.status = 'booked';
  } else if (paymentType === 'final') {
    updates.final_payment_paid = true;
    updates.final_payment_paid_at = new Date().toISOString();
    updates.status = 'paid';
    if (typeof paymentIntent.amount_received === 'number') {
      updates.final_payment_amount = paymentIntent.amount_received / 100; // convert pence to pounds
    }
  }

  const { data, error } = await supabase.from('jobs').update(updates).eq('id', jobId);
  if (error) {
    throw error;
  }
  return data;
};

const upsertJobRefund = async (charge) => {
  if (!supabase) {
    return null;
  }

  let jobId = charge.metadata?.job_id;
  let paymentType = charge.metadata?.payment_type || 'deposit';

  if (!jobId && charge.payment_intent && stripe) {
    const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent);
    jobId = paymentIntent.metadata?.job_id;
    paymentType = paymentIntent.metadata?.payment_type || paymentType;
  }

  if (!jobId) {
    return null;
  }

  const updates = {
    deposit_refunded: true,
    status: 'cancelled_by_customer',
  };

  const { data, error } = await supabase.from('jobs').update(updates).eq('id', jobId);
  if (error) {
    throw error;
  }
  return data;
};

async function processStripeEvent(event, supabaseClient) {
  if (!event || !event.type) {
    throw new Error('Invalid Stripe event payload');
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      if (!paymentIntent || !paymentIntent.metadata?.job_id) {
        console.log('payment_intent.succeeded missing job_id; skipped DB update');
        return null;
      }
      return await upsertJobPaymentIntent(paymentIntent);
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      if (!paymentIntent || !paymentIntent.metadata?.job_id || !supabaseClient) {
        console.log('payment_intent.payment_failed missing job_id or supabase; skipped DB update');
        return null;
      }

      const jobId = paymentIntent.metadata.job_id;
      const updates = {
        stripe_payment_intent: paymentIntent.id,
        status: 'payment_failed',
        last_payment_error: paymentIntent.last_payment_error?.message || null,
      };

      const { data, error } = await supabaseClient.from('jobs').update(updates).eq('id', jobId);
      if (error) {
        throw error;
      }
      return data;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      return await upsertJobRefund(charge);
    }

    default:
      console.log('Unhandled event type:', event.type);
      return null;
  }
}

if (app && express) {
  app.post('/webhook', express.raw({ type: '*/*' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const buf = req.body;

    if (stripe && endpointSecret && sig) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } catch (err) {
      console.error('⚠️  Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log('Received event:', event.type);
    try {
      await processStripeEvent(event, supabase);
      return res.json({ received: true });
    } catch (dbErr) {
      console.error('Failed to process Stripe event', dbErr);
      return res.status(500).send('DB update failed');
    }
  }

  // Fallback parsing if stripe not configured — attempt JSON parse
  try {
    const json = JSON.parse(buf.toString('utf8'));
    console.log('Received (unverified) event:', json.type || json);
    return res.json({ received: true });
  } catch (err) {
    console.error('Failed to parse webhook body', err.message);
    return res.status(400).send('Invalid payload');
  }
  });

  app.get('/', (req, res) => res.send('Stripe webhook listener. POST /webhook'));

  app.listen(port, () => console.log(`Stripe webhook listener running on http://localhost:${port}/webhook`));
}

module.exports = {
  processStripeEvent,
  upsertJobPaymentIntent,
  upsertJobRefund,
};
