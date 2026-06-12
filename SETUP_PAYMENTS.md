# SETUP_PAYMENTS.md — Hollywood Studio AI

## Visão Geral

Este guia configura Supabase (banco de dados + autenticação) e Stripe (pagamentos + webhook) para o Hollywood Studio AI.

---

## 1. Supabase

### 1.1 Criar projeto
1. Acesse [supabase.com](https://supabase.com) → New Project
2. Anote: Project URL e as API Keys

### 1.2 Rodar SQL
1. Vá em **SQL Editor** → New Query
2. Cole o conteúdo de `SUPABASE_SCHEMA.sql` e execute

### 1.3 Copiar credenciais
- **Project URL** → `SUPABASE_URL`
- **anon public** key → `SUPABASE_ANON_KEY` (seguro para o frontend)
- **service_role** secret → `SUPABASE_SERVICE_ROLE_KEY` (**backend only — nunca no config.js**)

---

## 2. Stripe

### 2.1 Criar produtos
1. [dashboard.stripe.com](https://dashboard.stripe.com) → Products → Add product
2. **Hollywood Studio PRO** → preço único/recorrente → copiar Price ID → `STRIPE_PRICE_PRO`
3. **Hollywood Studio ULTRA** → preço único/recorrente → copiar Price ID → `STRIPE_PRICE_ULTRA`

### 2.2 Chave secreta
- Developers → API Keys → **Secret key** → `STRIPE_SECRET_KEY`

### 2.3 Webhook
1. Developers → Webhooks → Add endpoint
2. URL: `https://hollywoodstudio.ai/api/stripe-webhook`
3. Selecionar eventos:
   - `checkout.session.completed` ✅
   - `customer.subscription.updated` ✅
   - `customer.subscription.deleted` ✅
   - `invoice.payment_failed` ✅
4. Reveal **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## 3. Vercel — Environment Variables

Vá em **Vercel Dashboard → Project → Settings → Environment Variables** e adicione:

| Variável | Onde obter | Expor ao frontend? |
|---|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API | ✅ Sim (config.js) |
| `SUPABASE_ANON_KEY` | Supabase → API Keys → anon | ✅ Sim (config.js) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → service_role | ❌ **Backend only** |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys | ❌ **Backend only** |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → Signing secret | ❌ **Backend only** |
| `STRIPE_PRICE_PRO` | Stripe → Products → Price ID | ❌ Backend |
| `STRIPE_PRICE_ULTRA` | Stripe → Products → Price ID | ❌ Backend |
| `SITE_URL` | `https://hollywoodstudio.ai` | ❌ Backend |

---

## 4. config.js (frontend público)

Adicione **somente** as variáveis públicas:

```js
SUPABASE_URL: 'https://xxxx.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGc...',
```

**NUNCA** coloque `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY` ou `STRIPE_WEBHOOK_SECRET` no config.js.

---

## 5. Testar

### Localmente (Stripe CLI)
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```
Use cartão de teste: `4242 4242 4242 4242`, data futura, CVC qualquer.

### Em produção
1. Acesse `https://hollywoodstudio.ai/#plans`
2. Clique em um plano → deve redirecionar para Stripe Checkout
3. Complete com cartão de teste
4. Verifique no Supabase: tabelas `profiles` (credits atualizado) e `credit_transactions` (nova linha)

---

## 6. Créditos por plano

| Plano | Créditos |
|---|---|
| Novo usuário (trial) | 3 |
| PRO | 1.000 |
| ULTRA | 10.000 |
