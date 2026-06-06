"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const DEMOS = [
  { type: "video", url: "/assets/dog-soccer.mp4", title: "Dog Soccer", model: "Seedance / Viral", prompt: "Um cachorro jogador de futebol em uma cena divertida, energia de reels, câmera dinâmica." },
  { type: "video", url: "/assets/surf.mp4", title: "Surf Cinematic", model: "Action / Sports", prompt: "Cena cinematográfica de surf, movimento fluido, câmera premium, look de campanha." },
  { type: "video", url: "/assets/dog-tightrope.mp4", title: "Tightrope Dog", model: "Character / Fun", prompt: "Personagem animal em cena surpreendente, visual viral, controle de movimento." },
  { type: "video", url: "/assets/cinematic-demo.mp4", title: "Cinematic Demo", model: "Premium Look", prompt: "Demonstração visual cinematográfica para vitrine do Hollywood Studio AI." },
];

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("hsai_gal") || "[]")); } catch { setItems([]); }
  }, []);
  const all = [...items, ...DEMOS];

  return (
    <main className="min-h-screen bg-[#0a0a0c] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#d4a857]">Hollywood Studio AI</p>
            <h1 className="mt-2 text-4xl font-black">Galeria & Demos</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">Aqui entram suas gerações locais e uma vitrine inicial com demos para dar vida ao produto antes da galeria server-side.</p>
          </div>
          <Link href="/studio" className="rounded-xl bg-[#d4a857] px-5 py-3 text-sm font-bold text-black">Voltar ao Studio</Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {all.map((item, i) => (
            <div key={`${item.url}-${i}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-xl shadow-black/20">
              <div className="aspect-video bg-black">
                {item.type === "video" ? <video src={item.url} className="h-full w-full object-cover" muted loop autoPlay playsInline controls /> : <img src={item.url} className="h-full w-full object-cover" alt="Geração" />}
              </div>
              <div className="p-4">
                <div className="mb-1 text-xs font-mono text-[#d4a857]">{item.model || "HSAI"}</div>
                <h3 className="mb-2 font-black">{item.title || "Geração"}</h3>
                <p className="line-clamp-3 text-sm text-zinc-300">{item.prompt || "Sem prompt"}</p>
                <button onClick={() => navigator.clipboard?.writeText(item.prompt || "")} className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10">Copiar prompt</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
