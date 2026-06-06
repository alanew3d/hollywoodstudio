"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#070707] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111]/90 p-8 shadow-2xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[.32em] text-[#d4a857]">Hollywood Studio AI</p>
        <h1 className="text-3xl font-black">Entrar no Studio</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Acesse sua galeria, créditos, planos e ferramentas de produção audiovisual com IA.</p>
        <button onClick={() => signIn("google", { callbackUrl: "/studio" })} className="mt-8 w-full rounded-xl bg-[#d4a857] px-5 py-4 text-sm font-black uppercase tracking-widest text-black">
          Continuar com Google
        </button>
        <Link href="/pricing" className="mt-4 block text-center text-sm text-zinc-400 hover:text-white">Ver planos antes de entrar</Link>
      </div>
    </main>
  );
}
