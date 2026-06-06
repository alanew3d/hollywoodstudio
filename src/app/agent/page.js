import Link from "next/link";
const capabilities = [
  ["Entender brief", "Transforma um pedido solto em direção criativa, cenas e formato."],
  ["Analisar referências", "Recebe imagens/vídeos e extrai estilo, composição, câmera e identidade visual."],
  ["Sugerir modelo", "Indica Seedance, Kling, Veo, Flux, Seedream ou outro modelo conforme o objetivo."],
  ["Estimar créditos", "Mostra custo antes de gerar para evitar gasto desnecessário."],
  ["Enviar para Studio", "Converte a conversa em prompt e configurações prontas para geração."],
  ["Final Cut AI", "Fase seguinte: montar vídeos finais com templates e render automático."],
];
export default function AgentPage(){
 return <main className="min-h-screen bg-[#070707] px-6 py-12 text-white md:px-12"><div className="mx-auto max-w-7xl">
  <p className="text-xs font-black uppercase tracking-[.32em] text-[#d4a857]">Director Agent</p>
  <h1 className="mt-3 max-w-4xl text-4xl font-black md:text-6xl">O agente que transforma conversa em produção audiovisual.</h1>
  <p className="mt-5 max-w-3xl text-zinc-400">Inspirado no conceito de orquestradores criativos, o Director Agent será a camada central do Hollywood Studio AI: ele entende contexto, referências e objetivo antes de gastar créditos.</p>
  <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{capabilities.map(([t,d])=><div key={t} className="rounded-2xl border border-white/10 bg-white/[.04] p-6"><h3 className="mb-3 text-xl font-black text-[#f0d08a]">{t}</h3><p className="text-sm leading-6 text-zinc-400">{d}</p></div>)}</div>
  <div className="mt-10 rounded-3xl border border-[#d4a857]/20 bg-[#d4a857]/10 p-6"><h2 className="text-2xl font-black">Fluxo proposto</h2><p className="mt-3 text-zinc-300">Conversa + referências → direção criativa → storyboard → prompts → custo estimado → confirmação → geração → galeria → final cut.</p><Link href="/studio" className="mt-6 inline-block rounded-xl bg-[#d4a857] px-6 py-4 text-sm font-black uppercase tracking-widest text-black">Abrir Studio</Link></div>
 </div></main>
}
