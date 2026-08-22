import './globals.css';

export const metadata = {
  title: 'Hollywood Studio AI — Seu estúdio criativo com IA',
  description: 'Gere vídeos, imagens e áudio cinematográficos com os melhores modelos de IA.',
  icons: { icon: '/favicon.jpg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{__html: `
(function(){
  // ── TEMA claro/escuro ──────────────────────────────
  var saved = localStorage.getItem('hs_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  if(saved === 'light') document.documentElement.classList.add('hs-light');

  // ── KEY pré-salva: nunca pede de novo ──────────────
  // A key já é salva no localStorage pelo próprio app.
  // Se quiser pré-configurar para todos (admin), 
  // adicione NEXT_PUBLIC_MUAPI_KEY no Vercel e descomente:
  var envKey = '${process.env.NEXT_PUBLIC_MUAPI_KEY || ""}';
  if(envKey && envKey.length > 5 && !localStorage.getItem('muapi_key')) {
    localStorage.setItem('muapi_key', envKey);
  }

  // ── SPLASH cinematográfico ─────────────────────────
  if(sessionStorage.getItem('hs_splash')) return;
  sessionStorage.setItem('hs_splash','1');
  
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;overflow:hidden;' +
    'display:flex;align-items:center;justify-content:center';
  
  var isMobile = window.innerWidth <= 768;
  var img = document.createElement('img');
  img.src = isMobile ? '/hero-hollywoodstudio-ai-vert.png' : '/hero-hollywoodstudio-ai.jpg';
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;' +
    'animation:hsZoomIn 1s ease-out forwards';
  
  var style = document.createElement('style');
  style.textContent = '@keyframes hsZoomIn{from{transform:scale(1.05);opacity:0}to{transform:scale(1);opacity:1}}';
  
  var skip = document.createElement('button');
  skip.textContent = 'Pular →';
  skip.style.cssText = 'position:absolute;bottom:28px;right:28px;' +
    'border:1px solid rgba(201,168,76,.7);background:rgba(0,0,0,.55);' +
    'color:#fff;border-radius:999px;padding:10px 20px;font-size:13px;' +
    'font-weight:700;cursor:pointer;backdrop-filter:blur(8px);' +
    'transition:background .2s,color .2s';
  skip.onmouseover = function(){ this.style.background='#c9a84c'; this.style.color='#000'; };
  skip.onmouseout  = function(){ this.style.background='rgba(0,0,0,.55)'; this.style.color='#fff'; };

  function hideSplash(){
    d.style.transition = 'opacity .5s';
    d.style.opacity = '0';
    setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 520);
  }
  
  skip.onclick = hideSplash;
  img.onerror = hideSplash;
  setTimeout(hideSplash, 2600);
  
  d.appendChild(style);
  d.appendChild(img);
  d.appendChild(skip);
  document.body.appendChild(d);
})();
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
