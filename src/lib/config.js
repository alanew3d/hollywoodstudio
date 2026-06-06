/**
 * HOLLYWOOD STUDIO AI — Configuração centralizada
 * Todos os env vars validados e exportados daqui.
 */

const config = {
  app: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || "Hollywood Studio AI",
    tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || "Produção audiovisual cinematográfica com IA",
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    webhookUrl: process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  },

  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  },

  // ─── Planos Hollywood Studio AI ──────────────────
  plans: {
    basico: {
      id: "basico",
      name: "Básico",
      nameEn: "Basic",
      price: 99,
      credits: 150,
      currency: "brl",
      highlight: false,
      features: {
        pt: ["150 segundos de vídeo/mês", "Seedance 2.0 + Kling 3.0", "Galeria pessoal", "Suporte por email"],
        en: ["150 seconds of video/month", "Seedance 2.0 + Kling 3.0", "Personal gallery", "Email support"],
      },
      stripeLink: process.env.NEXT_PUBLIC_STRIPE_LINK_BASICO || "",
    },
    premium: {
      id: "premium",
      name: "Premium",
      nameEn: "Premium",
      price: 199,
      credits: 300,
      currency: "brl",
      highlight: true,
      features: {
        pt: ["300 segundos de vídeo/mês", "Todos os modelos (Veo 3, Flux, Seedream…)", "Storyboard com IA", "Suporte prioritário"],
        en: ["300 seconds of video/month", "All models (Veo 3, Flux, Seedream…)", "AI Storyboard", "Priority support"],
      },
      stripeLink: process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM || "",
    },
    avancado: {
      id: "avancado",
      name: "Avançado",
      nameEn: "Advanced",
      price: 349,
      credits: 600,
      currency: "brl",
      highlight: false,
      features: {
        pt: ["600 segundos de vídeo/mês", "API direta + projetos ilimitados", "Director Agent (IA)", "Concierge dedicado"],
        en: ["600 seconds of video/month", "Direct API + unlimited projects", "Director Agent (AI)", "Dedicated concierge"],
      },
      stripeLink: process.env.NEXT_PUBLIC_STRIPE_LINK_AVANCADO || "",
    },
  },

  // ─── Stripe (cartão internacional + Payment Links) ─
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    // Payment Links pré-criados (sem necessidade de checkout dinâmico)
    links: {
      basico:   process.env.NEXT_PUBLIC_STRIPE_LINK_BASICO || "",
      premium:  process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM || "",
      avancado: process.env.NEXT_PUBLIC_STRIPE_LINK_AVANCADO || "",
    },
  },

  // ─── MercadoPago (Pix + Boleto + Cartão BR) ────────
  mercadopago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
    successUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/studio?payment=success`,
    failureUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pricing?payment=failed`,
    pendingUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pricing?payment=pending`,
  },

  // ─── PayPal (internacional) ─────────────────────────
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    email: process.env.NEXT_PUBLIC_PAYPAL_EMAIL || "alansorrah@gmail.com",
    mode: process.env.NODE_ENV === "production" ? "live" : "sandbox",
  },

  // ─── Provedores de IA ─────────────────────────────
  ai: {
    // BytePlus ModelArk — Seedance 2.0 (PRINCIPAL)
    byteplus: {
      apiKey: process.env.BYTEPLUS_API_KEY,
      baseUrl: process.env.BYTEPLUS_BASE_URL || "https://ark.ap-southeast.bytepluses.com",
      models: {
        "t2v-720p":   "doubao-seedance-video-pro-250528",
        "i2v-720p":   "doubao-seedance-video-i2v-pro-250528",
        "t2v-480p":   "doubao-seedance-video-lite-250528",
        "i2v-480p":   "doubao-seedance-video-i2v-lite-250528",
      },
    },

    // Atlas Cloud — multi-modelo (Kling, Veo, Flux, Seedream…)
    atlascloud: {
      apiKey: process.env.ATLASCLOUD_API_KEY,
      baseUrl: process.env.ATLASCLOUD_BASE_URL || "https://api.atlascloud.ai",
    },

    // Replicate — fallback para modelos não cobertos
    replicate: {
      token: process.env.REPLICATE_API_TOKEN,
    },

    // muapi.ai — compatibilidade com boilerplate original
    // SUBSTITUIR por BytePlus em produção (trocar USE_MUAPI para false)
    muapi: {
      enabled: process.env.USE_MUAPI === "true",
      apiKey: process.env.SEEDANCE_V2_API_KEY || process.env.BYTEPLUS_API_KEY,
      endpoints: {
        t2v:       { "480p": "https://api.muapi.ai/api/v1/seedance-2.0-t2v-480p", "720p": "https://api.muapi.ai/api/v1/seedance-v2.0-t2v" },
        i2v:       { "480p": "https://api.muapi.ai/api/v1/seedance-2.0-i2v-480p", "720p": "https://api.muapi.ai/api/v1/seedance-v2.0-i2v" },
        reference: { "480p": "https://api.muapi.ai/api/v1/seedance-2.0-omni-reference-480p", "720p": "https://api.muapi.ai/api/v1/seedance-2.0-omni-reference" },
      },
    },
  },

  // ─── Storage ─────────────────────────────────────
  storage: {
    r2: {
      accountId: process.env.R2_ACCOUNT_ID,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucket: process.env.R2_BUCKET_NAME || "hollywoodstudio",
      publicUrl: process.env.R2_PUBLIC_URL || "",
    },
  },

  db: { url: process.env.DATABASE_URL },
};

// Validação server-side
if (typeof window === "undefined") {
  const checks = [
    ["DATABASE_URL", config.db.url],
    ["NEXTAUTH_SECRET", config.auth.secret],
    ["GOOGLE_CLIENT_ID", config.auth.google.clientId],
    ["BYTEPLUS_API_KEY", config.ai.byteplus.apiKey],
    ["STRIPE_SECRET_KEY", config.stripe.secretKey],
    ["MERCADOPAGO_ACCESS_TOKEN", config.mercadopago.accessToken],
  ];
  checks.forEach(([name, val]) => {
    if (!val) console.warn(`[HSAI CONFIG] ⚠ Variável ausente: ${name}`);
  });
}

export default config;
