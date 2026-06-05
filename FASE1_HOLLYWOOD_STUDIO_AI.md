# FASE 1 — Hollywood Studio AI

Esta versão adapta o projeto Seedance 2 Generator para a primeira base SaaS do Hollywood Studio AI.

## O que já foi ajustado

1. Branding inicial para Hollywood Studio AI.
2. Tema visual `hollywood` com fundo escuro e dourado.
3. Página de planos em português e BRL.
4. Stripe checkout por plano: `basico`, `premium`, `avancado`.
5. Créditos simplificados: **1 crédito = 1 segundo de vídeo**.
6. `.env.example` atualizado para Vercel/Neon/Supabase/Stripe/Google.
7. Provider de vídeo mantido compatível com o fluxo original para não quebrar o deploy inicial.

## O que você deve fazer agora

### 1. Subir para GitHub
Crie um repositório novo, por exemplo:

`hollywood-studio-ai-saas`

Suba todos os arquivos desta pasta.

### 2. Criar banco PostgreSQL
Use Neon ou Supabase.
Copie a connection string para:

`DATABASE_URL`

Se o provedor der uma URL separada para migração, use também em:

`DIRECT_URL`

### 3. Configurar Vercel
Importe o repositório na Vercel e adicione as variáveis do `.env.example`.

Obrigatórias para o primeiro deploy completo:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SEEDANCE_V2_API_KEY`
- `WEBHOOK_URL`
- `NEXT_PUBLIC_THEME=hollywood`

### 4. Rodar Prisma
Localmente ou via build command, rode:

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

### 5. Configurar Stripe Webhook
No Stripe, crie um endpoint apontando para:

`https://SEU-DOMINIO/api/stripe/webhook`

Evento necessário:

`checkout.session.completed`

Cole o signing secret em:

`STRIPE_WEBHOOK_SECRET`

## Próxima fase

FASE 2 deve cuidar de:

- provider real BytePlus/AtlasCloud;
- homepage mais premium;
- galeria com visual Hollywood Studio AI;
- logo real;
- storage Cloudflare R2;
- planos recorrentes em vez de pacote único, se você preferir assinatura mensal.
