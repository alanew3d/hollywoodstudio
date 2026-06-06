"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FaBars, FaCoins, FaMagic, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { LoginButton } from "./AuthButtons";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Studio", href: "/studio" },
    { name: "Galeria", href: "/gallery" },
    { name: "Planos", href: "/pricing" },
  ];
  if (session?.user?.role === "admin") navLinks.push({ name: "Admin", href: "/admin" });

  return (
    <nav className="sticky top-0 z-[100] flex h-20 items-center justify-between border-b border-[#d4a857]/15 bg-[#080808]/90 px-4 text-white backdrop-blur-2xl md:px-10">
      <Link href="/" className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d4a857] text-black shadow-lg shadow-[#d4a857]/20">
          <FaMagic />
        </div>
        <div className="leading-none">
          <div className="text-sm font-black uppercase tracking-tight md:text-base">Hollywood Studio AI</div>
          <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-[#d4a857]">From idea to final cut</div>
        </div>
      </Link>

      <div className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[.04] p-1 lg:flex">
        {navLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${active ? "bg-[#d4a857] text-black" : "text-zinc-400 hover:bg-white/10 hover:text-white"}`}>
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        {session ? (
          <>
            <Link href="/pricing" className="hidden items-center gap-2 rounded-xl border border-[#d4a857]/20 bg-[#d4a857]/10 px-4 py-2 text-xs font-black text-[#f0d08a] sm:flex">
              <FaCoins /> {session.user?.credits ?? 0} CR
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="hidden rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 sm:inline-flex sm:items-center sm:gap-2">
              Sair <FaSignOutAlt />
            </button>
          </>
        ) : (
          <LoginButton className="!rounded-xl !bg-[#d4a857] !px-5 !py-3 !text-xs !font-black !uppercase !tracking-widest !text-black" label="Entrar" />
        )}

        <button className="lg:hidden" onClick={() => setOpen((v) => !v)}>
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-20 border-b border-white/10 bg-[#080808] p-4 lg:hidden">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-4 text-xs font-black uppercase tracking-widest text-zinc-300 hover:bg-white/10">
              {link.name}
            </Link>
          ))}
          {session && <div className="mt-3 rounded-xl border border-[#d4a857]/20 bg-[#d4a857]/10 p-4 text-sm text-[#f0d08a]">Saldo: {session.user?.credits ?? 0} créditos</div>}
        </div>
      )}
    </nav>
  );
}
