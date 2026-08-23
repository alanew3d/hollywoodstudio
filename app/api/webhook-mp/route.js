// Webhook do Mercado Pago → adiciona créditos no Supabase
export const runtime = 'edge'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const MP_TOKEN = process.env.MP_ACCESS_TOKEN

// Mapeamento: plano → créditos
const PLAN_MAP = {
  '18S6Euq': { credits: 200, plan: 'basico',   desc: 'Plano Básico R$99' },
  '1oH3qf6': { credits: 700, plan: 'premium',  desc: 'Plano Premium R$299' },
  '1rFDpXm': { credits: 2000, plan: 'agencias', desc: 'Plano Agências R$799' },
  // Top-ups avulsos
  'topup5':  { credits: 50,  plan: null, desc: 'Top-up $5' },
  'topup10': { credits: 110, plan: null, desc: 'Top-up $10' },
  'topup15': { credits: 180, plan: null, desc: 'Top-up $15' },
  'topup20': { credits: 250, plan: null, desc: 'Top-up $20' },
}

async function supaRPC(fn, params) {
  const res = await fetch(`${SUPA_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  })
  return res.json()
}

async function getPaymentDetails(paymentId) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { 'Authorization': `Bearer ${MP_TOKEN}` }
  })
  return res.json()
}

export async function POST(req) {
  try {
    const body = await req.json()
    console.log('[MP Webhook]', JSON.stringify(body).slice(0, 200))

    // MP envia: { type: 'payment', data: { id: '...' } }
    if (body.type !== 'payment' && body.action !== 'payment.created') {
      return ok({ received: true, action: 'ignored' })
    }

    const paymentId = body.data?.id
    if (!paymentId) return ok({ received: true, action: 'no_payment_id' })

    // Busca detalhes do pagamento
    const payment = await getPaymentDetails(paymentId)

    // Só processa pagamentos aprovados
    if (payment.status !== 'approved') {
      return ok({ received: true, action: `status_${payment.status}` })
    }

    const email = payment.payer?.email
    if (!email) return ok({ received: true, action: 'no_email' })

    // Detecta qual plano pelo external_reference ou description
    const ref = payment.external_reference || ''
    const desc = payment.description || ''

    let planData = null
    for (const [key, data] of Object.entries(PLAN_MAP)) {
      if (ref.includes(key) || desc.includes(key)) {
        planData = data
        break
      }
    }

    // Fallback: detecta pelo valor
    if (!planData) {
      const amount = payment.transaction_amount
      if (amount >= 790) planData = PLAN_MAP['1rFDpXm']
      else if (amount >= 290) planData = PLAN_MAP['1oH3qf6']
      else if (amount >= 90) planData = PLAN_MAP['18S6Euq']
      else if (amount >= 100) planData = PLAN_MAP['topup20']
      else if (amount >= 75) planData = PLAN_MAP['topup15']
      else if (amount >= 50) planData = PLAN_MAP['topup10']
      else planData = PLAN_MAP['topup5']
    }

    // Adiciona créditos via função Supabase
    const result = await supaRPC('add_credits', {
      p_email: email,
      p_amount: planData.credits,
      p_plan: planData.plan,
      p_description: planData.desc,
      p_reference_id: String(paymentId)
    })

    console.log('[MP Webhook] Créditos adicionados:', email, planData.credits, result)

    return ok({
      received: true,
      email,
      credits_added: planData.credits,
      plan: planData.plan,
      result
    })

  } catch(e) {
    console.error('[MP Webhook Error]', e.message)
    return ok({ received: true, error: e.message }, 500)
  }
}

function ok(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
