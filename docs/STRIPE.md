# Stripe webhook and local testing

Quick start for the local webhook listener added in `scripts/stripe-webhook.js`:

1. Install dependencies:

   npm ci --legacy-peer-deps --no-audit --no-fund

2. Create a `.env` file with the following (use staging keys for CI/staging):

   STRIPE*SECRET=sk_test*...
   STRIPE*ENDPOINT_SECRET=whsec*...

3. Run the webhook listener locally:

   npm run start:webhook

4. Use the Stripe CLI to forward events to your local listener:

   stripe listen --forward-to localhost:4242/webhook

Notes:

- This is a scaffold for local and staging testing — implement secure server-side handling and persistent verification before production.
- Webhook handlers should verify signature, validate events, and reconcile payment state in your DB.
