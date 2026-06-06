import config from "@/lib/config";
import { UserService } from "./user";
import { prisma } from "@/lib/prisma";

/**
 * Custo em créditos (segundos) por geração.
 * 1 crédito = 1 segundo de vídeo na lógica Hollywood Studio AI.
 * Aqui adicionamos multiplicadores por resolução e qualidade.
 */
export function getCreditCost(mode, duration, quality = "basic", resolution = "720p") {
  const isReference = mode === "reference-to-video";
  const is720p = resolution === "720p";
  let rate;

  if (isReference) {
    rate = is720p ? (quality === "high" ? 2.0 : 1.5) : (quality === "high" ? 1.6 : 1.2);
  } else {
    rate = is720p ? (quality === "high" ? 1.5 : 1.0) : (quality === "high" ? 1.2 : 0.8);
  }

  // Custo mínimo = 1 crédito
  return Math.max(1, Math.ceil(duration * rate));
}

export const AIService = {
  getCreditCost,

  async generate(userId, params) {
    const { mode, prompt, aspect_ratio = "16:9", resolution = "720p", duration = 5, quality = "basic", images_list = [], video_files = [], audio_files = [], model = "seedance2" } = params;

    const cost = getCreditCost(mode, duration, quality, resolution);
    await UserService.deductCredits(userId, cost);

    // Decide provider: BytePlus (direto) ou muapi (fallback)
    const useBytePlus = !config.ai.muapi.enabled && !!config.ai.byteplus.apiKey;

    let request_id;

    if (useBytePlus) {
      request_id = await _generateByteplus({ mode, prompt, aspect_ratio, resolution, duration, quality, images_list, video_files, audio_files, userId });
    } else {
      request_id = await _generateMuapi({ mode, prompt, aspect_ratio, resolution, duration, quality, images_list, video_files, audio_files, userId });
    }

    await prisma.creation.create({
      data: {
        userId, prompt,
        model: model || "seedance2",
        provider: useBytePlus ? "byteplus" : "muapi",
        aspectRatio: aspect_ratio,
        resolution,
        duration: parseInt(duration),
        quality,
        mode,
        videoFiles: video_files,
        audioFiles: audio_files,
        inputImages: images_list,
        requestId: request_id,
        status: "processing",
        creditsUsed: cost,
      },
    });

    return { request_id, cost };
  },

  async edit(userId, params) {
    return this.generate(userId, { ...params, mode: "reference-to-video" });
  },

  async checkStatus(requestId) {
    const creation = await prisma.creation.findUnique({ where: { requestId } });
    if (!creation) return { status: "processing" };
    if (creation.status === "completed") return { status: "completed", imageUrl: creation.imageUrl, thumbnailUrl: creation.thumbnailUrl };
    if (creation.status === "failed") throw new Error(creation.error || "Geração falhou");
    return { status: "processing" };
  },
};

// ── BytePlus ModelArk ──────────────────────────────
async function _generateByteplus({ mode, prompt, aspect_ratio, resolution, duration, quality, images_list, userId }) {
  const { apiKey, baseUrl, models } = config.ai.byteplus;
  if (!apiKey) throw new Error("BYTEPLUS_API_KEY não configurado");

  const isI2V = mode === "image-to-video" || (mode === "reference-to-video" && images_list.length > 0);
  const modelKey = isI2V ? `i2v-${resolution}` : `t2v-${resolution}`;
  const modelId = models[modelKey] || models["t2v-720p"];

  const webhookUrl = `${config.app.webhookUrl}/api/webhook/byteplus`;

  const payload = {
    model: modelId,
    content: [{ type: "text", text: prompt }],
    parameters: {
      aspect_ratio,
      duration: parseInt(duration),
      quality: quality === "high" ? "high" : "standard",
    },
  };

  if (isI2V && images_list.length > 0) {
    payload.content.unshift({ type: "image_url", image_url: { url: images_list[0] } });
  }

  const res = await fetch(`${baseUrl}/api/v3/contents/generations/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...payload, webhook: webhookUrl }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`BytePlus API Error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const request_id = data.id || data.request_id || data.task_id;
  if (!request_id) throw new Error("BytePlus: nenhum request_id recebido");
  return request_id;
}

// ── muapi.ai (compatibilidade boilerplate) ─────────
async function _generateMuapi({ mode, prompt, aspect_ratio, resolution, duration, quality, images_list, video_files, audio_files, userId }) {
  const { apiKey, endpoints } = config.ai.muapi;
  if (!apiKey) throw new Error("SEEDANCE_V2_API_KEY não configurado");

  let type;
  if (mode === "text-to-video") type = "t2v";
  else if (mode === "image-to-video") type = "i2v";
  else type = "reference";

  const endpoint = endpoints[type]?.[resolution];
  if (!endpoint) throw new Error(`Endpoint não encontrado para ${mode} ${resolution}`);

  const webhookUrl = `${config.app.webhookUrl}/api/webhook/byteplus`;
  const submitUrl = `${endpoint}?webhook=${encodeURIComponent(webhookUrl)}`;

  const payload = { prompt, aspect_ratio, duration: parseInt(duration), quality };
  if (type !== "t2v") payload.images_list = images_list.slice(0, 9);
  if (type === "reference") {
    payload.video_files = video_files.slice(0, 3);
    payload.audio_files = audio_files.slice(0, 3);
  }

  const res = await fetch(submitUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`muapi Error: ${res.status} ${err}`);
  }

  const { request_id } = await res.json();
  if (!request_id) throw new Error("muapi: nenhum request_id recebido");
  return request_id;
}
