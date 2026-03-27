-- WeeJobs Production Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the production database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'tradesperson', 'admin')),
  phone VARCHAR(50),
  area VARCHAR(255),
  trade_categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tradie_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  area VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  timing VARCHAR(100) NOT NULL,
  budget VARCHAR(100),
  photos TEXT[],
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'completed', 'cancelled')),
  is_garage_clearance BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_tradie_id ON jobs(tradie_id);
CREATE INDEX IF NOT EXISTS idx_jobs_area ON jobs(area);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow user creation during signup (via service role or auth trigger)
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tradespeople can view customer info for jobs they've accepted
CREATE POLICY "Tradies can view customers for their jobs" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.tradie_id = auth.uid() 
      AND jobs.customer_id = users.id
    )
  );

-- Customers can view tradie info for their accepted jobs
CREATE POLICY "Customers can view tradies for their jobs" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.customer_id = auth.uid() 
      AND jobs.tradie_id = users.id
    )
  );

-- ============================================
-- JOBS POLICIES
-- ============================================

-- Customers can view all their own jobs
CREATE POLICY "Customers can view own jobs" ON jobs
  FOR SELECT USING (customer_id = auth.uid());

-- Tradespeople can view open jobs in their area
CREATE POLICY "Tradies can view open jobs" ON jobs
  FOR SELECT USING (
    status = 'open' 
    OR tradie_id = auth.uid()
  );

-- Customers can create jobs
CREATE POLICY "Customers can create jobs" ON jobs
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Customers can update their own open jobs
CREATE POLICY "Customers can update own open jobs" ON jobs
  FOR UPDATE USING (
    customer_id = auth.uid() 
    AND status = 'open'
  );

-- Tradespeople can accept open jobs (update tradie_id and status)
CREATE POLICY "Tradies can accept jobs" ON jobs
  FOR UPDATE USING (
    status = 'open' 
    OR tradie_id = auth.uid()
  );

-- Customers can cancel their jobs
CREATE POLICY "Customers can cancel own jobs" ON jobs
  FOR UPDATE USING (
    customer_id = auth.uid()
  );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can view messages where they are sender or receiver
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() 
    OR receiver_id = auth.uid()
  );

-- Users can send messages (create)
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Users can mark messages as read
CREATE POLICY "Receivers can mark messages read" ON messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to jobs table
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEVELOPMENT ONLY: PERMISSIVE POLICIES
-- Uncomment these and comment out the strict policies above
-- for development/testing purposes
-- ============================================

-- DROP POLICY IF EXISTS "Users can view own profile" ON users;
-- DROP POLICY IF EXISTS "Users can update own profile" ON users;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
-- DROP POLICY IF EXISTS "Tradies can view customers for their jobs" ON users;
-- DROP POLICY IF EXISTS "Customers can view tradies for their jobs" ON users;
-- DROP POLICY IF EXISTS "Customers can view own jobs" ON jobs;
-- DROP POLICY IF EXISTS "Tradies can view open jobs" ON jobs;
-- DROP POLICY IF EXISTS "Customers can create jobs" ON jobs;
-- DROP POLICY IF EXISTS "Customers can update own open jobs" ON jobs;
-- DROP POLICY IF EXISTS "Tradies can accept jobs" ON jobs;
-- DROP POLICY IF EXISTS "Customers can cancel own jobs" ON jobs;
-- DROP POLICY IF EXISTS "Users can view their messages" ON messages;
-- DROP POLICY IF EXISTS "Users can send messages" ON messages;
-- DROP POLICY IF EXISTS "Receivers can mark messages read" ON messages;

-- CREATE POLICY "Allow all for development" ON users FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all for development" ON jobs FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all for development" ON messages FOR ALL USING (true) WITH CHECK (true);
