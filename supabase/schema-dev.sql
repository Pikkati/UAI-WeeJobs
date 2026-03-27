-- WeeJobs Development Database Schema for Supabase
-- Use this for development/testing with permissive RLS policies
-- WARNING: Do NOT use these policies in production!

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
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- ENABLE RLS (but with permissive policies)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DEVELOPMENT PERMISSIVE POLICIES
-- These allow all operations for testing
-- ============================================
CREATE POLICY "dev_users_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_jobs_all" ON jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_messages_all" ON messages FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE TEST DATA
-- ============================================
INSERT INTO users (id, email, name, role, phone, area, trade_categories) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'sarah@weejobs.test', 'Sarah McConnell', 'customer', '07712345678', 'Portstewart', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'john@weejobs.test', 'John Builder', 'tradesperson', '07798765432', 'Coleraine', ARRAY['General Building', 'Plumbing', 'Electrical']),
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@weejobs.test', 'Admin User', 'admin', '07700000000', 'Causeway Coast', NULL)
ON CONFLICT (email) DO NOTHING;
