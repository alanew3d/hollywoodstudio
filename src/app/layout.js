import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/saas/Navbar";

const font = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Hollywood Studio AI — Produção audiovisual com IA",
  description: "Plataforma SaaS para gerar vídeos cinematográficos com IA, créditos flexíveis e direção criativa.",
};

export default function RootLayout({ children }) {
  const theme = process.env.NEXT_PUBLIC_THEME || "hollywood";

  return (
    <html lang="pt-BR" className="h-dvh w-full transition-colors duration-500" data-theme={theme} style={{ colorScheme: "dark" }}>
      <body className={`${font.className} h-dvh w-full flex flex-col antialiased transition-colors duration-500`}>
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
