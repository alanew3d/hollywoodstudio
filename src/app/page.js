import Link from "next/link";

const steps = [
  ["01", "Brief", "Comece pela ideia, objetivo, marca, referência e formato."],
  ["02", "Storyboard", "Transforme o brief em cenas cinematográficas e prompts prontos."],
  ["03", "Studio", "Gere imagem, vídeo ou áudio com modelos selecionados por finalidade."],
  ["04", "Gallery", "Organize versões, prompts, referências e resultados por projeto."],
  ["05", "Final Cut AI", "Monte o corte final com ritmo, formato, textos e direção de edição."],
];

const features = [
  ["Director Agent", "Um agente criativo para entender referências e preparar o plano de produção."],
  ["Multi-model Studio", "Seedance, Kling, Veo, Flux, Seedream e áudio no mesmo workflow."],
  ["Créditos claros", "Modelo simples: 1 crédito = 1 segundo de vídeo base."],
  ["Public Beta", "Pronto para planos, usuários, admin e evolução por fases."],
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <section className="relative overflow-hidden px-6 py-20 md:px-12 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,168,87,.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,.08),transparent_25%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-6 inline-flex rounded-full border border-[#d4a857]/30 bg-[#d4a857]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-[#d4a857]">
            Hollywood Studio AI · Public Beta
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[.95] tracking-tight md:text-7xl">
            O estúdio de workflow audiovisual com IA.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
            Da ideia ao corte final: transforme briefs em storyboards, prompts, cenas, galeria e montagem guiada com uma lógica de produção cinematográfica.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/studio" className="rounded-xl bg-[#d4a857] px-6 py-4 text-sm font-black uppercase tracking-widest text-black transition hover:brightness-110">
              Abrir Studio
            </Link>
            <Link href="/pricing" className="rounded-xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white/10">
              Ver planos
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.02] px-6 py-12 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-5">
          {steps.map(([num, title, text]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-[#111]/80 p-5">
              <div className="mb-4 font-mono text-xs text-[#d4a857]">{num}</div>
              <h3 className="mb-2 text-lg font-bold">{title}</h3>
              <p className="text-sm leading-6 text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#d4a857]">From idea to final cut</p>
            <h2 className="text-3xl font-black md:text-5xl">Não é só um gerador. É uma linha de produção criativa.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {features.map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                <h3 className="mb-3 text-xl font-bold text-[#f0d08a]">{title}</h3>
                <p className="text-sm leading-6 text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
