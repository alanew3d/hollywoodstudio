import './globals.css';

export const metadata = {
  title: 'Hollywood Studio AI — Seu estúdio criativo com IA',
  description: 'Gere vídeos, imagens e áudio cinematográficos com os melhores modelos de IA.',
  icons: { icon: '/favicon.jpg' },
  openGraph: {
    title: 'Hollywood Studio AI',
    description: 'Seu estúdio criativo com IA — vídeo, imagem, áudio e muito mais.',
    images: ['/hero-hollywoodstudio-ai.jpg'],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{__html: `
          // Splash cinematográfico
          (function(){
            if(sessionStorage.getItem('hs_splash_done')) return;
            var d=document.createElement('div');
            d.id='hs-splash';
            d.style.cssText='position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden';
            var isMobile=window.innerWidth<=768;
            var img=document.createElement('img');
            img.src=isMobile?'/hero-hollywoodstudio-ai-vert.png':'/hero-hollywoodstudio-ai.jpg';
            img.style.cssText='width:100%;height:100%;object-fit:cover;animation:hsZoom 1s ease-out';
            var style=document.createElement('style');
            style.textContent='@keyframes hsZoom{from{transform:scale(1.05);opacity:0}to{transform:scale(1);opacity:1}}';
            var skip=document.createElement('button');
            skip.textContent='Pular →';
            skip.style.cssText='position:absolute;right:28px;bottom:28px;border:1px solid rgba(201,168,76,.7);background:rgba(0,0,0,.55);color:#fff;border-radius:999px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;backdrop-filter:blur(8px)';
            function hide(){
              sessionStorage.setItem('hs_splash_done','1');
              d.style.opacity='0';
              d.style.transition='opacity .5s';
              setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d)},500);
            }
            skip.onclick=hide;
            img.onerror=hide;
            d.appendChild(style);d.appendChild(img);d.appendChild(skip);
            document.body.appendChild(d);
            setTimeout(hide, 2500);
          })();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
