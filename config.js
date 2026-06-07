/**
 * HOLLYWOOD STUDIO AI — config.js v3.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Este arquivo é carregado pelo index.html antes de tudo.
 * Edite aqui as chaves e faça commit no GitHub — o Vercel republica em ~1 min.
 *
 * SEGURANÇA: Não commite chaves sk_live_ ou chaves de produção em repos PÚBLICOS.
 * Use o Admin do site (Integrações) para configurar chaves em produção.
 * ─────────────────────────────────────────────────────────────────────────────
 */

window.HSAI_CONFIG = {

  // ── IDENTIDADE ──────────────────────────────────────────────────────────────
  SITE_NAME:    'Hollywood Studio AI',
  SITE_URL:     'https://hollywoodstudio.ai',
  ADMIN_USER:   'admin',
  ADMIN_PASS:   'hw2026!',          // ← TROQUE antes de divulgar publicamente
  ADMIN_EMAIL:  '',                 // ← seu email — vira admin automático no Google login

  // ── GOOGLE OAUTH ────────────────────────────────────────────────────────────
  // console.cloud.google.com → APIs → Credenciais → OAuth 2.0 Client ID
  // Origens autorizadas: https://hollywoodstudio.ai  |  https://hollywoodstudio.vercel.app
  GOOGLE_CLIENT_ID: '1080113912210-medhqckkq2qp38j9ggqoegik2n9inue3.apps.googleusercontent.com',

  // ── GERAÇÃO DE IA — ATLAS CLOUD (multi-modelo, 46 modelos) ─────────────────
  // https://atlascloud.ai → Dashboard → API Keys
  API_KEY:   '',                    // ← Chave Atlas Cloud
  API_BASE:  'https://api.atlascloud.ai',
  PROVIDER:  'atlascloud',

  PROVIDERS: {
    atlascloud: {
      key:  '',                     // ← mesma chave acima
      base: 'https://api.atlascloud.ai',
    },
    modelark: {
      // BytePlus ModelArk — Seedance 2.0 direto (opcional, bypass do Atlas)
      // ark.byteplus.com → Console → API Keys
      key:  '',
      base: 'https://ark.ap-southeast.bytepluses.com',
    },
    fal: {
      // fal.ai — modelos alternativos
      // fal.ai → Dashboard → API Keys
      key:  '',
      base: 'https://fal.run',
    },
  },

  // ── CLAUDE (Anthropic) ───────────────────────────────────────────────────────
  // console.anthropic.com → API Keys → Create Key
  // Usado em: Help chatbot (claude-haiku-4-5), Agentes, Juiz Chat, Storyboard
  // Custo: ~$0.001 por resposta de help · Haiku é o modelo mais barato
  CLAUDE_API_KEY: '',               // ← sk-ant-api03-...

  // ── OPENAI (GPT) ────────────────────────────────────────────────────────────
  // platform.openai.com → API Keys → Create new secret key
  // Usado em: Juiz Chat (GPT-4o), Storyboard, Agente Flow
  OPENAI_API_KEY: '',               // ← sk-proj-...

  // ── GOOGLE GEMINI ────────────────────────────────────────────────────────────
  // aistudio.google.com → Get API Key (gratuito com limites generosos)
  // Usado em: Gemini Avatar, Aprimorar prompt, Flow, Storyboard, Help chatbot
  GEMINI_API_KEY: '',               // ← AIza...
  GEMINI_MODEL:   'gemini-2.0-flash',

  // ── YOUTUBE API ─────────────────────────────────────────────────────────────
  // console.cloud.google.com → APIs → YouTube Data API v3 → Credenciais
  YOUTUBE_API_KEY: '',              // ← AIza...

  // ── PLANOS — STRIPE PAYMENT LINKS ───────────────────────────────────────────
  // dashboard.stripe.com → Payment Links → Criar (moeda: BRL)
  // URL de sucesso: https://hollywoodstudio.ai?payment=success
  STRIPE: {
    basico:   '',                   // ← https://buy.stripe.com/...  (R$99  / 150s)
    premium:  '',                   // ← https://buy.stripe.com/...  (R$199 / 300s)
    avancado: '',                   // ← https://buy.stripe.com/...  (R$349 / 600s)
  },

  // ── TOP-UPS AVULSOS ──────────────────────────────────────────────────────────
  STRIPE_TOPUPS: {
    t100: '',                       // ← https://buy.stripe.com/...  (100s / R$79)
    t300: '',                       // ← https://buy.stripe.com/...  (300s / R$199)
    t700: '',                       // ← https://buy.stripe.com/...  (700s / R$399)
  },

  // ── PAYPAL ───────────────────────────────────────────────────────────────────
  PAYPAL: 'alansorrah@gmail.com',   // ← email ou handle paypal.me

  // ── PIX / MERCADOPAGO ────────────────────────────────────────────────────────
  // Chave Pix direta (CPF/email/telefone/aleatória) OU link MercadoPago
  PIX: '',                          // ← ex: alansorrah@gmail.com  ou  https://mpago.la/...

  // ── MÉTODOS DE PAGAMENTO ATIVOS ─────────────────────────────────────────────
  PAY: {
    stripe: true,
    paypal: true,
    pix:    true,
  },

  // ── CRÉDITOS GRÁTIS NO CADASTRO ─────────────────────────────────────────────
  FREE_CREDITS: 0,                  // 0 = nenhum crédito grátis. Só paga usa.

  // ── ENDPOINTS BACKEND (Vercel Serverless) ────────────────────────────────────
  // Deixe vazio para usar localStorage + FAQ local.
  // Preencha com https://hollywoodstudio.ai para ativar os backends reais.
  AUTH_ENDPOINT:        'https://hollywoodstudio.ai',
  HELP_ENDPOINT:        '',         // ← deixar vazio usa Claude/Gemini direto
  COUNCIL_ENDPOINT:     '',
  DOCS_ENDPOINT:        '',
  FEED_ENDPOINT:        '',

  // ── SEO ──────────────────────────────────────────────────────────────────────
  SEO: {
    title:       'Hollywood Studio AI — Produção audiovisual com IA',
    description: 'Gere vídeos, imagens e áudio cinematográficos com Seedance 2.0, Kling 3.0, Veo 3, Flux Pro e mais de 40 modelos. Direção criativa, storyboard e galeria.',
    image:       'https://hollywoodstudio.ai/assets/logos/logo-hero.png',
    url:         'https://hollywoodstudio.ai',
  },

  // ── GALERIA DE DEMO ──────────────────────────────────────────────────────────
  // Deixe [] para usar os vídeos da pasta /assets/demo/
  REEL_IMAGES: [],

};
