import './globals.css';

export const metadata = {
  title: 'Hollywood Studio AI — Seu estúdio criativo com IA',
  description: 'Gere vídeos, imagens e áudio cinematográficos com os melhores modelos de IA.',
  icons: { icon: '/favicon.jpg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{__html: `
(function(){
  // Key MuAPI via env var — pré-configura para visitantes
  try {
    var envKey = "${process.env.NEXT_PUBLIC_MUAPI_KEY || ''}";
    if(envKey && envKey.length > 5 && !localStorage.getItem('muapi_key')) {
      localStorage.setItem('muapi_key', envKey);
    }
  } catch(e){}

  // Splash só uma vez por sessão
  try { if(sessionStorage.getItem('hs_splash')) return; } catch(e){ return; }
  try { sessionStorage.setItem('hs_splash','1'); } catch(e){}

  // Cria splash
  var splash = document.createElement('div');
  splash.id = 'hs-splash';
  splash.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'background:#000',
    'overflow:hidden',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'transition:opacity 0.5s ease'
  ].join(';');

  // Imagem de fundo
  var img = document.createElement('img');
  var isMobile = window.innerWidth <= 768;
  img.src = isMobile
    ? '/hero-hollywoodstudio-ai-vert.png'
    : '/hero-hollywoodstudio-ai.jpg';
  img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
  img.style.animation = 'hsZoomIn 1.2s ease-out forwards';

  // CSS de animação
  var style = document.createElement('style');
  style.textContent = '@keyframes hsZoomIn{from{transform:scale(1.06);opacity:0}to{transform:scale(1);opacity:1}}';

  // Botão pular
  var skip = document.createElement('button');
  skip.textContent = 'Pular →';
  skip.style.cssText = [
    'position:absolute',
    'bottom:32px',
    'right:32px',
    'border:1px solid rgba(201,168,76,0.75)',
    'background:rgba(0,0,0,0.6)',
    'color:#fff',
    'border-radius:999px',
    'padding:11px 22px',
    'font-size:14px',
    'font-weight:700',
    'cursor:pointer',
    'backdrop-filter:blur(10px)',
    '-webkit-backdrop-filter:blur(10px)',
    'z-index:2',
    'font-family:-apple-system,sans-serif'
  ].join(';');

  // Mobile: centraliza botão
  if(isMobile) {
    skip.style.right = 'auto';
    skip.style.left = '50%';
    skip.style.transform = 'translateX(-50%)';
  }

  skip.onmouseover = function(){ this.style.background='#c9a84c'; this.style.color='#000'; };
  skip.onmouseout  = function(){ this.style.background='rgba(0,0,0,0.6)'; this.style.color='#fff'; };

  function hide() {
    splash.style.opacity = '0';
    setTimeout(function(){
      if(splash && splash.parentNode) splash.parentNode.removeChild(splash);
    }, 520);
  }

  skip.onclick = hide;
  img.onerror  = hide;
  setTimeout(hide, 2800);

  splash.appendChild(style);
  splash.appendChild(img);
  splash.appendChild(skip);
  document.body.appendChild(splash);
})();
        `}} />
      </body>
    </html>
  );
}
