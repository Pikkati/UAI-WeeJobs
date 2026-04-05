# Password Reset Email Template

Subject: Reset your WeeJobs password

Hi {{name || 'there'}},

You recently requested to reset the password for your WeeJobs account ({{email}}).

Click the link below to choose a new password:

{{reset_link}}

If you did not request a password reset, you can safely ignore this email. The link will expire in 1 hour.

Thanks,
The WeeJobs Team

---

Notes for implementers:

- When using Supabase, set `redirectTo` to the app URL that will handle the reset token if you want to deep-link into the app.
- Keep reset links short-lived and single-use.
- Consider logging reset requests in `audit_logs` for security monitoring.
