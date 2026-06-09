# Hollywood Studio AI — Guia de Configuração para Produção

## Pré-requisitos
- Conta Vercel (deploy já ativo em hollywoodstudio.ai)
- Conta Supabase (supabase.com)
- Conta Stripe (stripe.com)
- Conta Resend (resend.com)
- API key OpenAI e/ou Anthropic (opcional mas recomendado)

---

## PASSO 1 — Criar projeto Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em **New project**
3. Nome: `hollywoodstudio-ai`
4. Senha forte para o banco (salve em local seguro)
5. Região: South America (São Paulo) — `sa-east-1`
6. Aguarde o projeto inicializar (~2 min)

---

## PASSO 2 — Rodar o schema SQL

1. No dashboard Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o conteúdo de `supabase/schema.sql`
4. Clique em **Run** (F5)
5. Confirme: todas as tabelas foram criadas em **Table Editor**

Tabelas esperadas:
- profiles, plans, credit_transactions, payments, payment_events
- uploads, projects, generations, favorites, gallery_items
- support_tickets, moderation_reports, user_consents
- api_logs, analytics_events, app_settings

---

## PASSO 3 — Criar buckets Supabase Storage

1. Vá em **Storage** no dashboard Supabase
2. Clique em **New bucket** e crie:
   - `user-uploads` — privado (desmarca "Public bucket")
   - `generated-media` — privado
   - `public-gallery` — público (marca "Public bucket")
3. Para cada bucket privado, configure as políticas RLS:
   ```sql
   -- user-uploads: usuário só vê seus arquivos
   CREATE POLICY "user reads own uploads"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

   CREATE POLICY "user inserts own uploads"
     ON storage.objects FOR INSERT
     WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

---

## PASSO 4 — Configurar Google Auth no Supabase

1. Vá em **Authentication > Providers > Google**
2. Habilite o provider
3. No Google Cloud Console (console.cloud.google.com):
   - APIs e Serviços → Credenciais → Criar credencial OAuth 2.0
   - Tipo: Aplicativo da Web
   - Origens JS autorizadas: `https://hollywoodstudio.ai`, `https://hollywoodstudio.vercel.app`
   - URIs de redirecionamento: `https://[SEU_PROJECT_REF].supabase.co/auth/v1/callback`
4. Copie Client ID e Client Secret para o Supabase
5. Salvar alterações

Para login direto com token Google (sem redirecionar para Supabase):
- Configure `GOOGLE_CLIENT_ID` nas env vars da Vercel

---

## PASSO 5 — Copiar chaves Supabase

No dashboard Supabase: **Settings > API**

Copie:
- `Project URL` → `SUPABASE_URL`
- `anon public` → `SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**NUNCA expor no frontend**)

---

## PASSO 6 — Configurar variáveis na Vercel

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto `hollywoodstudio`
3. Vá em **Settings > Environment Variables**
4. Adicione TODAS as variáveis abaixo (para Production):

```
SUPABASE_URL                = https://[ref].supabase.co
SUPABASE_ANON_KEY           = eyJ...
SUPABASE_SERVICE_ROLE_KEY   = eyJ...   ← NÃO expor no frontend
STRIPE_SECRET_KEY           = sk_live_...
STRIPE_WEBHOOK_SECRET       = whsec_...
STRIPE_PRICE_CREATOR        = price_...
STRIPE_PRICE_PRO            = price_...
STRIPE_PRICE_STUDIO         = price_...
RESEND_API_KEY              = re_...
RESEND_FROM_EMAIL           = noreply@hollywoodstudio.ai
OPENAI_API_KEY              = sk-...    (opcional)
ANTHROPIC_API_KEY           = sk-ant-... (opcional)
GEMINI_API_KEY              = AIza...   (opcional)
GOOGLE_CLIENT_ID            = [id].apps.googleusercontent.com
APP_URL                     = https://hollywoodstudio.ai
ADMIN_EMAILS                = seu@email.com
```

5. Clique em **Save** para cada variável
6. Faça **redeploy** para aplicar as variáveis

---

## PASSO 7 — Criar produtos no Stripe

1. Acesse https://dashboard.stripe.com/products
2. Crie 3 planos de assinatura recorrente (mensal):

| Produto    | Preço      | Price ID (copiar) |
|-----------|-----------|-------------------|
| Creator   | R$ 97/mês  | `STRIPE_PRICE_CREATOR` |
| Pro       | R$ 197/mês | `STRIPE_PRICE_PRO` |
| Studio    | R$ 397/mês | `STRIPE_PRICE_STUDIO` |

3. Para créditos avulsos, crie produtos únicos (one-time):

| Produto      | Preço      | Price ID |
|-------------|-----------|----------|
| 100 créditos | R$ 47     | `STRIPE_PRICE_T100` |
| 300 créditos | R$ 127    | `STRIPE_PRICE_T300` |
| 700 créditos | R$ 267    | `STRIPE_PRICE_T700` |

4. Adicione os Price IDs nas env vars da Vercel

---

## PASSO 8 — Configurar Stripe Webhook

1. No Stripe Dashboard: **Developers > Webhooks > Add endpoint**
2. URL: `https://hollywoodstudio.ai/api/payments/webhook`
3. Eventos a escutar:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.payment_failed`
4. Copie o **Signing secret** → `STRIPE_WEBHOOK_SECRET` na Vercel

---

## PASSO 9 — Configurar Resend

1. Acesse https://resend.com
2. Adicione e verifique seu domínio `hollywoodstudio.ai`
3. Crie uma API Key: **API Keys > Create API Key**
4. Permissão: Sending access
5. Copie a chave → `RESEND_API_KEY`
6. Configure `RESEND_FROM_EMAIL=noreply@hollywoodstudio.ai`

---

## PASSO 10 — Deploy final

```bash
# Via Vercel CLI
npx vercel --prod

# Ou via Git push (se conectado ao GitHub)
git push origin main
```

---

## PASSO 11 — Verificar integração

Acesse: `https://hollywoodstudio.ai/api/health`

Resposta esperada com tudo configurado:
```json
{
  "ok": true,
  "supabase": true,
  "stripe": true,
  "resend": true,
  "openai": true,
  "version": "2.0.0"
}
```

---

## PASSO 12 — Executar o checklist de testes

Ver `TESTING_CHECKLIST.md` para o roteiro completo.

---

## ⚠️ Chaves que NUNCA entram no frontend

As variáveis abaixo são **exclusivamente backend** (api/index.js).
Jamais devem aparecer em `index.html`, `config.js`, `hsai-core.js`, `admin-patch.js` ou `localStorage`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_CLIENT_SECRET`

---

## Variáveis públicas (seguras no frontend)

Estas podem ser expostas:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GOOGLE_CLIENT_ID`

Mas ainda assim, use apenas via `window.HSAI_CONFIG` e nunca em código hardcoded.

---

## Configuração mínima para funcionar (modo básico)

Para uma implantação rápida sem todos os serviços:

1. Supabase (auth + db) — **obrigatório para produção real**
2. Stripe + Webhook — obrigatório para pagamentos
3. Resend — opcional (emails podem ser omitidos no início)
4. OpenAI/Claude — opcional (fallbacks de IA ativam automaticamente)

Sem nenhuma variável configurada, a plataforma funciona em modo **"beta/demo"** com dados no localStorage.
