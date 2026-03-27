#!/usr/bin/env node
/* Simple Stripe webhook listener for local testing and staging.
   - Expects STRIPE_SECRET and STRIPE_ENDPOINT_SECRET in env or .env
   - Use `npm run start:webhook` to start locally.
*/
const express = require('express');
const Stripe = require('stripe');

const port = process.env.PORT || 4242;
const stripeSecret = process.env.STRIPE_SECRET || process.env.EXPO_PUBLIC_STRIPE_SECRET;
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!stripeSecret) {
  console.warn('Warning: STRIPE_SECRET not set. Webhook verification will be skipped.');
}
if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. DB updates will be unavailable.');
}

const stripe = stripeSecret ? Stripe(stripeSecret) : null;
const supabase = supabaseUrl && supabaseKey ? require('@supabase/supabase-js').createClient(supabaseUrl, supabaseKey) : null;
const app = express();

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
    // Handle key Stripe event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        try {
          const updated = await upsertJobPaymentIntent(event.data.object);
          console.log('Updated job for payment_intent.succeeded:', updated ? 'ok' : 'skipped');
        } catch (dbErr) {
          console.error('Failed to update job status after payment_intent.succeeded', dbErr);
          return res.status(500).send('DB update failed');
        }
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        try {
          const paymentIntent = event.data.object;
          const metadata = paymentIntent.metadata || {};
          const jobId = metadata.job_id;
          if (jobId && supabase) {
            const { data: updated, error } = await supabase
              .from('jobs')
              .update({
                stripe_payment_intent: paymentIntent.id,
                status: 'payment_failed',
                last_payment_error: paymentIntent.last_payment_error?.message || null,
              })
              .eq('id', jobId);
            if (error) throw error;
            console.log('Updated job for payment_intent.payment_failed:', updated ? 'ok' : 'skipped');
          } else {
            console.log('No job_id metadata found for payment_intent.payment_failed; skipped DB update.');
          }
        } catch (dbErr) {
          console.error('Failed to update job status after payment_intent.payment_failed', dbErr);
          return res.status(500).send('DB update failed');
        }
        break;
      case 'charge.refunded':
        console.log('Charge refunded:', event.data.object.id);
        try {
          const updated = await upsertJobRefund(event.data.object);
          console.log('Updated job for charge.refunded:', updated ? 'ok' : 'skipped');
        } catch (dbErr) {
          console.error('Failed to update job status after charge.refunded', dbErr);
          return res.status(500).send('DB update failed');
        }
        break;
      default:
        // Log unhandled event types
        console.log('Unhandled event type:', event.type);
    }
    return res.json({ received: true });
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
