import Link from "next/link";

const demoVideos = [
  { title: "Dog Soccer — AI Reel", file: "/assets/dog-soccer.mp4", tag: "Viral / UGC" },
  { title: "Surf Cinematic", file: "/assets/surf.mp4", tag: "Action / Sports" },
  { title: "Tightrope Dog", file: "/assets/dog-tightrope.mp4", tag: "Character / Fun" },
  { title: "Cinematic Experiment", file: "/assets/cinematic-demo.mp4", tag: "Premium Look" },
];

const workflow = [
  ["01", "Brief", "Comece com objetivo, marca, referência, público e formato."],
  ["02", "Director Agent", "Converse com o agente para transformar intenção em direção criativa."],
  ["03", "Storyboard", "Receba cenas, prompts, modelos recomendados e estimativa de créditos."],
  ["04", "Studio", "Gere imagens, vídeos e áudio com modelos de IA organizados por finalidade."],
  ["05", "Gallery", "Salve versões, prompts, referências e resultados por projeto."],
  ["06", "Final Cut AI", "Próxima fase: montagem automática e editor premium."],
];

const coming = ["IMG.LY Studio Editor", "Creatomate / Shotstack Final Cut", "Public Templates", "Academy", "Opportunities", "Director's Council"];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <section className="relative overflow-hidden px-6 py-16 md:px-12 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(212,168,87,.24),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,.08),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-[#d4a857]/30 bg-[#d4a857]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-[#d4a857]">
              Public Beta · Workflow audiovisual com IA
            </div>
            <img src="/assets/logo-hero.png" alt="Hollywood Studio AI" className="mb-8 max-h-28 w-auto object-contain" />
            <h1 className="max-w-4xl text-4xl font-black leading-[.98] tracking-tight md:text-7xl">
              Da ideia ao corte final.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
              Um estúdio vertical para criação audiovisual com IA: brief, agente criativo, storyboard, modelos, geração, galeria e montagem guiada.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/studio" className="rounded-xl bg-[#d4a857] px-6 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:brightness-110">
                Abrir Studio
              </Link>
              <Link href="/models" className="rounded-xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10">
                Ver modelos
              </Link>
              <Link href="/agent" className="rounded-xl border border-[#d4a857]/30 bg-[#d4a857]/10 px-6 py-4 text-sm font-bold uppercase tracking-widest text-[#f0d08a] transition hover:bg-[#d4a857]/20">
                Director Agent
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-[#d4a857]/20 bg-white/[.04] p-3 shadow-2xl shadow-black/40">
            <div className="grid grid-cols-2 gap-3">
              {demoVideos.map((v) => (
                <div key={v.file} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                  <video src={v.file} className="aspect-video h-full w-full object-cover" muted loop autoPlay playsInline />
                  <div className="border-t border-white/10 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#d4a857]">{v.tag}</div>
                    <div className="mt-1 text-sm font-bold">{v.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.02] px-6 py-12 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3 xl:grid-cols-6">
          {workflow.map(([num, title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-[#111]/80 p-5">
              <div className="mb-4 font-mono text-xs text-[#d4a857]">{num}</div>
              <h3 className="mb-2 text-lg font-bold">{title}</h3>
              <p className="text-sm leading-6 text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#d4a857]">O diferencial</p>
            <h2 className="text-3xl font-black md:text-5xl">Não é uma lista de ferramentas. É um workflow de produção.</h2>
            <p className="mt-5 text-zinc-400">A versão pública inicial já mostra o caminho completo e deixa as features futuras visíveis sem travar o lançamento.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6"><h3 className="mb-3 text-xl font-bold text-[#f0d08a]">Studio multi-modelo</h3><p className="text-sm leading-6 text-zinc-400">Seedance, Kling, Veo, Sora, Wan, Hailuo, Flux, Seedream, GPT Image, Gemini e áudio em uma experiência única.</p></div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6"><h3 className="mb-3 text-xl font-bold text-[#f0d08a]">Agente criativo</h3><p className="text-sm leading-6 text-zinc-400">O usuário não precisa partir do prompt vazio: o agente conduz brief, referências, cenas e próximos passos.</p></div>
            <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6"><h3 className="mb-3 text-xl font-bold text-[#f0d08a]">Planos e créditos</h3><p className="text-sm leading-6 text-zinc-400">Estrutura pronta para cobrança, créditos e acesso por plano. Render real só com pagamento/créditos.</p></div>
          </div>
          <div className="mt-8 rounded-3xl border border-[#d4a857]/20 bg-[#d4a857]/10 p-6">
            <div className="text-xs font-black uppercase tracking-[.3em] text-[#d4a857]">Coming next</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {coming.map((x) => <span key={x} className="rounded-full border border-[#d4a857]/30 bg-black/20 px-4 py-2 text-sm text-[#f0d08a]">{x}</span>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
