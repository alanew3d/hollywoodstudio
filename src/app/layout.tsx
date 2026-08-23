import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Cinema Studio — Hollywood Studio AI",
  description: "Produza vídeos cinematográficos com IA. Compose cenas, adicione áudio e exporte em alta qualidade.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        {/* Banner Hollywood Studio */}
        <div style={{
          background: 'linear-gradient(90deg, #000 0%, #1a1400 50%, #000 100%)',
          borderBottom: '1px solid rgba(201,168,76,0.3)',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{color:'#c9a84c',fontWeight:900,fontSize:'13px',letterSpacing:'1px'}}>
              HOLLYWOOD STUDIO AI
            </span>
            <span style={{color:'rgba(255,255,255,0.3)',fontSize:'12px'}}>›</span>
            <span style={{color:'rgba(255,255,255,0.6)',fontSize:'12px'}}>Cinema Studio</span>
          </div>
          <a href="https://hollywoodstudio.ai" 
            style={{color:'rgba(201,168,76,0.7)',fontSize:'11px',textDecoration:'none'}}>
            ← Voltar ao Studio
          </a>
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
