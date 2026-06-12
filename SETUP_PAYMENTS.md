# SETUP_PAYMENTS.md — Hollywood Studio AI

## Visao Geral

Este guia configura Supabase (banco de dados + autenticacao) e Stripe (pagamentos + webhook) para o Hollywood Studio AI.

---

## 1. Supabase

### 1.1 Criar projeto
1. Acesse https://supabase.com -> New Project
2. Anote: Project URL e as API Keys

### 1.2 Rodar SQL
1. Va em **SQL Editor** -> New Query
2. Cole o conteudo de `SUPABASE_SCHEMA.sql` e execute

### 1.3 Copiar credenciais
- **Project URL** -> `SUPABASE_URL`
- **anon public** key -> `SUPABASE_ANON_KEY` (seguro para o frontend)
- **service_role** secret -> `SUPABASE_SERVICE_ROLE_KEY` (**backend only — nunca no config.js**)

---

## 2. Stripe

### 2.1 Criar produtos
1. https://dashboard.stripe.com -> Products -> Add product
2. **Hollywood Studio PRO** -> preco recorrente -> copiar Price ID -> `STRIPE_PRICE_PRO`  (creditos: 1.000)
3. **Hollywood Studio ULTRA** -> preco recorrente -> copiar Price ID -> `STRIPE_PRICE_ULTRA` (creditos: 10.000)

### 2.2 Chave secreta
- Developers -> API Keys -> **Secret key** -> `STRIPE_SECRET_KEY`

### 2.3 Webhook
1. Developers -> Webhooks -> Add endpoint
2. URL: `https://hollywoodstudio.ai/api/stripe-webhook`
3. Selecionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Reveal **Signing secret** -> `STRIPE_WEBHOOK_SECRET`

---

## 3. Vercel — Environment Variables

Va em **Vercel Dashboard -> Project -> Settings -> Environment Variables** e adicione:

| Variavel | Onde obter | Frontend? |
|---|---|---|
| `SUPABASE_URL` | Supabase -> Project Settings -> API | Sim (config.js) |
| `SUPABASE_ANON_KEY` | Supabase -> API Keys -> anon | Sim (config.js) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase -> API Keys -> service_role | **NUNCA** |
| `STRIPE_SECRET_KEY` | Stripe -> Developers -> API Keys | **NUNCA** |
| `STRIPE_WEBHOOK_SECRET` | Stripe -> Webhooks -> Signing secret | **NUNCA** |
| `STRIPE_PRICE_PRO` | Stripe -> Products -> Price ID | Nao |
| `STRIPE_PRICE_ULTRA` | Stripe -> Products -> Price ID | Nao |
| `SITE_URL` | `https://hollywoodstudio.ai` | Nao |
| `OPENAI_API_KEY` | platform.openai.com | **NUNCA** |
| `ANTHROPIC_API_KEY` | console.anthropic.com | **NUNCA** |
| `GEMINI_API_KEY` | aistudio.google.com | **NUNCA** |

---

## 4. config.js (frontend publico)

Adicione **somente** as variaveis publicas:

```js
SUPABASE_URL: 'https://xxxx.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGc...',
```

**NUNCA** coloque `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`OPENAI_API_KEY`, `ANTHROPIC_API_KEY` ou `GEMINI_API_KEY` no `config.js`.

---

## 5. Testar

### Localmente (Stripe CLI)
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```
Use cartao de teste: `4242 4242 4242 4242`, data futura, CVC qualquer.

### Em producao
1. Acesse `https://hollywoodstudio.ai/#plans`
2. Clique em um plano -> deve redirecionar para Stripe Checkout
3. Complete com cartao de teste
4. Verifique no Supabase: tabelas `profiles` (credits atualizado) e `credit_transactions` (nova linha)

---

## 6. Creditos por plano

| Plano | Creditos | Preco sugerido |
|---|---|---|
| Novo usuario (trial) | 3 | Gratis |
| PRO | 1.000 | Configure no Stripe |
| ULTRA | 10.000 | Configure no Stripe |