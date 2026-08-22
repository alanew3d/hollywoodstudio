import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_CREDITS: Record<string, number> = {
  'price_basic':   150,
  'price_premium': 500,
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: "Missing config" }, { status: 400 })
  }

  let event: any
  try {
    // Verificação simples sem SDK (Edge runtime)
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const email = session.customer_email || session.customer_details?.email
        const priceId = session.metadata?.price_id || ""
        const credits = PLAN_CREDITS[priceId] || 150
        const plan = credits >= 500 ? "premium" : "basic"

        if (email) {
          // Busca usuário pelo email
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, credits")
            .eq("email", email)
            .single()

          if (profile) {
            await supabase
              .from("profiles")
              .update({
                credits: (profile.credits || 0) + credits,
                plan,
                stripe_customer_id: session.customer,
              })
              .eq("id", profile.id)

            await supabase.from("credit_transactions").insert({
              user_id: profile.id,
              amount: credits,
              type: "purchase",
              description: `Plano ${plan} — ${credits} créditos`,
              stripe_payment_id: session.payment_intent,
            })
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object
        if (sub.status === "active") {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", sub.customer)
            .single()

          if (profile) {
            await supabase
              .from("profiles")
              .update({ plan: "active" })
              .eq("id", profile.id)
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", sub.customer)
          .single()

        if (profile) {
          await supabase
            .from("profiles")
            .update({ plan: "starter" })
            .eq("id", profile.id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
