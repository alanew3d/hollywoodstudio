# diretor.ai — Deploy em 8 passos

## Você vai precisar criar conta em (todos gratuitos):
- github.com
- vercel.com
- supabase.com
- resend.com
- console.anthropic.com

---

## PASSO 1 — Supabase (banco de dados + auth)

1. Acesse **app.supabase.com** → New Project
2. Nome: `diretor-ai` | Região: South America (São Paulo)
3. Anote a senha do banco — salve em local seguro
4. Aguardar criar (~1 min)
5. No menu lateral: **SQL Editor** → colar todo o conteúdo de `supabase_setup.sql` → Run
6. Ir em **Settings → API** e anotar:
   - `Project URL` → será o `SUPABASE_URL`
   - `anon public` key → será o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → será o `SUPABASE_SERVICE_KEY`
7. Ir em **Authentication → Providers**:
   - Email: habilitar "Confirm email" (opcional para MVP)
   - Google: adicionar Client ID + Secret (opcional)

---

## PASSO 2 — Editar index.html

Abrir `index.html` e substituir nas linhas iniciais:

```javascript
const SUPABASE_URL = 'https://SEUPROJETO.supabase.co';
// → cole a URL do Supabase

const SUPABASE_ANON_KEY = 'SUAANON_KEY_AQUI';
// → cole a anon/public key do Supabase
```

---

## PASSO 3 — GitHub

1. Acesse **github.com** → New repository
2. Nome: `diretor-ai` | Privado (recomendado)
3. Fazer upload de todos os arquivos desta pasta

Ou pelo terminal:
```bash
cd diretor-ai/
git init
git add .
git commit -m "diretor.ai v1"
git remote add origin https://github.com/SEUUSUARIO/diretor-ai.git
git push -u origin main
```

---

## PASSO 4 — Vercel (deploy automático)

1. Acesse **vercel.com** → New Project
2. Conectar com GitHub → selecionar `diretor-ai`
3. Framework Preset: **Other**
4. Root Directory: `./`
5. **Settings → Environment Variables** — adicionar:

| Nome | Valor |
|------|-------|
| `ANTHROPIC_API_KEY` | sk-ant-api03-... |
| `SUPABASE_URL` | https://SEUPROJETO.supabase.co |
| `SUPABASE_SERVICE_KEY` | eyJhbGci... (service_role) |
| `STRIPE_SECRET_KEY` | sk_live_... |
| `STRIPE_WEBHOOK_SECRET` | whsec_... (preencher após PASSO 6) |
| `MP_ACCESS_TOKEN` | APP_USR-... |
| `RESEND_API_KEY` | re_... |
| `ADMIN_EMAIL` | seu@email.com |

6. **Deploy** → aguardar (~2 min) → site no ar!

---

## PASSO 5 — Domínio diretor.ai

1. Vercel → seu projeto → **Settings → Domains**
2. Adicionar: `diretor.ai`
3. Seguir instruções de DNS (no seu registrador de domínio):
   - Adicionar registro A: `76.76.19.19`
   - Ou mudar nameservers para Vercel
4. Aguardar propagação (5 min a 24h)

---

## PASSO 6 — Stripe (pagamentos automáticos)

1. **dashboard.stripe.com** → Products → Add Product
2. Criar 3 produtos:
   - `Iniciado` — R$97,00/mês recorrente
   - `Diretor` — R$197,00/mês recorrente  
   - `Grande Mestre` — R$497,00/mês recorrente
3. Para cada produto: Payment Link → criar link → copiar URL
4. No admin do site: Admin → Pagamentos → colar os links
5. **Developers → Webhooks → Add endpoint**:
   - URL: `https://diretor.ai/api/payment`
   - Eventos: `checkout.session.completed`
   - Copiar "Signing secret" → colocar no Vercel como `STRIPE_WEBHOOK_SECRET`
   - **Redeploy o Vercel** após adicionar a variável

Para que o Stripe saiba qual plano ativar, em cada Payment Link:
- Metadata → Add: `plan_id` = `iniciado` (ou `diretor` ou `grande_mestre`)

---

## PASSO 7 — Mercado Pago (Pix/Boleto BR)

1. **mercadopago.com.br/developers** → Suas integrações → Nova aplicação
2. Credenciais → copiar Access Token → colocar no Vercel como `MP_ACCESS_TOKEN`
3. Criar links de pagamento no painel MP → copiar → Admin → Pagamentos
4. Webhook: Integrações → IPN → URL: `https://diretor.ai/api/payment?provider=mp`

---

## PASSO 8 — Ativar primeiro admin

Após criar sua conta no site:

1. Supabase → **Table Editor → profiles**
2. Encontrar sua linha pelo email
3. Editar: `role` = `admin`

Agora você pode:
- Acessar Admin → fazer login com sua conta normal
- Ver todos os usuários
- Alterar planos manualmente
- Ver estatísticas de uso

---

## FLUXO COMPLETO APÓS DEPLOY

```
Usuário se registra
       ↓
Perfil criado automaticamente no Supabase
       ↓
Usuário clica "Assinar Diretor"
       ↓
Stripe Payment Link (com metadata plan_id=diretor)
       ↓
Pagamento confirmado → Webhook → /api/payment
       ↓
Supabase atualiza: plan=diretor, decisions_limit=999
       ↓
Resend envia email: "Plano Diretor ativado"
       ↓
Usuário faz login → Claude API chamada via /api/claude
       ↓
Chave Claude NUNCA exposta no browser ✓
```

---

## TESTAR LOCALMENTE (opcional)

```bash
npm install -g vercel
cp .env.example .env.local
# preencher .env.local com suas chaves
vercel dev
# site rodando em http://localhost:3000
```

---

## SUPORTE

Qualquer dúvida durante o deploy, Alan pode usar o Claude com este arquivo
como contexto e pedir ajuda específica para cada etapa.
