import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/lib/services/ai";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { mode, prompt, aspect_ratio, resolution, duration, quality, model, images_list, video_files, audio_files } = body;

    if (!prompt && mode === "text-to-video") {
      return NextResponse.json({ error: "Prompt obrigatório" }, { status: 400 });
    }

    // Estima créditos antes de gerar (para o frontend mostrar)
    const { getCreditCost } = await import("@/lib/services/ai");
    const estimatedCost = getCreditCost(mode, duration, quality, resolution);

    let result;
    try {
      result = await AIService.generate(session.user.id, {
        mode, prompt, aspect_ratio, resolution, duration, quality, model, images_list, video_files, audio_files,
      });
    } catch (err) {
      if (err.message === "Créditos insuficientes") {
        return NextResponse.json(
          { error: "Créditos insuficientes", code: "INSUFFICIENT_CREDITS", required: estimatedCost },
          { status: 403 }
        );
      }
      throw err;
    }

    return NextResponse.json({
      ...result,
      estimatedCost,
      metadata: { prompt, aspect_ratio, resolution, duration, model },
    });
  } catch (error) {
    console.error("[AI_GENERATE]", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao gerar" },
      { status: 500 }
    );
  }
}
