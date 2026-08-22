"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserMenu } from "@/components/auth/UserMenu"
import { cn } from "@/lib/utils"
import type { User } from "@supabase/supabase-js"

interface HeaderProps {
  user: User | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <img src="/logo.png" alt="Hollywood Studio AI" className="h-7 dark:brightness-110"
              onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
            <span className="font-bold text-sm tracking-wide hidden sm:block" style={{color:'#c9a84c'}}>
              HOLLYWOOD STUDIO AI
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/criar', label: 'Criar' },
              { href: '/galeria', label: 'Galeria' },
              { href: '/modelos', label: 'Modelos' },
              { href: '/#pricing', label: 'Planos' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  pathname === href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
