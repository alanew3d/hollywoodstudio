"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("hsai_gal") || "[]")); } catch { setItems([]); }
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0c] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#d4a857]">Hollywood Studio AI</p>
            <h1 className="mt-2 text-4xl font-black">Galeria</h1>
            <p className="mt-2 text-sm text-zinc-400">Suas últimas gerações salvas neste navegador aparecerão aqui. A galeria server-side entra na próxima fase.</p>
          </div>
          <Link href="/studio" className="rounded-xl bg-[#d4a857] px-5 py-3 text-sm font-bold text-black">Voltar ao Studio</Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-12 text-center text-zinc-400">
            Nenhuma geração local ainda. Abra o Studio e gere seu primeiro material.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
                <div className="aspect-video bg-black">
                  {item.type === "video" ? <video src={item.url} className="h-full w-full object-cover" controls /> : <img src={item.url} className="h-full w-full object-cover" alt="Geração" />}
                </div>
                <div className="p-4">
                  <div className="mb-1 text-xs font-mono text-[#d4a857]">{item.model || "HSAI"}</div>
                  <p className="line-clamp-3 text-sm text-zinc-300">{item.prompt || "Sem prompt"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
