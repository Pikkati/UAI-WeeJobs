-- Production-safe RLS migration for WeeJobs
-- Non-destructive: enables RLS and creates targeted policies
-- Run via Supabase SQL editor or migration tooling

BEGIN;

-- Enable RLS on key tables (no data changes)
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;

-- Users: read/update own profile
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'users_select_own' AND polrelid = 'users'::regclass
  ) THEN
    CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'users_update_own' AND polrelid = 'users'::regclass
  ) THEN
    CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END$$;

-- Jobs: customers can manage their jobs; tradies can view open jobs or assigned jobs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'jobs_select_customer' AND polrelid = 'jobs'::regclass
  ) THEN
    CREATE POLICY jobs_select_customer ON jobs FOR SELECT USING (customer_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'jobs_select_tradie_open_or_assigned' AND polrelid = 'jobs'::regclass
  ) THEN
    CREATE POLICY jobs_select_tradie_open_or_assigned ON jobs FOR SELECT USING (status = 'open' OR tradie_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'jobs_insert_customer' AND polrelid = 'jobs'::regclass
  ) THEN
    CREATE POLICY jobs_insert_customer ON jobs FOR INSERT WITH CHECK (customer_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'jobs_update_customer_open' AND polrelid = 'jobs'::regclass
  ) THEN
    CREATE POLICY jobs_update_customer_open ON jobs FOR UPDATE USING (customer_id = auth.uid() AND status = 'open') WITH CHECK (customer_id = auth.uid());
  END IF;
END$$;

-- Messages: only participants may read/insert/update as appropriate
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'messages_select_participant' AND polrelid = 'messages'::regclass
  ) THEN
    CREATE POLICY messages_select_participant ON messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'messages_insert_sender' AND polrelid = 'messages'::regclass
  ) THEN
    CREATE POLICY messages_insert_sender ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'messages_update_receiver' AND polrelid = 'messages'::regclass
  ) THEN
    CREATE POLICY messages_update_receiver ON messages FOR UPDATE USING (receiver_id = auth.uid()) WITH CHECK (receiver_id = auth.uid());
  END IF;
END$$;

COMMIT;
