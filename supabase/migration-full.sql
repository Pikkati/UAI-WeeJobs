-- WeeJobs Full Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Safe to run against databases where tables already exist

-- ============================================
-- 1. USERS TABLE — add missing columns
-- ============================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS average_rating       NUMERIC(3,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews        INTEGER       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS jobs_completed       INTEGER       DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified_pro      BOOLEAN       DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subscription_plan    VARCHAR(20)   DEFAULT 'payg',
  ADD COLUMN IF NOT EXISTS pricing_default      VARCHAR(10)   DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS hourly_rate          NUMERIC(8,2);

-- ============================================
-- 2. JOBS TABLE — update status constraint,
--    add missing columns
-- ============================================

-- Drop any existing CHECK constraint on the status column
DO $$
DECLARE
  con_name TEXT;
BEGIN
  FOR con_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'jobs'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE jobs DROP CONSTRAINT IF EXISTS %I', con_name);
  END LOOP;
END;
$$;

-- Add the updated status constraint with all marketplace statuses
ALTER TABLE jobs
  ADD CONSTRAINT jobs_status_check CHECK (status IN (
    'open',
    'pending_customer_choice',
    'awaiting_customer_choice',
    'booked',
    'on_the_way',
    'in_progress',
    'estimate_acknowledged',
    'awaiting_quote_approval',
    'awaiting_invoice_payment',
    'awaiting_final_payment',
    'paid',
    'awaiting_confirmation',
    'completed',
    'cancelled'
  ));

-- Add all missing columns to jobs
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS postcode                 VARCHAR(20),
  ADD COLUMN IF NOT EXISTS lat                      NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS lng                      NUMERIC(9,6),
  ADD COLUMN IF NOT EXISTS pricing_type             VARCHAR(10)   DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS deposit_amount           NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS deposit_paid             BOOLEAN       DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deposit_paid_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS estimate_hours           NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS estimate_hourly_rate     NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS estimate_materials       NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS estimate_total           NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS estimate_notes           TEXT,
  ADD COLUMN IF NOT EXISTS estimate_acknowledged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS quote_labour             NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS quote_materials          NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS quote_notes              TEXT,
  ADD COLUMN IF NOT EXISTS quote_total              NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS quote_sent_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invoice_hours            NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS invoice_hourly_rate      NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS invoice_materials        NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS invoice_total            NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS invoice_notes            TEXT,
  ADD COLUMN IF NOT EXISTS invoice_sent_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS final_payment_amount     NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS final_payment_paid       BOOLEAN       DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS final_payment_paid_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_confirmed       BOOLEAN       DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tradie_confirmed         BOOLEAN       DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS completed_at             TIMESTAMPTZ;

-- ============================================
-- 3. JOB_INTERESTS TABLE
--    Table may already exist — add any missing columns
-- ============================================
CREATE TABLE IF NOT EXISTS job_interests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  tradie_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status            VARCHAR(20) NOT NULL DEFAULT 'interested',
  unlock_fee_paid   BOOLEAN     DEFAULT FALSE,
  unlock_fee_amount NUMERIC(8,2),
  is_pro_at_time    BOOLEAN     DEFAULT FALSE,
  distance_miles    NUMERIC(6,2),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Add any columns that may be missing from an older version of this table
ALTER TABLE job_interests
  ADD COLUMN IF NOT EXISTS unlock_fee_paid   BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS unlock_fee_amount NUMERIC(8,2),
  ADD COLUMN IF NOT EXISTS is_pro_at_time    BOOLEAN     DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS distance_miles    NUMERIC(6,2);

-- Add unique constraint if missing (safe — won't duplicate if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'job_interests'::regclass
      AND contype = 'u'
      AND conname = 'job_interests_job_id_tradie_id_key'
  ) THEN
    ALTER TABLE job_interests ADD CONSTRAINT job_interests_job_id_tradie_id_key UNIQUE (job_id, tradie_id);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_job_interests_job_id    ON job_interests(job_id);
CREATE INDEX IF NOT EXISTS idx_job_interests_tradie_id ON job_interests(tradie_id);
CREATE INDEX IF NOT EXISTS idx_job_interests_status    ON job_interests(status);

-- ============================================
-- 4. REVIEWS TABLE
--    Table may already exist — add any missing columns
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tradie_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL,
  title       VARCHAR(255),
  comment     TEXT,
  photos      TEXT[],
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Add any columns that may be missing from an older version of this table
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS tradie_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title       VARCHAR(255),
  ADD COLUMN IF NOT EXISTS photos      TEXT[];

CREATE INDEX IF NOT EXISTS idx_reviews_tradie_id ON reviews(tradie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_job_id    ON reviews(job_id);

-- ============================================
-- 5. PERMISSIVE RLS POLICIES (dev mode)
-- ============================================
ALTER TABLE job_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dev_job_interests_all" ON job_interests;
CREATE POLICY "dev_job_interests_all" ON job_interests
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_reviews_all" ON reviews;
CREATE POLICY "dev_reviews_all" ON reviews
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "dev_users_all"    ON users;
DROP POLICY IF EXISTS "dev_jobs_all"     ON jobs;
DROP POLICY IF EXISTS "dev_messages_all" ON messages;

CREATE POLICY "dev_users_all"    ON users    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_jobs_all"     ON jobs     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_messages_all" ON messages FOR ALL USING (true) WITH CHECK (true);
