/**
 * api/stripe/webhook.js
 * Recebe confirmação de pagamento do Stripe e adiciona créditos ao usuário.
 *
 * Configure no Stripe Dashboard:
 * Webhooks → Add endpoint → https://hollywoodstudio.vercel.app/api/stripe/webhook
 * Evento: checkout.session.completed
 */

import Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(Buffer.from(data)));
    req.on('error', reject);
  });
}

// Planos e créditos correspondentes
const PLAN_CREDITS = {
  basico:   150,
  premium:  300,
  avancado: 600,
  t100:     100,
  t300:     300,
  t700:     700,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe/webhook] Signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId   = session.metadata?.userId   || session.client_reference_id;
    const planId   = session.metadata?.planId   || session.metadata?.plan;
    const credits  = parseInt(session.metadata?.credits || PLAN_CREDITS[planId] || 0);
    const email    = session.customer_details?.email || session.metadata?.email;
    const amount   = (session.amount_total || 0) / 100;

    console.log(`[stripe/webhook] Payment confirmed: ${email} | plan=${planId} | +${credits}cr | R$${amount}`);

    // If you have a database: update user credits here.
    // For the HTML-only version: the HTML polls /api/credits/check?email=...
    // and the webhook stores a pending credit grant in Vercel KV.

    if (process.env.KV_REST_API_URL && credits > 0 && (userId || email)) {
      try {
        const key = userId ? `credits:uid:${userId}` : `credits:email:${email}`;
        const existing = await kvGet(key);
        const current = existing ? parseInt(existing) : 0;
        await kvSet(key, String(current + credits), 86400 * 7); // TTL 7 days
        console.log(`[stripe/webhook] KV updated: ${key} = ${current + credits}`);
      } catch (kvErr) {
        console.error('[stripe/webhook] KV error:', kvErr);
      }
    }
  }

  return res.status(200).json({ received: true });
}

// Vercel KV helpers (uses REDIS_URL or KV_REST_API_URL env vars)
async function kvSet(key, value, ttl) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  await fetch(`${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}${ttl ? `/ex/${ttl}` : ''}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}
async function kvGet(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const d = await r.json();
  return d.result;
}
