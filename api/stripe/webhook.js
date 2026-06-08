/**
 * api/stripe/webhook.js
 * Recebe confirmação de pagamento do Stripe e adiciona créditos ao usuário via Vercel KV.
 *
 * Configure no Stripe Dashboard:
 *   Webhooks → Add endpoint → https://hollywoodstudio.ai/api/stripe/webhook
 *   Evento: checkout.session.completed
 *
 * Env vars obrigatórias:
 *   STRIPE_SECRET_KEY      — sk_live_... ou sk_test_...
 *   STRIPE_WEBHOOK_SECRET  — whsec_...
 *   KV_REST_API_URL        — URL do Vercel KV (Upstash)
 *   KV_REST_API_TOKEN      — Token do Vercel KV
 */

import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

const PLAN_CREDITS = {
  basico:   150,
  premium:  300,
  avancado: 600,
  t100:     100,
  t300:     300,
  t700:     700,
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end',   () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey) {
    console.error('[stripe/webhook] STRIPE_SECRET_KEY env var not set');
    return res.status(503).json({ error: 'Stripe not configured on server' });
  }
  if (!webhookSecret) {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET env var not set');
    return res.status(503).json({ error: 'Webhook secret not configured on server' });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object;
    const userId   = session.metadata?.userId  || session.client_reference_id || null;
    const planId   = session.metadata?.planId  || session.metadata?.plan      || null;
    const credits  = parseInt(session.metadata?.credits || PLAN_CREDITS[planId] || 0, 10);
    const email    = session.customer_details?.email || session.metadata?.email || null;
    const amount   = ((session.amount_total || 0) / 100).toFixed(2);

    console.log(`[stripe/webhook] Payment OK — email=${email} plan=${planId} +${credits}cr R$${amount}`);

    if (credits > 0 && (userId || email)) {
      const kvOk = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
      if (kvOk) {
        try {
          const key      = userId ? `credits:uid:${userId}` : `credits:email:${email}`;
          const existing = await kvGet(key);
          const current  = existing !== null ? parseInt(existing, 10) : 0;
          await kvSet(key, String(current + credits), 86400 * 7);
          console.log(`[stripe/webhook] KV updated — ${key} = ${current + credits}`);
        } catch (kvErr) {
          console.error('[stripe/webhook] KV error:', kvErr.message);
        }
      } else {
        console.warn('[stripe/webhook] KV not configured — credits not persisted server-side');
      }
    }
  }

  return res.status(200).json({ received: true });
}

// ── Vercel KV / Upstash REST helpers ────────────────────────────────────────
async function kvSet(key, value, ttlSeconds) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const path  = ttlSeconds
    ? `/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}/ex/${ttlSeconds}`
    : `/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`;
  const r = await fetch(`${url}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`KV set failed: ${r.status}`);
}

async function kvGet(key) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d.result ?? null;
}
