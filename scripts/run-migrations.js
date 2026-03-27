#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function main() {
  const migrationsDir = path.resolve(__dirname, '..', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('No migrations directory found.');
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.SUPABASE_DATABASE_URL;
  if (!dbUrl) {
    console.log('No DATABASE_URL detected. To apply migrations, set DATABASE_URL (or SUPABASE_DB_URL) and re-run.');
    process.exit(0);
  }

  let pg;
  try {
    pg = require('pg');
  } catch (err) {
    console.error('Missing dependency: pg. Install with `npm install pg` and re-run.');
    process.exit(1);
  }

  const { Client } = pg;
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      const res = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
      if (res.rowCount > 0) {
        console.log(`Skipping already-applied migration: ${file}`);
        continue;
      }

      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Failed to apply ${file}:`, err.message || err);
        throw err;
      }
    }

    console.log('Migrations complete.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Migration runner failed:', err);
  process.exit(1);
});
