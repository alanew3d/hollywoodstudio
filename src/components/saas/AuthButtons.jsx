"use client";

import { signIn, signOut } from "next-auth/react";
import { FaGoogle, FaSignOutAlt } from "react-icons/fa";

export function LoginButton({ className = "", label = "Entrar com Google", callbackUrl = "/studio" }) {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl })}
      className={`group relative inline-flex items-center gap-3 rounded-full bg-slate-950 px-8 py-4 font-semibold text-white outline-none transition-all hover:scale-105 focus:ring-2 focus:ring-white/50 ${className}`}
    >
      <FaGoogle className="text-lg" />
      {label}
    </button>
  );
}

export function SignOutButton({ className = "" }) {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className={`text-muted transition-colors hover:text-foreground ${className}`}>
      <FaSignOutAlt />
    </button>
  );
}
