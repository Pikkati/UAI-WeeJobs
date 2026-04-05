## Indexing for Production

To ensure good performance at scale, verify that the following indexes exist (see schema.sql for reference):

- `CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);`
- `CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);`
- `CREATE INDEX IF NOT EXISTS idx_jobs_tradie_id ON jobs(tradie_id);`
- `CREATE INDEX IF NOT EXISTS idx_jobs_area ON jobs(area);`
- `CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);`
- `CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);`
- `CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);`
- `CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);`
- `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`
- `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`

Review and add additional indexes for new tables or high-traffic queries as needed.

## Backup/Restore Test Checklist

Before major releases or after schema changes:

- [ ] Take a fresh logical backup (see above)
- [ ] Restore into a temporary Supabase project or local Postgres instance
- [ ] Apply all migrations in order: schema.sql → migration-full.sql → production-rls.sql
- [ ] Run smoke tests on restored DB (basic queries, RLS checks)
- [ ] Validate indexes and constraints
- [ ] Document any manual steps or issues
      Database backups and restore (Supabase/Postgres)
      ===============================================

Recommended backup and restore practices for the staging/production Supabase projects.

1. Scheduled snapshots (Supabase)

- Use Supabase project settings to enable automated backups/snapshots.
- Configure retention windows appropriate to your compliance needs.

2. Manual logical backup (pg_dump)

- Export schema and data: `pg_dump --format=custom --file=weejobs-backup.dump --dbname=<CONN_STRING>`
- For only schema: `pg_dump --schema-only --file=schema.sql --dbname=<CONN_STRING>`

3. Restore (pg_restore / psql)

- Restore custom dump: `pg_restore --clean --no-owner --dbname=<CONN_STRING> weejobs-backup.dump`
- Restore schema-only: `psql --dbname=<CONN_STRING> < schema.sql`

4. Migrations

- Keep SQL migrations under `supabase/` in repo and apply via the Supabase SQL editor or your CI migration runner.
- Example files: `supabase/migration-full.sql`, `supabase/production-rls.sql`, `supabase/fix-rls.sql`.

5. Testing restores

- Regularly test restores into a temporary project to validate migration and backup integrity.

6. Rollback plan

- For destructive migrations, create a rollback SQL and validate it in staging before running in production.
