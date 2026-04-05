# Production Readiness Checklist

Use this checklist before promoting changes from `UAI-Development` to `main` and deploying to production.

Core checks

- [ ] Database schema migrations: all new migrations present, tested, reversible, and applied to a staging copy.
- [ ] Row Level Security (RLS): policies reviewed and tested on staging with sample accounts.
- [ ] Backups: automated backups configured and tested; restore tested on a disposable instance.
- [ ] Secrets: production secrets stored in GitHub Secrets / platform secret storage — never commit secrets to repo.

Application checks

- [ ] CI Green: all status checks pass on `UAI-Development` PRs (TypeScript, ESLint, Tests, Dependency Audit).
- [ ] End-to-end or smoke tests: critical flows (login, create job, payment) pass on staging.
- [ ] Monitoring: Sentry (or equivalent) integrated and DSN configured in staging and production.
- [ ] Logging & alerts: ensure critical errors generate alerts and logs are centralized.

Payments & external integrations

- [ ] Stripe: webhook endpoints validated, signature verification enabled, and test webhook replay path verified.
- [ ] Supabase: service role keys and anon keys scoped correctly; RLS verified for all endpoints.

Operational checks

- [ ] EAS / app signing: credentials configured for production builds (iOS/Android) and tested.
- [ ] Rate limiting & resource quotas: ensure APIs and DB can handle expected load; set quotas if needed.
- [ ] Rollback plan: documented rollback steps for code and DB schema.

Post-deploy

- [ ] Smoke run in production: perform quick post-deploy smoke tests and verify monitoring/alerts.
- [ ] Run a quick security scan and review any new dependencies introduced.
