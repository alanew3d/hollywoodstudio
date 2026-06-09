-- ============================================================
-- Hollywood Studio AI — Supabase Schema v2.0
-- Execute no Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABELAS
-- ============================================================

-- Perfis de usuário (espelha auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  avatar_url      TEXT,
  role            TEXT NOT NULL DEFAULT 'user'
                  CHECK (role IN ('visitor','user','creator','pro','studio','admin','super_admin')),
  plan            TEXT NOT NULL DEFAULT 'free'
                  CHECK (plan IN ('free','basico','creator','pro','studio','enterprise')),
  credits_balance INTEGER NOT NULL DEFAULT 0 CHECK (credits_balance >= 0),
  trial_granted   BOOLEAN NOT NULL DEFAULT false,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  onboarding_data JSONB DEFAULT '{}',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Planos disponíveis
CREATE TABLE IF NOT EXISTS public.plans (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'brl',
  monthly_credits INTEGER NOT NULL DEFAULT 0,
  features        JSONB DEFAULT '[]',
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transações de créditos
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL
                  CHECK (type IN ('purchase','subscription','trial','usage','refund','admin_adjustment','bonus','failed_reversal')),
  amount          INTEGER NOT NULL,
  source          TEXT,
  payment_id      TEXT,
  status          TEXT NOT NULL DEFAULT 'completed'
                  CHECK (status IN ('pending','completed','failed','reversed')),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pagamentos
CREATE TABLE IF NOT EXISTS public.payments (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider             TEXT NOT NULL DEFAULT 'stripe',
  provider_session_id  TEXT,
  provider_payment_id  TEXT,
  amount               NUMERIC(10,2) NOT NULL,
  currency             TEXT NOT NULL DEFAULT 'brl',
  status               TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','paid','failed','refunded','cancelled')),
  plan_id              TEXT,
  credits              INTEGER DEFAULT 0,
  metadata             JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Eventos de webhook (idempotência)
CREATE TABLE IF NOT EXISTS public.payment_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider     TEXT NOT NULL DEFAULT 'stripe',
  event_id     TEXT UNIQUE NOT NULL,
  event_type   TEXT NOT NULL,
  processed    BOOLEAN NOT NULL DEFAULT false,
  payload      JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Uploads de usuário
CREATE TABLE IF NOT EXISTS public.uploads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url    TEXT NOT NULL,
  file_path   TEXT,
  file_type   TEXT NOT NULL DEFAULT 'image'
              CHECK (file_type IN ('image','video','audio','document')),
  title       TEXT,
  file_size   BIGINT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projetos
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Projeto sem título',
  prompt      TEXT,
  model_id    TEXT,
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft','ready','generating','completed','archived')),
  references  JSONB DEFAULT '[]',
  output      JSONB DEFAULT '{}',
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gerações (jobs)
CREATE TABLE IF NOT EXISTS public.generations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  provider      TEXT,
  model_id      TEXT NOT NULL,
  prompt        TEXT,
  input_media   JSONB DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'queued'
                CHECK (status IN ('queued','processing','completed','failed','cancelled','refunded')),
  progress      INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  cost_credits  INTEGER DEFAULT 0,
  error_message TEXT,
  result_url    TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

-- Favoritos
CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type   TEXT NOT NULL DEFAULT 'gallery'
              CHECK (item_type IN ('gallery','demo','template','model','public','generation')),
  item_id     TEXT NOT NULL,
  title       TEXT,
  prompt      TEXT,
  media_url   TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Galeria (itens gerados)
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT,
  prompt      TEXT,
  media_url   TEXT NOT NULL,
  media_type  TEXT NOT NULL DEFAULT 'image'
              CHECK (media_type IN ('image','video','audio')),
  visibility  TEXT NOT NULL DEFAULT 'private'
              CHECK (visibility IN ('private','public','hidden','under_review')),
  likes       INTEGER DEFAULT 0,
  views       INTEGER DEFAULT 0,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chamados de suporte
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category    TEXT NOT NULL DEFAULT 'Geral'
              CHECK (category IN ('Pagamento','Créditos','Erro de geração','Upload','Login','Conta','Sugestão','Comercial','Parcerias','Geral')),
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open','in_progress','resolved','closed')),
  priority    TEXT NOT NULL DEFAULT 'normal'
              CHECK (priority IN ('low','normal','high','urgent')),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Relatórios de moderação
CREATE TABLE IF NOT EXISTS public.moderation_reports (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  item_type        TEXT NOT NULL CHECK (item_type IN ('gallery_item','public_post','upload')),
  item_id          TEXT NOT NULL,
  reason           TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','reviewed','action_taken','dismissed')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Consentimentos de termos
CREATE TABLE IF NOT EXISTS public.user_consents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('terms','privacy','credits_policy','refund_policy','content_policy')),
  version     TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_hash     TEXT,
  metadata    JSONB DEFAULT '{}'
);

-- Logs de API
CREATE TABLE IF NOT EXISTS public.api_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  endpoint    TEXT,
  action      TEXT NOT NULL,
  status      TEXT,
  duration_ms INTEGER,
  error       TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Eventos de analytics
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event       TEXT NOT NULL,
  source      TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configurações da aplicação
CREATE TABLE IF NOT EXISTS public.app_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user            ON public.payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_events_event_id  ON public.payment_events(event_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user             ON public.uploads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user            ON public.projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_user         ON public.generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user           ON public.favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_user             ON public.gallery_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_public           ON public.gallery_items(visibility, created_at DESC) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_support_tickets_user     ON public.support_tickets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user           ON public.analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event          ON public.analytics_events(event, created_at DESC);

-- ============================================================
-- TRIGGER: atualizar updated_at automaticamente
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_generations_updated_at
  BEFORE UPDATE ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE TRIGGER trg_support_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TRIGGER: criar profile automaticamente após signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, plan, credits_balance, trial_granted)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    'user',
    'free',
    3,      -- 3 créditos de boas-vindas (trial)
    true    -- trial já concedido
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events    ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles: user reads own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles: user updates own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin reads all"   ON public.profiles;

CREATE POLICY "profiles: user reads own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: user updates own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin via service role bypasses RLS automaticamente (sem política necessária para service_role)

-- ── Credit Transactions ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "credit_tx: user reads own" ON public.credit_transactions;

CREATE POLICY "credit_tx: user reads own"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE apenas via service_role (backend)

-- ── Payments ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "payments: user reads own" ON public.payments;

CREATE POLICY "payments: user reads own"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- ── Uploads ───────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "uploads: user reads own"   ON public.uploads;
DROP POLICY IF EXISTS "uploads: user inserts own"  ON public.uploads;
DROP POLICY IF EXISTS "uploads: user deletes own"  ON public.uploads;

CREATE POLICY "uploads: user reads own"
  ON public.uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "uploads: user inserts own"
  ON public.uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "uploads: user deletes own"
  ON public.uploads FOR DELETE
  USING (auth.uid() = user_id);

-- ── Projects ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "projects: user reads own"    ON public.projects;
DROP POLICY IF EXISTS "projects: user inserts own"   ON public.projects;
DROP POLICY IF EXISTS "projects: user updates own"   ON public.projects;
DROP POLICY IF EXISTS "projects: user deletes own"   ON public.projects;

CREATE POLICY "projects: user reads own"
  ON public.projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "projects: user inserts own"
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: user updates own"
  ON public.projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "projects: user deletes own"
  ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- ── Favorites ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "favorites: user all own" ON public.favorites;

CREATE POLICY "favorites: user all own"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Gallery Items ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "gallery: user reads own"   ON public.gallery_items;
DROP POLICY IF EXISTS "gallery: anyone reads public" ON public.gallery_items;
DROP POLICY IF EXISTS "gallery: user inserts own"  ON public.gallery_items;
DROP POLICY IF EXISTS "gallery: user updates own"  ON public.gallery_items;
DROP POLICY IF EXISTS "gallery: user deletes own"  ON public.gallery_items;

CREATE POLICY "gallery: user reads own"
  ON public.gallery_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "gallery: anyone reads public"
  ON public.gallery_items FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "gallery: user inserts own"
  ON public.gallery_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gallery: user updates own"
  ON public.gallery_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "gallery: user deletes own"
  ON public.gallery_items FOR DELETE
  USING (auth.uid() = user_id);

-- ── Generations ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "generations: user reads own" ON public.generations;

CREATE POLICY "generations: user reads own"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

-- ── Support Tickets ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "support: user reads own"   ON public.support_tickets;
DROP POLICY IF EXISTS "support: user inserts own"  ON public.support_tickets;

CREATE POLICY "support: user reads own"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "support: user inserts own"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── User Consents ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "consents: user all own" ON public.user_consents;

CREATE POLICY "consents: user all own"
  ON public.user_consents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Analytics Events ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "analytics: user inserts own" ON public.analytics_events;

CREATE POLICY "analytics: user inserts own"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- STORAGE BUCKETS (executar separadamente no dashboard ou via API)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('user-uploads',   'user-uploads',   false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('generated-media','generated-media', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('public-gallery', 'public-gallery',  true);

-- Storage RLS policies (executar após criar os buckets):
-- CREATE POLICY "uploads: user reads own files"
--   ON storage.objects FOR SELECT USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "uploads: user inserts own files"
--   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "public-gallery: anyone reads"
--   ON storage.objects FOR SELECT USING (bucket_id = 'public-gallery');

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

INSERT INTO public.plans (id, name, price, currency, monthly_credits, features, active) VALUES
('free',       'Free',       0,     'brl', 3,   '["3 créditos de boas-vindas","Galeria privada","Templates básicos"]', true),
('creator',    'Creator',    97,    'brl', 200, '["200 créditos/mês","Todos os modelos","Upload ilimitado","Galeria pública","Suporte por e-mail"]', true),
('pro',        'Pro',        197,   'brl', 400, '["400 créditos/mês","Prioridade na fila","Sem marca d''água","Analytics avançado","Suporte prioritário"]', true),
('studio',     'Studio',     397,   'brl', 800, '["800 créditos/mês","Multi-usuário (em breve)","API access (em breve)","SLA dedicado","Gerente de conta"]', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.app_settings (key, value) VALUES
('trial_credits',     '3'),
('max_upload_mb',     '50'),
('max_uploads_free',  '10'),
('max_uploads_paid',  '500'),
('rate_limit_rpm',    '30'),
('feature_flags',     '{"enableTrial":true,"enablePayments":true,"enableUploads":true,"enablePublicGallery":true}')
ON CONFLICT (key) DO NOTHING;
