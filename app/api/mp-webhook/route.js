export const runtime = 'edge'

// Planos MP → créditos
const PLAN_CREDITS = {
  'Hollywood Studio AI — Básico':   200,
  'Hollywood Studio AI — Premium':  700,
  'Hollywood Studio AI — Agências': 2000,
}

export async function POST(req) {
  try {
    const body = await req.json()
    console.log('MP Webhook:', JSON.stringify(body))

    // Mercado Pago envia notificação de pagamento aprovado
    if (body.action === 'payment.created' || body.type === 'payment') {
      const paymentId = body.data?.id
      
      // Busca detalhes do pagamento na API do MP
      const mpKey = process.env.MP_ACCESS_TOKEN
      if (mpKey && paymentId) {
        const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { 'Authorization': `Bearer ${mpKey}` }
        })
        const payment = await res.json()
        
        if (payment.status === 'approved') {
          const planName = payment.additional_info?.items?.[0]?.title || ''
          const credits = PLAN_CREDITS[planName] || 200
          const email = payment.payer?.email

          // TODO: salvar no Supabase
          console.log(`Créditos a adicionar: ${credits} para ${email}`)
          
          // Chama API interna para adicionar créditos
          // await addCreditsToUser(email, credits)
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}
