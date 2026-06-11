/**
 * api/index.js — Hollywood Studio AI · Única Serverless Function
 * Vercel Hobby: máx. 12 funções → tudo aqui dentro.
 *
 * Rotas implementadas:
 *   POST /api/auth/google          Verificar token Google
 *   GET  /api/auth/session         Retornar dados do usuário via Supabase JWT
 *   GET  /api/credits/balance      Saldo de créditos
 *   POST /api/credits/use          Consumir créditos (valida antes de gerar)
 *   GET  /api/credits/history      Histórico de transações
 *   POST /api/admin/credits/add    Admin: adicionar créditos a usuário
 *   POST /api/payments/checkout    Criar Stripe Checkout Session
 *   POST /api/payments/webhook     Stripe Webhook (checkout + subscription)
 *   GET  /api/payments/history     Histórico de pagamentos do usuário
 *   GET  /api/uploads/list         Listar uploads do usuário
 *   POST /api/uploads/register     Registrar upload na DB
 *   GET  /api/gallery/list         Galeria do usuário
 *   POST /api/gallery/save         Salvar item na galeria
 *   GET  /api/favorites/list       Favoritos do usuário
 *   POST /api/favorites/save       Favoritar item
 *   DELETE /api/favorites/delete   Desfavoritar
 *   GET  /api/projects/list        Projetos do usuário
 *   POST /api/projects/save        Salvar projeto
 *   DELETE /api/projects/delete    Excluir projeto
 *   POST /api/ai/enhance-prompt    Melhorar prompt via OpenAI/Claude
 *   POST /api/ai/creative-board    Conselho criativo
 *   POST /api/ai/social-caption    Legenda social
 *   POST /api/ai/storyboard        Gerar storyboard
 *   POST /api/email/send           Enviar e-mail via Resend
 *   POST /api/support/ticket       Abrir chamado de suporte
 *   GET  /api/account/export       Exportar dados do usuário
 *   POST /api/account/delete       Excluir conta
 *   GET  /api/admin/users          Admin: listar usuários
 *   POST /api/admin/users/update   Admin: atualizar role/plano de usuário
 *   GET  /api/admin/status         Admin: status das integrações
 *   GET  /api/admin/config         Config pública/admin
 *   POST /api/admin/config         Salvar config (admin)
 *   GET  /api/health               Health check
 *   GET  /api/credits/check        Legado: Vercel KV check
 *   POST /api/auth/google          Legado: Google token verify
 */

import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

// ──────────────────────────────────────────────────────────────────────────────
// CORS
// ──────────────────────────────────────────────────────────────────────────────

const DEFAULT_ORIGINS = [
  'https://hollywoodstudio.ai',
  'https://www.hollywoodstudio.ai',
  'https://hollywoodstudio.vercel.app',
];

function setCors(req, res) {
  const extra = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const allowed = [...DEFAULT_ORIGINS, ...extra];
  const origin = req.headers.origin || '';
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (/\.vercel\.app$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Supabase-Auth');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// ──────────────────────────────────────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────────────────────────────────────

function getApiPath(req) {
  const pathname = (req.url || '').split('?')[0];
  const m = pathname.match(/^\/api\/?(.*)$/);
  return (m && m[1]) ? m[1].replace(/\/$/, '').toLowerCase() : '';
}

function getQuery(req) {
  const q = (req.url || '').includes('?') ? (req.url || '').split('?')[1] : '';
  return Object.fromEntries(new URLSearchParams(q));
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJsonBody(req) {
  const raw = await getRawBody(req);
  if (!raw.length) return {};
  try { return JSON.parse(raw.toString('utf8')); } catch { return {}; }
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function log(level, ...args) {
  const ts = new Date().toISOString();
  if (level === 'error') console.error(`[${ts}]`, ...args);
  else if (process.env.NODE_ENV !== 'production') console.log(`[${ts}]`, ...args);
}

// ──────────────────────────────────────────────────────────────────────────────
// SUPABASE REST HELPERS
// ──────────────────────────────────────────────────────────────────────────────

function sbUrl()  { return process.env.SUPABASE_URL || ''; }
function sbSvc()  { return process.env.SUPABASE_SERVICE_ROLE_KEY || ''; }
function sbAnon() { return process.env.SUPABASE_ANON_KEY || ''; }
function hasSB()  { return !!(sbUrl() && sbSvc()); }

/** Executa query Supabase via PostgREST usando service role */
async function sbQuery(table, opts = {}) {
  if (!hasSB()) return { data: null, error: 'Supabase não configurado' };
  const { select = '*', filter = '', method = 'GET', body = null, upsert = false, single = false } = opts;

  let url = `${sbUrl()}/rest/v1/${table}?select=${encodeURIComponent(select)}`;
  if (filter) url += `&${filter}`;
  if (single) url += '&limit=1';

  const headers = {
    'apikey': sbSvc(),
    'Authorization': `Bearer ${sbSvc()}`,
    'Content-Type': 'application/json',
    'Prefer': upsert ? 'resolution=merge-duplicates,return=representation' : 'return=representation',
  };
  if (single) headers['Accept'] = 'application/vnd.pgrst.object+json';

  const fetchOpts = { method, headers };
  if (body) fetchOpts.body = JSON.stringify(body);

  try {
    const r = await fetch(url, fetchOpts);
    const text = await r.text();
    if (!r.ok) return { data: null, error: text || `HTTP ${r.status}` };
    const data = text ? JSON.parse(text) : null;
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

/** Verifica o JWT Supabase do usuário e retorna o payload */
async function verifySupabaseJWT(token) {
  if (!hasSB() || !token) return null;
  try {
    const r = await fetch(`${sbUrl()}/auth/v1/user`, {
      headers: { 'apikey': sbAnon(), 'Authorization': `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

/** Pega o perfil do usuário na tabela profiles */
async function getProfile(userId) {
  const { data } = await sbQuery('profiles', {
    filter: `id=eq.${userId}`,
    single: true,
  });
  return data;
}

/** Extrai o Bearer token do request */
function getBearerToken(req) {
  const auth = req.headers.authorization || req.headers['x-supabase-auth'] || '';
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
}

/** Autenticar usuário e retornar {supaUser, profile} ou null */
async function authenticate(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  if (hasSB()) {
    const supaUser = await verifySupabaseJWT(token);
    if (!supaUser || !supaUser.id) return null;
    const profile = await getProfile(supaUser.id);
    return { supaUser, profile: profile || { id: supaUser.id, role: 'user', plan: 'free', credits_balance: 0 } };
  }

  // Fallback: aceita qualquer token não vazio (modo dev sem Supabase)
  return { supaUser: { id: 'dev-user', email: 'dev@local' }, profile: { id: 'dev-user', role: 'user', plan: 'free', credits_balance: 10 } };
}

/** Verificar se o usuário autenticado é admin */
function isAdmin(auth) {
  if (!auth) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim()).filter(Boolean);
  return auth.profile?.role === 'admin' || auth.profile?.role === 'super_admin'
    || adminEmails.includes(auth.supaUser?.email || '');
}

/** Upsert um registro na tabela (usar com service role) */
async function sbUpsert(table, data) {
  return sbQuery(table, { method: 'POST', body: Array.isArray(data) ? data : [data], upsert: true });
}

/** Inserir um registro */
async function sbInsert(table, data) {
  return sbQuery(table, { method: 'POST', body: Array.isArray(data) ? data : [data] });
}

/** Atualizar registros com filtro */
async function sbUpdate(table, filter, data) {
  return sbQuery(table, { method: 'PATCH', filter, body: data });
}

/** Deletar registros com filtro */
async function sbDelete(table, filter) {
  return sbQuery(table, { method: 'DELETE', filter });
}

// ──────────────────────────────────────────────────────────────────────────────
// VERCEL KV (legado — ainda usado para checkouts rápidos)
// ──────────────────────────────────────────────────────────────────────────────

function hasKV() { return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN); }

async function kvGet(key) {
  if (!hasKV()) return null;
  try {
    const r = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.result ?? null;
  } catch { return null; }
}

async function kvSet(key, value, ttl) {
  if (!hasKV()) return;
  const path = ttl
    ? `/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}/ex/${ttl}`
    : `/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`;
  await fetch(`${process.env.KV_REST_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
}

async function kvDel(key) {
  if (!hasKV()) return;
  await fetch(`${process.env.KV_REST_API_URL}/del/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// CRÉDITOS
// ──────────────────────────────────────────────────────────────────────────────

const PLAN_CREDITS = { free: 0, basico: 150, creator: 200, pro: 400, studio: 800, t100: 100, t300: 300, t700: 700 };

/** Obter saldo de créditos do usuário */
async function getUserCredits(userId) {
  if (!hasSB()) {
    const kv = await kvGet(`credits:uid:${userId}`);
    return kv !== null ? parseInt(kv, 10) : 0;
  }
  const { data } = await sbQuery('profiles', {
    select: 'credits_balance',
    filter: `id=eq.${userId}`,
    single: true,
  });
  return data?.credits_balance ?? 0;
}

/** Adicionar/remover créditos com log de transação */
async function mutateCredits(userId, amount, type, source, meta = {}) {
  if (!hasSB()) {
    const key = `credits:uid:${userId}`;
    const cur = parseInt(await kvGet(key) || '0', 10);
    const next = Math.max(0, cur + amount);
    await kvSet(key, String(next), 86400 * 30);
    return { ok: true, balance: next };
  }

  // Atualizar saldo
  const curBalance = await getUserCredits(userId);
  const newBalance = Math.max(0, curBalance + amount);

  await sbUpdate('profiles', `id=eq.${userId}`, {
    credits_balance: newBalance,
    updated_at: new Date().toISOString(),
  });

  // Registrar transação
  await sbInsert('credit_transactions', [{
    id: uuid(),
    user_id: userId,
    type,
    amount,
    source: source || type,
    status: 'completed',
    metadata: meta,
    created_at: new Date().toISOString(),
  }]);

  return { ok: true, balance: newBalance };
}

// ──────────────────────────────────────────────────────────────────────────────
// E-MAIL via Resend
// ──────────────────────────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'noreply@hollywoodstudio.ai';
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY não configurada' };

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html: html || `<p>${text || subject}</p>` }),
    });
    if (!r.ok) { const e = await r.text(); return { ok: false, error: e }; }
    const d = await r.json();
    return { ok: true, id: d.id };
  } catch (e) { return { ok: false, error: e.message }; }
}

// ──────────────────────────────────────────────────────────────────────────────
// IA PROXY (OpenAI / Claude / Gemini)
// ──────────────────────────────────────────────────────────────────────────────

async function callOpenAI(prompt, system = '', model = 'gpt-4o-mini') {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d.choices?.[0]?.message?.content || null;
}

async function callClaude(prompt, system = '') {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key, 'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1200,
      system: system || 'Você é um assistente especialista em produção audiovisual com IA.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d.content?.[0]?.text || null;
}

async function callGemini(prompt, system = '') {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
    }
  );
  if (!r.ok) return null;
  const d = await r.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

/** Chamar IA disponível: tenta OpenAI → Claude → Gemini → fallback */
async function callAI(prompt, system = '', fallback = '') {
  const result = await callOpenAI(prompt, system)
    || await callClaude(prompt, system)
    || await callGemini(prompt, system);
  return result || fallback;
}

// ──────────────────────────────────────────────────────────────────────────────
// CONFIG (KV + env)
// ──────────────────────────────────────────────────────────────────────────────

const CONFIG_KEY = 'hsai:config';

function buildConfigFromEnv() {
  return {
    PROVIDER: process.env.PROVIDER || 'atlascloud',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    PROVIDERS: {
      atlascloud: { base: process.env.ATLAS_BASE || '', key: process.env.ATLAS_KEY || '' },
      fal:        { base: 'https://fal.run', key: process.env.FAL_KEY || '' },
    },
    FREE_CREDITS: parseInt(process.env.FREE_CREDITS || '3', 10),
    TRIAL_CREDITS: parseInt(process.env.TRIAL_CREDITS || '3', 10),
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
    STRIPE: {
      basico:   process.env.STRIPE_LINK_BASICO   || '',
      creator:  process.env.STRIPE_LINK_CREATOR  || '',
      pro:      process.env.STRIPE_LINK_PRO       || '',
      studio:   process.env.STRIPE_LINK_STUDIO    || '',
    },
    TOPUPS: {
      t100: process.env.STRIPE_TOPUP_100 || '',
      t300: process.env.STRIPE_TOPUP_300 || '',
      t700: process.env.STRIPE_TOPUP_700 || '',
    },
    FEATURE_FLAGS: {
      enableTrial:          process.env.FLAG_TRIAL          !== 'false',
      enablePayments:       process.env.FLAG_PAYMENTS       !== 'false',
      enableUploads:        process.env.FLAG_UPLOADS        !== 'false',
      enableAIText:         process.env.FLAG_AI_TEXT        !== 'false',
      enableVideoGeneration:process.env.FLAG_VIDEO_GEN      !== 'false',
      enablePublicGallery:  process.env.FLAG_PUBLIC_GALLERY !== 'false',
      enableInstagram:      process.env.FLAG_INSTAGRAM      !== 'false',
      enableFounderOffer:   process.env.FLAG_FOUNDER_OFFER  !== 'false',
    },
  };
}

async function loadConfig() {
  if (hasKV()) {
    try {
      const r = await kvGet(CONFIG_KEY);
      if (r) return JSON.parse(r);
    } catch {}
  }
  return buildConfigFromEnv();
}

async function saveConfig(cfg) {
  if (!hasKV()) throw new Error('Vercel KV não configurado.');
  await kvSet(CONFIG_KEY, JSON.stringify(cfg));
}

// ──────────────────────────────────────────────────────────────────────────────
// HANDLERS
// ──────────────────────────────────────────────────────────────────────────────

// ── /api/health ──────────────────────────────────────────────────────────────

function handleHealth(req, res) {
  return res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    supabase: hasSB(),
    kv: hasKV(),
    stripe: !!process.env.STRIPE_SECRET_KEY,
    resend: !!process.env.RESEND_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    claude: !!process.env.ANTHROPIC_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    magnific: !!process.env.MAGNIFIC_API_KEY,
    atlas: !!(process.env.ATLAS_API_KEY || process.env.ATLAS_KEY),
    version: '2.1.0',
  });
}

// ── /api/health/details ──────────────────────────────────────────────────────
// Presença BOOLEANA de cada variável de ambiente (nunca expõe valores).
function handleHealthDetails(req, res) {
  const has = (k) => !!process.env[k];
  return res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    env: {
      SUPABASE_URL:              has('SUPABASE_URL'),
      SUPABASE_ANON_KEY:         has('SUPABASE_ANON_KEY'),
      SUPABASE_SERVICE_ROLE_KEY: has('SUPABASE_SERVICE_ROLE_KEY'),
      STRIPE_SECRET_KEY:         has('STRIPE_SECRET_KEY'),
      STRIPE_WEBHOOK_SECRET:     has('STRIPE_WEBHOOK_SECRET'),
      RESEND_API_KEY:            has('RESEND_API_KEY'),
      OPENAI_API_KEY:            has('OPENAI_API_KEY'),
      ANTHROPIC_API_KEY:         has('ANTHROPIC_API_KEY'),
      GEMINI_API_KEY:            has('GEMINI_API_KEY'),
      MAGNIFIC_API_KEY:          has('MAGNIFIC_API_KEY'),
      ATLAS_API_KEY:             !!(process.env.ATLAS_API_KEY || process.env.ATLAS_KEY),
      HEYGEN_API_KEY:            has('HEYGEN_API_KEY'),
      FAL_API_KEY:               !!(process.env.FAL_API_KEY || process.env.FAL_KEY),
      BYTEPLUS_API_KEY:          !!(process.env.BYTEPLUS_API_KEY || process.env.SEEDANCE_API_KEY),
      KLING_API_KEY:             has('KLING_API_KEY'),
      FLUX_API_KEY:              !!(process.env.FLUX_API_KEY || process.env.BFL_API_KEY),
      RUNWAY_API_KEY:            has('RUNWAY_API_KEY'),
      GOOGLE_CLIENT_ID:          has('GOOGLE_CLIENT_ID'),
      KV:                        hasKV(),
      APP_URL:                   has('APP_URL'),
      ADMIN_EMAILS:              has('ADMIN_EMAILS'),
    },
  });
}

// ── /api/auth/google ─────────────────────────────────────────────────────────

async function handleAuthGoogle(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = await readJsonBody(req);
  const { credential } = body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });

  const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  const payload = await verifyRes.json();
  if (!verifyRes.ok || payload.error) return res.status(401).json({ error: 'Invalid Google token' });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (clientId && payload.aud !== clientId) return res.status(401).json({ error: 'Token audience mismatch' });

  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '').split(',').map(e => e.trim());
  const user = {
    uid: payload.sub, email: payload.email, name: payload.name, picture: payload.picture,
    admin: adminEmails.includes(payload.email),
    provider: 'google',
    verified: payload.email_verified === 'true' || payload.email_verified === true,
  };
  return res.status(200).json({ user, ok: true });
}

// ── /api/auth/session ────────────────────────────────────────────────────────

async function handleAuthSession(req, res) {
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const { supaUser, profile } = auth;
  return res.status(200).json({
    ok: true,
    user: {
      id: supaUser.id,
      email: supaUser.email,
      name: profile?.full_name || supaUser.user_metadata?.full_name || '',
      avatar: profile?.avatar_url || supaUser.user_metadata?.avatar_url || '',
      role: profile?.role || 'user',
      plan: profile?.plan || 'free',
      credits: profile?.credits_balance ?? 0,
      trialGranted: profile?.trial_granted ?? false,
    },
  });
}

// ── /api/credits/* ───────────────────────────────────────────────────────────

async function handleCreditsBalance(req, res) {
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const balance = await getUserCredits(auth.supaUser.id);
  return res.status(200).json({ ok: true, balance, plan: auth.profile?.plan || 'free' });
}

async function handleCreditsUse(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { amount = 1, feature = 'generation', description = '' } = body;
  const cost = Math.max(1, parseInt(amount, 10));

  const balance = await getUserCredits(auth.supaUser.id);
  if (balance < cost) {
    return res.status(402).json({
      ok: false,
      error: 'INSUFFICIENT_CREDITS',
      required: cost,
      balance,
      upgradeSuggestion: 'Adquira um plano ou pacote de créditos para continuar.',
    });
  }

  const result = await mutateCredits(auth.supaUser.id, -cost, 'usage', feature, { description, feature });
  return res.status(200).json({ ok: true, debited: cost, balance: result.balance });
}

async function handleCreditsHistory(req, res) {
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (!hasSB()) return res.status(200).json({ ok: true, transactions: [], note: 'Supabase não configurado' });

  const { data } = await sbQuery('credit_transactions', {
    filter: `user_id=eq.${auth.supaUser.id}&order=created_at.desc&limit=50`,
  });
  return res.status(200).json({ ok: true, transactions: data || [] });
}

// Legado: /api/credits/check (compatibilidade com frontend antigo)
async function handleCreditsCheck(req, res) {
  const { email, uid } = getQuery(req);
  if (!email && !uid) return res.status(400).json({ error: 'Missing email or uid' });
  const key = uid ? `credits:uid:${uid}` : `credits:email:${email}`;
  const credits = await kvGet(key);
  if (credits !== null) {
    await kvDel(key);
    return res.status(200).json({ ok: true, credits: parseInt(credits, 10), consumed: true });
  }
  return res.status(200).json({ ok: true, credits: 0, consumed: false });
}

// ── /api/admin/credits/add ───────────────────────────────────────────────────

async function handleAdminCreditsAdd(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin only' });

  const body = await readJsonBody(req);
  const { userId, email, amount, reason = 'admin_adjustment' } = body;
  if (!userId && !email) return res.status(400).json({ error: 'userId ou email obrigatório' });
  if (!amount || isNaN(amount)) return res.status(400).json({ error: 'amount inválido' });

  let targetId = userId;
  if (!targetId && email && hasSB()) {
    const { data } = await sbQuery('profiles', { filter: `email=eq.${email}`, single: true });
    targetId = data?.id;
    if (!targetId) return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const result = await mutateCredits(targetId, parseInt(amount, 10), 'admin_adjustment', reason, {
    by_admin: auth.supaUser.id,
    reason,
  });

  log('info', `Admin ${auth.supaUser.email} adicionou ${amount} créditos para ${targetId}`);
  return res.status(200).json({ ok: true, balance: result.balance, userId: targetId });
}

// ── /api/payments/* ──────────────────────────────────────────────────────────

async function handlePaymentsCheckout(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(200).json({
      ok: false,
      status: 'beta',
      message: 'Pagamentos não configurados. Configure STRIPE_SECRET_KEY para habilitar.',
      fallback: true,
    });
  }

  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { planId, creditPack, successUrl, cancelUrl } = body;

  const priceMap = {
    basico:  process.env.STRIPE_PRICE_BASICO   || process.env.STRIPE_PRICE_CREATOR,
    creator: process.env.STRIPE_PRICE_CREATOR,
    pro:     process.env.STRIPE_PRICE_PRO,
    studio:  process.env.STRIPE_PRICE_STUDIO,
    t100:    process.env.STRIPE_PRICE_T100,
    t300:    process.env.STRIPE_PRICE_T300,
    t700:    process.env.STRIPE_PRICE_T700,
  };

  const priceId = priceMap[planId || creditPack];
  if (!priceId) {
    return res.status(400).json({ error: `Plano/pacote "${planId || creditPack}" não configurado. Defina a env STRIPE_PRICE_${(planId || creditPack || '').toUpperCase()}.` });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
  const isSubscription = ['creator', 'pro', 'studio', 'basico'].includes(planId);
  const appUrl = process.env.APP_URL || 'https://hollywoodstudio.ai';

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? 'subscription' : 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl || `${appUrl}?payment=success`,
    cancel_url:  cancelUrl  || `${appUrl}?payment=cancel`,
    customer_email: auth.supaUser.email,
    client_reference_id: auth.supaUser.id,
    metadata: {
      userId: auth.supaUser.id,
      planId: planId || '',
      credits: String(PLAN_CREDITS[planId || creditPack] || 0),
    },
  });

  return res.status(200).json({ ok: true, checkoutUrl: session.url, sessionId: session.id });
}

async function handlePaymentsWebhook(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) return res.status(503).json({ error: 'Stripe não configurado' });

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // Idempotência: verificar se o evento já foi processado
  if (hasSB()) {
    const { data: existing } = await sbQuery('payment_events', {
      filter: `event_id=eq.${event.id}`,
      single: true,
    });
    if (existing?.processed) {
      return res.status(200).json({ received: true, duplicate: true });
    }
    // Registrar o evento bruto imediatamente
    await sbInsert('payment_events', [{
      id: uuid(),
      provider: 'stripe',
      event_id: event.id,
      event_type: event.type,
      processed: false,
      payload: event,
      created_at: new Date().toISOString(),
    }]);
  }

  let processed = false;
  let userId = null;
  let creditsToAdd = 0;
  let planId = null;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    userId = session.client_reference_id || session.metadata?.userId;
    planId = session.metadata?.planId;
    creditsToAdd = parseInt(session.metadata?.credits || PLAN_CREDITS[planId] || 0, 10);

    if (userId && creditsToAdd > 0) {
      await mutateCredits(userId, creditsToAdd, 'purchase', `stripe:${event.type}`, {
        stripe_session: session.id,
        plan: planId,
      });
      if (hasSB()) {
        await sbInsert('payments', [{
          id: uuid(),
          user_id: userId,
          provider: 'stripe',
          provider_session_id: session.id,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'brl',
          status: 'paid',
          plan_id: planId,
          credits: creditsToAdd,
          metadata: { stripe_session: session.id },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
        if (planId) {
          await sbUpdate('profiles', `id=eq.${userId}`, { plan: planId, updated_at: new Date().toISOString() });
        }
      }

      // KV fallback
      if (!hasSB() && hasKV()) {
        const email = session.customer_details?.email;
        const key = userId ? `credits:uid:${userId}` : `credits:email:${email}`;
        const existing = parseInt(await kvGet(key) || '0', 10);
        await kvSet(key, String(existing + creditsToAdd), 86400 * 7);
      }

      // E-mail de confirmação
      const email = session.customer_details?.email;
      if (email) {
        await sendEmail({
          to: email,
          subject: 'Pagamento confirmado — Hollywood Studio AI',
          html: `<p>Olá! Seu pagamento foi aprovado.<br>
          <b>${creditsToAdd} créditos</b> foram adicionados à sua conta.<br><br>
          <a href="https://hollywoodstudio.ai">Acessar o Estúdio →</a></p>`,
        });
      }
      processed = true;
    }

  } else if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    const sub = invoice.subscription;
    // Renovação de assinatura → recarregar créditos mensais
    if (sub && hasSB()) {
      const stripeCustomer = invoice.customer;
      // Busca userId via payments
      const { data: payment } = await sbQuery('payments', {
        filter: `provider=eq.stripe&metadata->stripe_customer=eq.${stripeCustomer}`,
        single: true,
      });
      if (payment?.user_id) {
        const monthPlanId = payment.plan_id || 'creator';
        creditsToAdd = PLAN_CREDITS[monthPlanId] || 200;
        await mutateCredits(payment.user_id, creditsToAdd, 'subscription', `stripe:renewal`, {
          invoice: invoice.id,
        });
        processed = true;
      }
    }

  } else if (event.type === 'customer.subscription.deleted') {
    // Assinatura cancelada → downgrade para free
    const sub = event.data.object;
    if (hasSB() && sub.metadata?.userId) {
      await sbUpdate('profiles', `id=eq.${sub.metadata.userId}`, {
        plan: 'free', updated_at: new Date().toISOString(),
      });
      processed = true;
    }
  }

  // Marcar evento como processado
  if (hasSB()) {
    await sbUpdate('payment_events', `event_id=eq.${event.id}`, {
      processed: true,
      processed_at: new Date().toISOString(),
    });
  }

  return res.status(200).json({ received: true, processed });
}

async function handlePaymentsHistory(req, res) {
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasSB()) return res.status(200).json({ ok: true, payments: [], note: 'Supabase não configurado' });

  const { data } = await sbQuery('payments', {
    filter: `user_id=eq.${auth.supaUser.id}&order=created_at.desc&limit=20`,
  });
  return res.status(200).json({ ok: true, payments: data || [] });
}

// ── /api/uploads/* ───────────────────────────────────────────────────────────

async function handleUploadsList(req, res) {
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasSB()) return res.status(200).json({ ok: true, uploads: [], note: 'Supabase não configurado' });

  const { data } = await sbQuery('uploads', {
    filter: `user_id=eq.${auth.supaUser.id}&order=created_at.desc&limit=100`,
  });
  return res.status(200).json({ ok: true, uploads: data || [] });
}

async function handleUploadsRegister(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { fileUrl, filePath, fileType, title, metadata } = body;
  if (!fileUrl) return res.status(400).json({ error: 'fileUrl obrigatório' });

  if (!hasSB()) return res.status(200).json({ ok: true, id: uuid(), note: 'Salvo localmente (Supabase não configurado)' });

  const row = {
    id: uuid(),
    user_id: auth.supaUser.id,
    file_url: fileUrl,
    file_path: filePath || '',
    file_type: fileType || 'image',
    title: title || '',
    metadata: metadata || {},
    created_at: new Date().toISOString(),
  };
  const { data, error } = await sbInsert('uploads', [row]);
  if (error) return res.status(500).json({ error });
  return res.status(200).json({ ok: true, upload: data?.[0] || row });
}

// ── /api/gallery/* ───────────────────────────────────────────────────────────

async function handleGalleryList(req, res) {
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasSB()) return res.status(200).json({ ok: true, items: [], note: 'Supabase não configurado' });

  const q = getQuery(req);
  const visibility = q.visibility || 'private';
  const limit = Math.min(parseInt(q.limit || '100', 10), 200);

  const filter = visibility === 'public'
    ? `visibility=eq.public&order=created_at.desc&limit=${limit}`
    : `user_id=eq.${auth.supaUser.id}&order=created_at.desc&limit=${limit}`;

  const { data } = await sbQuery('gallery_items', { filter });
  return res.status(200).json({ ok: true, items: data || [] });
}

async function handleGallerySave(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { title, prompt, mediaUrl, mediaType, visibility = 'private', metadata } = body;
  if (!mediaUrl) return res.status(400).json({ error: 'mediaUrl obrigatório' });

  if (!hasSB()) return res.status(200).json({ ok: true, id: uuid(), note: 'Supabase não configurado' });

  const row = {
    id: body.id || uuid(),
    user_id: auth.supaUser.id,
    title: title || '',
    prompt: prompt || '',
    media_url: mediaUrl,
    media_type: mediaType || 'image',
    visibility,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
  };
  const { data, error } = await sbUpsert('gallery_items', [row]);
  if (error) return res.status(500).json({ error });
  return res.status(200).json({ ok: true, item: data?.[0] || row });
}

// ── /api/favorites/* ─────────────────────────────────────────────────────────

async function handleFavoritesList(req, res) {
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasSB()) return res.status(200).json({ ok: true, favorites: [], note: 'Supabase não configurado' });

  const { data } = await sbQuery('favorites', {
    filter: `user_id=eq.${auth.supaUser.id}&order=created_at.desc&limit=200`,
  });
  return res.status(200).json({ ok: true, favorites: data || [] });
}

async function handleFavoritesSave(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { itemId, itemType = 'gallery', title, prompt, mediaUrl, metadata } = body;
  if (!itemId) return res.status(400).json({ error: 'itemId obrigatório' });

  if (!hasSB()) return res.status(200).json({ ok: true, note: 'Supabase não configurado' });

  const row = {
    id: uuid(),
    user_id: auth.supaUser.id,
    item_id: itemId,
    item_type: itemType,
    title: title || '',
    prompt: prompt || '',
    media_url: mediaUrl || '',
    metadata: metadata || {},
    created_at: new Date().toISOString(),
  };
  const { data, error } = await sbInsert('favorites', [row]);
  if (error) return res.status(500).json({ error });
  return res.status(200).json({ ok: true, favorite: data?.[0] || row });
}

async function handleFavoritesDelete(req, res) {
  if (req.method !== 'DELETE' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { itemId } = body;
  if (!itemId) return res.status(400).json({ error: 'itemId obrigatório' });

  if (!hasSB()) return res.status(200).json({ ok: true, note: 'Supabase não configurado' });

  await sbDelete('favorites', `user_id=eq.${auth.supaUser.id}&item_id=eq.${itemId}`);
  return res.status(200).json({ ok: true });
}

// ── /api/projects/* ──────────────────────────────────────────────────────────

async function handleProjectsList(req, res) {
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (!hasSB()) return res.status(200).json({ ok: true, projects: [], note: 'Supabase não configurado' });

  const { data } = await sbQuery('projects', {
    filter: `user_id=eq.${auth.supaUser.id}&order=updated_at.desc&limit=100`,
  });
  return res.status(200).json({ ok: true, projects: data || [] });
}

async function handleProjectsSave(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { title, prompt, modelId, references, output, metadata } = body;

  if (!hasSB()) return res.status(200).json({ ok: true, id: uuid(), note: 'Supabase não configurado' });

  const row = {
    id: body.id || uuid(),
    user_id: auth.supaUser.id,
    title: title || 'Projeto sem título',
    prompt: prompt || '',
    model_id: modelId || '',
    status: body.status || 'draft',
    references: references || [],
    output: output || {},
    metadata: metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await sbUpsert('projects', [row]);
  if (error) return res.status(500).json({ error });
  return res.status(200).json({ ok: true, project: data?.[0] || row });
}

async function handleProjectsDelete(req, res) {
  if (req.method !== 'DELETE' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { id } = body;
  if (!id) return res.status(400).json({ error: 'id obrigatório' });

  if (!hasSB()) return res.status(200).json({ ok: true, note: 'Supabase não configurado' });

  await sbDelete('projects', `user_id=eq.${auth.supaUser.id}&id=eq.${id}`);
  return res.status(200).json({ ok: true });
}

// ── /api/ai/* ────────────────────────────────────────────────────────────────

const AI_SYSTEM = {
  pt: 'Você é um especialista em produção audiovisual cinematográfica com IA. Responda de forma objetiva, criativa e prática. Nunca simule fala de pessoas reais vivas.',
  en: 'You are an expert in AI-driven cinematic audiovisual production. Answer objectively, creatively and practically. Never simulate speech from real living people.',
};

async function handleAIEnhancePrompt(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { prompt, lang = 'pt', style, model } = body;
  if (!prompt) return res.status(400).json({ error: 'prompt obrigatório' });

  const userPrompt = lang === 'pt'
    ? `Melhore este prompt para geração de vídeo/imagem com IA, tornando-o mais cinematográfico, específico e técnico. Adicione: enquadramento, iluminação, paleta de cores, movimento de câmera, atmosfera. Estilo desejado: ${style || 'cinematográfico realista'}. Modelo alvo: ${model || 'geral'}.\n\nPrompt original: ${prompt}\n\nRetorne apenas o prompt melhorado, sem explicações.`
    : `Improve this AI video/image generation prompt, making it more cinematic, specific and technical. Add: framing, lighting, color palette, camera movement, atmosphere. Desired style: ${style || 'realistic cinematic'}. Target model: ${model || 'general'}.\n\nOriginal prompt: ${prompt}\n\nReturn only the improved prompt, no explanations.`;

  const result = await callAI(userPrompt, AI_SYSTEM[lang],
    lang === 'pt'
      ? `${prompt}, estilo cinematográfico, iluminação dramática, câmera em movimento lento, paleta de cores frias, resolução ultra-HD`
      : `${prompt}, cinematic style, dramatic lighting, slow camera movement, cool color palette, ultra-HD resolution`
  );
  return res.status(200).json({ ok: true, enhanced: result, original: prompt });
}

async function handleAICreativeBoard(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { idea, references = [], style, lang = 'pt' } = body;
  if (!idea) return res.status(400).json({ error: 'idea obrigatória' });

  const userPrompt = lang === 'pt'
    ? `Você é um conselho criativo de cineastas. Analise esta ideia e responda em JSON com: conceito, tom, estética, riscos, narrativa, prompt_melhorado, proximos_passos (array de 3 itens).

Ideia: ${idea}
Referências: ${references.join(', ') || 'nenhuma'}
Estilo desejado: ${style || 'cinematográfico'}

IMPORTANTE: Não simule fala direta de pessoas reais. Use "visão inspirada em princípios criativos associados a [nome]".
Retorne apenas JSON válido, sem markdown.`
    : `You are a council of filmmakers. Analyze this idea and respond in JSON with: concept, tone, aesthetic, risks, narrative, enhanced_prompt, next_steps (array of 3 items).

Idea: ${idea}
References: ${references.join(', ') || 'none'}
Desired style: ${style || 'cinematic'}

IMPORTANT: Do not simulate direct speech from real people. Use "vision inspired by creative principles associated with [name]".
Return valid JSON only, no markdown.`;

  const raw = await callAI(userPrompt, AI_SYSTEM[lang]);
  let result;
  try { result = JSON.parse((raw || '').replace(/```json|```/g, '').trim()); }
  catch {
    result = {
      conceito: raw || (lang === 'pt' ? 'Análise criativa não disponível — configure uma API key de IA.' : 'Creative analysis unavailable — configure an AI API key.'),
      tom: lang === 'pt' ? 'cinematográfico' : 'cinematic',
      estética: lang === 'pt' ? 'realista e dramático' : 'realistic and dramatic',
      riscos: lang === 'pt' ? 'Definir referências visuais claras antes de gerar.' : 'Define clear visual references before generating.',
      narrativa: lang === 'pt' ? 'Narrativa visual forte com abertura de impacto.' : 'Strong visual narrative with impactful opening.',
      prompt_melhorado: idea,
      proximos_passos: lang === 'pt'
        ? ['Adicionar referência visual', 'Escolher modelo de geração', 'Definir formato final']
        : ['Add visual reference', 'Choose generation model', 'Define final format'],
    };
  }
  return res.status(200).json({ ok: true, result });
}

async function handleAISocialCaption(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { prompt, platform = 'instagram', lang = 'pt', tone = 'profissional' } = body;
  if (!prompt) return res.status(400).json({ error: 'prompt obrigatório' });

  const userPrompt = lang === 'pt'
    ? `Crie uma legenda para ${platform} sobre este conteúdo de vídeo/imagem feito com IA. Tom: ${tone}. Inclua: texto principal (2-3 linhas), call-to-action, 8-10 hashtags relevantes. Formato JSON: {caption, cta, hashtags}.\n\nConteúdo: ${prompt}`
    : `Create a ${platform} caption for this AI-generated video/image content. Tone: ${tone}. Include: main text (2-3 lines), call-to-action, 8-10 relevant hashtags. JSON format: {caption, cta, hashtags}.\n\nContent: ${prompt}`;

  const raw = await callAI(userPrompt, AI_SYSTEM[lang]);
  let result;
  try { result = JSON.parse((raw || '').replace(/```json|```/g, '').trim()); }
  catch {
    result = {
      caption: raw || (lang === 'pt' ? 'Criado com Hollywood Studio AI — produção audiovisual com inteligência artificial.' : 'Created with Hollywood Studio AI — audiovisual production with artificial intelligence.'),
      cta: lang === 'pt' ? 'Acesse hollywoodstudio.ai e crie o seu!' : 'Visit hollywoodstudio.ai and create yours!',
      hashtags: ['#hollywoodstudioai', '#videoIA', '#AIvideo', '#inteligenciaartificial', '#cinematic', '#contentcreator', '#videoediting', '#aicontent'],
    };
  }
  return res.status(200).json({ ok: true, result });
}

async function handleAIStoryboard(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { brief, scenes = 5, style = 'cinematográfico', lang = 'pt' } = body;
  if (!brief) return res.status(400).json({ error: 'brief obrigatório' });

  const userPrompt = lang === 'pt'
    ? `Você é um diretor de cinema. Crie um storyboard com ${scenes} cenas para este briefing. Para cada cena, gere: número, descrição visual (2-3 linhas), prompt para IA (específico, técnico), duração sugerida (segundos), notas de câmera. Estilo: ${style}.\n\nBriefing: ${brief}\n\nRetorne JSON: {title, scenes: [{number, description, prompt, duration, camera_notes}]}`
    : `You are a film director. Create a storyboard with ${scenes} scenes for this brief. For each scene: number, visual description (2-3 lines), AI prompt (specific, technical), suggested duration (seconds), camera notes. Style: ${style}.\n\nBrief: ${brief}\n\nReturn JSON: {title, scenes: [{number, description, prompt, duration, camera_notes}]}`;

  const raw = await callAI(userPrompt, AI_SYSTEM[lang]);
  let result;
  try { result = JSON.parse((raw || '').replace(/```json|```/g, '').trim()); }
  catch {
    result = {
      title: lang === 'pt' ? `Storyboard: ${brief.slice(0, 40)}` : `Storyboard: ${brief.slice(0, 40)}`,
      scenes: Array.from({ length: Math.min(scenes, 5) }, (_, i) => ({
        number: i + 1,
        description: lang === 'pt' ? `Cena ${i + 1}: ${brief}` : `Scene ${i + 1}: ${brief}`,
        prompt: `${brief}, cena ${i + 1}, estilo ${style}, cinematográfico, iluminação dramática`,
        duration: 5,
        camera_notes: lang === 'pt' ? 'Câmera estática, ângulo frontal' : 'Static camera, frontal angle',
      })),
    };
  }
  return res.status(200).json({ ok: true, storyboard: result });
}

// ── /api/email/send ──────────────────────────────────────────────────────────

async function handleEmailSend(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { to, subject, html, text, template } = body;

  // Templates predefinidos
  let finalTo = to, finalSubject = subject, finalHtml = html;

  if (template === 'welcome' && auth.supaUser.email) {
    finalTo = auth.supaUser.email;
    finalSubject = 'Bem-vindo ao Hollywood Studio AI!';
    finalHtml = `<h2>Bem-vindo ao Hollywood Studio AI!</h2>
<p>Sua conta foi criada com sucesso.</p>
<p>Você tem <b>créditos de boas-vindas</b> para começar a criar.</p>
<a href="https://hollywoodstudio.ai">Acessar o Estúdio →</a>`;
  } else if (template === 'support_received') {
    finalTo = auth.supaUser.email;
    finalSubject = 'Chamado de suporte recebido — Hollywood Studio AI';
    finalHtml = `<p>Recebemos seu chamado de suporte.<br>Responderemos em até 48h úteis.<br><br>
<a href="https://hollywoodstudio.ai">Acessar o Estúdio →</a></p>`;
  }

  if (!finalTo || !finalSubject) return res.status(400).json({ error: 'to e subject obrigatórios' });

  const result = await sendEmail({ to: finalTo, subject: finalSubject, html: finalHtml, text });
  return res.status(result.ok ? 200 : 503).json(result);
}

// ── /api/support/ticket ──────────────────────────────────────────────────────

async function handleSupportTicket(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  const { category, subject, message, metadata } = body;
  if (!subject || !message) return res.status(400).json({ error: 'subject e message obrigatórios' });

  const ticketId = uuid();

  if (hasSB()) {
    await sbInsert('support_tickets', [{
      id: ticketId,
      user_id: auth.supaUser.id,
      category: category || 'Geral',
      subject,
      message,
      status: 'open',
      priority: 'normal',
      metadata: metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }]);
  }

  // Notificar admin
  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: `[Suporte] ${category || 'Geral'}: ${subject}`,
      html: `<b>De:</b> ${auth.supaUser.email}<br>
<b>Categoria:</b> ${category || 'Geral'}<br>
<b>Mensagem:</b><br>${message.replace(/\n/g, '<br>')}`,
    });
  }

  // Confirmação para usuário
  await sendEmail({
    to: auth.supaUser.email,
    subject: 'Chamado de suporte recebido — Hollywood Studio AI',
    html: `<p>Olá! Seu chamado foi recebido com sucesso.<br>
<b>Protocolo:</b> ${ticketId.slice(0, 8).toUpperCase()}<br>
<b>Assunto:</b> ${subject}<br><br>
Responderemos em até 48h úteis.<br><br>
<a href="https://hollywoodstudio.ai">Acessar o Estúdio →</a></p>`,
  });

  return res.status(200).json({
    ok: true,
    ticketId: ticketId.slice(0, 8).toUpperCase(),
    message: 'Chamado registrado com sucesso.',
  });
}

// ── /api/account/* ───────────────────────────────────────────────────────────

async function handleAccountExport(req, res) {
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  if (!hasSB()) {
    return res.status(200).json({
      ok: true,
      note: 'Supabase não configurado — dados disponíveis apenas localmente',
      user: { id: auth.supaUser.id, email: auth.supaUser.email },
    });
  }

  const [profile, transactions, payments, projects, favorites, uploads] = await Promise.all([
    sbQuery('profiles',            { filter: `id=eq.${auth.supaUser.id}`, single: true }),
    sbQuery('credit_transactions', { filter: `user_id=eq.${auth.supaUser.id}&order=created_at.desc&limit=500` }),
    sbQuery('payments',            { filter: `user_id=eq.${auth.supaUser.id}&order=created_at.desc&limit=100` }),
    sbQuery('projects',            { filter: `user_id=eq.${auth.supaUser.id}&order=created_at.desc&limit=500` }),
    sbQuery('favorites',           { filter: `user_id=eq.${auth.supaUser.id}&order=created_at.desc&limit=500` }),
    sbQuery('uploads',             { filter: `user_id=eq.${auth.supaUser.id}&order=created_at.desc&limit=500` }),
  ]);

  return res.status(200).json({
    ok: true,
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    transactions: transactions.data || [],
    payments: payments.data || [],
    projects: projects.data || [],
    favorites: favorites.data || [],
    uploads: uploads.data || [],
  });
}

async function handleAccountDelete(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const body = await readJsonBody(req);
  if (body.confirm !== 'EXCLUIR') {
    return res.status(400).json({ error: 'Confirmação necessária: envie confirm="EXCLUIR"' });
  }

  if (!hasSB()) {
    return res.status(200).json({ ok: true, note: 'Supabase não configurado — exclusão simulada', beta: true });
  }

  const userId = auth.supaUser.id;

  // Anonimizar/deletar dados do usuário
  await Promise.allSettled([
    sbDelete('favorites',           `user_id=eq.${userId}`),
    sbDelete('projects',            `user_id=eq.${userId}`),
    sbDelete('uploads',             `user_id=eq.${userId}`),
    sbDelete('gallery_items',       `user_id=eq.${userId}`),
    sbUpdate('profiles', `id=eq.${userId}`, {
      full_name: '[REMOVIDO]',
      avatar_url: null,
      updated_at: new Date().toISOString(),
    }),
  ]);

  // Deletar usuário no Supabase Auth via service role
  try {
    await fetch(`${sbUrl()}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'apikey': sbSvc(), 'Authorization': `Bearer ${sbSvc()}` },
    });
  } catch {}

  return res.status(200).json({ ok: true, message: 'Conta removida com sucesso.' });
}

// ── /api/admin/* ─────────────────────────────────────────────────────────────

async function handleAdminUsers(req, res) {
  const auth = await authenticate(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin only' });

  if (!hasSB()) return res.status(200).json({ ok: true, users: [], note: 'Supabase não configurado' });

  const q = getQuery(req);
  const limit = Math.min(parseInt(q.limit || '50', 10), 200);
  const { data } = await sbQuery('profiles', {
    select: 'id,email,full_name,role,plan,credits_balance,created_at,updated_at',
    filter: `order=created_at.desc&limit=${limit}`,
  });
  return res.status(200).json({ ok: true, users: data || [] });
}

async function handleAdminUsersUpdate(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const auth = await authenticate(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin only' });

  const body = await readJsonBody(req);
  const { userId, role, plan } = body;
  if (!userId) return res.status(400).json({ error: 'userId obrigatório' });

  if (!hasSB()) return res.status(200).json({ ok: true, note: 'Supabase não configurado' });

  const update = { updated_at: new Date().toISOString() };
  if (role)  update.role = role;
  if (plan)  update.plan = plan;

  await sbUpdate('profiles', `id=eq.${userId}`, update);
  return res.status(200).json({ ok: true });
}

async function handleAdminStatus(req, res) {
  const auth = await authenticate(req);
  if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin only' });

  const status = {
    supabase:     { configured: hasSB(),                            label: 'Supabase' },
    kv:           { configured: hasKV(),                            label: 'Vercel KV' },
    stripe:       { configured: !!process.env.STRIPE_SECRET_KEY,   label: 'Stripe' },
    stripe_wh:    { configured: !!process.env.STRIPE_WEBHOOK_SECRET,label: 'Stripe Webhook' },
    resend:       { configured: !!process.env.RESEND_API_KEY,       label: 'Resend Email' },
    openai:       { configured: !!process.env.OPENAI_API_KEY,       label: 'OpenAI' },
    claude:       { configured: !!process.env.ANTHROPIC_API_KEY,    label: 'Claude' },
    gemini:       { configured: !!process.env.GEMINI_API_KEY,       label: 'Gemini' },
    magnific:     { configured: !!process.env.MAGNIFIC_API_KEY,     label: 'Magnific API' },
    atlas:        { configured: !!(process.env.ATLAS_API_KEY || process.env.ATLAS_KEY), label: 'Atlas Cloud API' },
    google_auth:  { configured: !!process.env.GOOGLE_CLIENT_ID,     label: 'Google Auth' },
    app_url:      { configured: !!process.env.APP_URL,              label: 'APP_URL' },
    admin_emails: { configured: !!process.env.ADMIN_EMAILS,         label: 'Admin Emails' },
  };

  const readyCount = Object.values(status).filter(s => s.configured).length;
  const totalCount = Object.keys(status).length;

  return res.status(200).json({
    ok: true,
    readiness: `${readyCount}/${totalCount}`,
    services: status,
    ts: new Date().toISOString(),
  });
}

async function handleAdminConfig(req, res) {
  if (req.method === 'GET') {
    const auth = await authenticate(req);
    const admin = auth && isAdmin(auth);
    try {
      const cfg = await loadConfig();
      const safe = {
        ...cfg,
        PROVIDERS: Object.fromEntries(
          Object.entries(cfg.PROVIDERS || {}).map(([k, v]) => [k, { base: v.base, hasKey: !!v.key }])
        ),
        GOOGLE_CLIENT_ID: cfg.GOOGLE_CLIENT_ID || '',
        FEATURE_FLAGS: cfg.FEATURE_FLAGS || {},
      };
      if (!admin) {
        // Config pública: apenas flags e IDs públicos
        return res.status(200).json({
          ok: true,
          config: {
            GOOGLE_CLIENT_ID: safe.GOOGLE_CLIENT_ID,
            FREE_CREDITS: safe.FREE_CREDITS,
            TRIAL_CREDITS: safe.TRIAL_CREDITS,
            FEATURE_FLAGS: safe.FEATURE_FLAGS,
            PROVIDER: safe.PROVIDER,
          },
        });
      }
      return res.status(200).json({ ok: true, config: safe });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'POST') {
    const auth = await authenticate(req);
    if (!auth || !isAdmin(auth)) return res.status(403).json({ error: 'Admin only' });
    const body = await readJsonBody(req);
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'JSON inválido' });
    try {
      await saveConfig(body);
      return res.status(200).json({ ok: true, message: 'Configurações salvas.' });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// ──────────────────────────────────────────────────────────────────────────────
// CREATIVE FINISHER — camada de provedores (Magnific / Atlas / OpenAI / Claude)
// As chamadas HTTP reais ao Magnific/Atlas ainda NÃO são feitas: sem a chave
// configurada retornamos status "not_configured"; com a chave, "pending_integration".
// Créditos NUNCA são debitados enquanto o provedor não responder com sucesso.
// ──────────────────────────────────────────────────────────────────────────────

function hasMagnific() { return !!process.env.MAGNIFIC_API_KEY; }
function hasAtlasFinisher() { return !!(process.env.ATLAS_API_KEY || process.env.ATLAS_KEY); }

async function callMagnificTool(tool, payload = {}) {
  if (!hasMagnific()) {
    return {
      ok: false,
      status: 'not_configured',
      message: 'Magnific API ainda não configurada. Configure MAGNIFIC_API_KEY nas variáveis de ambiente da Vercel.',
      tool,
    };
  }
  // Integração HTTP real será adicionada aqui (endpoint + payload Magnific).
  log('info', '[finisher] callMagnificTool (pending integration)', tool, Object.keys(payload || {}));
  return {
    ok: false,
    status: 'pending_integration',
    message: 'Chave Magnific detectada. A integração HTTP desta ferramenta será ativada em breve.',
    tool,
  };
}

async function callAtlasTool(model, payload = {}) {
  if (!hasAtlasFinisher()) {
    return {
      ok: false,
      status: 'not_configured',
      message: 'Atlas Cloud API ainda não configurada. Configure ATLAS_API_KEY nas variáveis de ambiente da Vercel.',
      model,
    };
  }
  log('info', '[finisher] callAtlasTool (pending integration)', model, Object.keys(payload || {}));
  return {
    ok: false,
    status: 'pending_integration',
    message: 'Chave Atlas detectada. A integração HTTP desta ferramenta será ativada em breve.',
    model,
  };
}

/** Texto via OpenAI com interface de payload do Finisher */
async function callOpenAIText(payload = {}) {
  const { prompt = '', system = '', model = 'gpt-4o-mini' } = payload;
  return callOpenAI(prompt, system, model);
}

/** Texto via Claude com interface de payload do Finisher */
async function callClaudeText(payload = {}) {
  const { prompt = '', system = '' } = payload;
  return callClaude(prompt, system);
}

/** Catálogo backend dos tools do Finisher (custo, premium, provedor padrão) */
const FINISHER_TOOLS = {
  'image-to-prompt':   { id: 'image_to_prompt',   credits: 1, premium: false, provider: 'ai-text'  },
  'improve-prompt':    { id: 'improve_prompt',    credits: 1, premium: false, provider: 'ai-text'  },
  'upscale':           { id: 'upscale_premium',   credits: 5, premium: true,  provider: 'magnific' },
  'inpaint':           { id: 'inpainting',        credits: 5, premium: true,  provider: 'magnific' },
  'relight':           { id: 'relight',           credits: 5, premium: true,  provider: 'magnific' },
  'style-transfer':    { id: 'style_transfer',    credits: 5, premium: true,  provider: 'magnific' },
  'expand':            { id: 'image_expand',      credits: 3, premium: true,  provider: 'magnific' },
  'remove-background': { id: 'remove_background', credits: 2, premium: true,  provider: 'magnific' },
  'change-camera':     { id: 'change_camera',     credits: 5, premium: true,  provider: 'atlas'    },
  'lip-sync':          { id: 'lip_sync',          credits: 10, premium: true, provider: 'atlas'    },
};

function localImproveFallback(prompt, mediaType) {
  const base = mediaType === 'image'
    ? 'composição profissional, iluminação dramática, alta resolução, detalhes nítidos, qualidade de estúdio'
    : 'plano cinematográfico, iluminação volumétrica, câmera em travelling suave, profundidade de campo, color grading profissional, 4K';
  return `${prompt}, ${base}, sem aparência artificial`;
}

async function handleFinisher(req, res, toolPath) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  const tool = FINISHER_TOOLS[toolPath];
  if (!tool) return res.status(404).json({ ok: false, error: 'Ferramenta desconhecida', tool: toolPath });

  const body = await readJsonBody(req);
  const prompt = (body.prompt || '').toString().slice(0, 4000);
  const mediaType = body.mediaType === 'image' ? 'image' : 'video';

  // ── Ferramentas de texto: funcionam com OpenAI/Claude quando há chave, com fallback local
  if (tool.provider === 'ai-text') {
    if (toolPath === 'improve-prompt') {
      if (!prompt.trim()) return res.status(400).json({ ok: false, error: 'prompt obrigatório' });
      const system = 'Você é um especialista em prompts para geração de vídeo e imagem com IA. Reescreva o prompt do usuário em um prompt técnico, cinematográfico e detalhado (câmera, lente, luz, paleta, movimento). Responda APENAS com o prompt melhorado.';
      const aiResult = (await callOpenAIText({ prompt, system })) || (await callClaudeText({ prompt, system }));
      return res.status(200).json({
        ok: true,
        tool: tool.id,
        source: aiResult ? 'ai' : 'local',
        enhanced: aiResult || localImproveFallback(prompt, mediaType),
        creditsUsed: 0,
      });
    }
    // image-to-prompt: requer modelo de visão — sem chave, orienta; com chave de texto, gera prompt-base
    const imageRef = body.image || body.imageUrl || '';
    if (!imageRef) return res.status(400).json({ ok: false, error: 'image/imageUrl obrigatório' });
    const hasTextAI = !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
    if (!hasTextAI) {
      return res.status(200).json({
        ok: false,
        status: 'not_configured',
        tool: tool.id,
        message: 'Extração de prompt requer OPENAI_API_KEY ou ANTHROPIC_API_KEY configurada na Vercel.',
      });
    }
    const sys2 = 'Você descreve imagens como prompts técnicos de geração (estilo, luz, lente, composição, paleta). Gere um prompt técnico genérico de alta qualidade baseado no contexto fornecido.';
    const hint = (body.hint || '').toString().slice(0, 500);
    const aiR = (await callOpenAIText({ prompt: `Contexto da referência: ${hint || 'imagem de referência enviada pelo usuário'}. Gere o prompt técnico.`, system: sys2 }))
      || (await callClaudeText({ prompt: `Contexto da referência: ${hint || 'imagem de referência enviada pelo usuário'}. Gere o prompt técnico.`, system: sys2 }));
    return res.status(200).json({ ok: !!aiR, status: aiR ? 'ok' : 'error', tool: tool.id, prompt: aiR || '', creditsUsed: 0 });
  }

  // ── Ferramentas premium (Magnific / Atlas): exigem login; nunca debitam sem provedor configurado
  const providerConfigured = tool.provider === 'magnific' ? hasMagnific() : hasAtlasFinisher();
  if (!providerConfigured) {
    const provider = tool.provider === 'magnific' ? 'Magnific' : 'Atlas Cloud';
    const envVar = tool.provider === 'magnific' ? 'MAGNIFIC_API_KEY' : 'ATLAS_API_KEY';
    return res.status(200).json({
      ok: false,
      status: 'not_configured',
      tool: tool.id,
      message: `${provider} API ainda não configurada. Configure ${envVar} nas variáveis de ambiente da Vercel.`,
    });
  }

  const auth = await authenticate(req);
  if (!auth) return res.status(401).json({ ok: false, error: 'login_required', message: 'Faça login para usar ferramentas premium do Finishing Lab.' });

  const userId = auth.supaUser.id;
  const balance = await getUserCredits(userId);
  if (balance < tool.credits) {
    return res.status(402).json({ ok: false, error: 'insufficient_credits', required: tool.credits, balance, message: 'Créditos insuficientes — veja os planos para recarregar.' });
  }

  const payload = { ...body, userId };
  const result = tool.provider === 'magnific'
    ? await callMagnificTool(tool.id, payload)
    : await callAtlasTool(tool.id, payload);

  if (!result.ok) {
    // Falha/integração pendente — nenhum crédito foi debitado
    return res.status(200).json({ ...result, tool: tool.id, creditsUsed: 0 });
  }

  // Sucesso real do provedor: debita e registra transação
  const debit = await mutateCredits(userId, -tool.credits, 'use', `finisher:${tool.id}`, { tool: tool.id });
  return res.status(200).json({ ok: true, tool: tool.id, result, creditsUsed: tool.credits, balance: debit.balance });
}

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC GALLERY
// ──────────────────────────────────────────────────────────────────────────────

// Demos exibidos quando o Supabase não está configurado ou a query falha.
const DEMO_GALLERY_ITEMS = [
  {
    id: 'demo-1', user_id: null, title: 'Golden hour rooftop',
    prompt: 'Cinematic golden hour shot of a director on a city rooftop, anamorphic lens flare, 35mm film grain',
    media_type: 'image', media_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&q=70&auto=format&fit=crop',
    thumbnail_url: null, model: 'demo', aspect_ratio: '16:9', is_public: true, status: 'published',
    created_at: '2026-01-01T12:00:00Z',
  },
  {
    id: 'demo-2', user_id: null, title: 'Neon noir alley',
    prompt: 'Ultra realistic neon noir alley at night, rain reflections, moody cyan and magenta lighting, cinematic',
    media_type: 'image', media_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&q=70&auto=format&fit=crop',
    thumbnail_url: null, model: 'demo', aspect_ratio: '16:9', is_public: true, status: 'published',
    created_at: '2026-01-01T11:00:00Z',
  },
  {
    id: 'demo-3', user_id: null, title: 'Studio product hero',
    prompt: 'Luxury watch hero shot, dark studio background, golden rim light, macro detail, commercial photography',
    media_type: 'image', media_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&q=70&auto=format&fit=crop',
    thumbnail_url: null, model: 'demo', aspect_ratio: '1:1', is_public: true, status: 'published',
    created_at: '2026-01-01T10:00:00Z',
  },
];

async function handlePublicGallery(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  // Sem Supabase configurado → demo data (nunca erro pro cliente)
  if (!hasSB()) {
    return res.status(200).json({ ok: true, source: 'demo', items: DEMO_GALLERY_ITEMS });
  }

  const { data, error } = await sbQuery('public_gallery_items', {
    select: 'id,user_id,title,prompt,media_type,media_url,thumbnail_url,model,aspect_ratio,is_public,status,created_at',
    filter: 'is_public=eq.true&status=eq.published&order=created_at.desc&limit=60',
  });

  if (error || !Array.isArray(data)) {
    log('error', '[public-gallery]', error || 'unexpected response');
    return res.status(200).json({ ok: true, source: 'demo', items: DEMO_GALLERY_ITEMS });
  }

  return res.status(200).json({ ok: true, source: 'supabase', items: data });
}

// ──────────────────────────────────────────────────────────────────────────────
// BETA FALLBACK
// ──────────────────────────────────────────────────────────────────────────────

function betaFallback(req, res, path) {
  return res.status(200).json({
    ok: true,
    status: 'beta',
    message: 'Endpoint preparado para integração futura.',
    path: req.url || `/api/${path}`,
    supabaseConfigured: hasSB(),
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// ROUTER
// ──────────────────────────────────────────────────────────────────────────────

const ROUTES = {
  'health':                  handleHealth,
  'health/details':          handleHealthDetails,
  // Auth
  'auth/google':             handleAuthGoogle,
  'auth/session':            handleAuthSession,
  // Credits
  'credits/balance':         handleCreditsBalance,
  'credits/use':             handleCreditsUse,
  'credits/history':         handleCreditsHistory,
  'credits/check':           handleCreditsCheck,           // legado
  // Admin Credits
  'admin/credits/add':       handleAdminCreditsAdd,
  // Payments
  'payments/checkout':       handlePaymentsCheckout,
  'payments/webhook':        handlePaymentsWebhook,
  'payments/history':        handlePaymentsHistory,
  'stripe/webhook':          handlePaymentsWebhook,        // legado
  // Uploads
  'uploads/list':            handleUploadsList,
  'uploads/register':        handleUploadsRegister,
  // Gallery
  'gallery/list':            handleGalleryList,
  'gallery/save':            handleGallerySave,
  // Public Gallery (sem auth — leitura pública, com fallback demo)
  'public-gallery':          handlePublicGallery,
  'public/gallery':          handlePublicGallery,
  // Favorites
  'favorites/list':          handleFavoritesList,
  'favorites/save':          handleFavoritesSave,
  'favorites/delete':        handleFavoritesDelete,
  // Projects
  'projects/list':           handleProjectsList,
  'projects/save':           handleProjectsSave,
  'projects/delete':         handleProjectsDelete,
  // AI
  'ai/enhance-prompt':       handleAIEnhancePrompt,
  'ai/creative-board':       handleAICreativeBoard,
  'ai/social-caption':       handleAISocialCaption,
  'ai/storyboard':           handleAIStoryboard,
  // Email
  'email/send':              handleEmailSend,
  // Support
  'support/ticket':          handleSupportTicket,
  // Account
  'account/export':          handleAccountExport,
  'account/delete':          handleAccountDelete,
  // Admin
  'admin/users':             handleAdminUsers,
  'admin/users/update':      handleAdminUsersUpdate,
  'admin/status':            handleAdminStatus,
  'admin/config':            handleAdminConfig,
  // Creative Finisher (Magnific / Atlas / OpenAI / Claude)
  'finisher/image-to-prompt':   (req, res) => handleFinisher(req, res, 'image-to-prompt'),
  'finisher/improve-prompt':    (req, res) => handleFinisher(req, res, 'improve-prompt'),
  'finisher/upscale':           (req, res) => handleFinisher(req, res, 'upscale'),
  'finisher/inpaint':           (req, res) => handleFinisher(req, res, 'inpaint'),
  'finisher/relight':           (req, res) => handleFinisher(req, res, 'relight'),
  'finisher/style-transfer':    (req, res) => handleFinisher(req, res, 'style-transfer'),
  'finisher/expand':            (req, res) => handleFinisher(req, res, 'expand'),
  'finisher/remove-background': (req, res) => handleFinisher(req, res, 'remove-background'),
  'finisher/change-camera':     (req, res) => handleFinisher(req, res, 'change-camera'),
  'finisher/lip-sync':          (req, res) => handleFinisher(req, res, 'lip-sync'),
};

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = getApiPath(req);

  // Log de acesso (apenas dev)
  log('info', `${req.method} /api/${path}`);

  const routeHandler = ROUTES[path];
  if (routeHandler) {
    try { return await routeHandler(req, res); }
    catch (err) {
      log('error', `[api/${path}]`, err.message, err.stack?.slice(0, 300));
      return res.status(500).json({ ok: false, error: 'Internal server error', path });
    }
  }

  return betaFallback(req, res, path);
}
