"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FaBars, FaCoins, FaMoon, FaSignOutAlt, FaSun, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import { LoginButton } from "./AuthButtons";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState("hollywood");
  const [lang, setLang] = useState("pt");

  useEffect(() => {
    const savedTheme = localStorage.getItem("hsai_theme") || "hollywood";
    const savedLang = localStorage.getItem("hsai_lang") || "pt";
    setTheme(savedTheme); setLang(savedLang);
    document.documentElement.dataset.theme = savedTheme;
    document.documentElement.lang = savedLang === "pt" ? "pt-BR" : "en";
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "hollywood" : "light";
    setTheme(next);
    localStorage.setItem("hsai_theme", next);
    document.documentElement.dataset.theme = next;
  };
  const toggleLang = () => {
    const next = lang === "pt" ? "en" : "pt";
    setLang(next);
    localStorage.setItem("hsai_lang", next);
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Studio", href: "/studio" },
    { name: "Modelos", href: "/models" },
    { name: "Agente", href: "/agent" },
    { name: "Galeria", href: "/gallery" },
    { name: "Planos", href: "/pricing" },
  ];
  if (session?.user?.role === "admin") navLinks.push({ name: "Admin", href: "/admin" });

  return (
    <nav className="sticky top-0 z-[100] flex min-h-20 items-center justify-between border-b border-[#d4a857]/15 bg-[#080808]/92 px-4 text-white backdrop-blur-2xl md:px-10" data-navbar>
      <Link href="/" className="flex items-center gap-3 min-w-0">
        <Image src="/assets/logo-light.png" width={240} height={64} priority alt="Hollywood Studio AI" className="h-12 w-auto max-w-[220px] object-contain" />
      </Link>

      <div className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/[.04] p-1 xl:flex">
        {navLinks.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${active ? "bg-[#d4a857] text-black" : "text-zinc-400 hover:bg-white/10 hover:text-white"}`}>
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button onClick={toggleLang} className="rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-[11px] font-black uppercase tracking-widest text-[#f0d08a]">{lang.toUpperCase()}</button>
        <button onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-[#f0d08a]">{theme === "light" ? <FaMoon /> : <FaSun />}</button>
        {session ? (
          <>
            <Link href="/pricing" className="hidden items-center gap-2 rounded-xl border border-[#d4a857]/20 bg-[#d4a857]/10 px-4 py-2 text-xs font-black text-[#f0d08a] sm:flex">
              <FaCoins /> {session.user?.credits ?? 0} CR
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="hidden rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-zinc-300 hover:bg-white/10 lg:inline-flex lg:items-center lg:gap-2">
              Sair <FaSignOutAlt />
            </button>
          </>
        ) : (
          <LoginButton className="!rounded-xl !bg-[#d4a857] !px-4 !py-3 !text-xs !font-black !uppercase !tracking-widest !text-black" label="Entrar" />
        )}

        <button className="xl:hidden text-[#f0d08a]" onClick={() => setOpen((v) => !v)}>
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-20 border-b border-white/10 bg-[#080808] p-4 xl:hidden">
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
