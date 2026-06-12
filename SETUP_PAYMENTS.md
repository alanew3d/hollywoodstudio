# SETUP_PAYMENTS.md
# Hollywood Studio AI — Configuração de Pagamentos e Supabase

## 1. Supabase

1. Acesse https://app.supabase.com → seu projeto → SQL Editor
2. Cole e execute o conteúdo de `SUPABASE_SCHEMA.sql`
3. Verifique as tabelas: profiles · credit_transactions · generation_logs · subscriptions
4. Ative RLS em todas (já incluído no schema)

## 2. Stripe

1. Crie dois produtos em https://dashboard.stripe.com/products:
   - Hollywood Studio Pro — preço recorrente mensal
   - Hollywood Studio Ultra — preço recorrente mensal

2. Copie o Price ID de cada um (formato: price_XXXX)

3. Crie o Webhook em:
   Developers → Webhooks → Add endpoint
   URL: https://hollywoodstudio.ai/api/stripe-webhook
   Eventos:
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_failed

4. Copie o Webhook Signing Secret (whsec_XXXX)

## 3. Vercel — Environment Variables

Acesse: https://vercel.com → seu projeto → Settings → Environment Variables

Adicione:

```
SUPABASE_URL=https://XXXXXXXXXXX.supabase.co
SUPABASE_ANON_KEY=eyJ...          # Público — pode ir ao config.js do frontend
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # SECRETO — apenas no backend, nunca no frontend
STRIPE_SECRET_KEY=sk_live_...     # SECRETO
STRIPE_WEBHOOK_SECRET=whsec_...   # SECRETO
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ULTRA=price_...
SITE_URL=https://hollywoodstudio.ai
```

## 4. config.js (frontend — apenas chaves públicas)

```js
window.HSAI_CONFIG = {
  // ...
  SUPABASE_URL: 'https://XXXXXXXXXXX.supabase.co',
  SUPABASE_ANON_KEY: 'eyJ...',   // anon key é pública — ok no frontend
  // NUNCA coloque aqui:
  // SUPABASE_SERVICE_ROLE_KEY
  // STRIPE_SECRET_KEY
  // STRIPE_WEBHOOK_SECRET

  // Desativar modo recuperação após configurar:
  ADMIN_USER: 'admin',
  ADMIN_PASS: 'SUA_SENHA_FORTE_AQUI',
  ADMIN_RECOVERY_MODE: false,   // ← TROCAR PARA false ANTES DE IR AO AR
};
```

## 5. Checklist rápido antes de ir ao ar

- [ ] SUPABASE_SCHEMA.sql executado com sucesso
- [ ] Tabelas profiles, credit_transactions, generation_logs, subscriptions existem
- [ ] RLS ativo em todas as tabelas
- [ ] Stripe webhook configurado e testado (use o Stripe CLI localmente)
- [ ] ADMIN_RECOVERY_MODE: false no config.js
- [ ] ADMIN_PASS alterado para senha forte
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Deploy realizado após adicionar as variáveis

## 6. Testar o fluxo de checkout

```bash
# Instalar Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
# Em outro terminal:
stripe trigger checkout.session.completed
```

## 7. Dependências do projeto (package.json)

```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "@supabase/supabase-js": "^2.0.0"
  }
}
```

Instale com: `npm install stripe @supabase/supabase-js`
