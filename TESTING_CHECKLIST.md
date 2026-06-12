# Hollywood Studio AI — Checklist de Testes de Produção

Execute cada item antes de confirmar o deploy como estável.

---

## 1. Infraestrutura

- [ ] `GET /api/health` retorna `200` com todos os campos
- [ ] `supabase: true` no health check
- [ ] `stripe: true` no health check
- [ ] `resend: true` no health check
- [ ] Deploy Vercel completado sem erros de build
- [ ] Domínio hollywoodstudio.ai respondendo
- [ ] HTTPS ativo (certificado válido)

---

## 2. Cadastro e Login

- [ ] Cadastro com e-mail e senha funciona
- [ ] Login com e-mail e senha funciona
- [ ] Login com Google funciona
- [ ] Sessão persiste após reload da página
- [ ] Logout limpa sessão e token JWT
- [ ] Após logout, botões de ação redirecionam para login
- [ ] Usuário recebe e-mail de boas-vindas (se Resend configurado)

---

## 3. Recuperação de senha

- [ ] Clicar em "Esqueci minha senha" abre formulário
- [ ] Enviar e-mail de recuperação dispara mensagem neutra
- [ ] E-mail de recuperação chega com link válido (se Supabase configurado)

---

## 4. Perfil do usuário

- [ ] Nome e avatar aparecem corretamente
- [ ] Painel "Minha Conta" abre sem erros
- [ ] Tabs: Perfil, Créditos, Assinatura, Dados, Segurança, Excluir
- [ ] Idioma PT/EN altera corretamente
- [ ] Alterar senha funciona (se Supabase configurado)

---

## 5. Créditos

- [ ] Saldo exibido corretamente na sidebar
- [ ] Trial de 3 créditos concedido na primeira conta
- [ ] Trial não é concedido duas vezes para o mesmo usuário
- [ ] Saldo sincroniza com backend via `GET /api/credits/balance`
- [ ] Usuário comum NÃO consegue adicionar créditos manualmente
- [ ] Admin consegue adicionar créditos via `POST /api/admin/credits/add`
- [ ] Histórico de transações acessível em "Minha Conta > Créditos"

---

## 6. Pagamentos (Stripe)

- [ ] Clicar em "Assinar Creator" abre Stripe Checkout
- [ ] Stripe Checkout redireciona para URL correta
- [ ] Após pagamento, webhook recebe `checkout.session.completed`
- [ ] Créditos são adicionados após webhook (não antes)
- [ ] Webhook duplicado NÃO adiciona créditos duas vezes (idempotência)
- [ ] E-mail de confirmação enviado (se Resend configurado)
- [ ] Histórico de pagamentos aparece em "Assinatura"
- [ ] Plano atualizado no perfil após pagamento

---

## 7. Upload de arquivos

- [ ] Upload de imagem funciona (JPG, PNG, WebP)
- [ ] Arquivo aparece em "Meus Uploads"
- [ ] Upload pode ser usado como referência no Estúdio
- [ ] Arquivo inválido (exe, svg malicioso) é rejeitado
- [ ] Arquivo muito grande exibe mensagem de erro clara
- [ ] Uploads registrados no banco Supabase (se configurado)

---

## 8. Favoritos

- [ ] Clicar em ★ adiciona item aos favoritos
- [ ] Favorito persiste após reload
- [ ] Desfavoritar remove do painel
- [ ] Se Supabase configurado: favorito sincroniza entre dispositivos

---

## 9. Projetos

- [ ] "Salvar projeto" funciona no Estúdio
- [ ] Projeto aparece em "Meus Projetos"
- [ ] Projeto persiste após reload
- [ ] Excluir projeto remove da lista
- [ ] Se Supabase configurado: projetos sincronizam entre dispositivos

---

## 10. Galeria

- [ ] Geração aparece na galeria após completar
- [ ] Item público aparece na galeria pública
- [ ] Item privado não aparece para outros usuários
- [ ] "Copiar prompt" funciona
- [ ] "Usar no Estúdio" funciona

---

## 11. IA (Prompts e Conselho Criativo)

- [ ] "Melhorar prompt" usa backend real (se chave configurada)
- [ ] Sem chave de IA: fallback local funciona
- [ ] Conselho Criativo retorna resultado
- [ ] "Gerar storyboard" funciona
- [ ] "Legenda social" gera texto relevante
- [ ] APIs de IA são chamadas pelo backend, NUNCA pelo frontend diretamente

---

## 12. E-mails transacionais

- [ ] E-mail de boas-vindas enviado ao cadastrar
- [ ] E-mail de confirmação de pagamento enviado
- [ ] E-mail de suporte enviado ao abrir chamado
- [ ] Admin recebe notificação de novo chamado
- [ ] Sem RESEND_API_KEY: nenhum erro crítico (gracioso)

---

## 13. Suporte

- [ ] Botão "Abrir chamado" funciona
- [ ] Formulário aceita categoria, assunto, mensagem
- [ ] Chamado registrado no banco (se Supabase)
- [ ] Usuário recebe protocolo de confirmação
- [ ] Admin recebe notificação por e-mail

---

## 14. Exportação de dados

- [ ] "Exportar meus dados" gera arquivo JSON
- [ ] JSON contém: perfil, projetos, favoritos, transações
- [ ] Download inicia automaticamente

---

## 15. Admin

- [ ] Painel admin acessível apenas para admins (role='admin' ou ADMIN_EMAILS)
- [ ] Usuário comum recebe 403 em endpoints /api/admin/*
- [ ] Admin pode listar usuários
- [ ] Admin pode alterar role de usuário
- [ ] Admin pode adicionar créditos com confirmação
- [ ] `GET /api/admin/status` mostra status de todas as integrações

---

## 16. Segurança

- [ ] NENHUMA chave privada em index.html ou assets
- [ ] NENHUMA chave privada em localStorage
- [ ] Endpoint `/api/admin/*` rejeita usuários não-admin com 403
- [ ] Endpoint `/api/credits/use` não aceita amounts negativos
- [ ] Webhook Stripe valida assinatura (rejeita payloads inválidos)
- [ ] CORS configurado corretamente (apenas origens autorizadas)

---

## 17. Modo sem configuração (modo beta)

- [ ] Site carrega sem NENHUMA env var configurada
- [ ] Login funciona em modo local (localStorage)
- [ ] Créditos funcionam localmente
- [ ] Botões de features beta mostram modal explicativo
- [ ] NÃO há erros críticos no console

---

## 18. Mobile

- [ ] Layout responsivo em 375px (iPhone SE)
- [ ] Layout responsivo em 768px (tablet)
- [ ] Menus e modais funcionam no touch
- [ ] Upload funciona em mobile (câmera + galeria)
- [ ] Botões têm tamanho adequado para toque (min 44px)

---

## 19. Internacionalização

- [ ] Alternar PT/EN muda idioma corretamente
- [ ] Erros exibidos no idioma correto
- [ ] Planos exibidos no idioma correto
- [ ] E-mails enviados no idioma do usuário (se implementado)

---

## 20. Performance

- [ ] Lighthouse Score > 70 (Performance)
- [ ] Sem console.log excessivos em produção
- [ ] Imagens carregam com lazy loading
- [ ] Script não duplicados
- [ ] Nenhum listener duplicado no DOM

---

## Resultado esperado

Antes do lançamento público, todos os itens críticos (1-16) devem estar marcados.
Itens 17-20 são desejáveis mas não bloqueiam o lançamento.

---

## Como testar o webhook Stripe localmente

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escutar eventos locais
stripe listen --forward-to localhost:3000/api/payments/webhook

# Simular pagamento aprovado
stripe trigger checkout.session.completed
```
