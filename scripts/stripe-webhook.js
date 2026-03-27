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

if (!stripeSecret) {
  console.warn('Warning: STRIPE_SECRET not set. Webhook verification will be skipped.');
}

const stripe = stripeSecret ? Stripe(stripeSecret) : null;
const app = express();

app.post('/webhook', express.raw({ type: '*/*' }), (req, res) => {
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
        // TODO: update job/payment status in DB
        console.log('Payment succeeded:', event.data.object.id);
        break;
      case 'charge.refunded':
        // TODO: mark payment as refunded in DB
        console.log('Charge refunded:', event.data.object.id);
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
