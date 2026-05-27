-- ============================================================================
-- Subsly — Migration Fase 3
-- ============================================================================

-- 1) Compartilhamento: quantas pessoas dividem a assinatura
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS shared_count INTEGER NOT NULL DEFAULT 1
  CHECK (shared_count >= 1 AND shared_count <= 20);

-- 2) Push subscriptions (Web Push API)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_user ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own push subs" ON push_subscriptions;
CREATE POLICY "Users can manage own push subs"
  ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- 3) Permitir push em notification_email -> nova coluna pra controlar push separado
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_push BOOLEAN NOT NULL DEFAULT false;

-- 4) Preferências de UI: locale e theme
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'pt-BR'
  CHECK (locale IN ('pt-BR', 'en'));

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'dark'
  CHECK (theme IN ('dark', 'light', 'system'));
