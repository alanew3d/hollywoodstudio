import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook unificado para callbacks de geração.
 * Suporta formato BytePlus ModelArk e muapi.ai.
 * URL: /api/webhook/byteplus (usado para ambos)
 */
export async function POST(req) {
  try {
    const data = await req.json();
    console.log("[GEN_WEBHOOK] Payload:", JSON.stringify(data).slice(0, 300));

    // Detecta o formato do payload
    // BytePlus: { id, status, output: { video_urls: [...] } }
    // muapi.ai: { id, outputs: ["url1"], error }
    const requestId = data.id || data.request_id;

    if (!requestId) {
      console.error("[GEN_WEBHOOK] Missing request_id:", data);
      return NextResponse.json({ error: "Missing request_id" }, { status: 400 });
    }

    const creation = await prisma.creation.findUnique({ where: { requestId } });

    if (!creation) {
      console.warn(`[GEN_WEBHOOK] Creation not found: ${requestId}`);
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    // Já processado — idempotente
    if (creation.status === "completed") {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // Verifica erro
    const hasError = data.error && data.error !== "";

    if (hasError) {
      await prisma.creation.update({
        where: { id: creation.id },
        data: { status: "failed", error: String(data.error) },
      });
      console.error(`[GEN_WEBHOOK] Generation failed for ${requestId}:`, data.error);
      return NextResponse.json({ success: true });
    }

    // Extrai URL do vídeo
    let videoUrl = null;

    // Formato BytePlus
    if (data.output?.video_urls?.length > 0) {
      videoUrl = data.output.video_urls[0];
    }
    // Formato BytePlus alternativo
    else if (data.output?.url) {
      videoUrl = data.output.url;
    }
    // Formato muapi (outputs array)
    else if (data.outputs?.length > 0) {
      videoUrl = data.outputs[0];
    }
    // Formato genérico
    else if (data.url) {
      videoUrl = data.url;
    }

    if (!videoUrl && data.status !== "completed") {
      // Ainda processando
      return NextResponse.json({ success: true, status: "still_processing" });
    }

    await prisma.creation.update({
      where: { id: creation.id },
      data: {
        status: "completed",
        imageUrl: videoUrl,
      },
    });

    console.log(`[GEN_WEBHOOK] ✓ Completed: ${requestId} → ${videoUrl?.slice(0, 60)}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[GEN_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
