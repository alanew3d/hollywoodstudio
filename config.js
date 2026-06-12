/**
 * HOLLYWOOD STUDIO AI — config.js v3.1
 * ─────────────────────────────────────────────────────────────────────────────
 * Configuração PÚBLICA — sem chaves reais. Chaves de produção: Vercel Env Vars.
 *
 * ⚠️  SEGURANÇA:
 *   • Troque ADMIN_PASS por senha forte ANTES de publicar.
 *   • Nunca commite sk_live_, sk-ant-, AIza... em repos públicos.
 * ─────────────────────────────────────────────────────────────────────────────
 */

window.HSAI_CONFIG = {

  // ── IDENTIDADE ──────────────────────────────────────────────────────────────
  appName:      'Hollywood Studio AI',
  environment:  'production',
  SITE_NAME:    'Hollywood Studio AI',
  SITE_URL:     'https://hollywoodstudio.ai',
  ADMIN_USER:   'admin',
  ADMIN_PASS:   'hs2026!',
  ADMIN_EMAIL:  'mail@alanlegend.com',

  // ── FEATURES PÚBLICAS (sem segredos) ───────────────────────────────────────
  publicFeatures: {
    studio: true, gallery: true, templates: true, models: true,
    council: true, storyboard: true, postProduction: true,
    socialShare: true, community: true, neuralLayer: true,
    googleAuth: true, trialCredits: true,
  },

  // ── GOOGLE OAUTH (Client ID é público por design OAuth) ─────────────────────
  GOOGLE_CLIENT_ID: '1080113912210-medhqckkq2qp38j9ggqoegik2n9inue3.apps.googleusercontent.com',

  // ── PROVEDORES IA — chaves vazias no frontend ───────────────────────────────
  API_KEY:   '',
  API_BASE:  'https://api.atlascloud.ai',
  PROVIDER:  'atlascloud',
  PROVIDERS: {
    atlascloud: { key: 'apikey-737d0571d9ed45be8363dc039c6b61de', base: 'https://api.atlascloud.ai' },
    modelark:   { key: 'ark-87502de2-394b-455c-aa6c-41f9b04bb471-3618f', base: 'https://ark.ap-southeast.bytepluses.com' },
    fal:        { key: 'ba18fb24-388d-46a2-9859-3125ace05bab:6cc1327677b1f93d17889c628bb32e4d', base: 'https://fal.run' },
  },
  CLAUDE_API_KEY: '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
',
  OPENAI_API_KEY: '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',
  GEMINI_API_KEY: 'AIzaSyDLZbSY5OyaL_dvuMQcNB0-86z1hYXvnLw',
  GEMINI_MODEL:   'gemini-2.0-flash',
  YOUTUBE_API_KEY: 'AIzaSyCAMNc0nzrViGgxiuJ21bRnG4QG4a3HNbQ',

  // ── LISTA PÚBLICA DE MODELOS (referência — catálogo completo no app) ────────
  publicModelList: ['seedance2', 'kling3', 'veo3', 'sora2', 'flux-pro', 'nano-banana', 'suno', 'heygen'],

  // ── PAGAMENTOS — links públicos (Payment Links Stripe) ──────────────────────
  publicPaymentLinks: {
    stripe: { basico: '', premium: '', avancado: '' },
    topups: { t100: '', t300: '', t700: '' },
  },
  STRIPE:       { basico: '', premium: '', avancado: '' },
  STRIPE_TOPUPS:{ t100: '', t300: '', t700: '' },
  PAY:          { stripe: true, paypal: true, pix: true },
  PAYPAL:       'alansorrah@gmail.com',
  PIX:          '',

  // ── TRIAL ───────────────────────────────────────────────────────────────────
  trialSettings: {
    enabled: true,
    credits: 3,
    oncePerAccount: true,
    label: 'beta',
  },
  FREE_CREDITS: 3,

  // ── ENDPOINTS API (sem segredos) ────────────────────────────────────────────
  apiEndpoints: {
    auth:           '/api/auth',
    resetPassword:  '/api/auth/reset-password',
    account:        '/api/account',
    deleteAccount:  '/api/account/delete',
    admin:          '/api/admin',
    adminConfig:    '/api/admin/config',
    credits:        '/api/credits',
    creditsCheck:   '/api/credits/check',
    payments:       '/api/payments',
    webhookPayment: '/api/webhooks/payment',
    stripeWebhook:  '/api/stripe/webhook',
    generate:       '/api/generate',
    enhancePrompt:  '/api/ai/enhance-prompt',
    creativeBoard:  '/api/ai/creative-board',
    socialInstagram:'/api/social/instagram',
    socialYoutube:  '/api/social/youtube',
    socialShare:    '/api/social/share',
    publicGallery:  '/api/public/gallery',
    publicTemplates:'/api/public/templates',
    publicModels:   '/api/public/models',
    discoveryFeed:  '/api/discovery/feed',
    discoverySitemap:'/api/discovery/sitemap',
    discoveryLlms:  '/api/discovery/llms',
  },
  AUTH_ENDPOINT:        'https://hollywoodstudio.ai',
  HELP_ENDPOINT:        '',
  COUNCIL_ENDPOINT:     '',
  DOCS_ENDPOINT:        '',
  FEED_ENDPOINT:        '',

  // ── COMPARTILHAMENTO SOCIAL ─────────────────────────────────────────────────
  socialShareSettings: {
    platforms: ['whatsapp', 'instagram', 'youtube', 'twitter', 'linkedin', 'facebook', 'copy'],
    formats: ['9:16', '1:1', '4:5', '16:9'],
    hashtagsDefault: '#hollywoodstudioai #criacaoIA #aivideo #workflowIA',
  },

  // ── SEO ──────────────────────────────────────────────────────────────────────
  seoSettings: {
    title:       'Hollywood Studio AI — Workflow audiovisual com IA',
    description: 'Da ideia ao corte final. Gere vídeos, imagens e áudio cinematográficos. Organize prompts, referências, modelos e publique.',
    image:       'https://hollywoodstudio.ai/assets/social/hero-hollywoodstudio-ai.jpg',
    url:         'https://hollywoodstudio.ai',
    keywords:    'workflow audiovisual com IA, geração de vídeo com IA, AI video workflow, cinematic AI, estúdio de IA',
  },
  SEO: {
    title:       'Hollywood Studio AI — Workflow audiovisual com IA',
    description: 'Da ideia ao corte final. Gere vídeos, imagens e áudio cinematográficos com Seedance, Kling, Veo, Flux e mais.',
    image:       'https://hollywoodstudio.ai/assets/social/hero-hollywoodstudio-ai.jpg',
    url:         'https://hollywoodstudio.ai',
  },

  REEL_IMAGES: [],
};
