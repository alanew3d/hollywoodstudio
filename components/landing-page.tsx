"use client"
import Link from "next/link"
import { ArrowRight, Sparkles, Video, Image, Layers } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <img src="/logo.png" alt="Hollywood Studio AI" className="h-16 mx-auto mb-8 dark:brightness-110"
            onError={e => (e.target as HTMLImageElement).style.display="none"} />
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-foreground mb-4">
            Seu estúdio criativo<br />
            <span style={{color:"#c9a84c"}}>com IA</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Gere vídeos, imagens e áudio cinematográficos com os melhores modelos de IA do mundo.
          </p>
          <Link href="/criar"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-black font-semibold text-lg transition-opacity hover:opacity-85"
            style={{background:"#c9a84c"}}>
            Começar a criar <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4" id="features">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Image, title: "Imagem com IA", desc: "GPT Image, Gemini, Flux, Nano Banana Pro e mais." },
            { icon: Video, title: "Vídeo com IA", desc: "Seedance, MiniMax H3, Kling, Wan, Veo 3." },
            { icon: Layers, title: "Spider Web", desc: "Canvas de nodes para workflows visuais avançados." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{background:"rgba(201,168,76,0.1)"}}>
                <Icon className="w-6 h-6" style={{color:"#c9a84c"}} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/30" id="pricing">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-light text-foreground mb-3">Planos & Créditos</h2>
          <p className="text-muted-foreground">Sistema baseado em créditos — válidos para vídeo, imagem e áudio.</p>
        </div>
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name:"Starter", price:"Grátis", credits:"10 créditos", features:["Modelos essenciais","Resolução até 720p","Galeria pessoal"] },
            { name:"Básico", price:"R$99", credits:"150 créditos/mês", features:["Todos os modelos","Resolução até 1080p","Storyboard com IA","Suporte por e-mail"], featured: true },
            { name:"Premium", price:"R$299", credits:"500 créditos/mês", features:["Modelos premium","4K vídeo e imagem","Spider Web","Suporte prioritário"] },
          ].map(plan => (
            <div key={plan.name}
              className={`bg-card rounded-2xl p-6 text-center relative ${plan.featured ? "border-2" : "border border-border"}`}
              style={plan.featured ? {borderColor:"#c9a84c"} : {}}>
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-black"
                  style={{background:"#c9a84c"}}>POPULAR</span>
              )}
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{plan.name}</p>
              <p className="text-4xl font-light text-foreground mb-1">{plan.price}</p>
              <p className="text-sm mb-5" style={{color:"#c9a84c"}}>{plan.credits}</p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <span style={{color:"#c9a84c"}}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/criar"
                className={`block w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85 ${plan.featured ? "text-black" : "border border-border text-foreground"}`}
                style={plan.featured ? {background:"#c9a84c"} : {}}>
                {plan.name === "Starter" ? "Começar grátis" : "Assinar"}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
