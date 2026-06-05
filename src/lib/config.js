/**
 * Hollywood Studio AI — centralized server configuration.
 * Phase 1 adaptation: Brazilian pricing, simple credits, and provider envs.
 */

const config = {
  app: {
    name: "Hollywood Studio AI",
    tagline: "Cinematic AI production studio",
    defaultFreeCredits: parseInt(process.env.DEFAULT_FREE_CREDITS || "10", 10),
  },
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    webhook_url: process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    currency: "brl",
    plans: {
      basico: { name: "Básico", amount: 9900, credits: 150 },
      premium: { name: "Premium", amount: 19900, credits: 300 },
      avancado: { name: "Avançado", amount: 34900, credits: 600 },
    },
  },
  ai: {
    provider: process.env.AI_PROVIDER || "muapi", // Phase 1 keeps muapi compatible. Later: byteplus/atlascloud.
    seedance: {
      apiKey: process.env.SEEDANCE_V2_API_KEY,
      endpoints: {
        t2v: {
          "480p": process.env.SEEDANCE_T2V_480P_ENDPOINT || "https://api.muapi.ai/api/v1/seedance-2.0-t2v-480p",
          "720p": process.env.SEEDANCE_T2V_720P_ENDPOINT || "https://api.muapi.ai/api/v1/seedance-v2.0-t2v",
        },
        i2v: {
          "480p": process.env.SEEDANCE_I2V_480P_ENDPOINT || "https://api.muapi.ai/api/v1/seedance-2.0-i2v-480p",
          "720p": process.env.SEEDANCE_I2V_720P_ENDPOINT || "https://api.muapi.ai/api/v1/seedance-v2.0-i2v",
        },
        reference: {
          "480p": process.env.SEEDANCE_REFERENCE_480P_ENDPOINT || "https://api.muapi.ai/api/v1/seedance-2.0-omni-reference-480p",
          "720p": process.env.SEEDANCE_REFERENCE_720P_ENDPOINT || "https://api.muapi.ai/api/v1/seedance-2.0-omni-reference",
        },
      },
    },
    byteplus: {
      apiKey: process.env.BYTEPLUS_API_KEY,
      baseUrl: process.env.BYTEPLUS_BASE_URL || "https://ark.ap-southeast.bytepluses.com/api/v3",
    },
    atlascloud: {
      apiKey: process.env.ATLASCLOUD_API_KEY,
      baseUrl: process.env.ATLASCLOUD_BASE_URL || "https://api.atlascloud.ai",
    },
  },
  db: { url: process.env.DATABASE_URL },
};

const requiredKeys = [
  ["GOOGLE_CLIENT_ID", config.auth.google.clientId],
  ["GOOGLE_CLIENT_SECRET", config.auth.google.clientSecret],
  ["STRIPE_SECRET_KEY", config.stripe.secretKey],
  ["DATABASE_URL", config.db.url],
];

if (typeof window === "undefined") {
  requiredKeys.forEach(([name, value]) => {
    if (!value) console.warn(`[CONFIG] Warning: Missing critical environment variable: ${name}`);
  });
}

export default config;
