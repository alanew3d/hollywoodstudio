import './globals.css';

export const metadata = {
  title: 'Hollywood Studio AI — Seu estúdio criativo com IA',
  description: 'Gere vídeos, imagens e áudio cinematográficos com os melhores modelos de IA.',
  icons: { icon: '/favicon.jpg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
