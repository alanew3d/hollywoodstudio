/**
 * api/admin/config.js
 * GET  /api/admin/config         → retorna config atual do servidor
 * POST /api/admin/config         → salva nova config (requer ADMIN_SECRET)
 *
 * Usa Vercel KV para persistir. Sem KV, usa variáveis de ambiente como fallback.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── GET: retorna config pública (sem chaves sensíveis) ──────────────────
  if (req.method === 'GET') {
    try {
      const cfg = await loadConfig();
      // Remove chaves sensíveis antes de retornar
      const safe = {
        ...cfg,
        PROVIDERS: Object.fromEntries(
          Object.entries(cfg.PROVIDERS || {}).map(([k, v]) => [k, { base: v.base, hasKey: !!v.key }])
        ),
        ADMIN_PASS: undefined,
        STRIPE_SECRET_KEY: undefined,
        STRIPE_WEBHOOK_SECRET: undefined,
      };
      return res.status(200).json({ ok: true, config: safe });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST: salva config completa ─────────────────────────────────────────
  if (req.method === 'POST') {
    // Verificar autenticação
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim();
    const adminSecret = process.env.ADMIN_SECRET || process.env.ADMIN_PASS || 'hw2026!';

    if (token !== adminSecret) {
      return res.status(401).json({ error: 'Unauthorized — invalid admin token' });
    }

    try {
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }

      // Salva no KV
      await saveConfig(body);

      // Gera o config.js para download/cópia
      const configJs = generateConfigJs(body);

      return res.status(200).json({
        ok: true,
        message: 'Configurações salvas com sucesso',
        configJs, // admin pode usar para baixar
      });
    } catch (e) {
      console.error('[admin/config POST]', e);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ── KV helpers ──────────────────────────────────────────────────────────────
const CONFIG_KEY = 'hsai:config';

async function loadConfig() {
  // 1. Tenta KV
  if (process.env.KV_REST_API_URL) {
    try {
      const r = await fetch(`${process.env.KV_REST_API_URL}/get/${CONFIG_KEY}`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      });
      const d = await r.json();
      if (d.result) return JSON.parse(d.result);
    } catch {}
  }
  // 2. Fallback: monta do env
  return buildConfigFromEnv();
}

async function saveConfig(cfg) {
  if (!process.env.KV_REST_API_URL) {
    throw new Error('Vercel KV não configurado. Adicione um KV store em Storage no painel do Vercel.');
  }
  await fetch(`${process.env.KV_REST_API_URL}/set/${CONFIG_KEY}/${encodeURIComponent(JSON.stringify(cfg))}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
}

function buildConfigFromEnv() {
  return {
    PROVIDER: process.env.PROVIDER || 'atlascloud',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    PROVIDERS: {
      atlascloud: { base: process.env.ATLAS_BASE || 'https://api.atlascloud.ai', key: process.env.ATLAS_KEY || '' },
      fal: { base: process.env.FAL_BASE || 'https://fal.run', key: process.env.FAL_KEY || '' },
      modelark: { base: process.env.MODELARK_BASE || 'https://ark.ap-southeast.bytepluses.com', key: process.env.MODELARK_KEY || '' },
    },
    AUTH_ENDPOINT: process.env.SITE_URL || '',
    STRIPE: {
      basico: process.env.STRIPE_LINK_BASICO || '',
      premium: process.env.STRIPE_LINK_PREMIUM || '',
      avancado: process.env.STRIPE_LINK_AVANCADO || '',
    },
    STRIPE_TOPUPS: {
      t100: process.env.STRIPE_TOPUP_100 || '',
      t300: process.env.STRIPE_TOPUP_300 || '',
      t700: process.env.STRIPE_TOPUP_700 || '',
    },
    PAY: { stripe: true, paypal: true, pix: !!process.env.PIX_KEY },
    PAYPAL: process.env.PAYPAL_EMAIL || 'alansorrah@gmail.com',
    PIX: process.env.PIX_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    FREE_CREDITS: parseInt(process.env.FREE_CREDITS || '50'),
    ADMIN_PASS: process.env.ADMIN_PASS || 'hw2026!',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  };
}

function generateConfigJs(cfg) {
  const J = v => JSON.stringify(v);
  const P = cfg.PROVIDERS || {};
  const ST = cfg.STRIPE || {};
  const PAY = cfg.PAY || { stripe: true, paypal: true, pix: false };
  return `/* config.js — Hollywood Studio AI — gerado pelo Admin em ${new Date().toISOString()} */
window.HSAI_CONFIG = {
  PROVIDER: ${J(cfg.PROVIDER || 'atlascloud')},
  ADMIN_USER: "admin",
  ADMIN_PASS: ${J(cfg.ADMIN_PASS || 'hw2026!')},
  ADMIN_EMAIL: ${J(cfg.ADMIN_EMAIL || '')},

  PROVIDERS: {
    atlascloud: { base: ${J((P.atlascloud || {}).base || 'https://api.atlascloud.ai')}, key: ${J((P.atlascloud || {}).key || '')} },
    fal:        { base: ${J((P.fal || {}).base || 'https://fal.run')}, key: ${J((P.fal || {}).key || '')} },
    modelark:   { base: ${J((P.modelark || {}).base || 'https://ark.ap-southeast.bytepluses.com')}, key: ${J((P.modelark || {}).key || '')} }
  },

  AUTH_ENDPOINT: ${J(cfg.AUTH_ENDPOINT || '')},
  HELP_ENDPOINT: ${J(cfg.HELP_ENDPOINT || '')},
  COUNCIL_ENDPOINT: ${J(cfg.COUNCIL_ENDPOINT || '')},
  GOOGLE_CLIENT_ID: ${J(cfg.GOOGLE_CLIENT_ID || '')},
  GEMINI_API_KEY: ${J(cfg.GEMINI_API_KEY || '')},
  GEMINI_MODEL: ${J(cfg.GEMINI_MODEL || 'gemini-2.0-flash')},

  STRIPE: { basico: ${J(ST.basico || '')}, premium: ${J(ST.premium || '')}, avancado: ${J(ST.avancado || '')} },
  STRIPE_TOPUPS: { t100: ${J((cfg.STRIPE_TOPUPS || {}).t100 || '')}, t300: ${J((cfg.STRIPE_TOPUPS || {}).t300 || '')}, t700: ${J((cfg.STRIPE_TOPUPS || {}).t700 || '')} },
  PAY: { stripe: ${!!PAY.stripe}, paypal: ${!!PAY.paypal}, pix: ${!!PAY.pix} },
  PAYPAL: ${J(cfg.PAYPAL || '')},
  PIX: ${J(cfg.PIX || '')},
  FREE_CREDITS: ${cfg.FREE_CREDITS || 50},
};`;
}
