-- WeeJobs Marketplace Flow Migration
-- This migration adds the full marketplace flow with express interest, customer selection, deposits, quotes, and reviews

-- ============================================
-- UPDATE JOBS TABLE - Extended Status Values
-- ============================================

-- First, drop the existing status constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Add new status constraint with all marketplace statuses
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check 
  CHECK (status IN (
    'open',                    -- Job posted, waiting for tradespeople to express interest
    'pending_customer_choice', -- 1-3 tradies interested, waiting for customer to pick
    'booked',                  -- Customer picked tradie and paid deposit
    'on_the_way',              -- Tradie traveling to job
    'in_progress',             -- Work has started
    'awaiting_quote_approval', -- Tradie sent final quote
    'awaiting_final_payment',  -- Customer approved quote, needs to pay
    'paid',                    -- Full payment received
    'awaiting_confirmation',   -- Waiting for both parties to confirm completion
    'completed',               -- Job fully completed
    'cancelled'                -- Job cancelled
  ));

-- Add new columns to jobs table for payment flow
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quote_labour DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quote_materials DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quote_notes TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quote_total DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS final_payment_amount DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS final_payment_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS final_payment_paid_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS customer_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tradie_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS postcode VARCHAR(20);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lat DECIMAL(10,7);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lng DECIMAL(10,7);

-- ============================================
-- JOB_INTERESTS TABLE
-- Tracks which tradespeople have expressed interest in which jobs
-- ============================================
CREATE TABLE IF NOT EXISTS job_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  tradie_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'interested' CHECK (status IN ('interested', 'shortlisted', 'selected', 'rejected', 'withdrawn')),
  unlock_fee_paid BOOLEAN DEFAULT FALSE,
  unlock_fee_amount DECIMAL(10,2),
  is_pro_at_time BOOLEAN DEFAULT FALSE,
  distance_miles DECIMAL(5,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, tradie_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_job_interests_job_id ON job_interests(job_id);
CREATE INDEX IF NOT EXISTS idx_job_interests_tradie_id ON job_interests(tradie_id);
CREATE INDEX IF NOT EXISTS idx_job_interests_status ON job_interests(status);

-- ============================================
-- REVIEWS TABLE
-- Customer reviews of tradespeople after job completion
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tradie_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_reviews_tradie_id ON reviews(tradie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ============================================
-- USERS TABLE - Add rating fields
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1);
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_pro BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'payg' CHECK (subscription_plan IN ('payg', 'pro'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS jobs_completed INTEGER DEFAULT 0;

-- ============================================
-- TRIGGER: Update user rating when review is added
-- ============================================
CREATE OR REPLACE FUNCTION update_tradie_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET 
    average_rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM reviews WHERE tradie_id = NEW.tradie_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE tradie_id = NEW.tradie_id)
  WHERE id = NEW.tradie_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tradie_rating_trigger ON reviews;
CREATE TRIGGER update_tradie_rating_trigger
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_tradie_rating();

-- ============================================
-- TRIGGER: Update job_interests updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_job_interests_updated_at ON job_interests;
CREATE TRIGGER update_job_interests_updated_at
  BEFORE UPDATE ON job_interests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================

ALTER TABLE job_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Job Interests Policies
CREATE POLICY "Tradies can create interests" ON job_interests
  FOR INSERT WITH CHECK (tradie_id = auth.uid());

CREATE POLICY "Tradies can view/update own interests" ON job_interests
  FOR ALL USING (tradie_id = auth.uid());

CREATE POLICY "Customers can view interests on their jobs" ON job_interests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_interests.job_id AND jobs.customer_id = auth.uid())
  );

CREATE POLICY "Customers can update interests on their jobs" ON job_interests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_interests.job_id AND jobs.customer_id = auth.uid())
  );

-- Reviews Policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for completed jobs" ON reviews
  FOR INSERT WITH CHECK (
    customer_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = reviews.job_id 
      AND jobs.customer_id = auth.uid() 
      AND jobs.status = 'completed'
    )
  );
