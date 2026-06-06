# Hollywood Studio AI — Public Beta Merge

Esta versão foi preparada para publicar uma primeira versão funcional do Hollywood Studio AI com foco em:

- Home pública clara
- Login Google via NextAuth
- Planos em BRL
- Studio com modelos, presets, referências, custo e galeria local
- Banco Prisma/Neon com usuários, criações e pagamentos
- APIs preparadas para Stripe, MercadoPago, Seedance/BytePlus e Admin
- Admin inicial em `/admin`

## Caminho de publicação

1. Substituir os arquivos do repo local pelo conteúdo deste pacote.
2. GitHub Desktop → Commit: `Public beta merge`.
3. GitHub Desktop → Push origin.
4. Vercel vai gerar novo deploy.
5. Se der erro, copiar as últimas linhas do Build Log e enviar ao ChatGPT.

## Variáveis mínimas para o primeiro deploy

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_URL=https://SEU-PROJETO.vercel.app
NEXTAUTH_SECRET=gere_uma_chave_forte
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
WEBHOOK_URL=https://SEU-PROJETO.vercel.app
NEXT_PUBLIC_THEME=hollywood
```

## Variáveis para pagamentos

```env
STRIPE_SECRET_KEY=sk_live_ou_test...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_ou_test...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_LINK_BASICO=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_PREMIUM=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_LINK_AVANCADO=https://buy.stripe.com/...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=
NEXT_PUBLIC_PAYPAL_EMAIL=alansorrah@gmail.com
```

## Variáveis para geração real

```env
BYTEPLUS_API_KEY=
BYTEPLUS_BASE_URL=https://ark.ap-southeast.bytepluses.com
USE_MUAPI=false
SEEDANCE_V2_API_KEY=
ATLASCLOUD_API_KEY=
ATLASCLOUD_BASE_URL=https://api.atlascloud.ai
```

## Observação importante

Sem as chaves de IA, o Studio abre, calcula créditos e aceita prompt, mas a geração real retornará erro de configuração. Isso é esperado até preencher `BYTEPLUS_API_KEY`, `SEEDANCE_V2_API_KEY` ou outro provider.
