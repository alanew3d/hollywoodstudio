// api/create-checkout-session.js
// POST /api/create-checkout-session
// Creates a Stripe Checkout Session (subscription mode).

import Stripe from 'stripe';

const PLAN_PRICES = {
  pro:   process.env.STRIPE_PRICE_PRO,
  ultra: process.env.STRIPE_PRICE_ULTRA,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(500).json({
    error: 'Stripe not configured. Add STRIPE_SECRET_KEY to Vercel environment variables.'
  });

  const { plan, userId, email } = req.body || {};
  const priceId = PLAN_PRICES[plan];
  if (!priceId) return res.status(400).json({ error: `Unknown plan "${plan}". Valid: pro, ultra` });

  const siteUrl = process.env.SITE_URL || 'https://hollywoodstudio.ai';

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/?checkout=success#criar`,
      cancel_url:  `${siteUrl}/?checkout=cancel#plans`,
      client_reference_id: userId || undefined,
      customer_email: email || undefined,
      metadata: { plan, userId: userId || '' },
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[create-checkout-session]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
