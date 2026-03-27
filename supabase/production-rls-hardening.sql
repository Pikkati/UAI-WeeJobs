-- WeeJobs Production RLS Hardening
-- This script is intended for manual review and execution in Supabase SQL Editor.
-- It does NOT run automatically from the app.
--
-- Goal:
-- 1. Remove active dev_*_all permissive policies.
-- 2. Restore the strictest production-oriented policies already present elsewhere in the repo,
--    but only where those policies are still clearly safe for the current schema/workflow.
-- 3. Explicitly leave drifted policy areas for manual definition instead of inventing risky access.

BEGIN;

-- =========================================================
-- 1. ENABLE RLS ON TARGET TABLES
-- =========================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_reports ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 2. DROP ACTIVE DEV-ALL POLICIES
-- =========================================================
DROP POLICY IF EXISTS "dev_users_all" ON users;
DROP POLICY IF EXISTS "dev_jobs_all" ON jobs;
DROP POLICY IF EXISTS "dev_messages_all" ON messages;
DROP POLICY IF EXISTS "dev_job_interests_all" ON job_interests;
DROP POLICY IF EXISTS "dev_reviews_all" ON reviews;
DROP POLICY IF EXISTS "dev_job_reports_all" ON job_reports;

-- =========================================================
-- 3. DROP KNOWN STRICT POLICY NAMES SO THIS SCRIPT IS IDEMPOTENT
-- =========================================================

-- users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Tradies can view customers for their jobs" ON users;
DROP POLICY IF EXISTS "Customers can view tradies for their jobs" ON users;
DROP POLICY IF EXISTS "Anyone can view tradesperson profiles" ON users;

-- jobs
DROP POLICY IF EXISTS "Customers can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Tradies can view open jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can create jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can update own open jobs" ON jobs;
DROP POLICY IF EXISTS "Tradies can accept jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can cancel own jobs" ON jobs;

-- messages
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Receivers can mark messages read" ON messages;

-- job_interests
DROP POLICY IF EXISTS "Tradies can create interests" ON job_interests;
DROP POLICY IF EXISTS "Tradies can view/update own interests" ON job_interests;
DROP POLICY IF EXISTS "Customers can view interests on their jobs" ON job_interests;
DROP POLICY IF EXISTS "Customers can update interests on their jobs" ON job_interests;

-- reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Reviewers can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Customers can create reviews for completed jobs" ON reviews;

-- =========================================================
-- 4. USERS POLICIES
-- Source:
-- - supabase/schema.sql
-- - supabase/migrations/001_profile_enhancements.sql
-- =========================================================
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Tradies can view customers for their jobs" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM jobs
      WHERE jobs.tradie_id = auth.uid()
        AND jobs.customer_id = users.id
    )
  );

CREATE POLICY "Customers can view tradies for their jobs" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM jobs
      WHERE jobs.customer_id = auth.uid()
        AND jobs.tradie_id = users.id
    )
  );

CREATE POLICY "Anyone can view tradesperson profiles" ON users
  FOR SELECT USING (role = 'tradesperson');

-- =========================================================
-- 5. JOBS POLICIES
-- Source:
-- - supabase/schema.sql
--
-- Safe to recreate:
-- - read own jobs
-- - view open jobs / assigned jobs
-- - create jobs as customer
--
-- NOT recreated automatically:
-- - update/cancel/accept policies from schema.sql are older than the
--   current marketplace workflow and do not model statuses like
--   booked, on_the_way, in_progress, awaiting_quote_approval, etc.
-- - Reapplying those UPDATE policies unchanged could break current app flows
--   or leave unsafe gaps.
-- =========================================================
CREATE POLICY "Customers can view own jobs" ON jobs
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Tradies can view open jobs" ON jobs
  FOR SELECT USING (
    status = 'open'
    OR tradie_id = auth.uid()
  );

CREATE POLICY "Customers can create jobs" ON jobs
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- MANUAL DEFINITION REQUIRED BEFORE PRODUCTION:
-- CREATE POLICY "Customers can update own open jobs" ON jobs ...
-- CREATE POLICY "Tradies can accept jobs" ON jobs ...
-- CREATE POLICY "Customers can cancel own jobs" ON jobs ...
--
-- Reason:
-- Current app workflow/status model has drifted beyond the older schema.sql policy set.

-- =========================================================
-- 6. MESSAGES POLICIES
-- Source:
-- - supabase/schema.sql
-- =========================================================
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid()
    OR receiver_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Receivers can mark messages read" ON messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- =========================================================
-- 7. JOB_INTERESTS POLICIES
-- Source:
-- - supabase/migration-v2-marketplace.sql
-- =========================================================
CREATE POLICY "Tradies can create interests" ON job_interests
  FOR INSERT WITH CHECK (tradie_id = auth.uid());

CREATE POLICY "Tradies can view/update own interests" ON job_interests
  FOR ALL USING (tradie_id = auth.uid());

CREATE POLICY "Customers can view interests on their jobs" ON job_interests
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM jobs
      WHERE jobs.id = job_interests.job_id
        AND jobs.customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update interests on their jobs" ON job_interests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM jobs
      WHERE jobs.id = job_interests.job_id
        AND jobs.customer_id = auth.uid()
    )
  );

-- =========================================================
-- 8. REVIEWS POLICIES
-- Sources:
-- - supabase/migrations/001_profile_enhancements.sql
-- - supabase/migration-v2-marketplace.sql
--
-- Safe to recreate:
-- - public read
-- - reviewer can update own review
--
-- NOT recreated automatically:
-- - insert policy has schema drift across repo versions:
--   * 001_profile_enhancements.sql uses reviewer_id/reviewee_id
--   * migration-v2-marketplace.sql uses customer_id/tradie_id and completed-job checks
-- - Current app code writes reviewer_id/reviewee_id/reviewer_role.
-- - Because the stricter completed-job insert policy does not match the current review schema
--   used by the app, it must be reconciled manually before production rollout.
-- =========================================================
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Reviewers can update own reviews" ON reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

-- MANUAL DEFINITION REQUIRED BEFORE PRODUCTION:
-- CREATE POLICY for INSERT on reviews after confirming the live reviews table schema
-- and whether review creation must be limited to completed jobs.

-- =========================================================
-- 9. JOB_REPORTS POLICIES
-- Source review result:
-- - No production-safe job_reports policy definition exists in the repo.
--
-- Action:
-- - Leave RLS enabled.
-- - Leave the table with no policies after removing dev_job_reports_all.
-- - This denies access by default until a manual production policy is defined.
-- =========================================================
-- MANUAL DEFINITION REQUIRED BEFORE PRODUCTION:
-- CREATE POLICY ... ON job_reports ...

COMMIT;
