"use client"

import { useState, useRef, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { Loader2, Upload, ArrowUp, Image, Video, Sparkles, ChevronDown } from "lucide-react"

// ── MODELOS ────────────────────────────────────────────
const MODELS = {
  image: [
    { id: "gemini-image",      label: "Gemini Image",       provider: "Google / OpenRouter" },
    { id: "gemini-image-pro",  label: "Gemini Image Pro",   provider: "Google / OpenRouter" },
    { id: "gpt-image-or",      label: "GPT-5 Image Mini",   provider: "OpenAI / OpenRouter" },
    { id: "gpt-image-or-pro",  label: "GPT-5 Image",        provider: "OpenAI / OpenRouter" },
    { id: "gpt-image-1",       label: "GPT Image 1",        provider: "OpenAI (direto)" },
    { id: "flux-pro",          label: "Flux Pro",           provider: "fal.ai" },
    { id: "nano-banana-pro",   label: "Nano Banana Pro",    provider: "fal.ai" },
    { id: "ideogram-v3",       label: "Ideogram V3",        provider: "fal.ai" },
    { id: "grok-image-2",      label: "Grok Image 2",       provider: "xAI" },
  ],
  video: [
    { id: "seedance-2.5",   label: "Seedance 2.5",   provider: "BytePlus" },
    { id: "seedance-2",     label: "Seedance 2",     provider: "BytePlus" },
    { id: "minimax-h3",     label: "MiniMax H3",     provider: "fal.ai" },
    { id: "kling-3",        label: "Kling 3",        provider: "fal.ai" },
    { id: "wan-3",          label: "Wan 3",          provider: "fal.ai" },
    { id: "wan-2.7",        label: "Wan 2.7",        provider: "fal.ai" },
    { id: "veo-3",          label: "Veo 3",          provider: "Google" },
    { id: "grok-video",     label: "Grok Video",     provider: "xAI" },
    { id: "runway-gen4",    label: "Runway Gen-4",   provider: "fal.ai" },
  ],
}

const RATIOS = ["16:9", "9:16", "1:1", "4:5", "3:4", "4:3"]

interface GenItem {
  id: string
  type: "image" | "video" | "chat"
  url?: string
  text?: string
  model: string
  prompt: string
  ts: number
}

export function StudioMain({ user }: { user: User | null }) {
  const [mode, setMode] = useState<"image" | "video">("image")
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("gemini-image")
  const [ratio, setRatio] = useState("1:1")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gallery, setGallery] = useState<GenItem[]>([])
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [showRatioMenu, setShowRatioMenu] = useState(false)
  const [fullscreen, setFullscreen] = useState<GenItem | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentModels = MODELS[mode]
  const currentModel = currentModels.find(m => m.id === model) || currentModels[0]

  // Switch mode → reset model
  const switchMode = (m: "image" | "video") => {
    setMode(m)
    setModel(MODELS[m][0].id)
    setShowModelMenu(false)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      textareaRef.current?.focus()
      return
    }
    if (!user) {
      setError("Faça login para gerar conteúdo.")
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/hs-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model, mode, ratio }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error || "Erro ao gerar")

      const item: GenItem = {
        id: `gen-${Date.now()}`,
        type: data.result.type,
        url: data.result.url,
        text: data.result.text,
        model: currentModel.label,
        prompt,
        ts: Date.now(),
      }
      setGallery(prev => [item, ...prev])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center">

        {/* Hero */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Hollywood Studio AI" className="h-12 mx-auto mb-5 dark:brightness-110"
            onError={e => (e.target as HTMLImageElement).style.display = "none"} />
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground mb-2">
            O que vamos <span style={{ color: "#c9a84c" }}>criar</span> hoje?
          </h1>
          <p className="text-muted-foreground text-sm">Da inspiração à criação</p>
        </div>

        {/* Prompt box */}
        <div className="w-full bg-card border border-border rounded-2xl shadow-sm overflow-hidden transition-shadow focus-within:shadow-md focus-within:border-primary/40">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKey}
            placeholder={mode === "image"
              ? "Descreva a imagem que quer criar..."
              : "Descreva as ações no vídeo..."}
            rows={3}
            className="w-full bg-transparent px-4 pt-4 pb-2 text-base resize-none outline-none text-foreground placeholder:text-muted-foreground/60"
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 pb-3 gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {/* Upload */}
              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Upload className="w-4 h-4" />
              </button>

              {/* Mode: Imagem / Vídeo */}
              <div className="flex items-center bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => switchMode("image")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === "image"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Image className="w-3.5 h-3.5" /> Imagem
                </button>
                <button
                  onClick={() => switchMode("video")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    mode === "video"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" /> Vídeo
                </button>
              </div>

              {/* Model selector */}
              <div className="relative">
                <button
                  onClick={() => { setShowModelMenu(!showModelMenu); setShowRatioMenu(false) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#c9a84c" }} />
                  <span className="max-w-[120px] truncate">{currentModel.label}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showModelMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 py-1 max-h-64 overflow-y-auto">
                    {currentModels.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setModel(m.id); setShowModelMenu(false) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
                          model === m.id ? "text-primary font-medium" : "text-foreground"
                        }`}
                      >
                        <div className="font-medium">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.provider}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ratio (só imagem) */}
              {mode === "image" && (
                <div className="relative">
                  <button
                    onClick={() => { setShowRatioMenu(!showRatioMenu); setShowModelMenu(false) }}
                    className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {ratio}
                  </button>
                  {showRatioMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-28 bg-card border border-border rounded-xl shadow-lg z-50 py-1">
                      {RATIOS.map(r => (
                        <button
                          key={r}
                          onClick={() => { setRatio(r); setShowRatioMenu(false) }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-muted ${
                            ratio === r ? "text-primary font-medium" : "text-foreground"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="flex items-center justify-center w-9 h-9 rounded-xl disabled:opacity-40 transition-all"
              style={{ background: "#c9a84c" }}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin text-black" />
                : <ArrowUp className="w-4 h-4 text-black" />
              }
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full mt-3 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Gallery feed */}
        {gallery.length > 0 && (
          <div className="w-full mt-8">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-4">
              Gerações
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map(item => (
                <div
                  key={item.id}
                  className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/40 transition-all"
                  onClick={() => setFullscreen(item)}
                >
                  {item.type === "image" && item.url && (
                    <img src={item.url} alt={item.prompt} className="w-full aspect-square object-cover" loading="lazy" />
                  )}
                  {item.type === "video" && item.url && (
                    <video src={item.url} className="w-full aspect-square object-cover" muted loop
                      onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={e => (e.target as HTMLVideoElement).pause()} />
                  )}
                  {item.type === "chat" && (
                    <div className="w-full aspect-square p-3 text-xs text-muted-foreground overflow-hidden leading-relaxed">
                      {item.text}
                    </div>
                  )}
                  <div className="px-2 py-1.5 border-t border-border">
                    <p className="text-[10px] font-semibold" style={{ color: "#c9a84c" }}>{item.model}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setFullscreen(null)}
        >
          {fullscreen.type === "image" && fullscreen.url && (
            <img src={fullscreen.url} alt={fullscreen.prompt}
              className="max-w-full max-h-[90vh] rounded-xl object-contain" />
          )}
          {fullscreen.type === "video" && fullscreen.url && (
            <video src={fullscreen.url} controls autoPlay loop
              className="max-w-full max-h-[90vh] rounded-xl" onClick={e => e.stopPropagation()} />
          )}
        </div>
      )}

      {/* Click outside menus */}
      {(showModelMenu || showRatioMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowModelMenu(false); setShowRatioMenu(false) }} />
      )}
    </div>
  )
}
