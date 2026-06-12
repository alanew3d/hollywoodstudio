// api/stripe-webhook.js
// Vercel Serverless Function — POST /api/stripe-webhook
// Processa checkout.session.completed e atualiza créditos no Supabase
// Secrets via Vercel Environment Variables (nunca no frontend)

const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service role NUNCA vai ao frontend
);

const CREDITS_BY_PLAN = {
  pro:   1000,
  ultra: 10000,
};

// Vercel precisa do raw body para verificar assinatura Stripe
export const config = { api: { bodyParser: false } };

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await rawBody(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Assinatura inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object;
    const userId   = session.metadata?.userId;
    const plan     = session.metadata?.plan;
    const credits  = CREDITS_BY_PLAN[plan] || 0;
    const customerId = session.customer;
    const subId      = session.subscription;

    if (!userId || !credits) {
      console.warn('[webhook] userId ou plano ausente no metadata.', { userId, plan });
      return res.status(200).json({ received: true });
    }

    try {
      // Incrementar créditos no profile
      await supabase.rpc('increment_credits', { p_user_id: userId, p_amount: credits });

      // Registrar transação
      await supabase.from('credit_transactions').insert({
        user_id:     userId,
        amount:      credits,
        type:        'purchase',
        description: `Plano ${plan} — checkout ${session.id}`,
        stripe_session_id: session.id,
      });

      // Registrar assinatura
      await supabase.from('subscriptions').upsert({
        user_id:             userId,
        plan,
        stripe_customer_id:  customerId,
        stripe_subscription_id: subId,
        status:              'active',
        updated_at:          new Date().toISOString(),
      }, { onConflict: 'user_id' });

      console.log(`[webhook] +${credits} créditos para userId=${userId} (plano ${plan})`);
    } catch (err) {
      console.error('[webhook] Erro ao atualizar Supabase:', err.message);
      // Retorna 200 para o Stripe não reenviar; logue o erro manualmente
    }
  }

  return res.status(200).json({ received: true });
};
