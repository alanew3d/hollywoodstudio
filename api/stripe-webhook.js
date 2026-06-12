// api/stripe-webhook.js
// POST /api/stripe-webhook
// Handles Stripe events: checkout.session.completed,
//   customer.subscription.updated, customer.subscription.deleted,
//   invoice.payment_failed

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const PLAN_CREDITS = { pro: 1000, ultra: 10000 };

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
  return createClient(url, key);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) return res.status(500).json({ error: 'Stripe env vars not configured.' });

  // Read raw body for signature verification
  let rawBody = '';
  try {
    rawBody = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
  } catch { return res.status(400).json({ error: 'Cannot read body' }); }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] Signature failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature error: ' + err.message });
  }

  console.log('[stripe-webhook] Event:', event.type);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const plan    = session.metadata?.plan;
      const userId  = session.metadata?.userId || session.client_reference_id;
      const credits = PLAN_CREDITS[plan];

      if (!userId || !credits) {
        console.warn('[stripe-webhook] Missing userId or unknown plan:', { userId, plan });
        return res.status(200).json({ received: true });
      }

      const supabase = getSupabase();

      // Upsert profile
      await supabase.from('profiles').upsert({ id: userId }, { onConflict: 'id' });

      // Get current credits
      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single();
      const currentCredits = profile?.credits || 0;

      // Update credits and plan
      await supabase.from('profiles')
        .update({ credits: currentCredits + credits, plan, updated_at: new Date().toISOString() })
        .eq('id', userId);

      // Log credit transaction (idempotent via stripe_event_id)
      await supabase.from('credit_transactions').upsert({
        user_id: userId,
        type: 'purchase',
        amount: credits,
        reason: `Plan ${plan} subscription`,
        stripe_session_id: session.id,
        stripe_event_id: event.id,
        metadata: { plan, session_id: session.id },
      }, { onConflict: 'stripe_event_id' });

      // Log subscription
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        stripe_session_id: session.id,
        plan,
        status: 'active',
        credits_granted: credits,
        metadata: { event_id: event.id },
      }, { onConflict: 'stripe_subscription_id' });

      console.log(`[stripe-webhook] ✅ Credited ${credits} to user ${userId} (plan: ${plan})`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const supabase = getSupabase();
      await supabase.from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', sub.id);
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const supabase = getSupabase();
      await supabase.from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', invoice.subscription);
    }

  } catch (err) {
    console.error('[stripe-webhook] Handler error:', err.message);
    return res.status(500).json({ error: err.message });
  }

  return res.status(200).json({ received: true });
}
