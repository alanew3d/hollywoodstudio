const MODELS = [
  ["video", "Seedance 2.0 Pro", "BytePlus", "Narrative cinematic motion, text/image to video", "1 cr/s"],
  ["video", "Seedance 2.0 Lite", "BytePlus", "Fast low-cost generation for iteration", ".6 cr/s"],
  ["video", "Seedance 2.0 I2V", "BytePlus", "Image to video with reference consistency", "1.2 cr/s"],
  ["video", "Kling 3.0", "Atlas Cloud", "People, facial expression, camera movement", "1.2 cr/s"],
  ["video", "Kling Motion Control", "Atlas Cloud", "Advanced motion and camera control", "1.6 cr/s"],
  ["video", "Veo 3.1 Lite", "Google", "Fast Veo generation for previews", "1.4 cr/s"],
  ["video", "Veo 3.1 Fast", "Google", "Higher quality and speed balance", "1.8 cr/s"],
  ["video", "Veo 3.1 Quality", "Google", "Premium photoreal video and audio", "2.4 cr/s"],
  ["video", "Sora 2", "OpenAI", "Complex scenes, physics, temporal coherence", "1.5 cr/s"],
  ["video", "Wan 2.7", "Alibaba", "First/last frame control", "1 cr/s"],
  ["video", "Hailuo", "MiniMax", "Fast expressive generation", ".8 cr/s"],
  ["video", "Lipsync Studio", "Multi", "Talking head, dubbing and avatar sync", "1 cr/s"],
  ["image", "Flux Pro", "Black Forest Labs", "Editorial images and premium detail", "8 cr"],
  ["image", "Seedream 5", "BytePlus", "Photoreal cinematic image generation", "6 cr"],
  ["image", "GPT Image 2", "OpenAI", "Instructional editing, graphics and text", "10 cr"],
  ["image", "Nano Banana Pro", "Nano", "Character consistency and identity", "5 cr"],
  ["image", "Gemini Omni", "Google", "Multimodal analysis + creation", "7 cr"],
  ["audio", "ElevenLabs", "Voice", "Narration, dubbing and voiceover", "12 cr"],
  ["audio", "Suno", "Music", "Scores, themes and jingles", "20 cr"],
  ["audio", "MMAudio", "SFX", "Sound effects synced to video", "15 cr"],
];

export default function ModelsPage() {
  const cats = ["video", "image", "audio"];
  return (
    <main className="min-h-screen bg-[#070707] px-6 py-12 text-white md:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.32em] text-[#d4a857]">Model catalogue</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Modelos disponíveis e planejados</h1>
        <p className="mt-5 max-w-3xl text-zinc-400">Esta página mostra a visão multi-modelo do Hollywood Studio AI. Os modelos podem ser conectados via BytePlus, Atlas Cloud, Replicate, OpenAI, Google e outros provedores conforme chaves/API forem ativadas.</p>
        {cats.map((cat) => (
          <section key={cat} className="mt-10">
            <h2 className="mb-4 text-2xl font-black capitalize text-[#f0d08a]">{cat === "video" ? "Vídeo" : cat === "image" ? "Imagem" : "Áudio"}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {MODELS.filter((m) => m[0] === cat).map((m) => (
                <div key={m[1]} className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
                  <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-lg font-black">{m[1]}</h3><span className="rounded-full bg-[#d4a857]/15 px-3 py-1 font-mono text-xs text-[#d4a857]">{m[4]}</span></div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">{m[2]}</div>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{m[3]}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
