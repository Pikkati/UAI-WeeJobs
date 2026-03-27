Resend Verification - Server Endpoint

Goal

Provide a secure server-side endpoint that can resend an email verification to an existing Supabase user. The endpoint must be executed server-side (Edge Function, Cloud Function, or small server) because it needs access to the Supabase "service_role" key.

Behavior

- Accepts POST { email: string }
- Finds the user by email using the Supabase Admin API / service client
- Triggers a verification email to the user via Supabase's admin API or by updating the user and using a templated email
- Returns 200 on success, 4xx/5xx on failure with a helpful message

Example (Supabase Edge Function - TypeScript)

This is a guideline implementation. Adjust imports and function wrapper to your host (Supabase Edge Functions, Vercel, Netlify Functions, etc.).

```ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // keep this secret

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Missing email' });

  try {
    // Find user
    const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ email });
    if (listErr) throw listErr;
    const user = users?.find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Option A: Use Supabase admin API to generate a signup/verification link and email it via your SMTP provider.
    // Some Supabase server APIs allow generating email links. If available, use that. Otherwise, trigger your own templated email.

    // Example pseudo-code if your SDK exposes a generate link function:
    // const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateConfirmationLink(user.id, { redirectTo: process.env.APP_URL });
    // if (linkErr) throw linkErr;
    // await sendEmail({ to: email, subject: 'Verify your email', body: `Click ${linkData.url}` });

    // Option B (generic): Re-send a verification by invoking your own email sender with a short-lived token.
    // Create a signed token (JWT) that your app can verify, store it or mark it in audit logs, and email a link to the app that will accept the token and confirm the user.

    // For now return success indicating an email was queued (implementers should replace this with real email send)
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('resend verification error', err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
```

Security & Notes

- Never expose the Supabase service role key on the client. This endpoint must be server-side only.
- Rate-limit this endpoint to prevent abuse and add logging to `audit_logs` or Sentry.
- If your provider supports it, prefer using Supabase's admin helper to generate verification links. If not available, implement a secure token-based flow and a separate confirmation endpoint that the user will visit to confirm their email.

Client integration

- Client `AuthContext.resendVerification(email)` will POST to `${EXPO_PUBLIC_API_BASE}/resend-verification`.
- Provide `EXPO_PUBLIC_API_BASE` in your environment variables to point to the server's base URL.

Example response contract

- 200 { ok: true }
- 404 { error: 'User not found' }
- 400 { error: 'Missing email' }
- 429 { error: 'Rate limit' }
- 500 { error: 'Server error' }
