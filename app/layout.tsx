import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hollywood Studio AI — Seu estúdio criativo com IA",
  description: "Gere vídeos, imagens e áudio cinematográficos com os melhores modelos de IA.",
  icons: { icon: "/favicon.jpg" },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Header user={user} />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
