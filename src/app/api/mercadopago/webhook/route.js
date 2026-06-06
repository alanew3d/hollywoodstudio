import { NextResponse } from "next/server";
import { MercadoPagoService } from "@/lib/services/billing";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("[MP_WEBHOOK] Received:", JSON.stringify(body).slice(0, 200));

    const result = await MercadoPagoService.handleWebhook(body);

    if (result.success) {
      console.log(`[MP_WEBHOOK] ✓ Pagamento aprovado: userId=${result.userId}, +${result.credits}cr`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[MP_WEBHOOK_ERROR]", error);
    // MP requer 200 mesmo em erro para não retentar indefinidamente
    return new NextResponse(null, { status: 200 });
  }
}

// MercadoPago também usa GET para validação de webhook
export async function GET(req) {
  return NextResponse.json({ status: "ok" });
}
