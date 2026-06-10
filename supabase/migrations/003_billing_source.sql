-- ============================================================================
-- SubGenie — Migration: origem de cobrança (cancelamento dinâmico)
-- ============================================================================

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS billing_source TEXT NOT NULL DEFAULT 'web'
  CHECK (billing_source IN ('web', 'apple', 'google', 'other'));
