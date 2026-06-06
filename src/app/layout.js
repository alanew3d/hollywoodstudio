import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/saas/Navbar";

const font = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Hollywood Studio AI — Produção audiovisual com IA",
  description: "Workflow audiovisual com IA: brief, storyboard, modelos, geração, galeria e final cut.",
  icons: { icon: "/assets/favicon.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="min-h-screen" data-theme="hollywood" style={{ colorScheme: "dark" }}>
      <body className={`${font.className} min-h-screen antialiased transition-colors duration-500`}>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-80px)]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
