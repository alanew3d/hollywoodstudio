/**
 * HOLLYWOOD STUDIO AI — config.js
 * Coloque este arquivo na raiz do seu projeto, junto com index.html
 * O index.html lê window.HSAI_CONFIG automaticamente.
 *
 * NUNCA commite este arquivo com chaves reais para repositórios públicos.
 * No Vercel: use este arquivo como template e configure as variáveis de ambiente.
 */

window.HSAI_CONFIG = {

  // ─── IDENTIDADE ──────────────────────────────────────────────────────────
  SITE_NAME:    'Hollywood Studio AI',
  SITE_URL:     'https://hollywoodstudio.ai',
  ADMIN_PASS:   'hw2026!',          // ← TROQUE antes de publicar

  // ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────
  // console.cloud.google.com → Credenciais → IDs do cliente OAuth 2.0
  // Origens autorizadas: https://hollywoodstudio.ai e https://hollywoodstudio.vercel.app
  // URIs de redirecionamento: mesmas URLs acima
  GOOGLE_CLIENT_ID: '',             // ← Cole aqui: xxx.apps.googleusercontent.com

  // ─── IA — ATLAS CLOUD (multi-modelo) ─────────────────────────────────────
  // https://atlascloud.ai → Dashboard → API Keys
  API_KEY:   '',                    // ← Sua chave Atlas Cloud
  API_BASE:  'https://api.atlascloud.ai',
  PROVIDER:  'atlascloud',

  // BytePlus ModelArk (Seedance 2.0 direto — opcional, use se quiser bypass do Atlas)
  PROVIDERS: {
    atlascloud: {
      key:  '',                     // ← mesma API_KEY acima
      base: 'https://api.atlascloud.ai',
    },
    modelark: {
      key:  '',                     // ← Chave BytePlus ModelArk (ark.byteplus.com)
      base: 'https://ark.ap-southeast.bytepluses.com',
    },
  },

  // ─── PLANOS — STRIPE PAYMENT LINKS ───────────────────────────────────────
  // dashboard.stripe.com → Payment Links → Criar
  // Crie 1 link por plano. Adicione metadata: userId (deixe vazio, webhook preenche)
  // Cada link já redireciona para hollywoodstudio.ai/studio?payment=success
  STRIPE: {
    basico:   '',                   // ← https://buy.stripe.com/...  (R$99 / 150s)
    premium:  '',                   // ← https://buy.stripe.com/...  (R$199 / 300s)
    avancado: '',                   // ← https://buy.stripe.com/...  (R$349 / 600s)
  },

  // ─── TOP-UPS DE CRÉDITOS — STRIPE ────────────────────────────────────────
  STRIPE_TOPUPS: {
    t100: '',                       // ← https://buy.stripe.com/...  (100s / R$79)
    t300: '',                       // ← https://buy.stripe.com/...  (300s / R$199)
    t700: '',                       // ← https://buy.stripe.com/...  (700s / R$399)
  },

  // ─── PAYPAL ───────────────────────────────────────────────────────────────
  PAYPAL: 'alansorrah@gmail.com',   // ← seu email PayPal

  // ─── PIX ─────────────────────────────────────────────────────────────────
  PIX: '',                          // ← chave Pix ou link MercadoPago: https://mpago.la/...

  // ─── MÉTODOS DE PAGAMENTO HABILITADOS ────────────────────────────────────
  PAY: {
    stripe: true,
    paypal: true,
    pix:    true,
  },

  // ─── CRÉDITOS GRÁTIS NO CADASTRO ─────────────────────────────────────────
  FREE_CREDITS: 50,                 // segundos dados ao criar conta

  // ─── ENDPOINTS DO BACKEND (Vercel Functions) ─────────────────────────────
  // Deixe vazios se não tiver backend — o sistema usa localStorage como fallback
  AUTH_ENDPOINT:        '',         // ← https://hollywoodstudio.vercel.app  (sem /api)
  HELP_ENDPOINT:        '',         // ← mesmo acima — para o assistente IA real
  COUNCIL_ENDPOINT:     '',         // ← mesmo acima — para o Juiz Chat real

  // ─── IA ASSISTENTE (Claude direto no browser — opcional) ─────────────────
  // Configurado pelo usuário em Admin → API Keys — não exponha aqui
  CLAUDE_API_KEY:  '',
  OPENAI_API_KEY:  '',

  // ─── GEMINI (Flow, Storyboard, Aprimorar) ────────────────────────────────
  GEMINI_API_KEY:  '',              // ← aistudio.google.com → Get API Key
  GEMINI_MODEL:    'gemini-2.0-flash',

  // ─── SEO ─────────────────────────────────────────────────────────────────
  SEO: {
    title:       'Hollywood Studio AI — Produção audiovisual com IA',
    description: 'Gere vídeos, imagens e áudio cinematográficos com Seedance, Kling, Veo, Flux e mais.',
    image:       'https://hollywoodstudio.ai/assets/logo-hero.png',
    url:         'https://hollywoodstudio.ai',
  },

};
