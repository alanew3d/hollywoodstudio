import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { createClient } = await import("@supabase/supabase-js")
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await req.text()
    let event: any
    
    try { event = JSON.parse(body) } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const PLAN_CREDITS: Record<string, number> = {
      'price_basic': 150,
      'price_premium': 500,
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const email = session.customer_email || session.customer_details?.email
        const priceId = session.metadata?.price_id || ""
        const credits = PLAN_CREDITS[priceId] || 150
        const plan = credits >= 500 ? "premium" : "basic"

        if (email) {
          const { data: profile } = await supabase
            .from("profiles").select("id, credits").eq("email", email).single()

          if (profile) {
            await supabase.from("profiles").update({
              credits: (profile.credits || 0) + credits,
              plan,
              stripe_customer_id: session.customer,
            }).eq("id", profile.id)

            await supabase.from("credit_transactions").insert({
              user_id: profile.id, amount: credits, type: "purchase",
              description: `Plano ${plan} — ${credits} créditos`,
              stripe_payment_id: session.payment_intent,
            })
          }
        }
        break
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object
        const { data: profile } = await supabase
          .from("profiles").select("id").eq("stripe_customer_id", sub.customer).single()
        if (profile) {
          await supabase.from("profiles").update({ plan: "starter" }).eq("id", profile.id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
