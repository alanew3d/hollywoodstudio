// api/create-checkout-session.js
// Vercel Serverless Function — POST /api/create-checkout-session
// Secrets via Vercel Environment Variables (nunca no frontend)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  pro:   process.env.STRIPE_PRICE_PRO,
  ultra: process.env.STRIPE_PRICE_ULTRA,
};

module.exports = async function handler(req, res) {
  // CORS permissivo para o próprio domínio
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || 'https://hollywoodstudio.ai');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plan, userId, email } = req.body || {};

  if (!plan || !PRICE_MAP[plan]) {
    return res.status(400).json({ error: 'Plano inválido. Use "pro" ou "ultra".' });
  }
  if (!userId) {
    return res.status(400).json({ error: 'userId obrigatório.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_MAP[plan], quantity: 1 }],
      customer_email: email || undefined,
      metadata: { userId, plan },
      success_url: (process.env.SITE_URL || 'https://hollywoodstudio.ai') + '/?checkout=success#criar',
      cancel_url:  (process.env.SITE_URL || 'https://hollywoodstudio.ai') + '/?checkout=cancel#plans',
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[checkout]', err.message);
    return res.status(500).json({ error: err.message });
  }
};
