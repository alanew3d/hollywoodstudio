# Hollywood Studio AI — Roadmap de Produção

> Última atualização: 2026-06-28
> Organizado por prioridade. Itens bloqueadores de produção estão marcados com 🔴.

---

## P0 — Segurança (bloqueadores imediatos)

Estes itens expõem dados sensíveis ou quebram o produto em produção agora.

- [ ] **🔴 Remover chaves de API do `config.js`**
  - `CLAUDE_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `YOUTUBE_API_KEY` estão em texto claro em um arquivo público
  - `PROVIDERS.atlascloud.key`, `PROVIDERS.fal.key`, `PROVIDERS.modelark.key` idem
  - O backend já usa `process.env` — o frontend não precisa de nenhuma dessas chaves
  - Ação: remover os valores, deixar strings vazias ou `''`

- [ ] **🔴 Remover `ADMIN_PASS` do `config.js`**
  - `ADMIN_PASS: 'hs2026!'` está exposto publicamente no JS servido ao browser
  - Ação: remover o campo; autenticação admin deve depender apenas do Supabase JWT + verificação de `role`

- [ ] **🔴 Corrigir CORS em `api/_supabase.js` e `api/payment.js`**
  - Ambos definem `Access-Control-Allow-Origin: https://diretor.ai` (domínio errado)
  - Causa: código copiado de outro produto sem ajuste
  - Ação: trocar para `https://hollywoodstudio.ai` ou usar a lógica de CORS do `api/index.js`

---

## P1 — Integrações essenciais (o produto não gera receita sem isso)

- [ ] **Configurar links de pagamento Stripe**
  - `STRIPE_LINK_BASICO`, `STRIPE_LINK_CREATOR`, `STRIPE_LINK_PRO`, `STRIPE_LINK_STUDIO` estão vazios
  - `STRIPE_TOPUP_100`, `STRIPE_TOPUP_300`, `STRIPE_TOPUP_700` idem
  - Criar os produtos e preços no Stripe Dashboard e preencher no Vercel Env Vars

- [ ] **Registrar webhook Stripe**
  - Endpoint: `https://hollywoodstudio.ai/api/payments/webhook`
  - Eventos necessários: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
  - Copiar o `STRIPE_WEBHOOK_SECRET` gerado para o Vercel Env Vars

- [ ] **Executar schema do banco de dados**
  - Rodar `supabase/schema.sql` no SQL Editor do Supabase de produção
  - Verificar se tabelas existem: `profiles`, `credit_transactions`, `payments`, `payment_events`, `projects`, `gallery_items`, `public_gallery_items`, `favorites`, `uploads`, `support_tickets`

- [ ] **Criar buckets no Supabase Storage**
  - `user-uploads` (privado)
  - `generated-media` (privado)
  - `public-gallery` (público)
  - Aplicar as políticas RLS comentadas no final do `schema.sql`

- [ ] **Configurar variáveis de ambiente no Vercel**
  - Verificar quais estão faltando: `GET /api/health/details` lista o status de cada uma
  - Mínimo necessário: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ANTHROPIC_API_KEY` (ou `OPENAI_API_KEY`)

---

## P2 — Correções de código (bugs que afetam usuários)

- [ ] **Remover/isolar código legado do diretor.ai**
  - `api/auth.js`, `api/admin.js` e `api/claude.js` consultam tabelas inexistentes no schema HSAI (`decisions`, `decisions_used`, `decisions_limit`)
  - Esses arquivos não são roteados pelo `vercel.json` atual, mas criam confusão e podem conflitar
  - Ação: mover para `_legacy/` ou deletar; o `api/index.js` já substitui todos eles

- [ ] **Corrigir assets do PWA manifest**
  - `manifest.json` referencia `/assets/logos/favicon.jpg` e `/assets/logos/logo-hero.png` — arquivos que não existem
  - Ação: apontar para `favicon.png` e `favicon.svg` que existem na raiz

- [ ] **Configurar Google OAuth no Supabase**
  - Adicionar `GOOGLE_CLIENT_ID` no Vercel Env Vars
  - Habilitar provider Google no Supabase Auth Dashboard
  - Adicionar `https://hollywoodstudio.ai` como origem autorizada no Google Cloud Console

- [ ] **Tratar Finisher Lab incompleto na UI**
  - Ferramentas `upscale`, `inpaint`, `relight`, `style-transfer`, `expand`, `remove-background`, `change-camera`, `lip-sync` retornam `pending_integration`
  - Usuários chegam até a tela e tentam pagar por algo que não funciona
  - Ação (curto prazo): desabilitar visualmente as ferramentas com badge "Em breve" até integração concluída
  - Ação (médio prazo): implementar chamadas HTTP reais para Magnific/Atlas

---

## P3 — Qualidade e manutenibilidade

- [ ] **Separar `index.html` em arquivos menores**
  - O arquivo tem 15.849 linhas com HTML, CSS e JS misturados
  - Mínimo: extrair CSS para `styles.css` e JS para módulos separados por seção
  - Ideal: migrar para um bundler (Vite + vanilla JS ou React)

- [ ] **Adicionar rate limiting nas rotas de API**
  - Rotas de geração e IA não têm nenhum controle de abuso
  - Opção simples: Vercel Edge Middleware com contagem por IP no KV
  - Opção robusta: Upstash Ratelimit

- [ ] **Adicionar monitoramento de erros**
  - Nenhum serviço de APM configurado (Sentry, LogRocket, etc.)
  - O `api/index.js` tem `log()` apenas para dev; erros de produção são silenciosos

- [ ] **Implementar CSP (Content-Security-Policy)**
  - Sem headers de segurança configurados no Vercel
  - Adicionar no `vercel.json`: `X-Frame-Options`, `X-Content-Type-Options`, `CSP`

---

## P4 — Limpeza do repositório

Itens que não afetam o produto mas poluem o código e podem causar confusão.

- [ ] Remover ou mover para repositório próprio:
  - `/kbc/` — Kindle BarraShopping Control (produto separado)
  - `/oceanmarine/` — Rio Ocean Marine (produto separado)
  - `/acheiproducao/` — Produto separado
  - `/_references/radar_v4/` — Código-fonte do diretor.ai como referência

- [ ] Deletar arquivos de rascunho na raiz:
  - `vercel.json_old`
  - `vercel_old.json`
  - `_commitmsg.txt`
  - `_syntaxcheck.cjs`
  - `hsai_check.cjs`
  - `admin-patch.js` (não está sendo incluído no index.html)
  - `IMPLEMENTATION_REPORT.md`, `TESTING_CHECKLIST.md`, `SETUP_PRODUCAO.md`, `DEPLOY.md` (consolidar ou arquivar)

---

## P5 — Funcionalidades futuras

- [ ] **Completar integração Mercado Pago (PIX)**
  - Campo `PIX` vazio no config; webhook parcialmente implementado em `api/payment.js`
  - Necessário para pagamentos no Brasil sem cartão de crédito

- [ ] **Galeria pública real**
  - Hoje retorna dados demo quando Supabase não está configurado
  - Implementar moderação de conteúdo antes de abrir para usuários

- [ ] **Multi-usuário / times** (mencionado no plano Studio)

- [ ] **API pública** (mencionada no plano Studio)

- [ ] **Notificações de geração concluída**
  - Hoje o usuário precisa ficar com a aba aberta; sem webhook de status dos provedores

---

## Checklist de Go-Live

Use esta lista antes de anunciar o produto publicamente:

```
[ ] Chaves removidas do config.js
[ ] CORS corrigido nos arquivos legados
[ ] ADMIN_PASS removido do código público
[ ] Schema SQL executado no Supabase de produção
[ ] Buckets de storage criados
[ ] Stripe: produtos, preços e webhook configurados
[ ] Variáveis de ambiente completas no Vercel (verificar /api/health/details)
[ ] Google OAuth autorizado para hollywoodstudio.ai
[ ] Finisher Lab com badge "Em breve" nas ferramentas incompletas
[ ] Manifest.json com assets que existem
[ ] Teste de pagamento end-to-end (checkout → webhook → créditos na conta)
[ ] Teste de login Google
[ ] Teste de geração com créditos
```
