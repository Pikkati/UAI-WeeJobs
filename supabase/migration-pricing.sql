-- WeeJobs Pricing Model Migration
-- Adds support for fixed price quotes and hourly rate invoices

-- ============================================
-- ADD PRICING FIELDS TO USERS TABLE
-- ============================================
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pricing_default VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_default IN ('fixed', 'hourly')),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2);

-- ============================================
-- ADD PRICING FIELDS TO JOBS TABLE
-- ============================================

-- Pricing type for this job (inherited from tradie default when job is accepted)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(20) CHECK (pricing_type IN ('fixed', 'hourly'));

-- Estimate fields (for hourly jobs - provisional estimate before work)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS estimate_hours DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS estimate_hourly_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS estimate_materials DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS estimate_total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS estimate_notes TEXT,
ADD COLUMN IF NOT EXISTS estimate_acknowledged_at TIMESTAMPTZ;

-- Invoice fields (for hourly jobs - actual cost after work)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS invoice_hours DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS invoice_hourly_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS invoice_materials DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS invoice_total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS invoice_notes TEXT,
ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMPTZ;

-- ============================================
-- UPDATE JOBS STATUS CONSTRAINT
-- ============================================
-- First drop the existing constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

-- Add new constraint with all status values
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check CHECK (
  status IN (
    'open',
    'pending_customer_choice',
    'booked',
    'estimate_acknowledged',
    'on_the_way',
    'in_progress',
    'awaiting_quote_approval',
    'awaiting_invoice_payment',
    'awaiting_final_payment',
    'paid',
    'awaiting_confirmation',
    'completed',
    'cancelled'
  )
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_jobs_pricing_type ON jobs(pricing_type);
CREATE INDEX IF NOT EXISTS idx_users_pricing_default ON users(pricing_default);
