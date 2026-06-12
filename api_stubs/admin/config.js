/**
 * api/admin/config.js
 * GET  /api/admin/config  → retorna config atual do servidor (sem chaves sensíveis)
 * POST /api/admin/config  → salva nova config (requer ADMIN_SECRET em env var)
 *
 * Usa Vercel KV (Upstash REST) para persistir. Sem KV, usa variáveis de ambiente como fallback.
 */

import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  // ── GET: retorna config pública (sem chaves sensíveis) ──────────────────
  if (req.method === 'GET') {
    try {
      const cfg = await loadConfig();
      const safe = {
        ...cfg,
        PROVIDERS: Object.fromEntries(
          Object.entries(cfg.PROVIDERS || {}).map(([k, v]) => [k, { base: v.base, hasKey: !!v.key }])
        ),
        ADMIN_PASS:            undefined,
        STRIPE_SECRET_KEY:     undefined,
        STRIPE_WEBHOOK_SECRET: undefined,
        CLAUDE_API_KEY:        undefined,
        OPENAI_API_KEY:        undefined,
        GEMINI_API_KEY:        undefined,
      };
      return res.status(200).json({ ok: true, config: safe });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST: salva config completa ─────────────────────────────────────────
  if (req.method === 'POST') {
    const adminSecret = process.env.ADMIN_SECRET || process.env.ADMIN_PASS;
    if (!adminSecret) {
      return res.status(503).json({ error: 'ADMIN_SECRET env var not configured on server.' });
    }

    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (token !== adminSecret) {
      return res.status(401).json({ error: 'Unauthorized — invalid admin token' });
    }

    try {
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }

      await saveConfig(body);
      const configJs = generateConfigJs(body);

      return res.status(200).json({
        ok: true,
        message: 'Configurações salvas com sucesso',
        configJs,
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
  if (process.env.KV_REST_API_URL) {
    try {
      const r = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(CONFIG_KEY)}`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      });
      if (r.ok) {
        const d = await r.json();
        if (d.result) return JSON.parse(d.result);
      }
    } catch {}
  }
  return buildConfigFromEnv();
}

async function saveConfig(cfg) {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error('Vercel KV não configurado. Adicione um KV store em Storage no painel do Vercel.');
  }

  // Use POST with JSON body to avoid URL-length limits on large configs
  const r = await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(CONFIG_KEY)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([JSON.stringify(cfg)]),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`KV set failed (${r.status}): ${txt}`);
  }
}

function buildConfigFromEnv() {
  return {
    PROVIDER: process.env.PROVIDER || 'atlascloud',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    PROVIDERS: {
      atlascloud: { base: process.env.ATLAS_BASE  || 'https://api.atlascloud.ai',                  key: process.env.ATLAS_KEY     || '' },
      fal:        { base: process.env.FAL_BASE    || 'https://fal.run',                             key: process.env.FAL_KEY       || '' },
      modelark:   { base: process.env.MODELARK_BASE || 'https://ark.ap-southeast.bytepluses.com',   key: process.env.MODELARK_KEY  || '' },
    },
    AUTH_ENDPOINT: process.env.SITE_URL || '',
    STRIPE: {
      basico:   process.env.STRIPE_LINK_BASICO   || '',
      premium:  process.env.STRIPE_LINK_PREMIUM  || '',
      avancado: process.env.STRIPE_LINK_AVANCADO || '',
    },
    STRIPE_TOPUPS: {
      t100: process.env.STRIPE_TOPUP_100 || '',
      t300: process.env.STRIPE_TOPUP_300 || '',
      t700: process.env.STRIPE_TOPUP_700 || '',
    },
    PAY:     { stripe: true, paypal: true, pix: !!process.env.PIX_KEY },
    PAYPAL:  process.env.PAYPAL_EMAIL || '',
    PIX:     process.env.PIX_KEY      || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    GEMINI_MODEL:   process.env.GEMINI_MODEL   || 'gemini-2.0-flash',
    FREE_CREDITS:   parseInt(process.env.FREE_CREDITS || '0'),
    ADMIN_EMAIL:    process.env.ADMIN_EMAIL    || '',
  };
}

function generateConfigJs(cfg) {
  const J  = v => JSON.stringify(v);
  const P  = cfg.PROVIDERS    || {};
  const ST = cfg.STRIPE       || {};
  const TU = cfg.STRIPE_TOPUPS || {};
  const PAY = cfg.PAY         || { stripe: true, paypal: true, pix: false };
  return `/* config.js — Hollywood Studio AI — gerado pelo Admin em ${new Date().toISOString()} */
window.HSAI_CONFIG = {
  PROVIDER: ${J(cfg.PROVIDER || 'atlascloud')},
  ADMIN_USER: "admin",
  ADMIN_PASS: ${J(cfg.ADMIN_PASS || '')},
  ADMIN_EMAIL: ${J(cfg.ADMIN_EMAIL || '')},

  PROVIDERS: {
    atlascloud: { base: ${J((P.atlascloud || {}).base || 'https://api.atlascloud.ai')}, key: ${J((P.atlascloud || {}).key || '')} },
    fal:        { base: ${J((P.fal       || {}).base || 'https://fal.run')},            key: ${J((P.fal       || {}).key || '')} },
    modelark:   { base: ${J((P.modelark  || {}).base || 'https://ark.ap-southeast.bytepluses.com')}, key: ${J((P.modelark || {}).key || '')} }
  },

  AUTH_ENDPOINT:    ${J(cfg.AUTH_ENDPOINT    || '')},
  HELP_ENDPOINT:    ${J(cfg.HELP_ENDPOINT    || '')},
  COUNCIL_ENDPOINT: ${J(cfg.COUNCIL_ENDPOINT || '')},
  GOOGLE_CLIENT_ID: ${J(cfg.GOOGLE_CLIENT_ID || '')},
  GEMINI_API_KEY:   ${J(cfg.GEMINI_API_KEY   || '')},
  GEMINI_MODEL:     ${J(cfg.GEMINI_MODEL     || 'gemini-2.0-flash')},

  STRIPE:       { basico: ${J(ST.basico || '')}, premium: ${J(ST.premium || '')}, avancado: ${J(ST.avancado || '')} },
  STRIPE_TOPUPS:{ t100: ${J(TU.t100 || '')}, t300: ${J(TU.t300 || '')}, t700: ${J(TU.t700 || '')} },
  PAY:          { stripe: ${!!PAY.stripe}, paypal: ${!!PAY.paypal}, pix: ${!!PAY.pix} },
  PAYPAL:       ${J(cfg.PAYPAL || '')},
  PIX:          ${J(cfg.PIX    || '')},
  FREE_CREDITS: ${cfg.FREE_CREDITS != null ? cfg.FREE_CREDITS : 0},
};`;
}
