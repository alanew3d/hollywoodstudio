# Hollywood Studio AI — Public Beta v3 Admin Control Panel

Esta versão adiciona um painel administrativo mais próximo de SaaS real.

## Novas áreas do Admin

- `/admin/users` — lista de usuários com busca, filtros, plano, créditos, role, criações, pagamentos e ações rápidas.
- `/admin/users/[id]` — ficha do usuário, histórico de pagamentos, criações, alteração de plano, role e créditos.
- `/admin/credits` — liberação manual de créditos, ideal para venda assistida por WhatsApp/PayPal enquanto webhooks são finalizados.
- `/admin/payments` — gestão de pagamentos, status e confirmação manual.
- `/admin/plans` — preços, créditos e links de contratação por plano.
- `/admin/models` — catálogo operacional de modelos: provider, categoria, custo, plano mínimo, premium e status.
- `/admin/features` — liga/desliga módulos como Studio, Agent, Final Cut, IMG.LY, Academy, Marketplace etc.
- `/admin/branding` — nome, tagline, idioma, tema, suporte e assets principais.
- `/admin/settings` — checklist de variáveis de ambiente e webhooks.

## Importante

Chaves sensíveis como STRIPE_SECRET_KEY, GOOGLE_CLIENT_SECRET, BYTEPLUS_API_KEY e ATLASCLOUD_API_KEY devem continuar na Vercel em Environment Variables.
O Admin mostra checklist e configurações comerciais, mas não deve virar cofre público de secrets.

## Depois de subir esta versão

Como o schema ganhou `AdminSetting` e `AuditLog`, rode o push do Prisma no banco Neon:

```bash
npx prisma db push
```

Se você não rodar isso, o site ainda deve abrir, mas salvar configurações do Admin pode retornar aviso de tabela ausente.

## Para liberar seu próprio acesso Admin

No Neon SQL Editor:

```sql
UPDATE "User" SET role='admin' WHERE email='alanew3d@gmail.com';
```

## Próximas prioridades

1. Corrigir Google OAuth: adicionar redirect URI autorizado.
2. Criar Stripe Payment Links reais e colar em `/admin/plans` e também nas envs públicas.
3. Testar venda assistida: pagamento por PayPal/WhatsApp → liberar crédito manual em `/admin/credits`.
4. Ativar API real de geração: BytePlus/Atlas.
5. Subir domínio `hollywoodstudio.ai` e atualizar `NEXTAUTH_URL`.
