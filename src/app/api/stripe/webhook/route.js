import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { StripeService } from "@/lib/services/billing";

export async function POST(req) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  try {
    await StripeService.handleWebhook(body, signature);
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK]", error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
}
