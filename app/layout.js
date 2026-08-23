import './globals.css';

export const metadata = {
  title: 'Hollywood Studio AI — Seu estúdio criativo com IA',
  description: 'Gere vídeos, imagens e áudio cinematográficos com os melhores modelos de IA.',
  icons: { icon: '/favicon.jpg' },
};

export default function RootLayout({ children }) {
  const muapiKey = process.env.NEXT_PUBLIC_MUAPI_KEY || '';

  return (
    <html lang="pt-BR">
      <body>
        {/* Injeta key MuAPI antes do React — usuário nunca vê modal de key */}
        <script dangerouslySetInnerHTML={{__html: `
(function(){
  // Key MuAPI — pré-configurada pelo admin
  window.__MUAPI_KEY__ = '${muapiKey}';
  if('${muapiKey}' && !localStorage.getItem('muapi_key')) {
    localStorage.setItem('muapi_key', '${muapiKey}');
    document.cookie = 'muapi_key=${muapiKey}; path=/; max-age=31536000; SameSite=Lax';
  }

  // Splash cinematográfico
  if(sessionStorage.getItem('hs_splash')) return;
  sessionStorage.setItem('hs_splash','1');
  var splash = document.createElement('div');
  splash.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center;transition:opacity .5s ease';
  var isMobile=window.innerWidth<=768;
  var img=document.createElement('img');
  img.src=isMobile?'/hero-hollywoodstudio-ai-vert.png':'/hero-hollywoodstudio-ai.jpg';
  img.style.cssText='width:100%;height:100%;object-fit:cover;animation:hsZoomIn 1.2s ease-out forwards';
  var st=document.createElement('style');
  st.textContent='@keyframes hsZoomIn{from{transform:scale(1.06);opacity:0}to{transform:scale(1);opacity:1}}';
  var skip=document.createElement('button');
  skip.textContent='Pular →';
  skip.style.cssText='position:absolute;bottom:28px;'+(isMobile?'left:50%;transform:translateX(-50%)':'right:28px')+';border:1px solid rgba(201,168,76,.75);background:rgba(0,0,0,.6);color:#fff;border-radius:999px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;backdrop-filter:blur(10px);font-family:-apple-system,sans-serif';
  function hide(){splash.style.opacity='0';setTimeout(function(){if(splash.parentNode)splash.parentNode.removeChild(splash);},520);}
  skip.onclick=hide; img.onerror=hide; setTimeout(hide,2800);
  splash.appendChild(st);splash.appendChild(img);splash.appendChild(skip);
  document.body.appendChild(splash);
})();
        `}} />
        {children}
      </body>
    </html>
  );
}
