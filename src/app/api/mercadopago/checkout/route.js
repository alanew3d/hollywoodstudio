import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { MercadoPagoService } from "@/lib/services/billing";
import config from "@/lib/config";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { planId } = await req.json();
    if (!planId || !config.plans[planId]) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const result = await MercadoPagoService.createPreference(session.user.id, planId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[MP_CHECKOUT]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
