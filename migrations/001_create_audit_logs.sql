-- Migration: 001_create_audit_logs.sql
-- Creates an audit_logs table to store system/audit events

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NULL,
  actor_email TEXT NULL,
  action TEXT NOT NULL,
  details JSONB NULL,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
