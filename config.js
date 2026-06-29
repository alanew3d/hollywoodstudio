/**
 * HOLLYWOOD STUDIO AI — config.js v4.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Configuração PÚBLICA — sem chaves reais. Chaves de produção: Vercel Env Vars.
 * v4.0: muapi.ai como provider primário de vídeo/imagem (105+ modelos)
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
    videoStudio: true, lipSync: true, musicStudio: true,
  },

  // ── GOOGLE OAUTH (Client ID é público por design OAuth) ─────────────────────
  GOOGLE_CLIENT_ID: '1080113912210-medhqckkq2qp38j9ggqoegik2n9inue3.apps.googleusercontent.com',

  // ── PROVEDORES IA ──────────────────────────────────────────────────────────
  // muapi.ai = provider primário (105+ modelos: Seedance 2.0, Kling 3.0, Veo3, Sora 2, etc)
  // atlascloud = fallback secundário
  API_KEY:   'ac8abd0c7cbb78e6df8d19a92c34889a486756c1da9443e44116dd811473fda3',
  API_BASE:  'https://api.muapi.ai',
  PROVIDER:  'muapi',

  PROVIDERS: {
    // ── MUAPI (primário) ──────────────────────────────────────────────────
    muapi: {
      key:  'ac8abd0c7cbb78e6df8d19a92c34889a486756c1da9443e44116dd811473fda3',   // Insira sua chave muapi.ai aqui ou em Vercel → MUAPI_KEY
      base: 'https://api.muapi.ai',
    },
    // ── ATLAS CLOUD (fallback) ────────────────────────────────────────────
    atlascloud: {
      key:  'apikey-737d0571d9ed45be8363dc039c6b61de',
      base: 'https://api.atlascloud.ai',
    },
    // ── FAL.AI (fallback adicional) ───────────────────────────────────────
    fal: {
      key:  'ba18fb24-388d-46a2-9859-3125ace05bab:6cc1327677b1f93d17889c628bb32e4d',
      base: 'https://fal.run',
    },
    modelark: {
      key:  'ark-87502de2-394b-455c-aa6c-41f9b04bb471-3618f',
      base: 'https://ark.ap-southeast.bytepluses.com',
    },
  },

  // ── CHAVES BACKEND (só lidas em Vercel Functions, nunca expostas no client) ─
  CLAUDE_API_KEY:  '',
  OPENAI_API_KEY:  '',
  GEMINI_API_KEY:  'AIzaSyDLZbSY5OyaL_dvuMQcNB0-86z1hYXvnLw',
  GEMINI_MODEL:    'gemini-2.0-flash',
  YOUTUBE_API_KEY: 'AIzaSyCAMNc0nzrViGgxiuJ21bRnG4QG4a3HNbQ',

  // ── CATÁLOGO MUAPI — modelos disponíveis para o HS Studio ──────────────────
  // Referência para UI (o app pode usar diretamente estes IDs com a muapi)
  muapiModels: {
    video: {
      t2v: [
        { id: 'seedance-v2.0-t2v',          name: 'Seedance 2.0',          badge: '⭐ TOP' },
        { id: 'kling-v3.0-pro-t2v',          name: 'Kling v3.0 Pro',        badge: 'NOVO' },
        { id: 'veo3-text-to-video',          name: 'Veo3',                  badge: '🔥' },
        { id: 'openai-sora-2-text-to-video', name: 'Sora 2',                badge: '🔥' },
        { id: 'kling-v2.1-master-t2v',       name: 'Kling v2.1 Master',     badge: '' },
        { id: 'wan2.6-text-to-video',        name: 'Wan 2.6',               badge: 'NOVO' },
        { id: 'minimax-hailuo-2.3-pro-t2v',  name: 'MiniMax Hailuo 2.3',    badge: '' },
        { id: 'runway-text-to-video',        name: 'Runway',                badge: '' },
        { id: 'hunyuan-text-to-video',       name: 'Hunyuan',               badge: '' },
      ],
      i2v: [
        { id: 'seedance-v2.0-i2v',           name: 'Seedance 2.0 I2V',      badge: '⭐ TOP' },
        { id: 'kling-v3.0-pro-image-to-video', name: 'Kling v3.0 Pro I2V',  badge: 'NOVO' },
        { id: 'veo3-image-to-video',          name: 'Veo3 I2V',             badge: '🔥' },
        { id: 'wan2.5-image-to-video',        name: 'Wan 2.5 I2V',          badge: '' },
        { id: 'runway-image-to-video',        name: 'Runway I2V',           badge: '' },
        { id: 'kling-v2.1-master-i2v',        name: 'Kling v2.1 Master I2V', badge: '' },
        { id: 'leonardoai-motion-2.0',        name: 'Leonardo Motion 2.0',  badge: '' },
      ],
    },
    image: [
      { id: 'seedance-v2.0-t2v',         name: 'Seedream v4.5',          badge: 'NOVO' },
      { id: 'flux-kontext-pro-t2i',       name: 'Flux Kontext Pro',       badge: '' },
      { id: 'gpt-image-2',               name: 'GPT Image 2',            badge: '🔥' },
      { id: 'google-imagen4-ultra',       name: 'Imagen 4 Ultra',         badge: '' },
      { id: 'midjourney-v7-text-to-image', name: 'MidJourney v7',         badge: '🔥' },
      { id: 'flux-2-pro',                name: 'Flux 2 Pro',             badge: '' },
      { id: 'nano-banana-pro',           name: 'Nano Banana Pro',        badge: '' },
    ],
    audio: [
      { id: 'suno-create-music',         name: 'Suno Music',             badge: '🎵' },
      { id: 'suno-voice-clone',          name: 'Suno Voice Clone',       badge: '' },
      { id: 'minimax-speech-2.6-hd',    name: 'MiniMax Speech HD',      badge: '' },
    ],
  },

  // ── LISTA PÚBLICA DE MODELOS (referência UI) ────────────────────────────────
  publicModelList: ['seedance2', 'kling3', 'veo3', 'sora2', 'flux-pro', 'nano-banana', 'suno', 'gptimage2'],

  // ── PAGAMENTOS ──────────────────────────────────────────────────────────────
  publicPaymentLinks: {
    stripe: { basico: '', premium: '', avancado: '' },
    topups: { t100: '', t300: '', t700: '' },
  },
  STRIPE:        { basico: '', premium: '', avancado: '' },
  STRIPE_TOPUPS: { t100: '', t300: '', t700: '' },
  PAY:           { stripe: true, paypal: true, pix: true },
  PAYPAL:        'alansorrah@gmail.com',
  PIX:           '',

  // ── PLANOS (créditos = segundos de vídeo) ───────────────────────────────────
  PLANS: {
    basico:   { price: 99,  credits: 150, label: 'Básico',   videoSec: 150 },
    premium:  { price: 199, credits: 300, label: 'Premium',  videoSec: 300 },
    avancado: { price: 349, credits: 600, label: 'Avançado', videoSec: 600 },
  },

  // ── TRIAL ───────────────────────────────────────────────────────────────────
  trialSettings: {
    enabled: true,
    credits: 3,
    oncePerAccount: true,
    label: 'beta',
  },
  FREE_CREDITS: 3,

  // ── ENDPOINTS API ──────────────────────────────────────────────────────────
  apiEndpoints: {
    auth:             '/api/auth',
    resetPassword:    '/api/auth/reset-password',
    account:          '/api/account',
    deleteAccount:    '/api/account/delete',
    admin:            '/api/admin',
    adminConfig:      '/api/admin/config',
    credits:          '/api/credits',
    creditsCheck:     '/api/credits/check',
    payments:         '/api/payments',
    webhookPayment:   '/api/webhooks/payment',
    stripeWebhook:    '/api/stripe/webhook',
    generate:         '/api/generate',
    enhancePrompt:    '/api/ai/enhance-prompt',
    creativeBoard:    '/api/ai/creative-board',
    socialInstagram:  '/api/social/instagram',
    socialYoutube:    '/api/social/youtube',
    socialShare:      '/api/social/share',
    publicGallery:    '/api/public/gallery',
    publicTemplates:  '/api/public/templates',
    publicModels:     '/api/public/models',
    discoveryFeed:    '/api/discovery/feed',
    discoverySitemap: '/api/discovery/sitemap',
    discoveryLlms:    '/api/discovery/llms',
  },
  AUTH_ENDPOINT:    'https://hollywoodstudio.ai',
  HELP_ENDPOINT:    '',
  COUNCIL_ENDPOINT: '',
  DOCS_ENDPOINT:    '',
  FEED_ENDPOINT:    '',

  // ── COMPARTILHAMENTO SOCIAL ─────────────────────────────────────────────────
  socialShareSettings: {
    platforms: ['whatsapp', 'instagram', 'youtube', 'twitter', 'linkedin', 'facebook', 'copy'],
    formats:   ['9:16', '1:1', '4:5', '16:9'],
    hashtagsDefault: '#hollywoodstudioai #criacaoIA #aivideo #workflowIA',
  },

  // ── SEO ──────────────────────────────────────────────────────────────────────
  seoSettings: {
    title:       'Hollywood Studio AI — Workflow audiovisual com IA',
    description: 'Da ideia ao corte final. Gere vídeos, imagens e áudio cinematográficos com Seedance 2.0, Kling 3.0, Veo3, Sora 2 e mais de 100 modelos.',
    image:       'https://hollywoodstudio.ai/assets/social/hero-hollywoodstudio-ai.jpg',
    url:         'https://hollywoodstudio.ai',
    keywords:    'workflow audiovisual com IA, geração de vídeo com IA, AI video workflow, cinematic AI, Seedance, Kling, Veo3, Sora 2',
  },
  SEO: {
    title:       'Hollywood Studio AI — Workflow audiovisual com IA',
    description: 'Da ideia ao corte final. Gere vídeos, imagens e áudio cinematográficos com Seedance, Kling, Veo, Sora, Flux e mais.',
    image:       'https://hollywoodstudio.ai/assets/social/hero-hollywoodstudio-ai.jpg',
    url:         'https://hollywoodstudio.ai',
  },

  REEL_IMAGES: [],
};
