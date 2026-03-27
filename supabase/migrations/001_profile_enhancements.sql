-- Profile Enhancement Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. ADD NEW PROFILE COLUMNS TO USERS TABLE
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS areas_covered TEXT[],
  ADD COLUMN IF NOT EXISTS portfolio_photos TEXT[];

-- ============================================
-- 2. CREATE REVIEWS TABLE
-- (matches the schema used in app/job/review.tsx)
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  reviewer_role VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate reviews per job per reviewer
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_per_job
  ON reviews(job_id, reviewer_id);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_job_id ON reviews(job_id);

-- ============================================
-- 3. RLS POLICIES FOR REVIEWS TABLE
-- ============================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated) can read reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews for jobs they were part of
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- Reviewers can update their own reviews
CREATE POLICY "Reviewers can update own reviews" ON reviews
  FOR UPDATE USING (reviewer_id = auth.uid());

-- ============================================
-- 4. ALLOW PUBLIC VIEWING OF TRADESPERSON PROFILES
-- (needed for the public profile screen)
-- ============================================

-- Allow anyone to view tradesperson profiles
-- (existing policies use OR logic, so this extends access safely)
CREATE POLICY "Anyone can view tradesperson profiles" ON users
  FOR SELECT USING (role = 'tradesperson');
