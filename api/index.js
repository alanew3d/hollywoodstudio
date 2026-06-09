/**
 * api/index.js — única Serverless Function (Vercel Hobby: máx. 12)
 * Roteia /api/* para handlers reais ou fallback beta.
 */

import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

const DEFAULT_ORIGINS = [
  'https://hollywoodstudio.ai',
  'https://www.hollywoodstudio.ai',
  'https://hollywoodstudio.vercel.app',
];

const PLAN_CREDITS = { basico: 150, premium: 300, avancado: 600, t100: 100, t300: 300, t700: 700 };
const CONFIG_KEY = 'hsai:config';

function setCors(req, res) {
  const allowed = [...DEFAULT_ORIGINS, ...(process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)];
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  else if (process.env.SITE_URL) res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getApiPath(req) {
  const raw = req.url || '';
  const pathname = raw.split('?')[0];
  const m = pathname.match(/^\/api\/?(.*)$/);
  return (m && m[1]) ? m[1].replace(/\/$/, '') : '';
}

function getQuery(req) {
  const raw = req.url || '';
  const q = raw.includes('?') ? raw.split('?')[1] : '';
  return Object.fromEntries(new URLSearchParams(q));
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJsonBody(req) {
  const raw = await getRawBody(req);
  if (!raw.length) return {};
  try { return JSON.parse(raw.toString('utf8')); }
  catch { return {}; }
}

async function kvGet(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const d = await r.json();
  return d.result ?? null;
}

async function kvSet(key, value, ttlSeconds) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const path = ttlSeconds
    ? `/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}/ex/${ttlSeconds}`
    : `/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`;
  const r = await fetch(`${url}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`KV set failed: ${r.status}`);
}

async function kvDel(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  await fetch(`${url}/del/${encodeURIComponent(key)}`, { headers: { Authorization: `Bearer ${token}` } });
}

// ── Handlers reais ────────────────────────────────────────────────────────────

async function handleGoogleAuth(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = await readJsonBody(req);
  const { credential } = body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });

  const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  const payload = await verifyRes.json();
  if (!verifyRes.ok || payload.error) return res.status(401).json({ error: 'Invalid Google token', detail: payload.error });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId && payload.aud !== clientId) return res.status(401).json({ error: 'Token audience mismatch' });

  const user = {
    uid: payload.sub, email: payload.email, name: payload.name, picture: payload.picture,
    admin: false, provider: 'google',
    verified: payload.email_verified === 'true' || payload.email_verified === true,
  };
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim());
  if (adminEmails.includes(user.email)) user.admin = true;

  return res.status(200).json({ user, ok: true });
}

async function handleCreditsCheck(req, res) {
  const { email, uid } = getQuery(req);
  if (!email && !uid) return res.status(400).json({ error: 'Missing email or uid' });
  try {
    const key = uid ? `credits:uid:${uid}` : `credits:email:${email}`;
    const credits = await kvGet(key);
    if (credits !== null) {
      await kvDel(key);
      return res.status(200).json({ ok: true, credits: parseInt(credits, 10), consumed: true });
    }
    return res.status(200).json({ ok: true, credits: 0, consumed: false });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function handleStripeWebhook(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey) return res.status(503).json({ error: 'Stripe not configured on server' });
  if (!webhookSecret) return res.status(503).json({ error: 'Webhook secret not configured on server' });

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId || session.client_reference_id || null;
    const planId = session.metadata?.planId || session.metadata?.plan || null;
    const credits = parseInt(session.metadata?.credits || PLAN_CREDITS[planId] || 0, 10);
    const email = session.customer_details?.email || session.metadata?.email || null;
    if (credits > 0 && (userId || email) && process.env.KV_REST_API_URL) {
      const key = userId ? `credits:uid:${userId}` : `credits:email:${email}`;
      const existing = await kvGet(key);
      const current = existing !== null ? parseInt(existing, 10) : 0;
      await kvSet(key, String(current + credits), 86400 * 7);
    }
  }
  return res.status(200).json({ received: true });
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
    STRIPE: { basico: process.env.STRIPE_LINK_BASICO || '', premium: process.env.STRIPE_LINK_PREMIUM || '', avancado: process.env.STRIPE_LINK_AVANCADO || '' },
    STRIPE_TOPUPS: { t100: process.env.STRIPE_TOPUP_100 || '', t300: process.env.STRIPE_TOPUP_300 || '', t700: process.env.STRIPE_TOPUP_700 || '' },
    PAY: { stripe: true, paypal: true, pix: !!process.env.PIX_KEY },
    PAYPAL: process.env.PAYPAL_EMAIL || '', PIX: process.env.PIX_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '', GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    FREE_CREDITS: parseInt(process.env.FREE_CREDITS || '0'), ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  };
}

async function loadConfig() {
  if (process.env.KV_REST_API_URL) {
    try {
      const r = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(CONFIG_KEY)}`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
      });
      if (r.ok) { const d = await r.json(); if (d.result) return JSON.parse(d.result); }
    } catch {}
  }
  return buildConfigFromEnv();
}

async function saveConfig(cfg) {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error('Vercel KV não configurado.');
  }
  const r = await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(CONFIG_KEY)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([JSON.stringify(cfg)]),
  });
  if (!r.ok) throw new Error(`KV set failed (${r.status})`);
}

function generateConfigJs(cfg) {
  const J = v => JSON.stringify(v);
  const P = cfg.PROVIDERS || {}; const ST = cfg.STRIPE || {}; const TU = cfg.STRIPE_TOPUPS || {};
  const PAY = cfg.PAY || { stripe: true, paypal: true, pix: false };
  return `window.HSAI_CONFIG = { PROVIDER: ${J(cfg.PROVIDER || 'atlascloud')}, FREE_CREDITS: ${cfg.FREE_CREDITS != null ? cfg.FREE_CREDITS : 0} };`;
}

async function handleAdminConfig(req, res) {
  if (req.method === 'GET') {
    try {
      const cfg = await loadConfig();
      const safe = {
        ...cfg,
        PROVIDERS: Object.fromEntries(Object.entries(cfg.PROVIDERS || {}).map(([k, v]) => [k, { base: v.base, hasKey: !!v.key }])),
        ADMIN_PASS: undefined, STRIPE_SECRET_KEY: undefined, STRIPE_WEBHOOK_SECRET: undefined,
        CLAUDE_API_KEY: undefined, OPENAI_API_KEY: undefined, GEMINI_API_KEY: undefined,
      };
      return res.status(200).json({ ok: true, config: safe });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  if (req.method === 'POST') {
    const adminSecret = process.env.ADMIN_SECRET || process.env.ADMIN_PASS;
    if (!adminSecret) return res.status(503).json({ error: 'ADMIN_SECRET env var not configured on server.' });
    const token = (req.headers.authorization || '').replace('Bearer ', '').trim();
    if (token !== adminSecret) return res.status(401).json({ error: 'Unauthorized — invalid admin token' });
    const body = await readJsonBody(req);
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid JSON body' });
    try {
      await saveConfig(body);
      return res.status(200).json({ ok: true, message: 'Configurações salvas com sucesso', configJs: generateConfigJs(body) });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

function betaFallback(req, res, path) {
  return res.status(200).json({
    ok: true,
    status: 'beta',
    message: 'Endpoint preparado para integração futura com backend/Supabase.',
    path: req.url || `/api/${path}`,
    route: path || '(root)',
  });
}

// ── Router principal ──────────────────────────────────────────────────────────

const ROUTES = {
  'auth/google': handleGoogleAuth,
  'credits/check': handleCreditsCheck,
  'stripe/webhook': handleStripeWebhook,
  'admin/config': handleAdminConfig,
};

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = getApiPath(req);
  const routeHandler = ROUTES[path];

  if (routeHandler) {
    try { return await routeHandler(req, res); }
    catch (err) {
      console.error(`[api/${path}]`, err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return betaFallback(req, res, path);
}
