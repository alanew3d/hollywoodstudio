import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/supabase/server"

const OR_MODELS: Record<string, { orModel: string; type: string }> = {
  "gemini-image":     { orModel: "google/gemini-2.5-flash-image", type: "image" },
  "gemini-image-pro": { orModel: "google/gemini-3.1-flash-image", type: "image" },
  "gpt-image-or":     { orModel: "openai/gpt-5-image-mini",       type: "image" },
  "gpt-image-or-pro": { orModel: "openai/gpt-5-image",            type: "image" },
  "gemini-2.5-flash": { orModel: "google/gemini-2.5-flash",       type: "chat" },
  "gpt-4o":           { orModel: "openai/gpt-4o",                 type: "chat" },
  "claude-sonnet":    { orModel: "anthropic/claude-sonnet-4-5",   type: "chat" },
  "grok-3":           { orModel: "x-ai/grok-3-fast",              type: "chat" },
}

async function callOpenRouter(orModel: string, type: string, prompt: string) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error("OPENROUTER_API_KEY não configurada")

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://hollywoodstudio.ai",
      "X-Title": "Hollywood Studio AI",
    },
    body: JSON.stringify({
      model: orModel,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  const text = await res.text()
  let data: any
  try { data = JSON.parse(text) } catch { throw new Error("Resposta inválida do OpenRouter") }
  if (!res.ok) throw new Error(data.error?.message || "OpenRouter error")

  const content = data.choices?.[0]?.message?.content
  if (type === "chat") return { type: "chat" as const, text: content, provider: "OpenRouter" }

  // Extract image from response
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block.type === "image_url") return { type: "image" as const, url: block.image_url?.url || block.image_url, provider: "OpenRouter" }
    }
  }
  if (typeof content === "string") {
    const match = content.match(/https?:\/\/\S+\.(jpg|jpeg|png|webp)/i)
    if (match) return { type: "image" as const, url: match[0], provider: "OpenRouter" }
    return { type: "chat" as const, text: content, provider: "OpenRouter" }
  }
  throw new Error("OpenRouter não retornou imagem")
}

async function callDirectProvider(model: string, prompt: string, options: any) {
  // BytePlus / Seedance
  if (model.startsWith("seedance")) {
    const key = process.env.BYTEPLUS_API_KEY
    if (!key) throw new Error("BYTEPLUS_API_KEY não configurada")
    const modelId = model === "seedance-2.5" ? "video-02" : "video-01"
    const res = await fetch("https://ark.ap-southeast.byteplusi.com/api/v3/contents/generations/tasks", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: modelId, content: [{ type: "text", text: prompt }], parameters: { duration: 5, resolution: "720p", aspect_ratio: options.ratio || "16:9" } }),
    })
    const d = await res.json()
    if (!res.ok) throw new Error(d.error?.message || "BytePlus error")
    return { type: "video_task" as const, taskId: d.id, provider: "BytePlus / Seedance" }
  }

  // fal.ai models
  const falModels: Record<string, string> = {
    "minimax-h3":    "fal-ai/minimax/video-01-live",
    "kling-3":       "fal-ai/kling-video/v1.6/pro/text-to-video",
    "wan-3":         "fal-ai/wan/v2.2/t2v",
    "wan-2.7":       "fal-ai/wan/v2.1/t2v",
    "runway-gen4":   "fal-ai/runway-gen4/turbo/text-to-video",
    "flux-pro":      "fal-ai/flux-pro",
    "nano-banana-pro": "fal-ai/flux/dev",
    "ideogram-v3":   "fal-ai/ideogram/v3",
  }
  if (falModels[model]) {
    const key = process.env.FAL_KEY
    if (!key) throw new Error("FAL_KEY não configurada")
    const isVideo = ["minimax-h3","kling-3","wan-3","wan-2.7","runway-gen4"].includes(model)
    const res = await fetch(`https://fal.run/${falModels[model]}`, {
      method: "POST",
      headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, ...(isVideo ? { duration: 5, aspect_ratio: options.ratio || "16:9" } : { image_size: "square_hd", num_images: 1 }) }),
    })
    const d = await res.json()
    if (!res.ok) throw new Error(d.detail || "fal.ai error")
    if (!isVideo) return { type: "image" as const, url: d.images?.[0]?.url, provider: "fal.ai" }
    const url = d.video?.url
    if (url) return { type: "video" as const, url, provider: "fal.ai" }
    return { type: "video_task" as const, taskId: d.request_id, provider: "fal.ai" }
  }

  // OpenAI direct
  if (model === "gpt-image-1") {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error("OPENAI_API_KEY não configurada")
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1024x1024" }),
    })
    const d = await res.json()
    if (!res.ok) throw new Error(d.error?.message || "OpenAI error")
    return { type: "image" as const, url: d.data[0].url, provider: "OpenAI" }
  }

  // xAI
  if (model === "grok-image-2") {
    const key = process.env.XAI_API_KEY
    if (!key) throw new Error("XAI_API_KEY não configurada")
    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "grok-2-image-1212", prompt, n: 1 }),
    })
    const d = await res.json()
    if (!res.ok) throw new Error(d.error?.message || "xAI error")
    return { type: "image" as const, url: d.data[0].url, provider: "xAI" }
  }

  // Veo 3 / Google
  if (model === "veo-3") {
    const key = process.env.GOOGLE_API_KEY
    if (!key) throw new Error("GOOGLE_API_KEY não configurada")
    // Veo via Gemini API (preview)
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/veo-003:predict?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { aspectRatio: options.ratio || "16:9" } }),
    })
    const d = await res.json()
    if (!res.ok) throw new Error(d.error?.message || "Google Veo error")
    return { type: "video_task" as const, taskId: d.name || "veo-task", provider: "Google / Veo" }
  }

  throw new Error(`Modelo "${model}" não reconhecido`)
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ ok: false, error: "Login necessário" }, { status: 401 })

    const { prompt, model, mode, ratio } = await req.json()
    if (!prompt) return NextResponse.json({ ok: false, error: "Prompt obrigatório" }, { status: 400 })

    let result

    // Try OpenRouter models first
    if (OR_MODELS[model]) {
      const { orModel, type } = OR_MODELS[model]
      result = await callOpenRouter(orModel, type, prompt)
    } else {
      // Try direct provider, fallback to OpenRouter for video/image
      try {
        result = await callDirectProvider(model, prompt, { ratio })
      } catch (directErr: any) {
        // Fallback: use OpenRouter for chat
        if (process.env.OPENROUTER_API_KEY) {
          result = await callOpenRouter("google/gemini-2.5-flash", "chat", `Generate a detailed description of: ${prompt}`)
          result = { ...result, text: `[Fallback - ${directErr.message}]\n\n${result.text}` }
        } else {
          throw directErr
        }
      }
    }

    return NextResponse.json({ ok: true, result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
