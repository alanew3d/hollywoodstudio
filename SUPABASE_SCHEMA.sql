-- SUPABASE_SCHEMA.sql
-- Hollywood Studio AI — Schema base
-- Cole no SQL Editor do Supabase: https://app.supabase.com → SQL Editor

-- ─────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null unique,           -- uid local (ex: u_alangabriel) ou sub do OAuth
  email         text,
  name          text,
  picture       text,
  credits       integer not null default 0,
  plan          text not null default 'free',   -- free | pro | ultra
  admin         boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table profiles enable row level security;

-- Usuário lê/atualiza apenas o próprio perfil; NUNCA altera créditos diretamente
create policy "Usuário vê próprio perfil"
  on profiles for select
  using (auth.uid()::text = user_id);

create policy "Usuário atualiza nome/foto"
  on profiles for update
  using (auth.uid()::text = user_id)
  with check (
    auth.uid()::text = user_id
    and credits = (select credits from profiles where user_id = auth.uid()::text)
  );

-- Service Role (backend/webhook) tem acesso total via chave service_role
-- (não precisa de policy — service_role bypassa RLS)

-- ─────────────────────────────────────────────
-- 2. CREDIT_TRANSACTIONS
-- ─────────────────────────────────────────────
create table if not exists credit_transactions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             text not null,
  amount              integer not null,          -- positivo = crédito, negativo = débito
  type                text not null,             -- purchase | generation | refund | grant
  description         text,
  model_id            text,
  stripe_session_id   text,
  created_at          timestamptz not null default now()
);

alter table credit_transactions enable row level security;

create policy "Usuário vê próprias transações"
  on credit_transactions for select
  using (auth.uid()::text = user_id);

-- Usuário NÃO pode inserir transações diretamente (apenas via service role)
-- (nenhuma policy de insert para usuários = bloqueado por RLS)

-- ─────────────────────────────────────────────
-- 3. GENERATION_LOGS
-- ─────────────────────────────────────────────
create table if not exists generation_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null,
  prompt       text,
  model_id     text,
  type         text,           -- video | image | audio
  credits_used integer,
  result_url   text,
  status       text,           -- pending | ok | error
  error_msg    text,
  created_at   timestamptz not null default now()
);

alter table generation_logs enable row level security;

create policy "Usuário vê próprios logs"
  on generation_logs for select
  using (auth.uid()::text = user_id);

create policy "Usuário insere próprios logs"
  on generation_logs for insert
  with check (auth.uid()::text = user_id);

-- ─────────────────────────────────────────────
-- 4. SUBSCRIPTIONS
-- ─────────────────────────────────────────────
create table if not exists subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 text not null unique,
  plan                    text not null,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  status                  text not null default 'active', -- active | cancelled | past_due
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table subscriptions enable row level security;

create policy "Usuário vê própria assinatura"
  on subscriptions for select
  using (auth.uid()::text = user_id);

-- ─────────────────────────────────────────────
-- 5. FUNÇÃO: increment_credits (chamada pelo webhook)
-- ─────────────────────────────────────────────
create or replace function increment_credits(p_user_id text, p_amount integer)
returns void language plpgsql security definer as $$
begin
  insert into profiles (user_id, credits)
    values (p_user_id, p_amount)
    on conflict (user_id)
    do update set credits = profiles.credits + p_amount,
                  updated_at = now();
end;
$$;

-- ─────────────────────────────────────────────
-- PRONTO — Copie este arquivo e cole no SQL Editor do Supabase
-- Após rodar, configure as variáveis de ambiente na Vercel (ver SETUP_PAYMENTS.md)
-- ─────────────────────────────────────────────
