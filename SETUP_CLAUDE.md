# Hollywood Studio AI — Guia de Setup Completo

## O que está neste pacote

Estes são os arquivos que substituem/adicionam ao boilerplate `seedance-2-generator`.
Mantém toda a lógica original e adiciona:
- **MercadoPago** (Pix + Boleto + Cartão BR)
- **BytePlus ModelArk** direto (Seedance 2.0 sem intermediário)
- **Planos em BRL** (R$99/199/349)
- **Schema Prisma** ampliado (Payment, plan, group, isPublic)
- **Webhook unificado** (BytePlus + muapi no mesmo endpoint)
- **Pricing page** com identidade Hollywood Studio AI

---

## Setup em 6 passos

### Passo 1 — Fork e clone

```bash
git clone https://github.com/SamurAIGPT/seedance-2-generator hollywoodstudio
cd hollywoodstudio
```

### Passo 2 — Substituir os arquivos

Copie os arquivos deste pacote por cima dos originais, mantendo a estrutura de pastas.
Os arquivos novos são:

```
src/lib/config.js                        ← substitui
src/lib/services/ai.js                   ← substitui
src/lib/services/billing.js              ← substitui
src/lib/services/user.js                 ← substitui
src/app/api/stripe/checkout/route.js     ← substitui
src/app/api/stripe/webhook/route.js      ← substitui
src/app/api/seedance/route.js            ← substitui
src/app/api/seedance/check-status/route.js ← substitui
src/app/api/mercadopago/checkout/route.js  ← NOVO
src/app/api/mercadopago/webhook/route.js   ← NOVO
src/app/api/webhook/byteplus/route.js      ← NOVO (substitui /webhook/muapi)
src/app/pricing/page.js                   ← substitui
prisma/schema.prisma                       ← substitui
.env.example                               ← substitui
```

### Passo 3 — Banco de dados (Neon.tech)

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Crie um projeto: `hollywoodstudio`
3. Copie as duas URLs (DATABASE_URL e DIRECT_URL)
4. Cole no `.env.local`

```bash
cp .env.example .env.local
# edite .env.local com suas chaves
```

### Passo 4 — Instalar e migrar banco

```bash
npm install
npx prisma generate
npx prisma db push     # cria as tabelas no Neon
```

### Passo 5 — Configurar pagamentos

#### Stripe (cartão internacional)
1. [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API Keys
2. Copie `sk_live_...` e `pk_live_...` para `.env.local`
3. Crie 3 Payment Links em [stripe.com/payment-links](https://stripe.com/payment-links):
   - Básico: R$99 (nome: "Hollywood Studio AI — Básico")
   - Premium: R$199
   - Avançado: R$349
4. Cole os links em `NEXT_PUBLIC_STRIPE_LINK_*`
5. Configure webhook: Stripe Dashboard → Webhooks → Add endpoint
   - URL: `https://hollywoodstudio.ai/api/stripe/webhook`
   - Evento: `checkout.session.completed`

#### MercadoPago (Pix + Boleto + Cartão BR)
1. [mercadopago.com.br](https://www.mercadopago.com.br/developers/panel) → Credenciais
2. Copie o Access Token de **Produção**
3. Configure webhook no painel MP:
   - URL: `https://hollywoodstudio.ai/api/mercadopago/webhook`
   - Evento: `payment`

#### PayPal (simples — redirecionamento)
- Apenas configure `NEXT_PUBLIC_PAYPAL_EMAIL=alansorrah@gmail.com`
- Funciona via paypal.me (sem necessidade de API)

### Passo 6 — Deploy no Vercel

```bash
npm install -g vercel
vercel
```

Configure as variáveis de ambiente no Vercel Dashboard:
- Settings → Environment Variables → cole todas do `.env.local`

---

## Estrutura de pagamentos

```
Usuário clica "Assinar Básico" com MercadoPago
→ POST /api/mercadopago/checkout { planId: "basico" }
→ Cria preference na API MP com Pix/Boleto/Cartão
→ Retorna URL do checkout MP
→ Usuário paga
→ MP dispara POST /api/mercadopago/webhook
→ Busca detalhes do pagamento na API MP
→ Se approved: UserService.activatePlan(userId, "basico", 150)
→ Usuário tem +150 créditos e plano "basico" ativo
```

```
Usuário clica "Assinar Premium" com Stripe Payment Link
→ Redireciona para buy.stripe.com/xxx (sem backend)
→ Usuário paga
→ Stripe dispara POST /api/stripe/webhook
→ Se checkout.session.completed: UserService.activatePlan(userId, "premium", 300)
→ Usuário tem +300 créditos
```

---

## Sistema de créditos

1 crédito = 1 segundo de vídeo (simplificado para o usuário)

```javascript
// Custo calculado em ai.js
getCreditCost(mode, duration, quality, resolution)
// Exemplos:
// text-to-video, 5s, 720p, basic  = 5 créditos
// text-to-video, 10s, 720p, high  = 15 créditos
// reference-to-video, 8s, 720p    = 12 créditos
```

---

## BytePlus vs muapi

Por padrão, `USE_MUAPI=false` → usa BytePlus direto.

Para voltar para muapi (mais simples, compatível com boilerplate):
```
USE_MUAPI="true"
SEEDANCE_V2_API_KEY="sua_chave_muapi"
```

O webhook `/api/webhook/byteplus` aceita ambos os formatos de resposta.

---

## Checklist de lançamento

- [ ] `.env.local` preenchido com todas as chaves
- [ ] `npx prisma db push` executado com sucesso
- [ ] Teste de login Google funcionando
- [ ] Stripe webhook configurado e testado
- [ ] MercadoPago webhook configurado e testado
- [ ] Geração de vídeo funcionando (BytePlus ou muapi)
- [ ] Deploy no Vercel sem erros
- [ ] Domain `hollywoodstudio.ai` apontando para Vercel
